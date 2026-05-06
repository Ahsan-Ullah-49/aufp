const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const pagesDir = path.join(rootDir, 'pages');

// Include index.html and all pages
const rootFiles = ['index.html'];
const pageFiles = fs.readdirSync(pagesDir).filter(f => f.endsWith('.html')).map(f => path.join('pages', f));
const allFiles = [...rootFiles, ...pageFiles];

function getPreloaderHTML(prefix) {
  return `
<!-- ══ PRELOADER ══ -->
<div id="preloader">
  <div class="loader-spinner-wrap">
    <div class="loader-spinner"></div>
    <img src="${prefix}Assets/logo/logo.png" alt="Loading" class="loader-logo" style="width: 40px; height: 40px; object-fit: contain; border-radius: 8px;" />
  </div>
  <div class="loader-text">Loading...</div>
</div>
`;
}

allFiles.forEach(file => {
  const filePath = path.join(rootDir, file);
  const isRoot = file === 'index.html';
  const prefix = isRoot ? '' : '../';
  
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Make sure we haven't already injected it
  if (!content.includes('id="preloader"')) {
    // Inject right after <body ...>
    // We use regex to find body tag which might have classes
    const bodyRegex = /(<body[^>]*>)/i;
    content = content.replace(bodyRegex, `$1${getPreloaderHTML(prefix)}`);
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Updated ${file}`);
  }
});
