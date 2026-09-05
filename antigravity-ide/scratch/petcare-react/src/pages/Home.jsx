import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Home = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('currentUser');
    setUser(null);
  };

  return (
    <div className="bg-surface text-on-surface font-body-md antialiased flex flex-col min-h-screen">
      {/* TopNavBar */}
      <nav className="sticky top-0 z-50 flex justify-between items-center w-full px-4 md:px-8 h-16 bg-surface border-b border-outline-variant">
        <div className="flex items-center gap-4">
          <Link className="font-headline-md text-headline-md font-bold text-primary flex items-center gap-2" to="/">
            <span className="material-symbols-outlined text-primary text-2xl filled-icon">pets</span>
            <span>Paws<span className="text-[#FF9933]">India</span> <span className="text-sm">🇮🇳</span></span>
          </Link>
        </div>

        {/* Auth Actions Right side */}
        <div className="flex items-center gap-4">
          {!user ? (
            <div className="flex items-center gap-2">
              <Link to="/login" className="font-label-md text-sm font-semibold text-primary border border-primary px-4 py-1.5 rounded-lg hover:bg-primary/10 transition-colors">
                Login / Sign In
              </Link>
              <Link to="/register" className="font-label-md text-sm font-semibold bg-primary text-on-primary px-4 py-1.5 rounded-lg hover:bg-surface-tint transition-colors shadow-sm">
                Create Account
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to={user.docType === 'Vet' ? "/doctor-dashboard" : "/owner-dashboard"} className="flex items-center gap-2 font-body-sm font-bold text-on-surface hover:text-primary transition-colors">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                  <span>{user.name ? user.name[0].toUpperCase() : 'U'}</span>
                </div>
                <span className="hidden sm:inline">{user.name}</span>
              </Link>
              <button onClick={handleLogout} className="text-xs font-semibold text-error hover:bg-error-container/20 px-2.5 py-1 rounded-md transition-colors border border-error/20">
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="max-w-container-max mx-auto px-4 md:px-8 py-8 md:py-16 grid md:grid-cols-2 gap-8 items-center">
          <div className="flex flex-col gap-6">
            <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 px-3 py-1 rounded-full w-fit">
              <span className="material-symbols-outlined text-sm text-[#FF9933]">verified_user</span>
              <span className="font-label-md text-label-md font-semibold">🇮🇳 India's Premier Online Pet Healthcare</span>
            </div>
            <h1 className="font-display-lg text-4xl md:text-5xl font-bold text-on-surface">Expert veterinary care for your pet, anytime across India.</h1>
            <p className="font-body-lg text-lg text-on-surface-variant max-w-[90%]">Connect with certified Indian veterinarians in Bengaluru, Mumbai, Delhi NCR, Hyderabad & Pune for instant video consultations and digital prescriptions.</p>
            <div className="flex flex-wrap gap-4 mt-4">
              <Link to="/register" className="bg-primary text-on-primary font-label-md px-6 py-3 rounded-lg hover:bg-primary-container transition-colors shadow-sm inline-block font-bold">
                Get Started
              </Link>
              <Link to="/vet-login" className="bg-surface text-primary border border-primary font-label-md px-6 py-3 rounded-lg hover:bg-primary/5 transition-colors shadow-sm inline-block font-bold">
                For Veterinarians
              </Link>
            </div>
          </div>
          <div className="relative h-[400px] md:h-[500px] rounded-xl overflow-hidden shadow-lg border border-surface-container-highest">
            <img className="w-full h-full object-cover" alt="Indian Veterinarian caring for a pet dog" src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800&auto=format&fit=crop"/>
          </div>
        </section>

        {/* Trust Stats */}
        <section className="bg-surface-container-low border-y border-outline-variant py-8">
          <div className="max-w-container-max mx-auto px-4 md:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col gap-2">
              <span className="font-headline-lg text-3xl font-bold text-primary">1,200+</span>
              <span className="font-label-md text-on-surface-variant">Verified Indian Vets</span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-headline-lg text-3xl font-bold text-primary">50,000+</span>
              <span className="font-label-md text-on-surface-variant">Consultations Done</span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-headline-lg text-3xl font-bold text-primary">100,000+</span>
              <span className="font-label-md text-on-surface-variant">Desi & Pedigree Pets</span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-headline-lg text-3xl font-bold text-primary">4.9/5 ★</span>
              <span className="font-label-md text-on-surface-variant">Rating in India</span>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="max-w-container-max mx-auto px-4 md:px-8 py-16 flex flex-col items-center text-center gap-8">
          <div className="max-w-2xl">
            <h2 className="font-headline-lg text-3xl font-bold text-on-surface mb-4">How PawsIndia Works</h2>
            <p className="font-body-md text-on-surface-variant">Simple, secure, and stress-free pet care across India in three steps.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 w-full mt-6">
            <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm flex flex-col items-center gap-4 relative">
              <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-primary mb-2">
                <span className="material-symbols-outlined">person_add</span>
              </div>
              <h3 className="font-headline-sm text-xl font-bold text-on-surface">1. Add Pet Profile</h3>
              <p className="font-body-sm text-on-surface-variant">Register your pet with age, breed, weight, and vaccination history.</p>
            </div>
            <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm flex flex-col items-center gap-4 relative">
              <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-primary mb-2">
                <span className="material-symbols-outlined">search</span>
              </div>
              <h3 className="font-headline-sm text-xl font-bold text-on-surface">2. Select Top Vet</h3>
              <p className="font-body-sm text-on-surface-variant">Choose top veterinarians in Bengaluru, Mumbai, Delhi, Hyderabad or Pune.</p>
            </div>
            <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm flex flex-col items-center gap-4 relative">
              <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-primary mb-2">
                <span className="material-symbols-outlined">videocam</span>
              </div>
              <h3 className="font-headline-sm text-xl font-bold text-on-surface">3. Instant Video Consultation</h3>
              <p className="font-body-sm text-on-surface-variant">Get live advice, digital Rx prescription, and diet charts on your phone.</p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-primary text-on-primary py-16 px-4 md:px-8 text-center">
          <div className="max-w-3xl mx-auto flex flex-col gap-6 items-center">
            <h2 className="font-display-lg text-3xl font-bold text-on-primary">Your pet deserves the best care in India.</h2>
            <p className="font-body-lg text-primary-fixed-dim">Join thousands of pet parents who trust PawsIndia for their dogs, cats, and birds.</p>
            <Link to="/register" className="bg-surface-container-lowest text-primary font-label-md px-8 py-4 rounded-lg hover:bg-surface-container-low transition-colors mt-4 shadow-md inline-block font-bold">
              Get Started Now
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-highest w-full py-8 px-4 md:px-8 flex flex-col gap-8 border-t border-outline-variant">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 w-full max-w-container-max mx-auto">
          <Link className="font-headline-sm text-xl font-bold text-primary flex items-center gap-2" to="/">
            <span className="material-symbols-outlined text-primary text-2xl filled-icon">pets</span>
            <span>Paws<span className="text-[#FF9933]">India</span> 🇮🇳</span>
          </Link>
          <div className="flex flex-wrap justify-center gap-6">
            <Link className="font-label-md text-on-surface-variant hover:text-primary transition-colors" to="/">Home</Link>
          </div>
        </div>
        <div className="w-full text-center mt-4 border-t border-outline-variant pt-4">
          <p className="font-body-sm text-on-surface-variant">© 2026 PawsIndia Veterinary Healthcare Pvt. Ltd. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
