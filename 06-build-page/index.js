const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');

const copyDir = async (srcDir, destDir) => {
  let isExist;
  try {
    await fsPromises.access(destDir, fsPromises.constants.F_OK);
    isExist = true;
  } catch (err) {
    isExist = false;
  }
  if (isExist) {
    await fsPromises
        .rm(destDir, { recursive: true, force: true })
        .catch((err) => console.log(err));
  }
  await fsPromises
      .mkdir(destDir, { recursive: true })
      .catch((err) => console.error('Error creating directory:', err.message));
  const entries = await fsPromises
      .readdir(srcDir, { withFileTypes: true })
      .catch((err) => console.error('Error reading directory:', err.message));
  await Promise.all(
      entries.map(async (entry) => {
        const srcPath = path.join(srcDir, entry.name);
        const destPath = path.join(destDir, entry.name);

        if (entry.isDirectory()) {
          await copyDir(srcPath, destPath);
        } else if (entry.isFile()) {
          await fsPromises
              .copyFile(srcPath, destPath)
              .catch((err) => console.error('Error copying file:', err.message));
        }
      }),
  );
};

const projectDist = path.join(__dirname, 'project-dist');
const templateFile = path.join(__dirname, 'template.html');
const componentsDir = path.join(__dirname, 'components');
const stylesDir = path.join(__dirname, 'styles');
const assetsDir = path.join(__dirname, 'assets');
const outputHtml = path.join(projectDist, 'index.html');
const outputCss = path.join(projectDist, 'style.css');
const outputAssets = path.join(projectDist, 'assets');

function processTemplate(templateContent, callback) {
  const templateTags = templateContent.match(/{{\s*[\w-]+\s*}}/g) || [];
  let pending = templateTags.length;

  templateTags.forEach((tag) => {
    const componentName = tag.replace(/{{\s*|\s*}}/g, '');
    const componentPath = path.join(componentsDir, `${componentName}.html`);

    fs.readFile(componentPath, 'utf8', (err, componentContent) => {
      if (err) {
        console.error(`Error reading component ${componentName}:`, err.message);
        templateContent = templateContent.replace(new RegExp(tag, 'g'), '');
      } else {
        templateContent = templateContent.replace(
          new RegExp(tag, 'g'),
          componentContent,
        );
      }

      pending -= 1;
      if (pending === 0) callback(templateContent);
    });
  });

  if (templateTags.length === 0) callback(templateContent);
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

    processTemplate(templateContent, (processedTemplate) => {
      fs.writeFile(outputHtml, processedTemplate, (err) => {
        if (err) {
          console.error('Error writing index.html:', err.message);
        } else {
          console.log('index.html created successfully!');
        }
      });
    });
  });

  const writeStream = fs.createWriteStream(outputCss);

  fs.readdir(stylesDir, { withFileTypes: true }, (err, files) => {
    if (err) {
      console.error('Error reading styles folder:', err.message);
      return;
    }

    let pendingFiles = files.filter(
      (file) => file.isFile() && path.extname(file.name) === '.css',
    ).length;

    files.forEach((file) => {
      if (file.isFile() && path.extname(file.name) === '.css') {
        const filePath = path.join(stylesDir, file.name);
        const readStream = fs.createReadStream(filePath, 'utf8');

        readStream.pipe(writeStream, { end: false });

        readStream.on('end', () => {
          pendingFiles -= 1;
          if (pendingFiles === 0) {
            writeStream.end();
          }
        });

        readStream.on('error', (err) => {
          console.error(`Error reading CSS file ${file.name}:`, err.message);
        });
      }
    });

    writeStream.on('finish', () => {
      console.log('style.css created successfully!');
    });
  });

  void copyDir(assetsDir, outputAssets);
});
