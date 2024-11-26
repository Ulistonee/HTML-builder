const fs = require('fs');
const path = require('path');

const projectDist = path.join(__dirname, 'project-dist');
const templateFile = path.join(__dirname, 'template.html');
const componentsDir = path.join(__dirname, 'components');
const stylesDir = path.join(__dirname, 'styles');
const assetsDir = path.join(__dirname, 'assets');
const outputHtml = path.join(projectDist, 'index.html');
const outputCss = path.join(projectDist, 'style.css');
const outputAssets = path.join(projectDist, 'assets');

function copyDir(srcDir, destDir) {
  fs.mkdir(destDir, { recursive: true }, (err) => {
    if (err) return console.error('Error creating directory:', err.message);

    fs.readdir(srcDir, { withFileTypes: true }, (err, entries) => {
      if (err) return console.error('Error reading directory:', err.message);

      fs.readdir(destDir, (err, destEntries) => {
        if (!err && destEntries.length) {
          destEntries.forEach((entry) => {
            const destPath = path.join(destDir, entry);
            fs.rm(destPath, { recursive: true, force: true }, (err) => {
              if (err) console.error('Error clearing destination:', err.message);
            });
          });
        }

        entries.forEach((entry) => {
          const srcPath = path.join(srcDir, entry.name);
          const destPath = path.join(destDir, entry.name);

          if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
          } else {
            fs.copyFile(srcPath, destPath, (err) => {
              if (err) console.error('Error copying file:', err.message);
            });
          }
        });
      });
    });
  });
}

fs.mkdir(projectDist, { recursive: true }, (err) => {
  if (err) {
    console.error('Error creating project-dist folder:', err.message);
    return;
  }

  fs.readFile(templateFile, 'utf8', (err, templateContent) => {
    if (err) {
      console.error('Error reading template file:', err.message);
      return;
    }

    const templateTags = templateContent.match(/{{\s*[\w-]+\s*}}/g) || [];

    let processedTemplate = templateContent;

    templateTags.forEach((tag) => {
      const componentName = tag.replace(/{{\s*|\s*}}/g, ''); // Extract name
      const componentPath = path.join(componentsDir, `${componentName}.html`);

      if (fs.existsSync(componentPath)) {
        const componentContent = fs.readFileSync(componentPath, 'utf8');
        processedTemplate = processedTemplate.replace(new RegExp(tag, 'g'), componentContent);
      } else {
        console.error(`Error: Component ${componentName} not found.`);
        processedTemplate = processedTemplate.replace(new RegExp(tag, 'g'), '');
      }
    });

    fs.writeFile(outputHtml, processedTemplate, (err) => {
      if (err) {
        console.error('Error writing index.html:', err.message);
      } else {
        console.log('index.html created successfully!');
      }
    });
  });

  const writeStream = fs.createWriteStream(outputCss);

  fs.readdir(stylesDir, { withFileTypes: true }, (err, files) => {
    if (err) {
      console.error('Error reading styles folder:', err.message);
      return;
    }

    files.forEach((file) => {
      if (file.isFile() && path.extname(file.name) === '.css') {
        const filePath = path.join(stylesDir, file.name);
        const readStream = fs.createReadStream(filePath, 'utf8');
        readStream.pipe(writeStream, { end: false });

        readStream.on('error', (err) => {
          console.error(`Error reading CSS file ${file.name}:`, err.message);
        });
      }
    });

    writeStream.on('finish', () => {
      console.log('style.css created successfully!');
    });
  });

  copyDir(assetsDir, outputAssets);
});
