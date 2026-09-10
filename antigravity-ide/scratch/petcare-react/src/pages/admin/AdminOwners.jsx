import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/adminApi';

const AdminOwners = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState('all');
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [ownersList, setOwnersList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOwnersFromDatabase = async () => {
      try {
        setLoading(true);
        const json = await adminApi.getOwners();
        if (json.success && json.owners) {
          setOwnersList(json.owners);
        }
      } catch (err) {
        console.error("Error loading owners from MongoDB:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOwnersFromDatabase();
  }, []);

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
    <div className="p-3 sm:p-6 max-w-[100rem] mx-auto space-y-4 sm:space-y-6">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="font-['Manrope'] text-xl sm:text-2xl font-bold text-on-surface tracking-tight flex flex-wrap items-center gap-2">
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
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-outline-variant/30 text-on-surface rounded-xl text-xs font-bold hover:bg-surface-container transition-colors shadow-sm self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-[1.125rem]">download</span>
          <span>Export Directory</span>
        </button>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-sm border border-outline-variant/20 flex items-center justify-between">
          <div>
            <span className="text-[0.6875rem] sm:text-xs font-bold text-on-surface-variant uppercase tracking-wider">Total Owners</span>
            <div className="text-xl sm:text-2xl font-bold font-['Manrope'] text-on-surface mt-0.5 sm:mt-1">14,820</div>
            <span className="text-xs text-secondary font-semibold">+312 this week</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-surface-container text-primary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined">supervisor_account</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-sm border border-outline-variant/20 flex items-center justify-between">
          <div>
            <span className="text-[0.6875rem] sm:text-xs font-bold text-on-surface-variant uppercase tracking-wider">Registered Patients</span>
            <div className="text-xl sm:text-2xl font-bold font-['Manrope'] text-primary mt-0.5 sm:mt-1">19,410</div>
            <span className="text-xs text-on-surface-variant">Dogs, Cats, Exotic</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined">pets</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-sm border border-outline-variant/20 flex items-center justify-between sm:col-span-2 lg:col-span-1">
          <div>
            <span className="text-[0.6875rem] sm:text-xs font-bold text-on-surface-variant uppercase tracking-wider">Active Telehealth</span>
            <div className="text-xl sm:text-2xl font-bold font-['Manrope'] text-secondary mt-0.5 sm:mt-1">98.4%</div>
            <span className="text-xs text-on-surface-variant">Profile health score</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined">health_and_safety</span>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-sm border border-outline-variant/20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[1.125rem]">
            search
          </span>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by owner, pet, email, or microchip..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-surface-container-low border border-outline-variant/40 focus:outline-none focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-2 sm:gap-3 self-end sm:self-auto w-full sm:w-auto justify-between sm:justify-start">
          <span className="text-xs font-semibold text-on-surface-variant shrink-0">Species:</span>
          <select
            value={speciesFilter}
            onChange={(e) => setSpeciesFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface font-medium focus:outline-none focus:border-primary flex-1 sm:flex-initial"
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
          <table className="w-full text-left text-xs min-w-[720px]">
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
          <div className="w-full max-w-lg bg-white h-full shadow-2xl border-l border-outline-variant/30 p-4 sm:p-6 overflow-y-auto flex flex-col justify-between">
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
