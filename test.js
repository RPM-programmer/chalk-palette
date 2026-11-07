// test.js
const chalk = require("./index.js");

(async () => {
  console.log("Включение камеры в режиме Hyper-Expansion через 2 секунды...");
  console.log("Нажмите 'q' или Ctrl+C для выхода.");
  await new Promise((r) => setTimeout(r, 2000));

  // Включаем режим Брайля { hyperExpansion: true }
  // По желанию можно отключить зеркалирование: { hyperExpansion: true, mirror: false }
  await chalk.cameraStream(15000, { hyperExpansion: true });

  console.log("Трансляция с камеры завершена!");
})();
