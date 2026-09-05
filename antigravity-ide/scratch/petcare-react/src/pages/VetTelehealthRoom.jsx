import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const VetTelehealthRoom = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const navigate = useNavigate();

  // Mock patient and doctor for UI demonstration
  const patient = {
    name: "Bella",
    speciesBreed: "Dog • Golden Retriever",
    age: "3 Yrs 2 Mos",
    weight: "24.5 kg",
    gender: "Female, Spayed",
    ownerName: "Rahul Sharma",
    ownerLocation: "Koramangala, Bengaluru",
    ownerEmail: "rahul.s@example.com",
    img: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&auto=format&fit=crop"
  };

  const doctorImg = "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&auto=format&fit=crop";

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages([...messages, { text: input, sender: 'doctor', time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }]);
    setInput('');
  };

  const endConsultation = () => {
    if (window.confirm("Are you sure you want to end this telehealth session?")) {
      navigate('/prescribe');
    }
  };

  return (
    <div className="bg-surface text-on-surface antialiased min-h-screen flex flex-col font-body-md overflow-hidden">
      <header className="h-16 bg-surface-container-lowest border-b border-outline-variant/30 px-6 flex justify-between items-center z-50">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-xs text-on-surface-variant hover:text-primary font-bold">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span> Back
          </button>
          <span className="text-outline-variant">|</span>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></span>
            <span className="font-bold text-xs text-on-surface uppercase tracking-wider hidden sm:inline">Live WebRTC Video Telehealth Session</span>
            <span className="font-bold text-xs text-on-surface uppercase tracking-wider sm:hidden">Live Call</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="font-mono text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20 hidden md:block">
            {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </div>
          <button onClick={endConsultation} className="bg-red-600 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md hover:bg-red-700 transition-all flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">call_end</span> End Call
          </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden h-[calc(100vh-64px)]">
        
        {/* Left Panel: Patient Vitals */}
        <aside className="hidden md:flex w-80 bg-surface-container-low border-r border-outline-variant/20 flex-col p-5 overflow-y-auto shrink-0 space-y-4">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md relative">
              <img src={patient.img} alt={patient.name} className="w-full h-full object-cover" />
              <span className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white"></span>
            </div>
            <div>
              <h2 className="font-headline-sm text-lg font-bold text-primary">{patient.name}</h2>
              <span className="text-xs text-on-surface-variant font-medium bg-surface-container px-2.5 py-0.5 rounded-full">{patient.speciesBreed}</span>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/20 shadow-sm space-y-2 text-xs">
            <h3 className="font-bold text-primary uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">monitor_heart</span> Patient Vitals
            </h3>
            <div className="flex justify-between border-b border-outline-variant/10 pb-1.5">
              <span className="text-on-surface-variant font-medium">Age</span>
              <span className="font-bold text-on-surface">{patient.age}</span>
            </div>
            <div className="flex justify-between border-b border-outline-variant/10 pb-1.5">
              <span className="text-on-surface-variant font-medium">Weight</span>
              <span className="font-bold text-on-surface">{patient.weight}</span>
            </div>
            <div className="flex justify-between border-b border-outline-variant/10 pb-1.5">
              <span className="text-on-surface-variant font-medium">Gender</span>
              <span className="font-bold text-on-surface">{patient.gender}</span>
            </div>
            <div className="flex justify-between border-b border-outline-variant/10 pb-1.5">
              <span className="text-on-surface-variant font-medium">Vaccination</span>
              <span className="font-bold text-emerald-700">✓ Up to Date</span>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/20 shadow-sm space-y-2 text-xs mt-auto">
            <h3 className="font-bold text-primary uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">person</span> Pet Parent Details
            </h3>
            <p className="font-bold text-on-surface text-sm">{patient.ownerName}</p>
            <p className="text-on-surface-variant">{patient.ownerLocation}</p>
          </div>
        </aside>

        {/* Center Panel: Video */}
        <section className="flex-1 flex flex-col bg-surface min-w-[320px] border-r border-outline-variant/20">
          <div className="h-64 sm:h-80 bg-slate-900 m-4 rounded-2xl overflow-hidden relative shadow-lg group">
            <img src={patient.img} alt="Live Stream" className="w-full h-full object-cover opacity-90" />
            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white text-xs px-3 py-1 rounded-full flex items-center gap-2 border border-white/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> HD Connected
            </div>
            <div className="absolute bottom-4 right-4 w-28 h-36 bg-slate-800 rounded-xl border-2 border-white overflow-hidden shadow-2xl">
              <img src={doctorImg} alt="Self View" className="w-full h-full object-cover" />
            </div>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-black/70 backdrop-blur-md px-6 py-3 rounded-full border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="text-white hover:text-primary transition-colors flex flex-col items-center">
                <span className="material-symbols-outlined text-[24px]">mic_off</span>
              </button>
              <button className="text-white hover:text-primary transition-colors flex flex-col items-center">
                <span className="material-symbols-outlined text-[24px]">videocam</span>
              </button>
              <button className="text-white hover:text-primary transition-colors flex flex-col items-center">
                <span className="material-symbols-outlined text-[24px]">screen_share</span>
              </button>
            </div>
          </div>
          
          <div className="flex-1 bg-surface-container-lowest m-4 mt-0 rounded-2xl border border-outline-variant/20 shadow-sm flex flex-col overflow-hidden">
             <div className="px-4 py-3 border-b border-outline-variant/30 bg-surface-container-low flex justify-between items-center">
                <h3 className="font-bold text-sm flex items-center gap-2"><span className="material-symbols-outlined text-[18px] text-primary">chat</span> Live Chat</h3>
             </div>
             <div className="flex-1 p-4 overflow-y-auto space-y-4">
                <div className="text-center text-[10px] text-on-surface-variant font-bold uppercase bg-surface-container w-max mx-auto px-3 py-1 rounded-full">Call Connected Securely</div>
                
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex flex-col max-w-[80%] ${msg.sender === 'doctor' ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                    <div className={`p-3 rounded-2xl text-sm ${msg.sender === 'doctor' ? 'bg-primary text-white rounded-tr-none' : 'bg-surface-container-low border border-outline-variant/30 rounded-tl-none'}`}>
                      {msg.text}
                    </div>
                    <span className="text-[10px] text-on-surface-variant mt-1">{msg.time}</span>
                  </div>
                ))}
             </div>
             <form onSubmit={handleSendMessage} className="p-3 border-t border-outline-variant/30 flex gap-2">
                <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message..." className="flex-1 bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary" />
                <button type="submit" className="bg-primary text-white w-10 h-10 rounded-xl flex items-center justify-center shadow-sm hover:bg-surface-tint">
                  <span className="material-symbols-outlined">send</span>
                </button>
             </form>
          </div>
        </section>

        {/* Right Panel: Quick Prescription Draft */}
        <aside className="hidden lg:flex w-80 bg-surface-container-lowest border-l border-outline-variant/20 flex-col p-5 overflow-y-auto shrink-0 space-y-4">
          <div className="flex justify-between items-center border-b border-outline-variant/30 pb-3">
            <h3 className="font-headline-sm text-sm font-bold flex items-center gap-2 text-primary">
              <span className="material-symbols-outlined text-[18px]">edit_document</span> Draft Prescription
            </h3>
          </div>
          
          <div className="space-y-4 flex-1">
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase text-on-surface-variant">Clinical Impression</label>
              <textarea rows="2" className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg p-2 text-sm focus:outline-none focus:border-primary resize-none" placeholder="Noted symptoms..."></textarea>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase text-on-surface-variant">Quick Rx Meds</label>
              <textarea rows="3" className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg p-2 text-sm focus:outline-none focus:border-primary resize-none" placeholder="1. Medicine A - 5mg..."></textarea>
            </div>
          </div>

          <div className="mt-auto pt-4 border-t border-outline-variant/30">
            <button onClick={endConsultation} className="w-full bg-surface-container text-on-surface font-bold text-xs py-3 rounded-xl border border-outline-variant hover:bg-surface-container-high transition-colors flex justify-center items-center gap-2">
              End & Move to Prescribe <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default VetTelehealthRoom;
