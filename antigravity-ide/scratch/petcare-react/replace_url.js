const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  let modified = false;

  const regexDouble = /"http:\/\/localhost:5000([^"]*)"/g;
  const regexSingle = /'http:\/\/localhost:5000([^']*)'/g;
  const regexBacktick = /`http:\/\/localhost:5000([^`]*)`/g;

  if (regexDouble.test(content) || regexSingle.test(content) || regexBacktick.test(content)) {
    content = content.replace(regexDouble, '`${import.meta.env.VITE_API_URL || "http://localhost:5000"}$1`');
    content = content.replace(regexSingle, '`${import.meta.env.VITE_API_URL || "http://localhost:5000"}$1`');
    content = content.replace(regexBacktick, '`${import.meta.env.VITE_API_URL || "http://localhost:5000"}$1`');
    
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
