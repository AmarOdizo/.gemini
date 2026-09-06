const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  let modified = false;

  // Match the template literal pattern currently in the files
  const regex1 = /\$\{import\.meta\.env\.VITE_API_URL \|\| "http:\/\/localhost:5000"\}/g;
  const regex2 = /http:\/\/localhost:5000/g;
  const regex3 = /https:\/\/localhost:5001/g;
  const targetUrl = 'https://odizopetcare.onrender.com';

  if (regex1.test(content) || regex2.test(content) || regex3.test(content)) {
    content = content.replace(regex1, targetUrl);
    content = content.replace(regex2, targetUrl);
    content = content.replace(regex3, targetUrl);
    
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
