import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNav from '../components/TopNav';

const Prescribe = () => {
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [selectedAppt, setSelectedAppt] = useState('');
  
  const [formData, setFormData] = useState({
    diagnosis: '',
    medicines: [{ name: '', dosage: '', frequency: '', duration: '' }],
    instructions: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    fetchAppointments(parsedUser._id);
  }, [navigate]);

  const fetchAppointments = async (vetId) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://odizopetcare.onrender.com'}/api/consultations?vetId=${vetId}`);
      if (res.ok) {
        const data = await res.json();
        // Only completed appointments need prescriptions usually, or we can just list all
        setAppointments(data.data || []);
      }
    } catch (err) {
      console.error("Error fetching appointments", err);
    }
  };

  const handleMedChange = (index, field, value) => {
    const newMeds = [...formData.medicines];
    newMeds[index][field] = value;
    setFormData({ ...formData, medicines: newMeds });
  };

  const addMedicine = () => {
    setFormData({
      ...formData,
      medicines: [...formData.medicines, { name: '', dosage: '', frequency: '', duration: '' }]
    });
  };

  const removeMedicine = (index) => {
    const newMeds = formData.medicines.filter((_, i) => i !== index);
    setFormData({ ...formData, medicines: newMeds });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAppt) {
      alert("Please select a patient/appointment");
      return;
    }
    
    setSubmitting(true);
    try {
      const appt = appointments.find(a => a._id === selectedAppt);
      const payload = {
        appointmentId: appt.appointmentId || appt._id,
        vetId: user.id || user._id,
        ownerId: appt.ownerId, // Include ownerId to directly save it on the Prescription
        
        // Immutable Vet Details
        vetName: user.name || user.fullName || 'Dr. Unknown',
        vetQualification: user.qualification || '',
        vetSpecialization: Array.isArray(user.specialization) ? user.specialization.join(', ') : (user.specialization || ''),
        vetClinic: user.clinicName || 'PawsIndia Pet Hospital',
        vetPhone: user.phone || user.clinicPhone || '',
        vetImage: user.photoUrl || 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&auto=format&fit=crop',
        vetSignature: user.name || 'Doctor',

        patientName: appt.petName,
        speciesBreed: appt.petSpecies,
        petParent: appt.ownerName,
        diagnosis: formData.diagnosis,
        medications: formData.medicines,
        symptoms: formData.instructions, // Storing advice/instructions here
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      };

      const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://odizopetcare.onrender.com'}/api/prescriptions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        alert('Prescription created successfully!');
        navigate('/doctor-dashboard');
      } else {
        alert(data.message || 'Failed to create prescription');
      }
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <main className="p-3 md:p-4 pb-20 md:pb-4 flex flex-col gap-3 max-w-[1280px] mx-auto w-full">
        <TopNav title="Digital Prescription" subtitle="Write and send digital Rx securely to pet parents." />

        <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-xl shadow-sm overflow-hidden max-w-4xl mx-auto w-full">
          <div className="p-4 border-b border-outline-variant/50 bg-surface-container-low flex justify-between items-center">
            <div>
              <h3 className="font-headline-sm font-bold text-sm text-primary flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]">prescriptions</span> Rx pad
              </h3>
              <p className="text-[10px] text-on-surface-variant font-bold font-mono mt-0.5">{user.vciNumber || 'VCI Verified'}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-xs">{user.name}</p>
              <p className="text-[10px] text-on-surface-variant">{user.qualification}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            
            <div className="space-y-3">
              <h4 className="font-bold text-xs border-b border-outline-variant/30 pb-1.5">Patient Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold font-label-md text-on-surface mb-1">Select Consultation *</label>
                  <select 
                    value={selectedAppt} 
                    onChange={(e) => setSelectedAppt(e.target.value)} 
                    required 
                    className="w-full px-2.5 py-1.5 border border-outline-variant/50 rounded-lg focus:outline-none focus:border-primary text-[11px] font-medium bg-surface-container-lowest shadow-xs"
                  >
                    <option value="">-- Choose Patient / Appointment --</option>
                    {appointments.map(appt => (
                      <option key={appt._id} value={appt._id}>
                        {appt.petName} ({appt.petSpecies}) - {appt.date}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold font-label-md text-on-surface mb-1">Clinical Diagnosis *</label>
                  <input 
                    type="text" 
                    value={formData.diagnosis} 
                    onChange={(e) => setFormData({...formData, diagnosis: e.target.value})} 
                    required 
                    placeholder="e.g. Mild Gastroenteritis"
                    className="w-full px-2.5 py-1.5 border border-outline-variant/50 rounded-lg focus:outline-none focus:border-primary text-[11px] font-medium bg-surface-container-lowest shadow-xs"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center border-b border-outline-variant/30 pb-1.5">
                <h4 className="font-bold text-xs">Medications (Rx)</h4>
                <button type="button" onClick={addMedicine} className="text-[10px] font-bold text-primary flex items-center gap-1 hover:bg-primary/5 px-2 py-1 rounded">
                  <span className="material-symbols-outlined text-[14px]">add</span> Add Medicine
                </button>
              </div>
              
              <div className="space-y-2">
                {formData.medicines.map((med, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-start bg-surface-container-low/50 p-2.5 rounded-lg border border-outline-variant/30 relative">
                    {formData.medicines.length > 1 && (
                      <button type="button" onClick={() => removeMedicine(index)} className="absolute -top-1.5 -right-1.5 bg-error text-white rounded-full w-4 h-4 flex items-center justify-center shadow hover:bg-error-container hover:text-error transition-colors">
                        <span className="material-symbols-outlined text-[10px]">close</span>
                      </button>
                    )}
                    <div className="md:col-span-4">
                      <label className="block text-[9px] font-bold text-on-surface-variant uppercase mb-0.5">Medicine Name</label>
                      <input type="text" value={med.name} onChange={(e) => handleMedChange(index, 'name', e.target.value)} required placeholder="e.g. Metronidazole" className="w-full px-2 py-1 border border-outline-variant/50 rounded-md text-[11px] font-medium bg-surface-container-lowest focus:border-primary focus:outline-none" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[9px] font-bold text-on-surface-variant uppercase mb-0.5">Dosage</label>
                      <input type="text" value={med.dosage} onChange={(e) => handleMedChange(index, 'dosage', e.target.value)} required placeholder="e.g. 5ml" className="w-full px-2 py-1 border border-outline-variant/50 rounded-md text-[11px] font-medium bg-surface-container-lowest focus:border-primary focus:outline-none" />
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-[9px] font-bold text-on-surface-variant uppercase mb-0.5">Frequency</label>
                      <input type="text" value={med.frequency} onChange={(e) => handleMedChange(index, 'frequency', e.target.value)} required placeholder="e.g. Twice a day (BD)" className="w-full px-2 py-1 border border-outline-variant/50 rounded-md text-[11px] font-medium bg-surface-container-lowest focus:border-primary focus:outline-none" />
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-[9px] font-bold text-on-surface-variant uppercase mb-0.5">Duration</label>
                      <input type="text" value={med.duration} onChange={(e) => handleMedChange(index, 'duration', e.target.value)} required placeholder="e.g. 5 days" className="w-full px-2 py-1 border border-outline-variant/50 rounded-md text-[11px] font-medium bg-surface-container-lowest focus:border-primary focus:outline-none" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-xs border-b border-outline-variant/30 pb-1.5">Doctor's Advice / Diet</h4>
              <textarea 
                value={formData.instructions} 
                onChange={(e) => setFormData({...formData, instructions: e.target.value})} 
                rows="2" 
                placeholder="Specific instructions for rest, diet, or next follow-up..."
                className="w-full px-2.5 py-1.5 border border-outline-variant/50 rounded-lg focus:outline-none focus:border-primary text-[11px] font-medium bg-surface-container-lowest resize-none shadow-xs"
              ></textarea>
            </div>

            <div className="pt-3 border-t border-outline-variant/50 flex justify-end gap-2">
              <button type="button" onClick={() => navigate('/doctor-dashboard')} className="px-4 py-1.5 border border-outline-variant/50 text-on-surface-variant font-bold rounded-lg hover:bg-surface-container text-[11px] transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="px-5 py-1.5 bg-primary text-on-primary font-bold rounded-lg shadow-sm hover:bg-surface-tint hover:-translate-y-0.5 active:translate-y-0 text-[11px] transition-all flex items-center gap-1.5">
                {submitting ? <><span className="material-symbols-outlined animate-spin text-[14px]">sync</span> Saving...</> : <><span className="material-symbols-outlined text-[14px]">send</span> Send Prescription</>}
              </button>
            </div>
            <p className="text-[9px] text-center text-on-surface-variant/70 font-medium leading-tight">
              By submitting this prescription, you confirm that you have evaluated the patient and are authorized to prescribe under VCI regulations.
            </p>
          </form>
        </div>
    </main>
  );
};

export default Prescribe;
