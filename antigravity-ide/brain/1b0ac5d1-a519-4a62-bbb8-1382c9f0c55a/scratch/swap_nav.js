const fs = require('fs');

// Read owner dashboard
const ownerHtml = fs.readFileSync('c:/Users/VICTUS/.gemini/antigravity-ide/scratch/petcare-app/owner-dashboard.html', 'utf8');

// Extract appSidebar
const sidebarMatch = ownerHtml.match(/(<nav id="appSidebar"[\s\S]*?<\/nav>)/);
if (!sidebarMatch) {
    console.error("Error: Could not find appSidebar in owner-dashboard.html");
    process.exit(1);
}
const ownerSidebar = sidebarMatch[1];

// Extract mobile nav
const mobileNavMatch = ownerHtml.match(/(<nav class="bg-surface border-t border-outline-variant md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-2">[\s\S]*?<\/nav>)/);
if (!mobileNavMatch) {
    console.error("Error: Could not find mobile nav in owner-dashboard.html");
    process.exit(1);
}
const ownerMobileNav = mobileNavMatch[1];

// Read vet-profile
let vetHtml = fs.readFileSync('c:/Users/VICTUS/.gemini/antigravity-ide/scratch/petcare-app/vet-profile.html', 'utf8');

// Replace appSidebar in vet-profile
vetHtml = vetHtml.replace(/<nav id="appSidebar"[\s\S]*?<\/nav>/, ownerSidebar);

// Ensure mobile nav exists in vet-profile, if it doesn't, append before </body>
if (!vetHtml.includes('<nav class="bg-surface border-t border-outline-variant md:hidden fixed bottom-0')) {
    vetHtml = vetHtml.replace('</body>', ownerMobileNav + '\n</body>');
} else {
    vetHtml = vetHtml.replace(/<nav class="bg-surface border-t border-outline-variant md:hidden fixed bottom-0[\s\S]*?<\/nav>/, ownerMobileNav);
}

// Replace the title to make it clear it's the Owner's view of the vet profile
vetHtml = vetHtml.replace('<title>Dr. Ananya Sharma - Doctor Profile | PetCare</title>', '<title>Veterinarian Profile | PetCare</title>');

fs.writeFileSync('c:/Users/VICTUS/.gemini/antigravity-ide/scratch/petcare-app/vet-profile.html', vetHtml, 'utf8');

console.log("Successfully updated vet-profile.html with Owner Navigation!");
