import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import TopNav from '../components/TopNav';

const BookingConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [source, setSource] = useState('');

  useEffect(() => {
    // If navigated without state, redirect to appointments
    if (!location.state || !location.state.draftPayload) {
      navigate('/appointments');
      return;
    }
    setData(location.state.draftPayload);
    setSource(location.state.source || 'appointments');
  }, [location, navigate]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('userToken') || '';
      const finalData = { ...data, reason: data.reason || data.reasonForVisit || 'Routine Checkup' };
      
      // 1. Create Appointment first
      const apptRes = await fetch(`${import.meta.env.VITE_API_URL || 'https://odizopetcare.onrender.com'}/api/appointments`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(finalData)
      });
      
      const apptJson = await apptRes.json();
      if (!apptRes.ok || !apptJson.success) {
        throw new Error(apptJson.message || "Failed to create appointment");
      }

      // 2. Create Consultation linked to the Appointment
      const consultPayload = { ...finalData, appointmentId: apptJson.appointment._id || apptJson.appointment.id };
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://odizopetcare.onrender.com'}/api/consultations`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(consultPayload)
      });
      
      const json = await res.json();
      
      if (res.ok && json.success) {
        setIsSaved(true);
      } else {
        alert(json.message || "Failed to save consultation");
      }
    } catch (err) {
      alert("Error saving consultation: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!data) return null;

  return (
    <main className="p-4 md:p-8 pb-24 md:pb-8 flex flex-col items-center justify-center min-h-screen max-w-[1280px] mx-auto w-full">
        <div className="w-full max-w-3xl">
          {/* Header Section */}
          <div className="text-center mb-8 animate-fade-in-up">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 border-4 transition-colors duration-500 ${isSaved ? 'bg-emerald-100 border-emerald-50' : 'bg-primary/10 border-primary/5'}`}>
              <span className={`material-symbols-outlined text-5xl transition-colors duration-500 ${isSaved ? 'text-emerald-500' : 'text-primary'}`}>
                {isSaved ? 'check_circle' : 'assignment'}
              </span>
            </div>
            <h1 className="font-headline-md text-3xl font-black text-on-surface mb-2 tracking-tight">
              {isSaved ? 'Booking Confirmed!' : 'Review Booking Details'}
            </h1>
            <p className="text-on-surface-variant font-medium">
              {isSaved ? 'Your appointment has been successfully saved to the database.' : 'Please review the details below and confirm to save your appointment.'}
            </p>
          </div>

          {/* Details Card */}
          <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-3xl shadow-xl p-8 mb-8 relative overflow-hidden animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-bl-[100%] pointer-events-none"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
              
              {/* Left Column */}
              <div className="space-y-6">
                
                {/* Doctor Details */}
                <div>
                  <h3 className="text-xs font-bold text-primary uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">stethoscope</span> Doctor Details
                  </h3>
                  <div className="bg-surface-container-low p-4 rounded-2xl">
                    <p className="font-headline-sm font-bold text-lg text-on-surface">{data.vetName}</p>
                    <p className="text-sm text-on-surface-variant">{data.vetSpecialization || 'Veterinarian'}</p>
                    <div className="mt-2 inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded text-xs font-bold">
                      Fee: ₹{data.fee}
                    </div>
                  </div>
                </div>

                {/* Appointment Details */}
                <div>
                  <h3 className="text-xs font-bold text-primary uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">event</span> Appointment Details
                  </h3>
                  <div className="bg-surface-container-low p-4 rounded-2xl grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-on-surface-variant">Date</p>
                      <p className="font-bold text-on-surface text-sm">{data.date}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-on-surface-variant">Time</p>
                      <p className="font-bold text-on-surface text-sm">{data.time}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-on-surface-variant">Type</p>
                      <p className="font-bold text-on-surface text-sm capitalize">{data.consultationType} Visit</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-on-surface-variant">Status</p>
                      <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-xs font-bold uppercase">
                        {data.status || 'Upcoming'}
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column */}
              <div className="space-y-6">
                
                {/* Pet Details */}
                <div>
                  <h3 className="text-xs font-bold text-primary uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">pets</span> Pet Details
                  </h3>
                  <div className="bg-surface-container-low p-4 rounded-2xl flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-primary">sound_detection_dog_barking</span>
                    </div>
                    <div>
                      <p className="font-headline-sm font-bold text-lg text-on-surface">{data.petName}</p>
                      <p className="text-xs text-on-surface-variant">
                        {data.petSpecies} {data.petBreed ? `• ${data.petBreed}` : ''} {data.petAge ? `• ${data.petAge}` : ''}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Owner Details */}
                <div>
                  <h3 className="text-xs font-bold text-primary uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">person</span> Owner Details
                  </h3>
                  <div className="bg-surface-container-low p-4 rounded-2xl">
                    <p className="font-bold text-on-surface">{data.ownerName}</p>
                    <p className="text-sm text-on-surface-variant">{data.ownerPhone}</p>
                  </div>
                </div>

                {/* Reason */}
                <div>
                  <h3 className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Reason for Visit</h3>
                  <p className="text-sm text-on-surface-variant bg-surface-container-lowest border border-outline-variant/30 p-3 rounded-xl italic">
                    "{data.reason || data.reasonForVisit}"
                  </p>
                </div>

              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            {!isSaved ? (
              <>
                <button onClick={() => navigate(source === 'vet-profile' ? -1 : '/appointments')} className="px-6 py-3.5 rounded-xl font-bold text-on-surface-variant hover:bg-surface-container transition-colors">
                  Go Back
                </button>
                <button onClick={handleSave} disabled={saving} className="bg-primary text-white px-8 py-3.5 rounded-xl font-bold hover:bg-surface-tint transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center gap-2">
                  {saving ? (
                    <><span className="material-symbols-outlined animate-spin">sync</span> Saving...</>
                  ) : (
                    <><span className="material-symbols-outlined">save</span> Confirm & Save Appointment</>
                  )}
                </button>
              </>
            ) : (
              <Link to="/appointments" className="bg-primary text-white px-8 py-3.5 rounded-xl font-bold hover:bg-surface-tint transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center gap-2">
                <span className="material-symbols-outlined">calendar_month</span> View My Appointments
              </Link>
            )}
          </div>
        </div>
    </main>
  );
};

export default BookingConfirmation;
