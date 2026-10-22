const chalk = require("./index.js");

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function runUltimateTest() {
    console.clear();
    
    // Массив всех доступных опций, разбитых по логическим группам
    const options = [
        "--- [NEW TRUECOLOR VFX] ---",
        "1. Plasma (Procedural lava-lamp field)",
        "2. WarpSpeed (Hyperspace star streaks)",
        "3. Cyber Radar (Tactical loop sonar sweep)",
        "4. Text Dissolve (Particles sand falling physics)",
        "5. Text Decrypt (Matrix cipher runtime lock)",
        "6. Radar Spinner (Single-line background task loader)",
        "7. Audio Visualizer (Live microphone spectrum grid)",
        
        "--- [CLASSIC FULL-SCREEN VFX] ---",
        "8. Digital Rain (The Matrix falling glyphs)",
        "9. Procedural Fire (Heat distribution simulation)",
        "10. Glitch Effect (Hacker screen shake & symbols)",
        "11. Pulse Effect (Sinusoidal text breathing illumination)",
        "12. Text Assemble (Flying particles text gathering)",
        "13. Text Laser (Laser beam character burn-in)",
        "14. Text Shimmer (Bright sweeping light reflection reflex)",
        "15. Text Morph (Chaotic particle character transformation)",
        
        "--- [CLASSIC ROW STYLES & INTERACTIVE UI] ---",
        "16. Typewriter Effect (Manual typing simulation)",
        "17. Rainbow Effect (Infinite in-place color cycling)",
        "18. Progress Bar (Dynamic Red-to-Green rendering state)",
        "19. Password Mask (Secure hidden interactive input pipeline)",
        
        "--- [INTERACTIVE RETRO GAMES] ---",
        "20. Snake Arcade (Arrow keys control, apple eating)",
        "21. Pong Arena (Player vs predictive AI paddle)",
        "Exit Test Suite"
    ];

    while (true) {
        // Вызываем ваше интерактивное CLI меню со стрелочками
        const selection = await chalk.animation.menu(options, "CHALK-PALETTE v3.0.0 — Ultimate Test Suite Dashboard:");
        
        if (!selection || selection.value === "Exit Test Suite") {
            console.clear();
            console.log("\x1b[1;32mUltimate test suite completed safely. Ready for NPM deployment! 🚀\x1b[0m\n");
            break;
        }

        // Пропускаем строки-заголовки групп при случайном клике Enter
        if (selection.value.startsWith("---")) continue;

        // Переключаем кейсы на основе индекса выбранной строки меню
        switch (selection.index) {
            // === NEW TRUECOLOR VFX ===
            case 1:
                await chalk.animation.plasma(4000);
                break;
            case 2:
                await chalk.animation.warpSpeed(4000);
                break;
            case 3:
                await chalk.animation.cyberRadar(5000);
                break;
            case 4:
                await chalk.animation.textDissolve("CLEANING RESIDUAL SYSTEM CORE LOGS...");
                break;
            case 5:
                await chalk.textDecrypt("ACCESS GRANTED: SECURITY ARCHITECTURE DECRYPTED STATUS OK");
                break;
            case 6:
                const rad = chalk.radarSpinner("Scanning project directory tree...");
                const files = ["/index.js", "/animation.js", "/games.js", "/index.d.ts", "Done!"];
                for (let f of files) {
                    await delay(600);
                    rad.update(`Auditing module file: ${f}`);
                }
                rad.stop("All components validated for release v3.0.0.");
                break;
            case 7:
                console.log("\n\x1b[33m[Notice]\x1b[0m The grid will live-render your sound. Speak into the microphone now.");
                await delay(1500);
                await chalk.audioVisualizer(5000);
                break;

            // === CLASSIC FULL-SCREEN VFX ===
            case 9:
                await chalk.animation.matrix(4000, "green");
                break;
            case 10:
                await chalk.animation.fire(4000);
                break;
            case 11:
                await chalk.animation.glitch("SYSTEM ERROR: CRITICAL INTRUSION DETECTED", 3000);
                break;
            case 12:
                await chalk.animation.pulse("CHALK-PALETTE GENERATION THREE", 4000);
                break;
            case 13:
                await chalk.animation.textAssemble("ASSEMBLED FROM DUST", 4000);
                break;
            case 14:
                await chalk.animation.textLaser("BURNING TEXT VIA LASER BEAM", 3000);
                break;
            case 15:
                await chalk.animation.textShimmer("SWEEPING SHIMMER REFLEX EFFECT", 2500);
                break;
            case 16:
                await chalk.animation.textMorph("STARTING STATE", "FINAL DESTINATION", 4000);
                break;

            // === CLASSIC ROW STYLES & INTERACTIVE UI ===
            case 18:
                console.clear();
                await chalk.animation.typewriter("Simulating incremental manual keystroke injection text...\n", 40);
                break;
            case 19:
                console.clear();
                console.log("Starting rainbow color loop test. Will run for 3 seconds...");
                const loop = chalk.animation.rainbow(" INFINITE RAINBOW RUNTIME REVOLUTION LOOP ");
                await delay(3000);
                loop.stop();
                break;
            case 20:
                console.clear();
                const progress = chalk.animation.progressBar(100);
                for (let i = 0; i <= 100; i += 2) {
                    await delay(30);
                    progress.update(i);
                }
                break;
            case 21:
                console.clear();
                const pass = await chalk.animation.passwordMask("Enter encrypted test phrase: ", "*");
                console.log(`\n\x1b[32m✓\x1b[0m Captured raw masked sequence: "${pass}"`);
                await delay(2000);
                break;

            // === INTERACTIVE RETRO GAMES ===
            case 23:
                await chalk.snake();
                break;
            case 24:
                await chalk.games.pong();
                break;
        }
    }
}

runUltimateTest().catch(async (err) => {
    console.error("\n\x1b[1;31m[TEST SUITE CRASHED]\x1b[0m Integration runtime failure:", err);
    process.stdout.write("\u001b[?1049l\u001b[?25h\u001b[0m");
    process.exit(1);
});
