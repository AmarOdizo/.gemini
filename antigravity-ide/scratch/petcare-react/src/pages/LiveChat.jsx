import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import OwnerSidebar from '../components/OwnerSidebar';
import VetSidebar from '../components/VetSidebar';
import supabase from '../supabaseClient';

const LiveChat = () => {
  const [searchParams] = useSearchParams();
  const consultationId = searchParams.get('consultationId');
  
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [user, setUser] = useState(null);
  const [consultation, setConsultation] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const messagesEndRef = useRef(null);
  const subscriptionRef = useRef(null);
  const navigate = useNavigate();

  const isDoctor = user && (user.role === 'doctor' || user.vciNumber);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    if (!consultationId) {
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('userToken') || localStorage.getItem('vetToken') || '';

    // Fetch consultation details
    fetch(`https://odizopetcare.onrender.com/api/consultations/${consultationId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setConsultation(data.data);
        }
      })
      .catch(err => console.error("Error fetching consultation", err));

    // 1. Fetch existing messages
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('conversationId', consultationId)
          .order('createdAt', { ascending: true });
          
        if (error) throw error;
        setMessages(data || []);
      } catch (err) {
        console.error("Error fetching chat messages:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    // 2. Set up Supabase Realtime Subscription IMMEDIATELY
    if (subscriptionRef.current) {
      supabase.removeChannel(subscriptionRef.current);
    }
    
    const channel = supabase.channel(`chat_messages_${consultationId}`);
    subscriptionRef.current = channel;
    
    channel.on('postgres_changes', { 
      event: 'INSERT', 
      schema: 'public', 
      table: 'chat_messages',
      filter: `conversationId=eq.${consultationId}`
    }, (payload) => {
      if (payload.new.conversationId !== consultationId) return;

      setMessages((prev) => {
         // Duplicate prevention using database message ID
         const isDuplicate = prev.some(m => (m.id === payload.new.id) || (m._id && m._id === payload.new.id));
         if (isDuplicate) {
           return prev;
         }
         return [...prev, payload.new];
      });
    })
    .subscribe((status) => {
      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        console.error("Realtime channel subscription error/timeout:", status);
      }
    });

    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
        subscriptionRef.current = null;
      }
    };
  }, [consultationId, navigate]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !user || !consultationId) return;
    
    const msgText = input;
    setInput('');
    
    const senderRole = isDoctor ? 'vet' : 'owner';
    const receiverIdObj = consultation ? (isDoctor ? consultation.ownerId : consultation.vetId) : null;
    const receiverId = typeof receiverIdObj === 'object' && receiverIdObj ? receiverIdObj._id || receiverIdObj.id : receiverIdObj;

    const newMsg = {
      senderId: String(user._id || user.id),
      receiverId: String(receiverId),
      senderName: user.name,
      senderRole: senderRole,
      message: msgText,
      conversationId: consultationId
    };

    try {
      // Prefer inserting into Supabase first
      const { data, error } = await supabase
        .from('chat_messages')
        .insert([{
           ...newMsg,
           createdAt: new Date().toISOString()
        }])
        .select()
        .single();
        
      if (error) throw error;
      
      // Update UI with returned database row
      setMessages((prev) => {
         const isDuplicate = prev.some(m => m.id === data.id);
         if (isDuplicate) return prev;
         return [...prev, data];
      });
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const headerTitle = consultation 
    ? (isDoctor ? `${consultation.ownerName} & ${consultation.petName}` : consultation.vetName) 
    : 'Loading...';
  const headerSubtitle = consultation
    ? (isDoctor ? `${consultation.petSpecies} Parent` : (consultation.vetSpecialization || 'Veterinarian'))
    : '';

  if (!user) return null;

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex">
      {isDoctor ? <VetSidebar /> : <OwnerSidebar />}
      
      <main className="flex-grow ml-0 md:ml-[280px] h-screen flex flex-col">
        {/* Chat Header */}
        <header className="h-16 bg-surface-container-lowest border-b border-outline-variant/30 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="md:hidden flex items-center text-on-surface-variant hover:text-primary transition-colors">
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg border border-primary/30">
                  {headerTitle.charAt(0)}
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
              </div>
              <div>
                <h2 className="font-bold text-sm text-on-surface">{headerTitle}</h2>
                <p className="text-[11px] text-primary font-bold">{headerSubtitle}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-container-low transition-colors text-on-surface-variant">
              <span className="material-symbols-outlined">call</span>
            </button>
            <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-container-low transition-colors text-on-surface-variant">
              <span className="material-symbols-outlined">videocam</span>
            </button>
            <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-container-low transition-colors text-on-surface-variant hidden sm:flex">
              <span className="material-symbols-outlined">more_vert</span>
            </button>
          </div>
        </header>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-surface-container-lowest/50 space-y-4 custom-scrollbar">
          <div className="text-center">
            <span className="text-[10px] font-bold text-on-surface-variant bg-surface-container-low px-3 py-1 rounded-full border border-outline-variant/20 uppercase tracking-wider">Today</span>
          </div>

          {loading ? (
             <div className="py-8 flex flex-col items-center justify-center text-on-surface-variant">
               <span className="material-symbols-outlined animate-spin text-primary text-3xl mb-2">sync</span>
               <span className="text-xs font-semibold">Connecting to chat...</span>
             </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-on-surface-variant mt-10">
               <p className="text-sm">No messages yet. Send a message to start the consultation.</p>
            </div>
          ) : (
            messages.map((msg) => {
              const msgSenderId = typeof msg.senderId === 'object' && msg.senderId ? String(msg.senderId._id) : String(msg.senderId);
              const currentUserId = String(user._id || user.id);
              
              // Normalize comparison to string and fix alignment logic
              const isMine = msgSenderId === currentUserId || String(msg.senderRole) === (isDoctor ? 'vet' : 'owner');
              const timeStr = new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
              
              // Use msg.id as key for Supabase messages
              const messageKey = msg.id || msg._id;
              
              return (
                <div key={messageKey} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] md:max-w-[60%] flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                    <div className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm ${isMine ? 'bg-primary text-white rounded-br-sm' : 'bg-surface-container text-on-surface border border-outline-variant/20 rounded-bl-sm'}`}>
                      {msg.message}
                    </div>
                    <span className="text-[10px] text-on-surface-variant mt-1 font-medium px-1">{timeStr}</span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div className="bg-surface-container-lowest p-4 border-t border-outline-variant/30 shrink-0">
          <form onSubmit={handleSend} className="max-w-4xl mx-auto flex items-end gap-2 bg-surface-container-low border border-outline-variant/50 rounded-2xl p-1.5 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/30 transition-all">
            <button type="button" className="p-2 text-on-surface-variant hover:text-primary transition-colors rounded-xl shrink-0">
              <span className="material-symbols-outlined">attach_file</span>
            </button>
            <textarea 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if(e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
              placeholder="Type a message..." 
              className="flex-1 bg-transparent border-none focus:ring-0 resize-none py-2.5 px-2 text-sm max-h-[120px] outline-none" 
              rows="1"
              disabled={loading}
            />
            <button type="submit" disabled={!input.trim() || loading} className="p-2.5 bg-primary text-white rounded-xl hover:bg-surface-tint transition-colors shrink-0 disabled:opacity-50 disabled:cursor-not-allowed">
              <span className="material-symbols-outlined text-[20px]">send</span>
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default LiveChat;
