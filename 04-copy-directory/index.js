const fs = require('fs');
const path = require('path');

function copyDir(srcDir, destDir) {
  fs.mkdir(destDir, { recursive: true }, (err) => {
    if (err) {
      console.error('Error creating directory:', err.message);
      return;
    }

    fs.readdir(srcDir, { withFileTypes: true }, (err, entries) => {
      if (err) {
        console.error('Error reading directory:', err.message);
        return;
      }

      fs.readdir(destDir, { withFileTypes: true }, (err, destEntries) => {
        if (err)
          return console.error(
            'Error reading destination directory:',
            err.message,
          );
        destEntries.forEach((entry) => {
          const destPath = path.join(destDir, entry.name);
          fs.rm(destPath, { recursive: true, force: true }, (err) => {
            if (err) console.error('Error removing old file:', err.message);
          });
        });

        entries.forEach((entry) => {
          const srcPath = path.join(srcDir, entry.name);
          const destPath = path.join(destDir, entry.name);

          if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
          } else if (entry.isFile()) {
            fs.copyFile(srcPath, destPath, (err) => {
              if (err) {
                console.error('Error copying file:', err.message);
              }
            });
          }
        });
      });
    });
  });
}

const srcDir = path.join(__dirname, 'files');
const destDir = path.join(__dirname, 'files-copy');

copyDir(srcDir, destDir);
