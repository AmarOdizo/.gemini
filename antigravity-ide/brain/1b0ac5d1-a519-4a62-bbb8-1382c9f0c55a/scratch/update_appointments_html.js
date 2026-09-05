const fs = require('fs');
const path = 'C:/Users/VICTUS/.gemini/antigravity-ide/scratch/petcare-app/vet-appointments.html';

let content = fs.readFileSync(path, 'utf8');

// 1. Clear appointmentsTableBody
const tbodyRegex = /<tbody class="divide-y divide-outline-variant\/20 text-xs" id="appointmentsTableBody">.*?<\/tbody>/s;
content = content.replace(tbodyRegex, `<tbody class="divide-y divide-outline-variant/20 text-xs" id="appointmentsTableBody">\n                    <!-- Rows injected dynamically via JS -->\n                </tbody>`);

// 2. Add render function and modify fetch logic
const fetchLogicRegex = /const response = await fetch\(`http:\/\/localhost:5000\/api\/vets\/\$\{docId\}\/appointments`\);\n\s+const json = await response\.json\(\);\n\s+if \(response\.ok && json\.success && Array\.isArray\(json\.appointments\)\) \{\n\s+console\.log\(`Loaded scoped appointments for Doctor ID: \$\{docId\}`\, json\.appointments\);\n\s+\}/s;

const newFetchLogic = `const response = await fetch(\`http://localhost:5000/api/vets/\${docId}/appointments\`);
                const json = await response.json();
                if (response.ok && json.success && Array.isArray(json.appointments)) {
                    console.log(\`Loaded scoped appointments for Doctor ID: \${docId}\`, json.appointments);
                    const tbody = document.getElementById('appointmentsTableBody');
                    if (json.appointments.length === 0) {
                        tbody.innerHTML = '<tr><td colspan="5" class="p-4 text-center text-on-surface-variant font-bold">No appointments found.</td></tr>';
                    } else {
                        tbody.innerHTML = '';
                        json.appointments.forEach(appt => {
                            const tr = document.createElement('tr');
                            tr.className = 'hover:bg-surface-container-low/40 transition-colors appt-row';
                            tr.setAttribute('data-status', appt.status || 'upcoming');
                            tr.setAttribute('data-search', (appt.petName + ' ' + appt.ownerName).toLowerCase());
                            
                            tr.innerHTML = \`
                                <td class="p-4 font-bold text-on-surface">
                                    \${appt.time || 'N/A'}<br/>
                                    <span class="text-[11px] font-normal text-on-surface-variant">\${appt.duration || '30 Min Consult'}</span>
                                </td>
                                <td class="p-4">
                                    <div class="flex items-center gap-3">
                                        <div class="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-base">🐶</div>
                                        <div>
                                            <p class="font-bold text-on-surface text-sm">\${appt.petName || 'Unknown Pet'}</p>
                                            <p class="text-on-surface-variant text-[11px]">\${appt.petSpecies || 'Pet'} • \${appt.ownerName || 'Unknown Owner'}</p>
                                        </div>
                                    </div>
                                </td>
                                <td class="p-4">
                                    <span class="font-bold text-primary block">\${appt.reason || 'General Consultation'}</span>
                                    <span class="text-on-surface-variant text-[11px]">\${appt.consultationType || 'Telehealth'}</span>
                                </td>
                                <td class="p-4">
                                    <span class="inline-flex items-center gap-1 font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 capitalize">
                                        \${appt.status || 'upcoming'}
                                    </span>
                                </td>
                                <td class="p-4 text-right space-x-1">
                                    <a href="create-prescription.html?vetId=\${docId}" class="px-3 py-1.5 bg-surface-container text-on-surface rounded-lg font-bold hover:bg-surface-container-high transition-colors">Rx Prescribe</a>
                                </td>
                            \`;
                            tbody.appendChild(tr);
                        });
                    }
                }`;

content = content.replace(fetchLogicRegex, newFetchLogic);

fs.writeFileSync(path, content, 'utf8');
console.log("Updated vet-appointments.html successfully!");
