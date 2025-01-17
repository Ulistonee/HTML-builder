const fs = require('fs');
const path = require('path');

const secretFolderPath = path.join(__dirname, 'secret-folder');

fs.readdir(secretFolderPath, { withFileTypes: true }, (err, files) => {
  if (err) {
    console.error('Error reading the folder:', err.message);
    return;
  }

  files.forEach((file) => {
    if (file.isFile()) {
      const filePath = path.join(secretFolderPath, file.name);

      fs.stat(filePath, (err, stats) => {
        if (err) {
          console.error('Error getting file stats:', err.message);
          return;
        }

        const { name, ext } = path.parse(file.name);
        const sizeInKB = stats.size / 1024;

        console.log(`${name} - ${ext.slice(1)} - ${sizeInKB.toFixed(3)}kb`);
      });
    }
  });
});
