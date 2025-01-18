const fs = require('fs').promises;
const path = require('path');

async function copyDir(srcDir, destDir) {
  let isExist;
  try {
    await fs.access(destDir, fs.constants.F_OK);
    isExist = true;
  } catch (err) {
    isExist = false;
  }
  if (isExist) {
    await fs
      .rm(destDir, { recursive: true, force: true })
      .catch((err) => console.log(err));
  }
  await fs
    .mkdir(destDir, { recursive: true })
    .catch((err) => console.error('Error creating directory:', err.message));
  const entries = await fs
    .readdir(srcDir, { withFileTypes: true })
    .catch((err) => console.error('Error reading directory:', err.message));
  await Promise.all(
    entries.map(async (entry) => {
      const srcPath = path.join(srcDir, entry.name);
      const destPath = path.join(destDir, entry.name);

      if (entry.isDirectory()) {
        await copyDir(srcPath, destPath);
      } else if (entry.isFile()) {
        await fs
          .copyFile(srcPath, destPath)
          .catch((err) => console.error('Error copying file:', err.message));
      }
    }),
  );
}
const srcDir = path.join(__dirname, 'files');
const destDir = path.join(__dirname, 'files-copy');

void copyDir(srcDir, destDir);
