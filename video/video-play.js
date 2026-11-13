// video-play.js
const path = require("path");
const codes = require(path.join(__dirname, "..", "src", "rgb-codes.js"));

module.exports = function videoPlayer(
  videoPath,
  duration = 10000,
  options = {},
) {
  const { spawn } = require("child_process");

  const hyperExpansion =
    options.hyperExpansion !== undefined ? options.hyperExpansion : false;

  const reset = codes.ansi ? codes.ansi.reset : "\u001b[0m";
  const hideCursor = "\u001b[?25l";
  const showCursor = "\u001b[?25h";

  process.stdout.write("\u001b[?1049h\u001b[2J" + hideCursor);
  const rows = process.stdout.rows || 24;
  const columns = process.stdout.columns || 80;

  const videoWidth = hyperExpansion ? columns * 2 : columns;
  const videoHeight = hyperExpansion ? rows * 4 : rows * 2;

  const ffmpeg = spawn("ffmpeg", [
    "-i",
    videoPath,
    "-t",
    duration / 1000,
    "-vf",
    `scale=${videoWidth}:${videoHeight}`,
    "-f",
    "rawvideo",
    "-pix_fmt",
    "rgb24",
    "-r",
    "24",
    "-",
  ]);

  const frameSize = videoWidth * videoHeight * 3;
  let buffer = Buffer.alloc(0);
  const frameQueue = [];
  let ffmpegClosed = false;

  ffmpeg.stdout.on("data", (chunk) => {
    if (buffer === null) return;

    buffer = Buffer.concat([buffer, chunk]);
    while (buffer.length >= frameSize) {
      const frameData = Buffer.alloc(frameSize);
      buffer.copy(frameData, 0, 0, frameSize);
      frameQueue.push(frameData);
      buffer = buffer.subarray(frameSize);
    }
  });

  ffmpeg.stderr.on("data", () => {});

  return new Promise((resolve) => {
    const intervalId = setInterval(() => {
      if (ffmpegClosed && frameQueue.length === 0) {
        clearInterval(intervalId);
        try {
          ffmpeg.stdout.removeAllListeners("data");
        } catch (e) {}
        ffmpeg.kill("SIGKILL");
        buffer = null;
        process.stdout.write("\u001b[?1049l" + showCursor + reset);
        resolve();
        return;
      }

      if (frameQueue.length === 0) return;

      const frameBuffer = frameQueue.shift();
      let frame = "\u001b[H";

      // ============================================================
      // РЕЖИМ 1: HYPER EXPANSION (Многоцветный Брайль 2х4)
      // ============================================================
      if (hyperExpansion) {
        const stride = videoWidth * 3;

        for (let y = 0; y < videoHeight; y += 4) {
          const row0 = y * stride;
          const row1 = (y + 1) * stride;
          const row2 = (y + 2) * stride;
          const row3 = (y + 3) * stride;

          for (let x = 0; x < videoWidth; x += 2) {
            const x0 = x * 3;
            const x1 = (x + 1) * 3;

            // Пиксели левой колонки (X = 0)
            const r00 = frameBuffer[row0 + x0],
              g00 = frameBuffer[row0 + x0 + 1],
              b00 = frameBuffer[row0 + x0 + 2];
            const r10 = frameBuffer[row1 + x0],
              g10 = frameBuffer[row1 + x0 + 1],
              b10 = frameBuffer[row1 + x0 + 2];
            const r20 = frameBuffer[row2 + x0],
              g20 = frameBuffer[row2 + x0 + 1],
              b20 = frameBuffer[row2 + x0 + 2];
            const r30 = frameBuffer[row3 + x0],
              g30 = frameBuffer[row3 + x0 + 1],
              b30 = frameBuffer[row3 + x0 + 2];

            // Пиксели правой колонки (X = 1)
            const r01 = frameBuffer[row0 + x1],
              g01 = frameBuffer[row0 + x1 + 1],
              b01 = frameBuffer[row0 + x1 + 2];
            const r11 = frameBuffer[row1 + x1],
              g11 = frameBuffer[row1 + x1 + 1],
              b11 = frameBuffer[row1 + x1 + 2];
            const r21 = frameBuffer[row2 + x1],
              g21 = frameBuffer[row2 + x1 + 1],
              b21 = frameBuffer[row2 + x1 + 2];
            const r31 = frameBuffer[row3 + x1],
              g31 = frameBuffer[row3 + x1 + 1],
              b31 = frameBuffer[row3 + x1 + 2];

            // Раздельный расчет средних цветов для левой и правой половин
            const avgRL = (r00 + r10 + r20 + r30) >> 2;
            const avgGL = (g00 + g10 + g20 + g30) >> 2;
            const avgBL = (b00 + b10 + b20 + b30) >> 2;

            const avgRR = (r01 + r11 + r21 + r31) >> 2;
            const avgGR = (g01 + g11 + g21 + g31) >> 2;
            const avgBR = (b01 + b11 + b21 + b31) >> 2;

            // Считаем общую среднюю яркость блока для порога
            const totalR = (avgRL + avgRR) >> 1;
            const totalG = (avgGL + avgGR) >> 1;
            const totalB = (avgBL + avgBR) >> 1;
            const blockBrightness =
              (totalR * 218 + totalG * 732 + totalB * 74) >> 10;

            // Сборка маски Брайля
            let brailleCode = 0;
            let leftActive = 0,
              rightActive = 0;

            if ((r00 * 218 + g00 * 732 + b00 * 74) >> 10 >= blockBrightness) {
              brailleCode |= 0x01;
              leftActive++;
            }
            if ((r10 * 218 + g10 * 732 + b10 * 74) >> 10 >= blockBrightness) {
              brailleCode |= 0x02;
              leftActive++;
            }
            if ((r20 * 218 + g20 * 732 + b20 * 74) >> 10 >= blockBrightness) {
              brailleCode |= 0x04;
              leftActive++;
            }
            if ((r01 * 218 + g01 * 732 + b01 * 74) >> 10 >= blockBrightness) {
              brailleCode |= 0x08;
              rightActive++;
            }
            if ((r11 * 218 + g11 * 732 + b11 * 74) >> 10 >= blockBrightness) {
              brailleCode |= 0x10;
              rightActive++;
            }
            if ((r21 * 218 + g21 * 732 + b21 * 74) >> 10 >= blockBrightness) {
              brailleCode |= 0x20;
              rightActive++;
            }
            if ((r30 * 218 + g30 * 732 + b30 * 74) >> 10 >= blockBrightness) {
              brailleCode |= 0x40;
              leftActive++;
            }
            if ((r31 * 218 + g31 * 732 + b31 * 74) >> 10 >= blockBrightness) {
              brailleCode |= 0x80;
              rightActive++;
            }

            if (leftActive + rightActive === 0) {
              frame += " ";
            } else {
              // Динамический выбор доминирующего цвета (какая сторона активнее, тот цвет и ярче)
              let finalR = totalR,
                finalG = totalG,
                finalB = totalB;
              if (leftActive > rightActive) {
                finalR = avgRL;
                finalG = avgGL;
                finalB = avgBL;
              } else if (rightActive > leftActive) {
                finalR = avgRR;
                finalG = avgGR;
                finalB = avgBR;
              }

              const char = String.fromCharCode(0x2800 + brailleCode);
              frame += `\u001b[38;2;${finalR};${finalG};${finalB}m${char}`;
            }
          }
          frame += "\n";
        }
      }
      // ============================================================
      // РЕЖИМ 2: СТАНДАРТНЫЙ (Цветные полублоки 1х2)
      // ============================================================
      else {
        const stride = videoWidth * 3;
        for (let y = 0; y < videoHeight; y += 2) {
          const row0 = y * stride;
          const row1 = (y + 1) * stride;

          for (let x = 0; x < videoWidth; x++) {
            const x0 = x * 3;
            const idxTop = row0 + x0;
            const idxBottom = row1 + x0;

            const rT = frameBuffer[idxTop],
              gT = frameBuffer[idxTop + 1],
              bT = frameBuffer[idxTop + 2];
            const rB = frameBuffer[idxBottom],
              gB = frameBuffer[idxBottom + 1],
              bB = frameBuffer[idxBottom + 2];

            frame += `\u001b[38;2;${rT};${gT};${bT};48;2;${rB};${gB};${bB}m▀`;
          }
          frame += "\n";
        }
      }

      process.stdout.write(frame + reset);
    }, 41);

    ffmpeg.on("close", () => {
      ffmpegClosed = true;
    });
    ffmpeg.on("error", () => {
      ffmpegClosed = true;
    });
  });
};
