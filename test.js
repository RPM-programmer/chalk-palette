const path = require("path");
const { playLogo3D } = require("./logo/logo-3d");

async function main() {
  await playLogo3D(path.join(__dirname, "logo", "logo.png"), {
    duration: 10000, // Крутится 4 секунды
    explodeOnStart: false, // Взрыв и сборка в самом начале
    force3D: true,
    explodeOnEnd: false,
  });

  console.log("Анимация завершена!");
}

main();
