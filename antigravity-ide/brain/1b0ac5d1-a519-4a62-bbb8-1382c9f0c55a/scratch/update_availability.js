const fs = require('fs');
const path = 'C:/Users/VICTUS/.gemini/antigravity-ide/scratch/petcare-app/vet-availability.html';

let content = fs.readFileSync(path, 'utf8');

// Replace saveScheduleSettings function
const saveRegex = /async function saveScheduleSettings\(\) \{[\s\S]*?\n\s+const toast = document.getElementById\('toastSaveNotice'\);/s;

const newSaveLogic = `async function saveScheduleSettings() {
            const user = window.VetAuth ? window.VetAuth.protectDoctorRoute() : null;
            const docId = window.VetAuth ? window.VetAuth.getDoctorId(user) : 'vet_101';
            
            // Gather data from DOM
            const emergencyConsult = document.getElementById('emergencyDutyToggle').checked;
            
            const weeklyHours = {};
            document.querySelectorAll('.day-row').forEach(row => {
                const day = row.getAttribute('data-day');
                const isActive = row.querySelector('.day-active-checkbox').checked;
                if (!isActive) {
                    weeklyHours[day] = "Closed";
                } else {
                    // Just get the first slot for simplicity in this mock
                    const inputs = row.querySelectorAll('input[type="time"]');
                    if (inputs.length >= 2) {
                        weeklyHours[day] = inputs[0].value + " - " + inputs[1].value;
                    } else {
                        weeklyHours[day] = "09:00 - 17:00";
                    }
                }
            });

            try {
                await fetch(\`http://localhost:5000/api/vets/\${docId}/availability\`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        emergencyConsult: emergencyConsult, 
                        slotDuration: 30,
                        weeklyHours: weeklyHours
                    })
                });
            } catch(e) {
                console.error("Failed to save schedule:", e);
            }

            const toast = document.getElementById('toastSaveNotice');`;

content = content.replace(saveRegex, newSaveLogic);

fs.writeFileSync(path, content, 'utf8');
console.log("Updated vet-availability.html successfully!");
