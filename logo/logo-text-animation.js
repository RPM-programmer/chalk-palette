// logo-animation.js
const path = require("path");
const codes = require(path.join(__dirname, "..", "src", "rgb-codes.js"));

const BIG_FONT = {
  // Латиница
  A: [" █ ", "█ █", "███", "█ █", "█ █"],
  B: ["██ ", "█ █", "██ ", "█ █", "██ "],
  C: [" ██", "█  ", "█  ", "█  ", " ██"],
  D: ["██ ", "█ █", "█ █", "█ █", "██ "],
  E: ["███", "█  ", "██ ", "█  ", "███"],
  F: ["███", "█  ", "██ ", "█  ", "█  "],
  G: [" ██", "█  ", "█ █", "█ █", " ██"],
  H: ["█ █", "█ █", "███", "█ █", "█ █"],
  I: ["███", " █ ", " █ ", " █ ", "███"],
  J: ["  █", "  █", "  █", "█ █", " ██"],
  K: ["█ █", "██ ", "█  ", "██ ", "█ █"],
  L: ["█  ", "█  ", "█  ", "█  ", "███"],
  M: ["█   █", "██ ██", "█ █ █", "█   █", "█   █"],
  N: ["█ █", "██ █", "█ █ █", "█  ██", "█ █"],
  O: [" ██ ", "█  █", "█  █", "█  █", " ██ "],
  P: ["██ ", "█ █", "██ ", "█  ", "█  "],
  Q: [" ███ ", "█   █", "█   █", "█  █ ", " ██ █"],
  R: ["██ ", "█ █", "██ ", "██ ", "█ █"],
  S: [" ██", "█  ", " ██", "  █", "██ "],
  T: ["███", " █ ", " █ ", " █ ", " █ "],
  U: ["█ █", "█ █", "█ █", "█ █", " ██"],
  V: ["█ █", "█ █", "█ █", "█ █", " █ "],
  W: ["█   █", "█   █", "█ █ █", "██ ██", "█   █"],
  X: ["█ █", " █ ", " █ ", " █ ", "█ █"],
  Y: ["█ █", "█ █", " █ ", " █ ", " █ "],
  Z: ["███", "  █", " █ ", "█  ", "███"],
  "—": ["    ", "    ", "█████", "    ", "    "],
  "-": ["    ", "    ", " ██ ", "    ", "    "],
  "!": [" █ ", " █ ", " █ ", "   ", " █ "],
  ":": [" █ ", "   ", "   ", "   ", " █ "],
  ";": [" █ ", "   ", "   ", "   ", "██ "],
  "·": ["   ", "   ", " █ ", "   ", "   "],
  ".": ["   ", "   ", "   ", "   ", " █ "],
  "(": ["  █ ", " █  ", " █  ", " █ ", "  █ "],
  ")": [" █  ", "  █ ", "  █ ", "  █ ", " █  "],
  "?": [" ██  ", "   █ ", "  █  ", "     ", "  █  "],
  "<": ["   █ ", "  █  ", " █   ", "  █  ", "   █ "],
  ">": [" █   ", "  █  ", "   █ ", "  █  ", " █   "],
  ",": ["    ", "    ", "    ", "  █ ", " █  "],
  "/": ["   █ ", "  █  ", "  █  ", " █   ", " █   "],
  "|": [" █ ", " █ ", " █ ", " █ ", " █ "],
  "\\": [" █   ", "  █  ", "  █  ", "   █ ", "   █ "],
  "'": [" █ ", " █ ", "   ", "   ", "   "],
  '"': [" █ █ ", " █ █ ", "     ", "     ", "     "],
  "`": [" █  ", "  █ ", "    ", "    ", "    "],
  "^": ["  █  ", " █ █ ", "     ", "     ", "     "],
  "[": [" ██ ", " █  ", " █  ", " █  ", " ██ "],
  "]": [" ██ ", "  █ ", "  █ ", "  █ ", " ██ "],
  "{": ["  ██ ", "  █  ", " █   ", "  █  ", "  ██ "],
  "}": [" ██  ", "  █  ", "   █ ", "  █  ", " ██  "],
  "~": ["     ", "     ", "██ █ ", "  █  ", "     "],
  "*": [" █ █ ", "  █  ", " █ █ ", "     ", "     "],
  _: ["     ", "     ", "    ", "    ", " ███ "],
  "=": ["     ", " ███ ", "     ", " ███ ", "     "],
  "+": ["     ", "  █  ", " ███ ", "  █  ", "     "],
  "→": ["    █  ", "     █ ", "████  █", "     █ ", "    █  "],
  "←": ["  █    ", " █     ", "█  ████", " █     ", "  █    "],
  "¡": [" █ ", "   ", " █ ", " █ ", " █ "],
  "¿": ["  █  ", "     ", "  █  ", " █   ", "  ██ "],
  "…": ["     ", "      ", "     ", "     ", "█ █ █"],
  "¬": ["     ", "     ", " ████", "    █", "     "],
  "×": ["     ", " █ █ ", "  █  ", " █ █ ", "     "],
  "@": [" ███ ", "█  ██", "█ ███", "█    ", " ███ "],
  "#": [" █ █ ", "█████", " █ █ ", "█████", " █ █ "],
  $: [" ████", "█ █  ", " ███ ", "  █ █", "████ "],
  "%": ["██  █", "██ █ ", "  █  ", " █ ██", "█  ██"],
  "&": [" ██  ", "█  █ ", " ██  ", "█  █ ", " ██ █"],
  "₽": ["███ ", "█  █", "███ ", "█   ", "███ "],
  "€": [" ███", "█   ", "███ ", "█   ", " ███"],
  "£": ["  ██", " █  ", "███ ", " █  ", "████"],
  "©": [" ███ ", "█ ██ ", "█ █  ", "█ ██ ", " ███ "],
  "°": [" ██ ", "█  █", " ██ ", "    ", "    "],
  "№": ["█ █ ██", "███ █ ", "█ █ ██", "    █ ", "      "],
  "÷": ["     ", "  █  ", "     ", "█████", "  █  "],
  "≠": ["   █ ", "█████", "  █  ", "█████", " █   "],
  "≈": ["     ", " ██ █", "█  █ ", " ██ █", "     "],
  "≤": ["   █ ", "  █  ", " █   ", "  █  ", "████ "],
  "≥": [" █   ", "  █  ", "   █ ", "  █  ", " ████"],
  "±": ["  █  ", " ███ ", "  █  ", "     ", " ███ "],
  "∞": ["     ", "██ ██", "█ █ █", "██ ██", "     "],
  "√": ["   ██", "  █  ", "  █  ", "█ █  ", " █   "],
  "↑": ["  █  ", " ███ ", "█ █ █", "  █  ", "  █  "],
  "↓": ["  █  ", "  █  ", "█ █ █", " ███ ", "  █  "],
  "«": ["  █  █", " █  █ ", "█  █  ", " █  █ ", "  █  █"],
  "»": ["█  █  ", " █  █ ", "  █  █", " █  █ ", "█  █  "],
  "•": ["   ", "   ", " █ ", "   ", "   "],
  // Белорусский алфавит (дополнение к кириллице)
  І: ["███", " █ ", " █ ", " █ ", "███"],
  Ў: ["  █  ", "█   █", " █ █ ", "  █  ", " █   "],

  // Кириллица (Русский алфавит)
  А: [" █ ", "█ █", "███", "█ █", "█ █"],
  Б: ["███", "█  ", "██ ", "█ █", "██ "],
  В: ["██ ", "█ █", "██ ", "█ █", "██ "],
  Г: ["███", "█  ", "█  ", "█  ", "█  "],
  Д: [" ██ ", "█  █", "█  █", "████", "█  █"],
  Е: ["███", "█  ", "██ ", "█  ", "███"],
  Ё: ["█ █", "███", "██ ", "█  ", "███"],
  Ж: ["█ █ █", "█ █ █", " ███ ", "█ █ █", "█ █ █"],
  З: ["██ ", "  █", " ██", "  █", "██ "],
  И: ["█  █", "█ ██", "██ █", "█  █", "█  █"],
  Й: ["█ █ ", "█  █", "█ ██", "██ █", "█  █"],
  К: ["█ █", "██ ", "█  ", "██ ", "█ █"],
  Л: [" ██ ", "█  █", "█  █", "█  █", "█  █"],
  М: ["█   █", "██ ██", "█ █ █", "█   █", "█   █"],
  Н: ["█ █", "█ █", "███", "█ █", "█ █"],
  О: [" ██ ", "█  █", "█  █", "█  █", " ██ "],
  П: ["███", "█ █", "█ █", "█ █", "█ █"],
  Р: ["██ ", "█ █", "██ ", "█  ", "█  "],
  С: [" ██", "█  ", "█  ", "█  ", " ██"],
  Т: ["███", " █ ", " █ ", " █ ", " █ "],
  У: ["█ █", "█ █", " ██", "  █", "██ "],
  Ф: [" █ ", "███", "███", " █ ", " █ "],
  Х: ["█ █", " █ ", " █ ", " █ ", "█ █"],
  Ц: ["█ █ ", "█ █ ", "█ █ ", "████", "   █"],
  Ч: ["█ █", "█ █", "███", "  █", "  █"],
  Ш: ["█ █ █", "█ █ █", "█ █ █", "█ █ █", "█████"],
  Щ: ["█ █ █ ", "█ █ █ ", "█ █ █ ", "█████ ", "     █"],
  Ъ: ["█   ", "██  ", "█ █ ", "█ █ ", "██  "],
  Ы: ["█ █ █", "█ █ █", "██  █", "█ █ █", "██  █"],
  Ь: ["█  ", "█  ", "██ ", "█ █", "██ "],
  Э: ["██ ", "  █", " ██", "  █", "██ "],
  Ю: ["█ ██ ", "█ █ █", "██  █", "█ █ █", "█ ██ "],
  Я: [" ██", "█ █", " ██", "█ █", "█ █"],

  // Цифры и спецсимволы
  " ": ["   ", "   ", "   ", "   ", "   "],
  1: [" █ ", "██ ", " █ ", " █ ", "███"],
  2: ["██ ", "  █", " ██", "█  ", "███"],
  3: ["██ ", "  █", " ██", "  █", "██ "],
  4: ["█ █", "█ █", "███", "  █", "  █"],
  5: ["███", "█  ", "██ ", "  █", "██ "],
  6: [" ██", "█  ", "██ ", "█ █", " ██"],
  7: ["███", "  █", " █ ", " █ ", " █ "],
  8: [" ██ ", "█  █", " ██ ", "█  █", " ██ "],
  9: [" ██ ", "█  █", " ███", "   █", " ██ "],
  0: [" ██ ", "█  █", "█  █", "█  █", " ██ "],
};

module.exports = function logoTextAnimation(text = "MINECRAFT", options = {}) {
  const { spawn } = require("child_process");
  const reset = codes.ansi ? codes.ansi.reset : "\u001b[0m";
  const hideCursor = "\u001b[?25l";
  const showCursor = "\u001b[?25h";

  const style = options.style || "forge";
  const colorName = options.color || "Gold";
  const speed = options.speed || 1;

  const RGB_COLORS = codes.rgb;
  const targetColor = RGB_COLORS[colorName] || RGB_COLORS["Gold"];

  process.stdout.write("\u001b[?1049h\u001b[2J" + hideCursor);
  const rows = process.stdout.rows || 24;
  const columns = process.stdout.columns || 80;

  const centerScreenX = Math.floor(columns / 2);
  const centerScreenY = Math.floor(rows / 2);

  const upperText = text.toUpperCase();
  const letterData = [];
  let totalWidth = 0;

  for (let char of upperText) {
    const matrix = BIG_FONT[char] || BIG_FONT[" "];
    const width = matrix[0].length; // Читаем длину ПЕРВОЙ строки (ширину конкретной буквы)
    letterData.push({ matrix, width });
    totalWidth += width + 1;
  }
  totalWidth -= 1;

  const startX = Math.max(1, Math.floor((columns - totalWidth) / 2));
  const targetY = Math.max(1, Math.floor((rows - 5) / 2));

  const pixels = [];
  let currentX = startX;

  letterData.forEach((lData) => {
    for (let h = 0; h < 5; h++) {
      const rowText = lData.matrix[h];
      for (let w = 0; w < lData.width; w++) {
        if (rowText[w] === "█") {
          const finalX = currentX + w;
          const finalY = targetY + h;

          const randomAngle = Math.random() * Math.PI * 2;
          const turbulenceFactor = 5 + Math.random() * 15;

          pixels.push({
            targetX: finalX,
            targetY: finalY,
            orbitX:
              centerScreenX + Math.cos(randomAngle) * turbulenceFactor * 1.5,
            orbitY: centerScreenY + Math.sin(randomAngle) * turbulenceFactor,
            x: centerScreenX,
            y: centerScreenY,
            lastX: centerScreenX,
            lastY: centerScreenY,
            personalEase: 0.05 + Math.random() * 0.04,
          });
        }
      }
    }
    currentX += lData.width + 1;
  });

  return new Promise((resolve) => {
    let frameCount = 0;
    let isArrived = false;

    const intervalId = setInterval(() => {
      frameCount++;
      let frame = "";

      // ============================================================
      // АНИМАЦИЯ 1: FORGE (Взрыв кусочков из центра и сборка)
      // ============================================================
      if (style === "forge") {
        if (!isArrived) {
          pixels.forEach((p) => {
            if (
              p.lastY >= 1 &&
              p.lastY <= rows &&
              p.lastX >= 1 &&
              p.lastX <= columns
            ) {
              frame += `\u001b[${p.lastY};${p.lastX}H `;
            }
          });

          let arrivedCount = 0;

          pixels.forEach((p) => {
            let currentGoalX = p.targetX;
            let currentGoalY = p.targetY;

            if (frameCount < 15) {
              const t = frameCount / 15;
              currentGoalX = centerScreenX + (p.orbitX - centerScreenX) * t;
              currentGoalY = centerScreenY + (p.orbitY - centerScreenY) * t;
            }

            const ease = p.personalEase * speed;
            p.x += (currentGoalX - p.x) * ease;
            p.y += (currentGoalY - p.y) * ease;

            const cx = Math.round(p.x);
            const cy = Math.round(p.y);
            p.lastX = cx;
            p.lastY = cy;

            if (
              Math.abs(p.x - p.targetX) < 0.15 &&
              Math.abs(p.y - p.targetY) < 0.15
            ) {
              arrivedCount++;
            }

            if (cy >= 1 && cy <= rows && cx >= 1 && cx <= columns) {
              const dist = Math.hypot(p.x - p.targetX, p.y - p.targetY);
              let factor = 1 - dist / 35;
              if (factor < 0.15) factor = 0.15;
              if (factor > 1) factor = 1;

              const r = Math.floor(targetColor[0] * factor);
              const g = Math.floor(targetColor[1] * factor);
              const b = Math.floor(targetColor[2] * factor);

              const char =
                dist > 2.5 ? "░▒▓"[Math.floor(Math.random() * 3)] : "█";
              frame += `\u001b[${cy};${cx}H\u001b[38;2;${r};${g};${b}m${char}`;
            }
          });

          if (arrivedCount === pixels.length || frameCount > 120) {
            isArrived = true;
            frameCount = 0;
          }
        } else {
          const postFrame = frameCount;
          if (postFrame < 15) {
            const flashFactor = Math.sin((postFrame / 15) * Math.PI);
            frame = "";
            pixels.forEach((p) => {
              const r = Math.floor(
                targetColor[0] + (255 - targetColor[0]) * flashFactor,
              );
              const g = Math.floor(
                targetColor[1] + (255 - targetColor[1]) * flashFactor,
              );
              const b = Math.floor(
                targetColor[2] + (255 - targetColor[2]) * flashFactor,
              );
              frame += `\u001b[${p.targetY};${p.targetX}H\u001b[38;2;${r};${g};${b}m█`;
            });
          } else if (postFrame < 35) {
            const fadeFactor = 1 - (postFrame - 15) / 20;
            frame = "";
            pixels.forEach((p) => {
              const r = Math.floor(targetColor[0] * fadeFactor);
              const g = Math.floor(targetColor[1] * fadeFactor);
              const b = Math.floor(targetColor[2] * fadeFactor);
              frame += `\u001b[${p.targetY};${p.targetX}H\u001b[38;2;${r};${g};${b}m█`;
            });
          } else {
            clearInterval(intervalId);
            process.stdout.write("\u001b[?1049l" + showCursor + reset);
            resolve();
            return;
          }
        }
      }
      // ============================================================
      // АНИМАЦИЯ 2: SLIDE (Кинематографичный выезд огромных букв слева)
      // ============================================================
      else if (style === "slide") {
        frame = "\u001b[H\u001b[2J";
        const progress = frameCount * 0.035 * speed;
        if (progress >= 1.4) {
          clearInterval(intervalId);
          process.stdout.write("\u001b[?1049l" + showCursor + reset);
          resolve();
          return;
        }
        pixels.forEach((p) => {
          const currentProgressX = Math.min(1, progress);
          const curX = Math.round(1 + (p.targetX - 1) * currentProgressX);
          const r = Math.floor(targetColor[0] * currentProgressX);
          const g = Math.floor(targetColor[1] * currentProgressX);
          const b = Math.floor(targetColor[2] * currentProgressX);
          if (
            p.targetY >= 1 &&
            p.targetY <= rows &&
            curX >= 1 &&
            curX <= columns
          ) {
            frame += `\u001b[${p.targetY};${curX}H\u001b[38;2;${r};${g};${b}m█`;
          }
        });
      }
      // ============================================================
      // АНИМАЦИЯ 3: POP (Резкое появление гигантских букв с пульсацией)
      // ============================================================
      else if (style === "pop") {
        frame = "\u001b[H\u001b[2J";
        if (frameCount > 50) {
          clearInterval(intervalId);
          process.stdout.write("\u001b[?1049l" + showCursor + reset);
          resolve();
          return;
        }
        const pulse =
          1 + Math.sin(frameCount * 0.22) * 0.15 * Math.exp(-frameCount * 0.05);
        const r = Math.floor(
          Math.max(0, Math.min(255, targetColor[0] * pulse)),
        );
        const g = Math.floor(
          Math.max(0, Math.min(255, targetColor[1] * pulse)),
        );
        const b = Math.floor(
          Math.max(0, Math.min(255, targetColor[2] * pulse)),
        );
        pixels.forEach((p) => {
          if (
            p.targetY >= 1 &&
            p.targetY <= rows &&
            p.targetX >= 1 &&
            p.targetX <= columns
          ) {
            frame += `\u001b[${p.targetY};${p.targetX}H\u001b[38;2;${r};${g};${b}m█`;
          }
        });
      }
      process.stdout.write(frame + reset);
    }, 30);
  });
};
