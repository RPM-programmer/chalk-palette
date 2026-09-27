const AnimationClass = require("./animation.js");
const anime = new AnimationClass();

async function testShimmer() {
    console.log("Запуск эффекта блика строки...");
    await new Promise(r => setTimeout(r, 1000));

    // Текст горит синим, и по нему пробегает яркая белая волна
    await anime.textShimmer("GLOSSY TEXT WITH NEON SHIMMER EFFECT", 2500);

    console.log("Эффект завершен.");
}

testShimmer().catch(console.error);
