const fs = require('fs');
const path = require('path');

const files = ['doctor-profile.html', 'vet-profile.html'];

const replacementScript = `<script>
        document.addEventListener('DOMContentLoaded', async () => {
            const rawUser = localStorage.getItem('currentUser');
            let currentUser = rawUser ? JSON.parse(rawUser) : null;

            // Check URL search parameters
            const params = new URLSearchParams(window.location.search);
            const queryId = params.get('id') || params.get('vci');

            const profileGrid = document.querySelector('.grid.grid-cols-1.lg\\\\:grid-cols-12');
            
            if (profileGrid) {
                profileGrid.style.display = 'none'; // Hide content initially
                
                // Create loader
                const loader = document.createElement('div');
                loader.id = 'profileLoader';
                loader.className = 'w-full flex flex-col items-center justify-center p-xl gap-4 text-on-surface-variant';
                loader.innerHTML = '<span class="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span><p class="font-bold">Loading Vet Profile...</p>';
                profileGrid.parentNode.insertBefore(loader, profileGrid);
            }

            // Adapt header back button according to logged-in user role
            const backBtn = document.getElementById('profileBackLink');
            if (backBtn) {
                if (currentUser && currentUser.role === 'doctor') {
                    backBtn.href = 'doctor-dashboard.html';
                    backBtn.innerHTML = \`<span class="material-symbols-outlined text-[18px]">arrow_back</span> Back to Doctor Dashboard\`;
                } else {
                    backBtn.href = 'find-vets.html';
                    backBtn.innerHTML = \`<span class="material-symbols-outlined text-[18px]">arrow_back</span> Back to Vets Directory\`;
                }
            }

            if (!queryId) {
                showError("No Veterinarian ID provided.");
                return;
            }

            try {
                const res = await fetch(\`http://localhost:5000/api/vets/\${queryId}\`);
                const json = await res.json();
                
                if (res.ok && json.success && json.data) {
                    populateVetData(json.data);
                } else {
                    showError(json.message || "Vet not found.");
                }
            } catch(err) {
                console.error('API fetch error:', err);
                showError("Unable to connect to the server. Please try again later.");
            }

            function showError(message) {
                const loader = document.getElementById('profileLoader');
                if (loader) loader.remove();
                
                if (profileGrid) {
                    const errorState = document.createElement('div');
                    errorState.className = 'w-full flex flex-col items-center justify-center p-xl gap-4 bg-error-container text-on-error-container rounded-2xl border border-error/30 mt-8';
                    errorState.innerHTML = \`<span class="material-symbols-outlined text-5xl">error</span><h2 class="font-headline-sm font-bold">\${message}</h2><a href="find-vets.html" class="mt-4 bg-error text-on-error px-6 py-2 rounded-lg font-bold hover:opacity-90">Go Back</a>\`;
                    profileGrid.parentNode.insertBefore(errorState, profileGrid);
                }
            }

            function populateVetData(vetData) {
                const loader = document.getElementById('profileLoader');
                if (loader) loader.remove();
                if (profileGrid) profileGrid.style.display = 'grid'; // Show content

                // Populate DOM Elements with Full Doctor Details
                document.getElementById('profileDoctorAvatar').src = vetData.photoUrl || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=500&auto=format&fit=crop';
                document.getElementById('profileDoctorName').textContent = vetData.name || vetData.fullName || 'Unknown Vet';
                document.getElementById('profileDoctorVci').textContent = vetData.vciNumber || vetData.regNumber || 'No VCI';
                document.getElementById('profileDoctorDegree').textContent = \`\${vetData.qualification || 'B.V.Sc'} • \${vetData.university || 'Registered University'}\`;
                
                document.getElementById('profileDoctorLocationExp').innerHTML = \`<span class="material-symbols-outlined text-[16px]">location_on</span> \${vetData.city || 'Location N/A'} • \${vetData.experienceYears || 0} Yrs Exp.\`;
                
                document.getElementById('profileDoctorAbout').textContent = vetData.about || 'Dedicated veterinarian.';
                document.getElementById('profileClinicNameAddress').textContent = vetData.clinicName || 'Independent Practice';
                document.getElementById('profileClinicAddressStr').textContent = vetData.clinicAddress || (vetData.city || 'Address N/A');
                document.getElementById('profileDoctorEmail').textContent = \`Email: \${vetData.email || 'N/A'}\`;
                document.getElementById('profileDoctorPhone').textContent = \`Phone: \${vetData.phone || 'N/A'} | Helpline: \${vetData.clinicPhone || 'N/A'}\`;
                
                const feeDisplay = document.getElementById('profileConsultFee');
                if (feeDisplay) feeDisplay.textContent = \`₹\${vetData.consultationFee || 0}\`;

                // Populate Specialization Badges
                const specsContainer = document.getElementById('profileSpecializationsContainer');
                if (specsContainer && Array.isArray(vetData.specialization) && vetData.specialization.length > 0) {
                    specsContainer.innerHTML = vetData.specialization.map(s => \`
                        <div class="bg-primary/10 text-primary px-3 py-1.5 rounded-xl border border-primary/20 text-xs font-bold flex items-center gap-1.5">
                            <span class="material-symbols-outlined text-[16px]">check_circle</span> \${s}
                        </div>
                    \`).join('');
                } else if (specsContainer) {
                    specsContainer.innerHTML = \`<div class="text-xs text-on-surface-variant">General Practice</div>\`;
                }

                // Setup Availability slots if available
                setupAvailability(vetData.availability);
            }
            
            function setupAvailability(availability) {
                // This is a placeholder since the existing UI uses static buttons for "consult-type-btn", "date-btn", "time-btn".
                // In a full implementation, you would dynamically create these based on 'availability'.
                // For now, we will just make the static buttons interactive as before.
                
                // Interactive Consultation Type Selector
                const typeBtns = document.querySelectorAll('.consult-type-btn');
                typeBtns.forEach(btn => {
                    btn.addEventListener('click', () => {
                        typeBtns.forEach(b => b.className = 'consult-type-btn p-sm rounded-xl border border-outline-variant bg-surface-container-lowest hover:border-primary text-on-surface-variant font-medium text-xs flex flex-col items-center gap-1');
                        btn.className = 'consult-type-btn p-sm rounded-xl border-2 border-primary bg-primary/10 text-primary font-bold text-xs flex flex-col items-center gap-1 shadow-sm';
                    });
                });

                // Date selector
                const dateBtns = document.querySelectorAll('.date-btn');
                dateBtns.forEach(btn => {
                    btn.addEventListener('click', () => {
                        dateBtns.forEach(b => b.className = 'date-btn flex flex-col items-center justify-center p-sm rounded-xl border border-outline-variant bg-surface hover:border-primary transition-all text-on-surface-variant');
                        btn.className = 'date-btn flex flex-col items-center justify-center p-sm rounded-xl border-2 border-primary bg-primary-container text-white font-bold shadow-sm';
                    });
                });

                // Time selector
                const timeBtns = document.querySelectorAll('.time-btn');
                timeBtns.forEach(btn => {
                    btn.addEventListener('click', () => {
                        timeBtns.forEach(b => b.className = 'time-btn px-sm py-2 rounded-lg border border-outline-variant text-on-surface-variant hover:border-primary transition-all text-xs text-center');
                        btn.className = 'time-btn px-sm py-2 rounded-lg border-2 border-primary bg-primary/10 text-primary font-bold text-xs text-center shadow-sm';
                    });
                });
            }
        });

        function confirmDoctorBooking() {
            const docNameElem = document.getElementById('profileDoctorName');
            const docName = docNameElem ? docNameElem.textContent : "Doctor";
            
            const petSelectElem = document.getElementById('selectPetDropdown');
            const selectedPet = petSelectElem ? petSelectElem.value : "Your Pet";
            
            alert(\`Appointment with \${docName} confirmed for \${selectedPet}! Redirecting to Appointments Center...\`);
            window.location.href = 'appointments.html';
        }
    </script>`;

for (const file of files) {
    const filePath = path.join('c:/Users/VICTUS/.gemini/antigravity-ide/scratch/petcare-app', file);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        // Replace existing script from <script> to </script> before <script src="portal-nav.js"></script>
        // The script we want to replace contains document.addEventListener('DOMContentLoaded'
        const scriptMatch = content.match(/<script>[\s\S]*?document\.addEventListener\('DOMContentLoaded'[\s\S]*?<\/script>/);
        
        if (scriptMatch) {
            content = content.replace(scriptMatch[0], replacementScript);
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(\`Successfully updated \${file}\`);
        } else {
            console.error(\`Could not find script block in \${file}\`);
        }
    } else {
        console.warn(\`File not found: \${file}\`);
    }
}
