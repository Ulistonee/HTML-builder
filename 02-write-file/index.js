const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'output.txt');

const writeStream = fs.createWriteStream(filePath, { flags: 'a' });

console.log(
  'Привет! Введите текст для записи в файл (или введите "exit" для выхода):',
);

process.stdin.on('data', (data) => {
  const input = data.toString().trim();

  if (input.toLowerCase() === 'exit') {
    sayGoodbye();
  } else {
    writeStream.write(input + '\n');
    console.log('Текст записан. Введите новый текст (или "exit" для выхода):');
  }
});

process.on('SIGINT', sayGoodbye);

function sayGoodbye() {
  console.log('Спасибо за использование программы. До свидания!');
  writeStream.end();
  process.exit();
}
