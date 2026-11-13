const fs = require("fs");
const zlib = require("zlib");
const os = require("os");
const { performance } = require("perf_hooks");

function checkCPU() {
  const cpus = os.cpus() || [];
  const cores = cpus.length;
  if (cores === 0) return { ok: false, reason: "Не удалось определить CPU" };

  const speed = cpus[0].speed || 2000;
  if (cores === 1 && speed < 1500) {
    return {
      ok: false,
      reason: "Не хватает ядер и частоты CPU для 3D-анимации",
    };
  }

  const load1m = os.loadavg()[0];
  if (load1m > 0 && load1m > cores * 0.9) {
    return {
      ok: false,
      reason: "Не хватает свободных ресурсов CPU (система перегружена)",
    };
  }

  const t0 = performance.now();
  let dummy = 0;
  for (let i = 0; i < 150000; i++) dummy += Math.sin(i) * Math.cos(i);
  if (performance.now() - t0 > 25 && dummy !== Infinity) {
    return {
      ok: false,
      reason: "Не хватает производительности CPU для плавного 3D",
    };
  }

  return { ok: true, reason: "" };
}

function playFallbackAnimation(reason, duration = 2500) {
  return new Promise((resolve) => {
    const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
    const startTime = Date.now();
    let tick = 0;

    process.stdout.write("\x1b[2J\x1b[H\x1b[?25l");

    const cleanup = () => {
      clearInterval(timer);
      process.stdout.write("\x1b[2J\x1b[H\x1b[?25h\x1b[0m");
      process.off("SIGINT", onSigInt);
    };

    const onSigInt = () => {
      cleanup();
      process.exit();
    };
    process.on("SIGINT", onSigInt);

    const timer = setInterval(() => {
      if (Date.now() - startTime >= duration) {
        cleanup();
        resolve();
        return;
      }

      const cols = process.stdout.columns || 80;
      const rows = process.stdout.rows || 24;
      const spinner = frames[tick % frames.length];
      const message = `${spinner} ${reason}...`;

      const padTop = Math.max(0, Math.floor(rows / 2));
      const padLeft = Math.max(0, Math.floor((cols - message.length) / 2));

      let out = "\x1b[H" + "\n".repeat(padTop);
      out +=
        " ".repeat(padLeft) +
        `\x1b[38;2;255;190;70m${spinner}\x1b[0m \x1b[38;2;200;200;200m${reason}...\x1b[0m`;

      process.stdout.write(out);
      tick++;
    }, 80);
  });
}

function readPNG(filePath) {
  const buf = fs.readFileSync(filePath);
  if (buf.readUInt32BE(0) !== 0x89504e47) {
    throw new Error("Файл не является корректным PNG");
  }

  let width = 0,
    height = 0,
    bitDepth = 8,
    colorType = 0;
  const idatChunks = [];
  let palette = null;
  let transparency = null;
  let offset = 8;

  while (offset < buf.length) {
    const length = buf.readUInt32BE(offset);
    const type = buf.toString("ascii", offset + 4, offset + 8);
    const data = buf.subarray(offset + 8, offset + 8 + length);

    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data.readUInt8(8);
      colorType = data.readUInt8(9);
    } else if (type === "PLTE") palette = data;
    else if (type === "tRNS") transparency = data;
    else if (type === "IDAT") idatChunks.push(data);
    else if (type === "IEND") break;
    offset += 12 + length;
  }

  const raw = zlib.inflateSync(Buffer.concat(idatChunks));
  const channelsMap = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 };
  const channels = channelsMap[colorType] || 4;
  const bpp = Math.max(1, Math.ceil((bitDepth * channels) / 8));
  const stride = Math.ceil((width * bitDepth * channels) / 8);
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

  function getPixelRGBA(x, y) {
    const rowOffset = y * stride;
    if (colorType === 6) {
      const i = rowOffset + x * 4;
      return {
        r: unfilter[i],
        g: unfilter[i + 1],
        b: unfilter[i + 2],
        a: unfilter[i + 3],
      };
    }
    if (colorType === 2) {
      const i = rowOffset + x * 3;
      return { r: unfilter[i], g: unfilter[i + 1], b: unfilter[i + 2], a: 255 };
    }
    if (colorType === 3 && palette) {
      let idx = 0;
      if (bitDepth === 8) idx = unfilter[rowOffset + x];
      else if (bitDepth === 4)
        idx = (unfilter[rowOffset + (x >> 1)] >> ((1 - (x & 1)) * 4)) & 0x0f;
      else if (bitDepth === 2)
        idx = (unfilter[rowOffset + (x >> 2)] >> ((3 - (x & 3)) * 2)) & 0x03;
      else if (bitDepth === 1)
        idx = (unfilter[rowOffset + (x >> 3)] >> (7 - (x & 7))) & 0x01;

      const pIdx = idx * 3;
      const a =
        transparency && idx < transparency.length ? transparency[idx] : 255;
      return {
        r: palette[pIdx],
        g: palette[pIdx + 1],
        b: palette[pIdx + 2],
        a,
      };
    }
    if (colorType === 4) {
      const i = rowOffset + x * 2;
      const v = unfilter[i];
      return { r: v, g: v, b: v, a: unfilter[i + 1] };
    }
    const v = unfilter[rowOffset + x];
    return { r: v, g: v, b: v, a: 255 };
  }

  // 1. Авто-обрезка (Auto-Crop) пустых или чисто чёрных полей вокруг логотипа
  let minX = width,
    minY = height,
    maxX = 0,
    maxY = 0;
  const isVisible = (p) => p.a > 128 && (p.r > 22 || p.g > 22 || p.b > 22);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (isVisible(getPixelRGBA(x, y))) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  // Если картинка полностью пустая, откатываемся к исходным границам
  if (minX > maxX || minY > maxY) {
    minX = 0;
    minY = 0;
    maxX = width - 1;
    maxY = height - 1;
  }

  const cropW = maxX - minX + 1;
  const cropH = maxY - minY + 1;

  // 2. Масштабируем обрезанный логотип до сетки 44x44
  const maxSize = 44;
  const scale = Math.min(1, maxSize / cropW, maxSize / cropH);
  const outW = Math.max(1, Math.floor(cropW * scale));
  const outH = Math.max(1, Math.floor(cropH * scale));

  const voxels = [];
  const cx = outW / 2;
  const cy = outH / 2;

  for (let y = 0; y < outH; y++) {
    const srcY = Math.min(maxY, minY + Math.floor(y / scale));
    for (let x = 0; x < outW; x++) {
      const srcX = Math.min(maxX, minX + Math.floor(x / scale));
      const p = getPixelRGBA(srcX, srcY);

      if (isVisible(p)) {
        for (let z = -1; z <= 1; z++) {
          const shade = z === 1 ? 1.0 : z === 0 ? 0.65 : 0.45;
          voxels.push({
            x: x - cx,
            y: y - cy,
            z: z * 1.4,
            r: Math.floor(p.r * shade),
            g: Math.floor(p.g * shade),
            b: Math.floor(p.b * shade),
            vx: (Math.random() - 0.5) * 6,
            vy: (Math.random() - 0.5) * 6,
            vz: (Math.random() - 0.5) * 6,
          });
        }
      }
    }
  }

  return { width: outW, height: outH, voxels };
}

function playLogo3D(filePath, options = {}) {
  const {
    duration = 4000,
    explodeOnStart = true,
    explodeOnEnd = true,
    force3D = false,
  } = options;

  if (!force3D) {
    const cpuStatus = checkCPU();
    if (!cpuStatus.ok) {
      return playFallbackAnimation(cpuStatus.reason, Math.min(duration, 2500));
    }
  }

  return new Promise((resolve) => {
    const { width: logoW, height: logoH, voxels } = readPNG(filePath);
    const startTime = Date.now();
    const endExplodeDuration = 550;

    let angleY = 0;
    let startForce = explodeOnStart ? 1.0 : 0;

    process.stdout.write("\x1b[2J\x1b[H\x1b[?25l");

    const cleanup = () => {
      clearInterval(timer);
      process.stdout.write("\x1b[2J\x1b[H\x1b[?25h\x1b[0m");
      process.off("SIGINT", onSigInt);
    };

    const onSigInt = () => {
      cleanup();
      process.exit();
    };
    process.on("SIGINT", onSigInt);

    const timer = setInterval(() => {
      const frameStart = performance.now();
      const elapsed = Date.now() - startTime;
      const remaining = duration - elapsed;

      if (remaining <= 0) {
        cleanup();
        resolve();
        return;
      }

      const canvasW = process.stdout.columns || 80;
      const rows = process.stdout.rows || 24;
      const canvasH = rows * 2;
      const fitScale = Math.min(
        canvasW / (logoW * 1.45),
        canvasH / (logoH * 1.45),
      );

      angleY += 0.06;
      const angleX = Math.sin(angleY * 0.5) * 0.25;

      if (startForce > 0.001) startForce *= 0.88;
      else startForce = 0;

      let endForce = 0;
      let fadeAlpha = 1;
      if (explodeOnEnd && remaining < endExplodeDuration) {
        const t = 1 - remaining / endExplodeDuration;
        endForce = t * t * 1.4;
        fadeAlpha = Math.max(0, 1 - t * 0.85);
      }

      const totalForce = startForce + endForce;
      const zBuffer = Array.from({ length: canvasH }, () =>
        Array(canvasW).fill(-Infinity),
      );
      const colorGrid = Array.from({ length: canvasH }, () =>
        Array(canvasW).fill(null),
      );

      const cosY = Math.cos(angleY),
        sinY = Math.sin(angleY);
      const cosX = Math.cos(angleX),
        sinX = Math.sin(angleX);
      const lightBoost = Math.max(0, cosY * cosX) * 45;

      for (const v of voxels) {
        const px = v.x + v.vx * totalForce * 14;
        const py = v.y + v.vy * totalForce * 14;
        const pz = v.z + v.vz * totalForce * 14;

        const x1 = px * cosY - pz * sinY;
        const z1 = pz * cosY + px * sinY;

        const y2 = py * cosX - z1 * sinX;
        const z2 = z1 * cosX + py * sinX;
        const fov = 55;
        const perspective = fov / (fov + z2 + 15);
        const screenX = Math.round(canvasW / 2 + x1 * perspective * fitScale);
        const screenY = Math.round(canvasH / 2 + y2 * perspective * fitScale);
        if (
          screenX >= 0 &&
          screenX < canvasW &&
          screenY >= 0 &&
          screenY < canvasH
        ) {
          if (z2 > zBuffer[screenY][screenX]) {
            zBuffer[screenY][screenX] = z2;
            colorGrid[screenY][screenX] = {
              r: Math.min(255, Math.floor((v.r + lightBoost) * fadeAlpha)),
              g: Math.min(255, Math.floor((v.g + lightBoost) * fadeAlpha)),
              b: Math.min(255, Math.floor((v.b + lightBoost) * fadeAlpha)),
            };
          }
        }
      }
      let out = "\x1b[H";
      for (let y = 0; y < canvasH; y += 2) {
        for (let x = 0; x < canvasW; x++) {
          const top = colorGrid[y][x];
          const bot = colorGrid[y + 1] ? colorGrid[y + 1][x] : null;
          if (!top && !bot) out += "\x1b[0m ";
          else if (top && !bot)
            out += `\x1b[0m\x1b[38;2;${top.r};${top.g};${top.b}m▀`;
          else if (!top && bot)
            out += `\x1b[0m\x1b[38;2;${bot.r};${bot.g};${bot.b}m▄`;
          else
            out += `\x1b[38;2;${top.r};${top.g};${top.b}m\x1b[48;2;${bot.r};${bot.g};${bot.b}m▀`;
        }
        if (y + 2 < canvasH) out += "\x1b[0m\n";
      }
      out += "\x1b[0m";
      process.stdout.write(out);
      if (!force3D && performance.now() - frameStart > 65) {
        cleanup();
        playFallbackAnimation(
          "Не хватает скорости CPU во время рендера",
          Math.min(remaining, 1500),
        ).then(resolve);
      }
    }, 30);
  });
}
module.exports = { playLogo3D, checkCPU, readPNG };
