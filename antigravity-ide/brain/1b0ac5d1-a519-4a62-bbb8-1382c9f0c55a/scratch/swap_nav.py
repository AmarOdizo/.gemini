import re

# Read owner dashboard
with open('c:/Users/VICTUS/.gemini/antigravity-ide/scratch/petcare-app/owner-dashboard.html', 'r', encoding='utf-8') as f:
    owner_html = f.read()

# Extract appSidebar
sidebar_match = re.search(r'(<nav id="appSidebar".*?</nav>)', owner_html, re.DOTALL)
if not sidebar_match:
    print("Error: Could not find appSidebar in owner-dashboard.html")
    exit(1)
owner_sidebar = sidebar_match.group(1)

# Extract mobile nav
mobile_nav_match = re.search(r'(<nav class="[^"]*md:hidden fixed bottom-0[^>]*>.*?</nav>)', owner_html, re.DOTALL)
if not mobile_nav_match:
    # Alternative regex for mobile nav
    mobile_nav_match = re.search(r'(<nav class="bg-surface border-t border-outline-variant md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-2">.*?</nav>)', owner_html, re.DOTALL)
    if not mobile_nav_match:
        print("Error: Could not find mobile nav in owner-dashboard.html")
        exit(1)
owner_mobile_nav = mobile_nav_match.group(1)

# Read vet-profile
with open('c:/Users/VICTUS/.gemini/antigravity-ide/scratch/petcare-app/vet-profile.html', 'r', encoding='utf-8') as f:
    vet_html = f.read()

# Replace appSidebar in vet-profile
vet_html_new, num_subs = re.subn(r'<nav id="appSidebar".*?</nav>', owner_sidebar, vet_html, count=1, flags=re.DOTALL)
if num_subs == 0:
    print("Error: Could not replace appSidebar in vet-profile.html")
    exit(1)

# Ensure mobile nav exists in vet-profile, if it doesn't, append before <script>
if '<nav class="bg-surface border-t border-outline-variant md:hidden fixed bottom-0' in vet_html_new:
    vet_html_new, num_subs = re.subn(r'<nav class="bg-surface border-t border-outline-variant md:hidden fixed bottom-0.*?</nav>', owner_mobile_nav, vet_html_new, count=1, flags=re.DOTALL)
else:
    # insert before script tags
    vet_html_new = vet_html_new.replace('<script>', owner_mobile_nav + '\n    <script>', 1)
    # wait, script might be something else
    # fallback to before </body>
    if owner_mobile_nav not in vet_html_new:
        vet_html_new = vet_html_new.replace('</body>', owner_mobile_nav + '\n</body>')

# Replace the title to make it clear it's the Owner's view of the vet profile
vet_html_new = vet_html_new.replace('<title>Dr. Ananya Sharma - Doctor Profile | PetCare</title>', '<title>Veterinarian Profile | PetCare</title>')

with open('c:/Users/VICTUS/.gemini/antigravity-ide/scratch/petcare-app/vet-profile.html', 'w', encoding='utf-8') as f:
    f.write(vet_html_new)

print("Successfully updated vet-profile.html with Owner Navigation!")
