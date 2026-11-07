const chalk = require("./index.js");

(async () => {
  // Рекомендуется ставить сочный зеленый ('Green' или 'Lime') или 'Gold' для этой анимации!
  await chalk.logoAnimation("CHALK CORE", {
    style: "forge",
    color: "RED",
    speed: 1,
  });
})();
