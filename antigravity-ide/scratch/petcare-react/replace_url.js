const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  let modified = false;

  // Match the hardcoded onrender URL
  const regex1 = /https:\/\/odizopetcare\.onrender\.com/g;
  const targetUrl = '${import.meta.env.VITE_API_URL}';

  if (regex1.test(content)) {
    content = content.replace(regex1, targetUrl);
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function traverse(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      traverse(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      replaceInFile(fullPath);
    }
  }
}

traverse(srcDir);
