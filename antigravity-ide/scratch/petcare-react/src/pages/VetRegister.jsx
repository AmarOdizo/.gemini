import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const VetRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    vciNumber: '',
    qualification: '',
    university: '',
    experience: '',
    clinicName: '',
    city: '',
    consultationFee: 499,
    clinicPhone: '',
    about: '',
    terms: false,
    photoUrl: '',
    licenseCertUrl: ''
  });
  
  const [specializations, setSpecializations] = useState({
    'Canine Medicine': true,
    'Feline Specialist': true,
    'Veterinary Surgery': false,
    'Dermatology': false,
    'Telehealth': true,
    'Avian & Exotics': false
  });

  const [loading, setLoading] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSpecChange = (spec) => {
    setSpecializations(prev => ({ ...prev, [spec]: !prev[spec] }));
  };

  const handleFileUpload = async (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/imagekit/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ file: reader.result, fileName: file.name, folder: '/vets' })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setFormData(prev => ({ ...prev, [fieldName]: data.url }));
        } else {
          alert('Upload failed: ' + (data.message || 'Unknown error'));
        }
      } catch (err) {
        alert('Upload Error: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    const specs = Object.keys(specializations).filter(k => specializations[k]);

    try {
      const res = await fetch('http://localhost:5000/api/vets/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          vciNumber: formData.vciNumber,
          qualification: formData.qualification,
          university: formData.university,
          experienceYears: formData.experience,
          specialization: specs,
          clinicName: formData.clinicName,
          city: formData.city,
          consultationFee: formData.consultationFee,
          clinicPhone: formData.clinicPhone,
          about: formData.about,
          photoUrl: formData.photoUrl,
          licenseCertUrl: formData.licenseCertUrl
        })
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        setSuccessModal(true);
      } else {
        alert(data.message || 'Registration failed');
      }
    } catch (err) {
      alert('Registration Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface text-on-surface antialiased min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-md border-b border-outline-variant/30 px-6 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
          <span className="material-symbols-outlined text-2xl filled-icon">pets</span>
          <span className="font-headline-sm font-black text-lg">PawsIndia <span className="font-body-sm font-normal text-on-surface-variant">| VCI Doctors</span></span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-xs text-on-surface-variant hidden sm:inline">Already registered?</span>
          <Link to="/login" className="text-xs font-bold text-primary border border-primary/30 px-3 py-1.5 rounded-lg hover:bg-primary/5 transition-colors">
            Doctor Login
          </Link>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center py-8 px-4">
        <div className="max-w-3xl w-full bg-surface-container-lowest rounded-2xl shadow-lg border border-outline-variant/30 p-6 md:p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-container/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

          <div className="text-center mb-8 relative z-10">
            <span className="inline-flex items-center gap-1 text-xs text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 font-bold mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> VCI Doctor Verification
            </span>
            <h1 className="font-headline-lg text-2xl md:text-3xl font-extrabold text-primary mb-2">Veterinarian Partner Registration</h1>
            <p className="font-body-md text-xs text-on-surface-variant max-w-lg mx-auto">
              Join PawsIndia's veterinary network. Complete your professional profile and upload your VCI Registration Certificate for instant verification.
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-6 relative z-10">
            {/* Section 1: Doctor Personal Information */}
            <div className="space-y-4">
              <h2 className="font-headline-sm text-base font-bold text-on-surface border-b border-outline-variant/30 pb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">person</span> Personal & Account Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold font-label-md text-on-surface mb-1">Full Name (with Prefix) *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Dr. Ananya Sharma" className="w-full px-3 py-2 border border-outline-variant/50 rounded-lg bg-surface-container-lowest font-body-sm text-sm focus:outline-none focus:border-primary focus:ring-1 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold font-label-md text-on-surface mb-1">Official Email Address *</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="dr.ananya@clinic.com" className="w-full px-3 py-2 border border-outline-variant/50 rounded-lg bg-surface-container-lowest font-body-sm text-sm focus:outline-none focus:border-primary focus:ring-1 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold font-label-md text-on-surface mb-1">Phone Number *</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required placeholder="+91 98765 43210" className="w-full px-3 py-2 border border-outline-variant/50 rounded-lg bg-surface-container-lowest font-body-sm text-sm focus:outline-none focus:border-primary focus:ring-1 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold font-label-md text-on-surface mb-1">Account Password *</label>
                  <input type="password" name="password" value={formData.password} onChange={handleChange} required placeholder="••••••••" className="w-full px-3 py-2 border border-outline-variant/50 rounded-lg bg-surface-container-lowest font-body-sm text-sm focus:outline-none focus:border-primary focus:ring-1 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold font-label-md text-on-surface mb-1">Profile Photo (Optional)</label>
                  <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'photoUrl')} disabled={loading} className="w-full px-3 py-2 border border-outline-variant/50 rounded-lg bg-surface-container-lowest font-body-sm text-sm focus:outline-none focus:border-primary focus:ring-1 transition-all file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
                  {formData.photoUrl && <p className="text-xs text-emerald-600 font-bold mt-1">✓ Photo uploaded</p>}
                </div>
              </div>
            </div>

            {/* Section 2: VCI Credentials & Qualification */}
            <div className="space-y-4">
              <h2 className="font-headline-sm text-base font-bold text-on-surface border-b border-outline-variant/30 pb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">badge</span> VCI License & Education
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold font-label-md text-on-surface mb-1">VCI Registration Number *</label>
                  <input type="text" name="vciNumber" value={formData.vciNumber} onChange={handleChange} required placeholder="e.g. VCI-2024-8891" className="w-full px-3 py-2 border border-outline-variant/50 rounded-lg bg-surface-container-lowest font-body-sm text-sm font-mono focus:outline-none focus:border-primary focus:ring-1 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold font-label-md text-on-surface mb-1">Primary Degree / Qualification *</label>
                  <input type="text" name="qualification" value={formData.qualification} onChange={handleChange} required placeholder="B.V.Sc & A.H. / M.V.Sc (Surgery)" className="w-full px-3 py-2 border border-outline-variant/50 rounded-lg bg-surface-container-lowest font-body-sm text-sm focus:outline-none focus:border-primary focus:ring-1 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold font-label-md text-on-surface mb-1">University / College Name *</label>
                  <input type="text" name="university" value={formData.university} onChange={handleChange} required placeholder="e.g. KVAFSU Bangalore" className="w-full px-3 py-2 border border-outline-variant/50 rounded-lg bg-surface-container-lowest font-body-sm text-sm focus:outline-none focus:border-primary focus:ring-1 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold font-label-md text-on-surface mb-1">Years of Experience *</label>
                  <input type="number" name="experience" min="0" value={formData.experience} onChange={handleChange} required placeholder="8" className="w-full px-3 py-2 border border-outline-variant/50 rounded-lg bg-surface-container-lowest font-body-sm text-sm focus:outline-none focus:border-primary focus:ring-1 transition-all" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold font-label-md text-on-surface mb-1">Upload VCI Certificate / License (Required)</label>
                  <input type="file" accept="image/*,.pdf" onChange={(e) => handleFileUpload(e, 'licenseCertUrl')} disabled={loading} required={!formData.licenseCertUrl} className="w-full px-3 py-2 border border-outline-variant/50 rounded-lg bg-surface-container-lowest font-body-sm text-sm focus:outline-none focus:border-primary focus:ring-1 transition-all file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
                  {formData.licenseCertUrl && <p className="text-xs text-emerald-600 font-bold mt-1">✓ Certificate uploaded successfully</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold font-label-md text-on-surface mb-2">Specializations & Focus Areas</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.keys(specializations).map(spec => (
                    <label key={spec} className="flex items-center gap-2 p-2 bg-surface-container-low border border-outline-variant/40 rounded-xl cursor-pointer hover:border-primary">
                      <input type="checkbox" checked={specializations[spec]} onChange={() => handleSpecChange(spec)} className="w-4 h-4 text-primary rounded" />
                      <span className="text-xs font-semibold text-on-surface">{spec}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 3: Practice & Clinic Location */}
            <div className="space-y-4">
              <h2 className="font-headline-sm text-base font-bold text-on-surface border-b border-outline-variant/30 pb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">location_on</span> Clinic & Consultation Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold font-label-md text-on-surface mb-1">Clinic / Hospital Name</label>
                  <input type="text" name="clinicName" value={formData.clinicName} onChange={handleChange} placeholder="PawsCare Pet Hospital" className="w-full px-3 py-2 border border-outline-variant/50 rounded-lg bg-surface-container-lowest font-body-sm text-sm focus:outline-none focus:border-primary focus:ring-1 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold font-label-md text-on-surface mb-1">City / State *</label>
                  <input type="text" name="city" value={formData.city} onChange={handleChange} required placeholder="Koramangala, Bengaluru" className="w-full px-3 py-2 border border-outline-variant/50 rounded-lg bg-surface-container-lowest font-body-sm text-sm focus:outline-none focus:border-primary focus:ring-1 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold font-label-md text-on-surface mb-1">Consultation Fee (₹) *</label>
                  <input type="number" name="consultationFee" min="0" value={formData.consultationFee} onChange={handleChange} required className="w-full px-3 py-2 border border-outline-variant/50 rounded-lg bg-surface-container-lowest font-body-sm text-sm font-bold text-primary focus:outline-none focus:border-primary focus:ring-1 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold font-label-md text-on-surface mb-1">Clinic Landline / Helpline</label>
                  <input type="tel" name="clinicPhone" value={formData.clinicPhone} onChange={handleChange} placeholder="080-25501234" className="w-full px-3 py-2 border border-outline-variant/50 rounded-lg bg-surface-container-lowest font-body-sm text-sm focus:outline-none focus:border-primary focus:ring-1 transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold font-label-md text-on-surface mb-1">Professional Bio / Profile Summary</label>
                <textarea name="about" value={formData.about} onChange={handleChange} rows="3" placeholder="Describe your clinical expertise..." className="w-full px-3 py-2 border border-outline-variant/50 rounded-lg bg-surface-container-lowest font-body-sm text-sm resize-none focus:outline-none focus:border-primary focus:ring-1 transition-all"></textarea>
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" name="terms" checked={formData.terms} onChange={handleChange} required className="w-4 h-4 text-primary rounded border-outline-variant mt-0.5" />
                <span className="text-xs text-on-surface-variant">
                  I declare that I hold a valid B.V.Sc / M.V.Sc degree recognized by VCI and agree to the 
                  <Link to="#" className="text-primary font-bold hover:underline"> VCI Telehealth Code of Ethics</Link>.
                </span>
              </label>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-primary text-on-primary rounded-xl py-3.5 px-6 font-bold text-sm hover:bg-tertiary hover:-translate-y-[1px] hover:shadow-lg transition-all active:scale-[0.98] duration-200 flex justify-center items-center gap-2">
              {loading ? <span>Processing...</span> : <span>Submit Profile for VCI Verification</span>}
              <span className="material-symbols-outlined text-base">verified</span>
            </button>
          </form>
        </div>
      </main>

      {/* Success Modal */}
      {successModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => navigate('/login')}></div>
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 relative z-10 text-center space-y-4">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto border-4 border-emerald-50">
              <span className="material-symbols-outlined text-4xl">pending_actions</span>
            </div>
            <h3 className="font-headline-md text-xl font-extrabold text-primary">Registration Submitted!</h3>
            <p className="font-body-md text-xs text-on-surface-variant leading-relaxed">
              Thank you for applying. Your VCI Registration Certificate has been submitted for fast-track credentialing. Our medical board will review your credentials within 2 hours.
            </p>
            <div className="pt-2 space-y-2">
              <Link to="/login" className="w-full bg-primary text-white rounded-xl py-2.5 font-bold text-xs block text-center shadow-sm hover:bg-tertiary transition-colors">
                Proceed to Doctor Login
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VetRegister;
