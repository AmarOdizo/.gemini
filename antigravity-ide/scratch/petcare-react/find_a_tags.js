const fs = require('fs');
const path = require('path');

function findATags(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            findATags(fullPath);
        } else if (fullPath.endsWith('.jsx')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (content.match(/<\s*a\b/i)) {
                console.log('Found <a> in:', fullPath);
                const lines = content.split('\n');
                lines.forEach((line, index) => {
                    if (line.match(/<\s*a\b/i)) {
                        console.log(`Line ${index + 1}: ${line.trim()}`);
                    }
                });
            }
        }
    }
}

findATags('./src');
