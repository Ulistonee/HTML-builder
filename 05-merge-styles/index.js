const fs = require('fs');
const path = require('path');

const stylesFolder = path.join(__dirname, 'styles');
const outputFolder = path.join(__dirname, 'project-dist');
const outputFile = path.join(outputFolder, 'bundle.css');

fs.mkdir(outputFolder, { recursive: true }, (err) => {
  if (err) {
    console.error('Error creating project-dist folder:', err.message);
    return;
  }

  const writeStream = fs.createWriteStream(outputFile);

  fs.readdir(stylesFolder, { withFileTypes: true }, (err, files) => {
    if (err) {
      console.error('Error reading styles folder:', err.message);
      return;
    }

    files.forEach((file) => {
      const filePath = path.join(stylesFolder, file.name);

      if (file.isFile() && path.extname(file.name) === '.css') {
        const readStream = fs.createReadStream(filePath, 'utf8');
        readStream.pipe(writeStream, { end: false });

        readStream.on('end', () => {
          console.log(`${file.name} merged into bundle.css`);
        });

        readStream.on('error', (err) => {
          console.error(`Error reading file ${file.name}:`, err.message);
        });
      } else {
        console.log(`Skipping non-CSS file: ${file.name}`);
      }
    });

    writeStream.on('finish', () => {
      console.log('bundle.css successfully created!');
    });
  });
});
