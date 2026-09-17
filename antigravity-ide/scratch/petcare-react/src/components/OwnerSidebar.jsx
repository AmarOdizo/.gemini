import React, { useState } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import Logo from './Logo';

const OwnerSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const storedUser = localStorage.getItem('currentUser');
      const currentUser = storedUser ? JSON.parse(storedUser) : { _id: 'guest', name: 'Guest User' };
      
      const payload = {
        vetId: 'platform-feedback',
        vetName: 'Platform / General Feedback',
        ownerId: currentUser._id || currentUser.id,
        ownerName: currentUser.name || 'Pet Owner',
        rating: feedbackRating,
        comment: feedbackComment
      };

      const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://odizopetcare.onrender.com'}/api/admin/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        alert('Thank you for your feedback! It has been submitted successfully.');
        setShowFeedbackModal(false);
        setFeedbackComment('');
        setFeedbackRating(5);
      } else {
        alert('Failed to submit feedback. Please try again.');
      }
    } catch (error) {
      console.error("Feedback error", error);
      alert('An error occurred while submitting feedback.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem('userToken');
    localStorage.removeItem('currentUser');
    navigate('/');
  };

  const navLinkClass = ({ isActive }) =>
    `nav-link flex items-center gap-md px-4 py-3 rounded-xl transition-all duration-300 ease-out group relative overflow-hidden ${
      isActive
        ? 'bg-gradient-to-r from-primary/10 to-primary/5 text-primary font-bold shadow-sm border border-primary/10 scale-[0.98]'
        : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface hover:translate-x-1'
    }`;

  return (
    <>
      {/* Desktop Sidebar */}
      <nav className="bg-surface/80 backdrop-blur-md border-r border-outline-variant/30 hidden md:flex flex-col h-screen w-[280px] p-6 gap-6 fixed left-0 top-0 z-40 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        {/* Header Brand */}
        <Link to="/" className="flex items-center mb-4 px-2 group">
          <div>
            <Logo iconSize="text-3xl" textSize="text-xl" />
            <p className="font-label-md text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">Veterinary Portal</p>
          </div>
        </Link>
        
        {/* Main Nav Links */}
        <div className="flex flex-col gap-2 flex-grow">
          <NavLink to="/owner-dashboard" className={navLinkClass}>
            <span className="material-symbols-outlined filled-icon text-[22px]">dashboard</span>
            <span className="font-label-md text-sm">Dashboard</span>
          </NavLink>
          <NavLink to="/find-vets" className={navLinkClass}>
            <span className="material-symbols-outlined text-[22px]">search</span>
            <span className="font-label-md text-sm">Find Vets</span>
          </NavLink>
          <NavLink to="/my-pets" className={navLinkClass}>
            <span className="material-symbols-outlined text-[22px]">pets</span>
            <span className="font-label-md text-sm">My Pets</span>
          </NavLink>
          <NavLink to="/appointments" className={navLinkClass}>
            <span className="material-symbols-outlined text-[22px]">calendar_today</span>
            <span className="font-label-md text-sm">Appointments</span>
          </NavLink>
          <NavLink to="/prescription" className={navLinkClass}>
            <span className="material-symbols-outlined text-[22px]">medical_services</span>
            <span className="font-label-md text-sm">Prescriptions</span>
          </NavLink>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col gap-3 mt-auto">
          <Link to="/find-vets" className="w-full bg-gradient-to-r from-[#FF7F50] to-[#FF9933] text-white font-label-md text-sm py-3 rounded-xl font-bold mb-2 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all text-center block">
            Book Appointment
          </Link>
          <button onClick={() => setShowFeedbackModal(true)} className="flex items-center gap-3 px-4 py-2.5 text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-all rounded-xl w-full text-left font-bold text-sm">
            <span className="material-symbols-outlined text-[20px]">feedback</span>
            Feedback
          </button>
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 text-error hover:bg-error-container/30 transition-all rounded-xl cursor-pointer w-full text-left font-bold text-sm group">
            <span className="material-symbols-outlined text-[20px] group-hover:-translate-x-1 transition-transform">logout</span>
            Logout
          </button>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-outline-variant z-50 px-1 flex justify-between items-center shadow-[0_-4px_24px_rgba(0,0,0,0.05)] pb-safe">
        <NavLink to="/owner-dashboard" className={({ isActive }) => `flex flex-col items-center py-2 px-2 rounded-lg flex-1 ${isActive ? 'text-primary' : 'text-on-surface-variant'}`}>
          <span className={`material-symbols-outlined text-[22px] ${location.pathname === '/owner-dashboard' ? 'filled-icon' : ''}`}>dashboard</span>
          <span className="text-[9px] font-bold mt-1">Home</span>
        </NavLink>
        <NavLink to="/find-vets" className={({ isActive }) => `flex flex-col items-center py-2 px-2 rounded-lg flex-1 ${isActive ? 'text-primary' : 'text-on-surface-variant'}`}>
          <span className={`material-symbols-outlined text-[22px] ${location.pathname === '/find-vets' ? 'filled-icon' : ''}`}>search</span>
          <span className="text-[9px] font-bold mt-1">Search</span>
        </NavLink>
        <NavLink to="/my-pets" className={({ isActive }) => `flex flex-col items-center py-2 px-2 rounded-lg flex-1 ${isActive ? 'text-primary' : 'text-on-surface-variant'}`}>
          <span className={`material-symbols-outlined text-[22px] ${location.pathname === '/my-pets' ? 'filled-icon' : ''}`}>pets</span>
          <span className="text-[9px] font-bold mt-1">Pets</span>
        </NavLink>
        <NavLink to="/appointments" className={({ isActive }) => `flex flex-col items-center py-2 px-2 rounded-lg flex-1 ${isActive ? 'text-primary' : 'text-on-surface-variant'}`}>
          <span className={`material-symbols-outlined text-[22px] ${location.pathname === '/appointments' ? 'filled-icon' : ''}`}>calendar_today</span>
          <span className="text-[9px] font-bold mt-1">Visits</span>
        </NavLink>
        
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className={`flex flex-col items-center py-2 px-2 rounded-lg flex-1 ${mobileMenuOpen ? 'text-primary' : 'text-on-surface-variant'}`}>
          <span className={`material-symbols-outlined text-[22px] ${mobileMenuOpen ? 'filled-icon' : ''}`}>menu</span>
          <span className="text-[9px] font-bold mt-1">More</span>
        </button>
      </div>

      {/* Mobile More Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity" onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute bottom-[60px] right-2 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-xl w-48 overflow-hidden animate-fade-in-up" onClick={e => e.stopPropagation()}>
            <div className="flex flex-col py-1">
              <NavLink to="/prescription" onClick={() => setMobileMenuOpen(false)} className={({isActive}) => `flex items-center gap-3 px-4 py-3 text-sm font-bold ${isActive ? 'text-primary bg-primary/10' : 'text-on-surface hover:bg-surface-container'}`}>
                <span className="material-symbols-outlined text-[20px]">medical_services</span> Rx
              </NavLink>
              <button onClick={() => { setMobileMenuOpen(false); setShowFeedbackModal(true); }} className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-on-surface hover:bg-surface-container w-full text-left transition-colors">
                <span className="material-symbols-outlined text-[20px]">feedback</span> Feedback
              </button>
              <div className="h-px bg-outline-variant/30 my-1 mx-2"></div>
              <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-error hover:bg-error-container/20 w-full text-left transition-colors">
                <span className="material-symbols-outlined text-[20px]">logout</span> Logout
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowFeedbackModal(false)}>
          <div className="bg-surface-container-lowest w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-low">
              <h3 className="font-headline-sm font-bold text-lg flex items-center gap-2 text-on-surface">
                <span className="material-symbols-outlined text-primary">reviews</span>
                Submit Feedback
              </h3>
              <button onClick={() => setShowFeedbackModal(false)} className="text-on-surface-variant hover:text-error transition-colors p-1 rounded-full hover:bg-surface-container">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            
            <form onSubmit={handleFeedbackSubmit} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-sm font-bold text-on-surface mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackRating(star)}
                      className="transition-transform hover:scale-110 focus:outline-none"
                    >
                      <span className={`material-symbols-outlined text-3xl ${star <= feedbackRating ? 'filled-icon text-amber-500' : 'text-on-surface-variant/30'}`}>
                        star
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-on-surface mb-2">Your Review / Feedback</label>
                <textarea
                  required
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  className="w-full bg-surface-container border border-outline-variant/50 rounded-xl p-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none h-32"
                  placeholder="Tell us about your experience..."
                ></textarea>
              </div>
              
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary text-on-primary py-3 rounded-xl font-bold hover:bg-primary-container hover:-translate-y-0.5 transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:translate-y-0"
                >
                  {isSubmitting ? (
                    <span className="material-symbols-outlined animate-spin">sync</span>
                  ) : (
                    <span className="material-symbols-outlined">send</span>
                  )}
                  {isSubmitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default OwnerSidebar;
