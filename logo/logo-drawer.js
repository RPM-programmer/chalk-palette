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
      colorType = data[9]; // 9-й байт IHDR — это тип цвета (2 = RGB, 6 = RGBA)
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

  // Учитываем И ширину, И высоту окна терминала
  const maxW = (process.stdout.columns || 80) - 6;
  const maxH = ((process.stdout.rows || 24) - 2) * 2;
  const scale = Math.min(1, maxW / width, maxH / height);

  const outW = Math.max(1, Math.floor(width * scale));
  const outH = Math.max(1, Math.floor(height * scale));

  const map = Array.from({ length: outH }, () => Array(outW).fill(null));
  const pixels = [];

  for (let y = 0; y < outH; y++) {
    const srcY = Math.min(height - 1, Math.floor(y / scale));
    for (let x = 0; x < outW; x++) {
      const srcX = Math.min(width - 1, Math.floor(x / scale));
      const i = srcY * stride + srcX * bpp;
      const r = unfilter[i],
        g = unfilter[i + 1],
        b = unfilter[i + 2];
      const a = bpp === 4 ? unfilter[i + 3] : 255;

      if (a > 128) {
        const px = { x, y, r, g, b };
        map[y][x] = px;
        pixels.push(px);
      }
    }
  }

  return { width: outW, height: outH, pixels, map };
}

function sortPixels(logo, mode) {
  const { pixels, map, width, height } = logo;

  if (mode === "zigzag") {
    return [...pixels].sort((a, b) => {
      if (a.y !== b.y) return a.y - b.y;
      return a.y % 2 === 0 ? a.x - b.x : b.x - a.x;
    });
  }

  if (mode === "spiral") {
    const cx = width / 2;
    const cy = height / 2;
    return [...pixels].sort((a, b) => {
      const distA = Math.hypot(a.x - cx, a.y - cy);
      const distB = Math.hypot(b.x - cx, b.y - cy);
      if (Math.abs(distA - distB) > 1.5) return distA - distB;
      return Math.atan2(a.y - cy, a.x - cx) - Math.atan2(b.y - cy, b.x - cx);
    });
  }

  if (mode === "outline") {
    const edges = [];
    const inner = [];

    for (const p of pixels) {
      const hasEmptyNeighbor =
        !map[p.y - 1]?.[p.x] ||
        !map[p.y + 1]?.[p.x] ||
        !map[p.y]?.[p.x - 1] ||
        !map[p.y]?.[p.x + 1];

      if (hasEmptyNeighbor) edges.push(p);
      else inner.push(p);
    }

    const cx = width / 2,
      cy = height / 2;
    edges.sort(
      (a, b) => Math.atan2(a.y - cy, a.x - cx) - Math.atan2(b.y - cy, b.x - cx),
    );
    return [...edges, ...inner];
  }

  return pixels;
}

function drawLogo(filePath, options = {}) {
  const {
    mode = "outline",
    fps = 30,
    duration = 1500,
    brushGlow = true,
    padLeft = 2,
  } = options;

  return new Promise((resolve) => {
    const logo = readPNG(filePath);
    const ordered = sortPixels(logo, mode);
    const totalPixels = ordered.length;
    const totalFrames = Math.max(1, Math.round((duration / 1000) * fps));
    const margin = " ".repeat(padLeft);

    function renderStep(visibleCount) {
      const grid = Array.from({ length: logo.height }, () =>
        Array(logo.width).fill(null),
      );
      const glowTail = Math.max(3, Math.floor(totalPixels * 0.04));

      for (let i = 0; i < visibleCount; i++) {
        const p = ordered[i];
        const isTip =
          brushGlow &&
          visibleCount < totalPixels &&
          visibleCount - i <= glowTail;

        if (isTip) {
          grid[p.y][p.x] = {
            r: Math.min(255, p.r + 110),
            g: Math.min(255, p.g + 110),
            b: Math.min(255, p.b + 110),
          };
        } else {
          grid[p.y][p.x] = p;
        }
      }

      let out = "\x1b[H"; // Ставим курсор строго в верхний левый угол экрана
      for (let y = 0; y < logo.height; y += 2) {
        out += margin;
        for (let x = 0; x < logo.width; x++) {
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

    let frame = 0;
    // Очищаем экран и прячем курсор перед началом рисования
    process.stdout.write("\x1b[2J\x1b[H\x1b[?25l");

    const cleanup = () => {
      clearInterval(timer);
      process.stdout.write("\x1b[?25h\x1b[0m");
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
        frame++;
        const progress = Math.min(1, frame / totalFrames);
        const visibleCount = Math.floor(totalPixels * progress);

        process.stdout.write(renderStep(visibleCount));

        if (frame >= totalFrames) {
          cleanup();
          resolve();
        }
      },
      Math.floor(1000 / fps),
    );
  });
}
function playShimmer(logo, padLeft = 2) {
  return new Promise((resolve) => {
    const margin = " ".repeat(padLeft);
    const maxWave = logo.width + logo.height + 10;
    let wave = -5;

    const timer = setInterval(() => {
      let out = "\x1b[H";
      for (let y = 0; y < logo.height; y += 2) {
        out += margin;
        for (let x = 0; x < logo.width; x++) {
          const top = logo.map[y][x];
          const bot = logo.map[y + 1] ? logo.map[y + 1][x] : null;

          // Вычисляем расстояние до диагональной линии блика
          const boostTop = top && Math.abs(x + y - wave) < 3 ? 90 : 0;
          const boostBot = bot && Math.abs(x + y + 1 - wave) < 3 ? 90 : 0;

          const tr = top ? Math.min(255, top.r + boostTop) : 0;
          const tg = top ? Math.min(255, top.g + boostTop) : 0;
          const tb = top ? Math.min(255, top.b + boostTop) : 0;

          const br = bot ? Math.min(255, bot.r + boostBot) : 0;
          const bg = bot ? Math.min(255, bot.g + boostBot) : 0;
          const bb = bot ? Math.min(255, bot.b + boostBot) : 0;

          if (!top && !bot) out += "\x1b[0m ";
          else if (top && !bot) out += `\x1b[0m\x1b[38;2;${tr};${tg};${tb}m▀`;
          else if (!top && bot) out += `\x1b[0m\x1b[38;2;${br};${bg};${bb}m▄`;
          else
            out += `\x1b[38;2;${tr};${tg};${tb}m\x1b[48;2;${br};${bg};${bb}m▀`;
        }
        out += "\x1b[0m\n";
      }

      process.stdout.write(out);
      wave += 2;

      if (wave > maxWave) {
        clearInterval(timer);
        resolve();
      }
    }, 35);
  });
}

module.exports = { drawLogo, readPNG, playShimmer };
