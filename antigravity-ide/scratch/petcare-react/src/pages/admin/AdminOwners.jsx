import React, { useState } from 'react';

const AdminOwners = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState('all');
  const [selectedOwner, setSelectedOwner] = useState(null);

  const initialOwners = [
    {
      id: 'OWN-101',
      name: 'Eleanor Vance',
      email: 'eleanor.vance@example.com',
      phone: '+1 (555) 432-8901',
      address: 'Seattle, WA',
      joinedDate: 'Jan 14, 2023',
      totalConsultations: 8,
      status: 'Active',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120',
      pets: [
        { name: 'Barnaby', species: 'Dog', breed: 'Golden Retriever', age: '4 yrs', microchip: '985141002349182', vaccinated: true },
        { name: 'Pip', species: 'Cat', breed: 'Tabby', age: '2 yrs', microchip: '985141002349183', vaccinated: true }
      ]
    },
    {
      id: 'OWN-102',
      name: 'Liam Henderson',
      email: 'liam.h@example.com',
      phone: '+1 (555) 543-9012',
      address: 'Austin, TX',
      joinedDate: 'Mar 22, 2023',
      totalConsultations: 5,
      status: 'Active',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120',
      pets: [
        { name: 'Cleo', species: 'Cat', breed: 'Siamese', age: '3 yrs', microchip: '985141008819201', vaccinated: true },
        { name: 'Mochi', species: 'Cat', breed: 'Siamese', age: '3 yrs', microchip: '985141008819202', vaccinated: false }
      ]
    },
    {
      id: 'OWN-103',
      name: 'Sophia Chen',
      email: 'sophia.c@example.com',
      phone: '+1 (555) 654-0123',
      address: 'San Francisco, CA',
      joinedDate: 'Jun 05, 2023',
      totalConsultations: 12,
      status: 'Active',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=120',
      pets: [
        { name: 'Rory', species: 'Dog', breed: 'French Bulldog', age: '1 yr', microchip: '985141003412984', vaccinated: true }
      ]
    },
    {
      id: 'OWN-104',
      name: 'David Miller',
      email: 'david.m@example.com',
      phone: '+1 (555) 765-1234',
      address: 'Denver, CO',
      joinedDate: 'Nov 18, 2022',
      totalConsultations: 16,
      status: 'Active',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120',
      pets: [
        { name: 'Zeus', species: 'Dog', breed: 'German Shepherd', age: '6 yrs', microchip: '985141009948210', vaccinated: true }
      ]
    },
    {
      id: 'OWN-105',
      name: 'Maya Lin',
      email: 'maya.lin@example.com',
      phone: '+1 (555) 876-2345',
      address: 'Boston, MA',
      joinedDate: 'Aug 10, 2023',
      totalConsultations: 4,
      status: 'Active',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120',
      pets: [
        { name: 'Luna', species: 'Cat', breed: 'Persian', age: '5 yrs', microchip: '985141001293847', vaccinated: true }
      ]
    },
    {
      id: 'OWN-106',
      name: 'James Wilson',
      email: 'j.wilson@example.com',
      phone: '+1 (555) 987-3456',
      address: 'Chicago, IL',
      joinedDate: 'Feb 02, 2024',
      totalConsultations: 2,
      status: 'Restricted',
      avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=120',
      pets: [
        { name: 'Buster', species: 'Dog', breed: 'Beagle', age: '2 yrs', microchip: '985141007728192', vaccinated: false }
      ]
    }
  ];

  const [ownersList, setOwnersList] = useState(initialOwners);

  const filteredOwners = ownersList.filter((o) => {
    // Species Filter
    if (speciesFilter !== 'all') {
      const hasSpecies = o.pets.some(
        (p) => p.species.toLowerCase() === speciesFilter.toLowerCase()
      );
      if (!hasSpecies) return false;
    }

    // Search Query (Owner, Pet, or Microchip)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchOwner = o.name.toLowerCase().includes(q) || o.email.toLowerCase().includes(q) || o.id.toLowerCase().includes(q);
      const matchPet = o.pets.some(
        (p) => p.name.toLowerCase().includes(q) || p.breed.toLowerCase().includes(q) || p.microchip.includes(q)
      );
      return matchOwner || matchPet;
    }
    return true;
  });

  return (
    <div className="p-6 max-w-[100rem] mx-auto space-y-6">
      {/* Title Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-['Manrope'] text-2xl font-bold text-on-surface tracking-tight flex items-center gap-2">
            <span>Pet Owner & Patient Directory</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-surface-container text-primary">
              14,820 Registered
            </span>
          </h1>
          <p className="text-xs text-on-surface-variant mt-1">
            Search pet owners, patient health records, microchip IDs, and consultation histories.
          </p>
        </div>

        <button
          onClick={() => alert("Exporting full owner directory as CSV...")}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-outline-variant/30 text-on-surface rounded-xl text-xs font-bold hover:bg-surface-container transition-colors shadow-sm"
        >
          <span className="material-symbols-outlined text-[1.125rem]">download</span>
          <span>Export Directory</span>
        </button>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-outline-variant/20 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Total Owners</span>
            <div className="text-2xl font-bold font-['Manrope'] text-on-surface mt-1">14,820</div>
            <span className="text-xs text-secondary font-semibold">+312 this week</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-surface-container text-primary flex items-center justify-center">
            <span className="material-symbols-outlined">supervisor_account</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-outline-variant/20 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Registered Patients</span>
            <div className="text-2xl font-bold font-['Manrope'] text-primary mt-1">19,410</div>
            <span className="text-xs text-on-surface-variant">Dogs, Cats, Exotic</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined">pets</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-outline-variant/20 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Active Telehealth</span>
            <div className="text-2xl font-bold font-['Manrope'] text-secondary mt-1">98.4%</div>
            <span className="text-xs text-on-surface-variant">Profile health score</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-secondary-container text-on-secondary-container flex items-center justify-center">
            <span className="material-symbols-outlined">health_and_safety</span>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-outline-variant/20 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[1.125rem]">
            search
          </span>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by owner name, pet, email, or microchip ID..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-surface-container-low border border-outline-variant/40 focus:outline-none focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className="text-xs font-semibold text-on-surface-variant shrink-0">Species:</span>
          <select
            value={speciesFilter}
            onChange={(e) => setSpeciesFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface font-medium focus:outline-none focus:border-primary"
          >
            <option value="all">All Species</option>
            <option value="dog">Canine (Dogs)</option>
            <option value="cat">Feline (Cats)</option>
            <option value="bird">Avian (Birds)</option>
            <option value="exotic">Exotic Animals</option>
          </select>
        </div>
      </div>

      {/* Owners Master Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-outline-variant/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-container-low text-on-surface-variant border-b border-outline-variant/20">
              <tr>
                <th className="p-4 font-bold">Owner Profile</th>
                <th className="p-4 font-bold">Contact Info</th>
                <th className="p-4 font-bold">Registered Pets</th>
                <th className="p-4 font-bold">Consultations</th>
                <th className="p-4 font-bold">Member Since</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {filteredOwners.map((owner) => (
                <tr key={owner.id} className="hover:bg-surface-container-low/40 transition-colors">
                  {/* Profile */}
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={owner.avatar}
                        alt={owner.name}
                        className="w-10 h-10 rounded-full object-cover ring-1 ring-primary/20"
                      />
                      <div>
                        <div className="font-bold text-on-surface">{owner.name}</div>
                        <div className="font-mono text-[0.6875rem] text-primary">{owner.id}</div>
                      </div>
                    </div>
                  </td>

                  {/* Contact */}
                  <td className="p-4">
                    <div className="text-on-surface font-medium">{owner.email}</div>
                    <div className="text-[0.6875rem] text-on-surface-variant">{owner.phone} • {owner.address}</div>
                  </td>

                  {/* Pets */}
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1.5">
                      {owner.pets.map((p, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-surface-container-low border border-outline-variant/30 text-[0.6875rem] font-medium text-on-surface"
                        >
                          <span className="font-bold text-primary">{p.name}</span>
                          <span className="text-on-surface-variant text-[0.625rem]">({p.breed})</span>
                          {p.vaccinated && (
                            <span className="material-symbols-outlined text-secondary text-[0.875rem]" title="Vaccinated">
                              check_circle
                            </span>
                          )}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Consultations */}
                  <td className="p-4">
                    <div className="font-bold text-on-surface">{owner.totalConsultations} completed</div>
                    <div className="text-[0.6875rem] text-secondary font-semibold">100% attendance</div>
                  </td>

                  {/* Member Since */}
                  <td className="p-4 text-on-surface-variant">
                    {owner.joinedDate}
                  </td>

                  {/* Status */}
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[0.6875rem] font-bold ${
                      owner.status === 'Active'
                        ? 'bg-secondary-container text-on-secondary-container'
                        : 'bg-error-container text-error'
                    }`}>
                      {owner.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="p-4 text-right">
                    <button
                      onClick={() => setSelectedOwner(owner)}
                      className="px-3 py-1.5 bg-surface-container text-primary rounded-lg text-xs font-bold hover:bg-primary-container hover:text-white transition-all shadow-sm"
                    >
                      Patient Record
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Patient Record Drawer */}
      {selectedOwner && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-sm flex justify-end animate-in fade-in">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl border-l border-outline-variant/30 p-6 overflow-y-auto flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4">
                <div className="flex items-center gap-3">
                  <img src={selectedOwner.avatar} alt={selectedOwner.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20" />
                  <div>
                    <h3 className="font-['Manrope'] text-lg font-bold text-on-surface">{selectedOwner.name}</h3>
                    <p className="text-xs text-on-surface-variant">{selectedOwner.email} • {selectedOwner.phone}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedOwner(null)}
                  className="p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {/* Registered Pets Detailed Breakdown */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider">Registered Patients & Pets</h4>
                {selectedOwner.pets.map((pet, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-sm text-primary">
                        <span className="material-symbols-outlined text-[1.25rem]">pets</span>
                        <span>{pet.name}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[0.625rem] font-bold ${
                        pet.vaccinated ? 'bg-secondary-container text-on-secondary-container' : 'bg-error-container text-error'
                      }`}>
                        {pet.vaccinated ? 'Vaccinations Up-To-Date' : 'Vaccine Booster Due'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[0.6875rem] text-on-surface-variant block">Species / Breed</span>
                        <span className="font-semibold text-on-surface">{pet.species} • {pet.breed}</span>
                      </div>
                      <div>
                        <span className="text-[0.6875rem] text-on-surface-variant block">Age</span>
                        <span className="font-semibold text-on-surface">{pet.age}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-[0.6875rem] text-on-surface-variant block">ISO Microchip ID</span>
                        <span className="font-mono font-bold text-primary">{pet.microchip}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Emergency Contact & Account Details */}
              <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20 space-y-2 text-xs">
                <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider">Account Telemetry</h4>
                <div className="flex justify-between text-on-surface">
                  <span className="text-on-surface-variant">Registration Location:</span>
                  <span className="font-semibold">{selectedOwner.address}</span>
                </div>
                <div className="flex justify-between text-on-surface">
                  <span className="text-on-surface-variant">Account Status:</span>
                  <span className="font-bold text-secondary">{selectedOwner.status}</span>
                </div>
                <div className="flex justify-between text-on-surface">
                  <span className="text-on-surface-variant">Total Completed Sessions:</span>
                  <span className="font-bold">{selectedOwner.totalConsultations}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-outline-variant/20">
              <button
                onClick={() => setSelectedOwner(null)}
                className="w-full py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-container transition-colors shadow-sm"
              >
                Close Patient Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOwners;
