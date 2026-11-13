const fs = require("fs");
const zlib = require("zlib");

function readPNG(filePath) {
  const buf = fs.readFileSync(filePath);
  if (buf.readUInt32BE(0) !== 0x89504e47) {
    throw new Error("Файл не является корректным PNG");
  }

  let width = 0,
    height = 0,
    colorType = 0;
  const idatChunks = [];
  let offset = 8;

  while (offset < buf.length) {
    const length = buf.readUInt32BE(offset);
    const type = buf.toString("ascii", offset + 4, offset + 8);
    const data = buf.subarray(offset + 8, offset + 8 + length);

    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      colorType = data[9]; // 2 = RGB, 6 = RGBA
    } else if (type === "IDAT") {
      idatChunks.push(data);
    } else if (type === "IEND") {
      break;
    }
    offset += 12 + length;
  }

  const raw = zlib.inflateSync(Buffer.concat(idatChunks));
  const bpp = colorType === 6 ? 4 : 3;
  const stride = width * bpp;
  const unfilter = Buffer.alloc(height * stride);

  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    const rowStart = y * (stride + 1) + 1;
    const outStart = y * stride;

    for (let x = 0; x < stride; x++) {
      const val = raw[rowStart + x];
      const a = x >= bpp ? unfilter[outStart + x - bpp] : 0;
      const b = y > 0 ? unfilter[outStart - stride + x] : 0;
      const c = x >= bpp && y > 0 ? unfilter[outStart - stride + x - bpp] : 0;

      let res = val;
      if (filter === 1) res = (val + a) & 0xff;
      else if (filter === 2) res = (val + b) & 0xff;
      else if (filter === 3) res = (val + ((a + b) >> 1)) & 0xff;
      else if (filter === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a),
          pb = Math.abs(p - b),
          pc = Math.abs(p - c);
        const pr = pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
        res = (val + pr) & 0xff;
      }
      unfilter[outStart + x] = res;
    }
  }

  const particles = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * stride + x * bpp;
      const r = unfilter[i],
        g = unfilter[i + 1],
        b = unfilter[i + 2];
      const a = bpp === 4 ? unfilter[i + 3] : 255;

      if (a > 128) {
        particles.push({ targetX: x, targetY: y, r, g, b });
      }
    }
  }
  return { width, height, particles };
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Анимирует сборку PNG-логотипа в терминале
 * @param {string} filePath Путь к PNG-файлу
 * @param {object} options Настройки анимации
 * @returns {Promise<void>}
 */
function animateLogo(filePath, options = {}) {
  const {
    frames = 40, // Количество кадров сборки
    fps = 25, // Кадров в секунду
    padX = 10, // Горизонтальный отступ для разлёта
    padY = 6, // Вертикальный отступ для разлёта
    loop = false, // Зациклить или остановиться после сборки
  } = options;

  return new Promise((resolve) => {
    const logo = readPNG(filePath);
    const canvasW = logo.width + padX * 2;
    const canvasH = logo.height + padY * 2;
    const linesCount = Math.ceil(canvasH / 2);

    const particles = logo.particles.map((p) => ({
      ...p,
      targetX: p.targetX + padX,
      targetY: p.targetY + padY,
      startX: Math.floor(Math.random() * canvasW),
      startY: Math.floor(Math.random() * canvasH),
      delay: Math.random() * 0.35,
    }));

    function renderFrame(progress) {
      const grid = Array.from({ length: canvasH }, () =>
        Array(canvasW).fill(null),
      );

      for (const p of particles) {
        const localT = Math.max(
          0,
          Math.min(1, (progress - p.delay) / (1 - p.delay)),
        );
        const eased = easeOutCubic(localT);
        const curX = Math.round(p.startX + (p.targetX - p.startX) * eased);
        const curY = Math.round(p.startY + (p.targetY - p.startY) * eased);

        if (curY >= 0 && curY < canvasH && curX >= 0 && curX < canvasW) {
          grid[curY][curX] = p;
        }
      }

      let out = "";
      for (let y = 0; y < canvasH; y += 2) {
        for (let x = 0; x < canvasW; x++) {
          const top = grid[y][x];
          const bot = grid[y + 1] ? grid[y + 1][x] : null;

          if (!top && !bot) out += "\x1b[0m ";
          else if (top && !bot)
            out += `\x1b[0m\x1b[38;2;${top.r};${top.g};${top.b}m▀`;
          else if (!top && bot)
            out += `\x1b[0m\x1b[38;2;${bot.r};${bot.g};${bot.b}m▄`;
          else
            out += `\x1b[38;2;${top.r};${top.g};${top.b}m\x1b[48;2;${bot.r};${bot.g};${bot.b}m▀`;
        }
        out += "\x1b[0m\n";
      }
      return out;
    }

    let currentFrame = 0;
    let direction = 1;

    process.stdout.write("\x1b[?25l"); // Скрываем курсор

    const cleanup = () => {
      clearInterval(timer);
      process.stdout.write("\x1b[?25h\x1b[0m"); // Возвращаем курсор и сбрасываем цвет
      process.off("SIGINT", onSigInt);
    };

    const onSigInt = () => {
      cleanup();
      process.stdout.write("\n");
      process.exit();
    };

    process.on("SIGINT", onSigInt);

    const timer = setInterval(
      () => {
        const progress = currentFrame / frames;
        const output = renderFrame(progress);

        if (currentFrame > 0 || direction === -1) {
          process.stdout.write(`\x1b[${linesCount}A`);
        }
        process.stdout.write(output);

        if (!loop && currentFrame >= frames) {
          cleanup();
          resolve();
          return;
        }

        currentFrame += direction;
        if (currentFrame >= frames) {
          currentFrame = frames;
          direction = -1;
        } else if (currentFrame <= 0) {
          currentFrame = 0;
          direction = 1;
        }
      },
      Math.floor(1000 / fps),
    );
  });
}

module.exports = { animateLogo, readPNG };
