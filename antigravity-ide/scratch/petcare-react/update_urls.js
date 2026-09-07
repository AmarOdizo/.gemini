const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

const findAndReplace = (dir) => {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.lstatSync(fullPath).isDirectory()) {
            findAndReplace(fullPath);
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            // Regex to find exact match without the fallback
            const regex = /\$\{import\.meta\.env\.VITE_API_URL\}/g;
            if (regex.test(content)) {
                content = content.replace(regex, "${import.meta.env.VITE_API_URL || 'https://odizopetcare.onrender.com'}");
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Updated: ${fullPath}`);
            }
        }
    });
};

findAndReplace(directoryPath);
console.log('Update complete!');
