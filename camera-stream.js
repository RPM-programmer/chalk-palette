// camera-stream.js
const path = require("path");
const codes = require(path.join(__dirname, "rgb-codes.js"));

module.exports = function cameraStream(duration = 15000, options = {}) {
  const { spawn } = require("child_process");

  // Настройки по умолчанию
  const mirror = options.mirror !== undefined ? options.mirror : true;
  const hyperExpansion =
    options.hyperExpansion !== undefined ? options.hyperExpansion : false;

  // Защищенное получение ANSI-кодов напрямую из rgb-codes в обход Proxy
  const reset = codes.ansi ? codes.ansi.reset : "\u001b[0m";
  const hideCursor = "\u001b[?25l";
  const showCursor = "\u001b[?25h";

  // Инициализируем альтернативный буфер экрана и скрываем курсор
  process.stdout.write("\u001b[?1049h\u001b[2J" + hideCursor);
  const rows = process.stdout.rows || 24;
  const columns = process.stdout.columns || 80;

  // Сетка подстраивается под выбранный режим
  // Для полублоков: ширина x1, высота x2
  // Для цветного Брайля (hyperExpansion): ширина x2, высота x4
  const videoWidth = hyperExpansion ? columns * 2 : columns;
  const videoHeight = hyperExpansion ? rows * 4 : rows * 2;

  let inputFormat = "";
  let cameraDevice = "";

  // Кроссплатформенный выбор девайса захвата
  switch (process.platform) {
    case "win32":
      inputFormat = "dshow";
      cameraDevice = "video=default";
      break;
    case "darwin":
      inputFormat = "avfoundation";
      cameraDevice = "default";
      break;
    case "linux":
    default:
      inputFormat = "v4l2";
      cameraDevice = "/dev/video0";
      break;
  }

  // Собираем цепочку видеофильтров ffmpeg
  let filterString = `scale=${videoWidth}:${videoHeight}`;
  if (mirror) {
    filterString += `,hflip`;
  }

  // Запускаем процесс захвата видео с веб-камеры
  const ffmpeg = spawn("ffmpeg", [
    "-f",
    inputFormat,
    "-i",
    cameraDevice,
    "-vf",
    filterString,
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

  // Перехватываем поток байтов из stdout
  ffmpeg.stdout.on("data", function onData(chunk) {
    if (buffer === null) return;

    buffer = Buffer.concat([buffer, chunk]);
    while (buffer.length >= frameSize) {
      const frameData = Buffer.alloc(frameSize);
      buffer.copy(frameData, 0, 0, frameSize);
      frameQueue.push(frameData);
      buffer = buffer.subarray(frameSize);
    }
  });

  // Игнорируем логи stderr от ffmpeg
  ffmpeg.stderr.on("data", () => {});

  // Локальное кэширование маски точек Брайля 2х4 для дикой скорости рендеринга
  const dots = [
    { dx: 0, dy: 0, bit: 0x01 },
    { dx: 0, dy: 1, bit: 0x02 },
    { dx: 0, dy: 2, bit: 0x04 },
    { dx: 1, dy: 0, bit: 0x08 },
    { dx: 1, dy: 1, bit: 0x10 },
    { dx: 1, dy: 2, bit: 0x20 },
    { dx: 0, dy: 3, bit: 0x40 },
    { dx: 1, dy: 3, bit: 0x80 },
  ];

  return new Promise((resolve) => {
    // Обработчик нажатия клавиш для выхода
    const handleInput = (key) => {
      const buf = Buffer.from(key);
      if ((buf.length === 1 && buf[0] === 3) || key === "q") {
        ffmpegClosed = true;
      }
    };

    // Корректная остановка всех потоков
    const cleanUpAndExit = () => {
      clearInterval(intervalId);

      try {
        ffmpeg.stdout.removeAllListeners("data");
      } catch (e) {}

      ffmpeg.kill("SIGKILL");
      buffer = null;

      // Возвращаем stdin терминала в исходное состояние
      try {
        process.stdin.removeListener("data", handleInput);
        process.stdin.setRawMode(false);
        process.stdin.pause();
      } catch (e) {}

      // Закрываем альтернативный буфер экрана и возвращаем курсор
      process.stdout.write("\u001b[?1049l" + showCursor + reset);
      resolve();
    };

    const intervalId = setInterval(() => {
      // Если ffmpeg отключился и все кадры отрисованы
      if (ffmpegClosed && frameQueue.length === 0) {
        cleanUpAndExit();
        return;
      }

      if (frameQueue.length === 0) return;

      const frameBuffer = frameQueue.shift();
      let frame = "\u001b[H";
      const stride = videoWidth * 3;

      // ============================================================
      // РЕЖИМ 1: ЦВЕТНОЙ HYPER EXPANSION С КАМЕРЫ (Брайль 2х4)
      // ============================================================
      if (hyperExpansion) {
        for (let y = 0; y < videoHeight; y += 4) {
          for (let x = 0; x < videoWidth; x += 2) {
            let brailleCode = 0;
            let firstR = -1,
              firstG = -1,
              firstB = -1;

            // Сканируем 8 подпикселей внутри макро-символа Брайля
            for (let i = 0; i < 8; i++) {
              const dot = dots[i];
              const idx = ((y + dot.dy) * videoWidth + (x + dot.dx)) * 3;

              const r = frameBuffer[idx] || 0;
              const g = frameBuffer[idx + 1] || 0;
              const b = frameBuffer[idx + 2] || 0;

              // Считаем яркость по быстрому целочисленному алгоритму
              const brightness = (r * 218 + g * 732 + b * 74) >> 10;

              // Порог чувствительности — 45
              if (brightness > 45) {
                brailleCode |= dot.bit;
                // Запоминаем цвет самого первого яркого пикселя для сочности палитры
                if (firstR === -1) {
                  firstR = r;
                  firstG = g;
                  firstB = b;
                }
              }
            }

            if (brailleCode === 0) {
              frame += " ";
            } else {
              // Если ярких точек не нашлось, берем цвет центра ячейки
              if (firstR === -1) {
                const centerIdx = ((y + 2) * videoWidth + x) * 3;
                firstR = frameBuffer[centerIdx];
                firstG = frameBuffer[centerIdx + 1];
                firstB = frameBuffer[centerIdx + 2];
              }
              const char = String.fromCharCode(0x2800 + brailleCode);
              frame += `\u001b[38;2;${firstR};${firstG};${firstB}m${char}`;
            }
          }
          frame += "\n";
        }
      }
      // ============================================================
      // РЕЖИМ 2: СТАНДАРТНЫЙ С КАМЕРЫ (Цветные полублоки 1х2)
      // ============================================================
      else {
        for (let y = 0; y < videoHeight; y += 2) {
          const row0 = y * stride;
          const row1 = (y + 1) * stride;

          for (let x = 0; x < videoWidth; x++) {
            const x0 = x * 3;
            const rT = frameBuffer[row0 + x0],
              gT = frameBuffer[row0 + x0 + 1],
              bT = frameBuffer[row0 + x0 + 2];
            const rB = frameBuffer[row1 + x0],
              gB = frameBuffer[row1 + x0 + 1],
              bB = frameBuffer[row1 + x0 + 2];

            frame += `\u001b[38;2;${rT};${gT};${bT};48;2;${rB};${gB};${bB}m▀`;
          }
          frame += "\n";
        }
      }

      process.stdout.write(frame + reset);
    }, 41);

    // Переводим терминал в режим чтения отдельных клавиш
    try {
      process.stdin.setRawMode(true);
      process.stdin.resume();
      process.stdin.setEncoding("utf8");
      process.stdin.on("data", handleInput);
    } catch (e) {}

    // Автоматический таймер отключения стрима
    setTimeout(() => {
      ffmpegClosed = true;
    }, duration);

    ffmpeg.on("close", () => {
      ffmpegClosed = true;
    });
    ffmpeg.on("error", () => {
      ffmpegClosed = true;
    });
  });
};
