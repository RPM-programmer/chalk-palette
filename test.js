const chalk = require("./index.js"); // Path to your library main file

// Helper function for beautiful delays between tests
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runSplitVersionTest() {
    console.clear();

    // Generating beautiful headings via static gradient
    const mainBanner    = chalk.animation.gradient("==================================================", "DeepSkyBlue", "DeepPink");
    const wasHeader     = chalk.animation.gradient("--- BLOCK 1: WAS (Original features of the package) ---", "Gold", "OrangeRed");
    const addedHeader   = chalk.animation.gradient("--- BLOCK 2: NOW (New features of v2.0.0) ---", "LawnGreen", "Cyan");
    const finalBanner   = chalk.animation.gradient("=== THE VERSION COMPARISON PRESENTATION COMPLETED ===", "LawnGreen", "Cyan");

    console.log(mainBanner);
    console.log(chalk.animation.gradient("    CHALK-PALETTE: COMPARISON OF TWO UPGRADE EPOCHS   ", "DeepSkyBlue", "DeepPink"));
    console.log(mainBanner);
    await sleep(2000);

    // =================================================================
    // PART 1: WAS
    // =================================================================
    console.clear();
    console.log(wasHeader);
    console.log(chalk.dim("In the first version, the package could quickly and easily style static text:\n"));
    await sleep(1000);

    // Demonstration of standard colors (Only PascalCase worked initially)
    console.log("-> " + chalk.Red("Standard Red") + " | " + chalk.DeepSkyBlue("Deep Sky Blue") + " | " + chalk.HotPink("Hot Pink"));
    await sleep(800);

    // Demonstration of backgrounds (bg)
    console.log("-> " + chalk.bgTomato(" Tomato BG ") + " | " + chalk.bgNavy(" White text on navy background "));
    await sleep(800);

    // Demonstration of system styles (lowercase)
    console.log("-> " + chalk.bold("Bold font") + " | " + chalk.underline("Underlined text") + " | " + chalk.italic("Italic text"));
    await sleep(1000);
    
    // =================================================================
    // LONG DELAY WITH COUNTDOWN
    // =================================================================
    console.log("\n" + chalk.dim("Switching to the massive upgrade demonstration in 7 seconds..."));
    await sleep(3000); // 3 seconds of static time to read text
    
    // Dynamic countdown on a single line
    for (let count = 3; count > 0; count--) {
        process.stdout.write(`\r\u001b[K${chalk.dim("Launching global update in: ")}${chalk.Orange(count)}...`);
        await sleep(1000);
    }
    process.stdout.write(`\r\u001b[K${chalk.Green("Launch! Switching screen buffer...")}\n`);
    await sleep(800);

    // =================================================================
    // PART 2: NOW (ADDED)
    // =================================================================
    console.clear();
    console.log(addedHeader);
    console.log(chalk.dim("The major v2.0.0 update introduces case-insensitivity, animations, and smart UI tools:\n"));
    await sleep(1500);

    // 1. Case Insensitivity Proof (NEW DEMO)
    console.log(chalk.Yellow("1. Case-insensitive color methods (Any case works now):"));
    console.log("   PascalCase: " + chalk.Crimson("Crimson color text"));
    console.log("   lowercase:  " + chalk.crimson("crimson color text (Automatically matched!)"));
    await sleep(2000);

    // 2. Clickable Links
    console.log("\n" + chalk.Yellow("2. URL auto-detection and clickable ANSI-links (customise):"));
    chalk.customise("   Visit our official repository: https://github.com/RPM-programmer/chalk-palette");
    await sleep(1500);

    // 3. Static Gradient
    console.log("\n" + chalk.Yellow("3. Static smooth color blending (gradient):"));
    const textGradient = chalk.animation.gradient("   This text is styled with a beautiful static dual-color gradient!", "DeepSkyBlue", "DeepPink");
    console.log(textGradient);
    await sleep(1500);

    // 4. Typewriter
    console.log("\n" + chalk.Yellow("4. Typewriter text effect (typewriter):"));
    await chalk.animation.typewriter("   Now text can fluidly appear on the screen character by character...", 40);
    await sleep(1500);

    // 5. Spinners
    console.log("\n" + chalk.Yellow("5. Single-line loading animations (spinner):"));
    const spinnerDots = chalk.animation.spinner("   Downloading external repository dependencies in background", "dots");
    await sleep(2500);
    spinnerDots.stop("Successfully completed!");
    await sleep(1500);

    // 6. Password Input
    console.log("\n" + chalk.Yellow("6. Interactive raw-mode secure password input (passwordMask):"));
    const password = await chalk.animation.passwordMask("   Enter secret token (characters are masked): ", "•");
    console.log(`   ${chalk.Green("✓")} Token captured securely into buffer (masked length: ${password.length} chars)`);
    await sleep(1500);

    // 7. Progress Bar
    console.log("\n" + chalk.Yellow("7. Adaptive auto-scaling color progress bar (progressBar):"));
    const bar = chalk.animation.progressBar(100);
    for (let i = 0; i <= 100; i++) {
        bar.update(i);
        await sleep(20);
    }
    await sleep(1500);

    // 8. Live Rainbow
    console.log("\n" + chalk.Yellow("8. Live shifting rainbow wave across text (rainbow):"));
    const rainbowEffect = chalk.animation.rainbow("   Smooth cross-platform spectrum cycle without tearing UTF-8 strings!", 50);
    await sleep(4000);
    rainbowEffect.stop();
    await sleep(1500);

    // 9. Cyberpunk Glitch (Full-screen alternate buffer)
    console.log("\n" + chalk.Yellow("9. Digital screen glitch effect (glitch):"));
    console.log(chalk.dim("   (Switching to hidden screen buffer...)"));
    await sleep(1200);
    await chalk.animation.glitch("CRITICAL_SYSTEM_ERROR: SECURITY_BREACH", 3000);
    console.log(chalk.Green("   ✓ Effect finished. Screen restored, previous terminal logs are safe!"));
    await sleep(1500);

    // 10. Pulse (Full-screen alternate buffer)
    console.log("\n" + chalk.Yellow("10. Cinematic fade-in and fade-out breathing text (pulse):"));
    await sleep(1200);
    await chalk.animation.pulse("Smooth text fading and glowing inside pitch darkness...", 3500);
    console.log(chalk.Green("   ✓ Effect finished. Console session completely restored!"));
    await sleep(1500);

    // 11. ASCII Fire (Full-screen alternate buffer)
    console.log("\n" + chalk.Yellow("11. Procedural ASCII live fire simulation (fire):"));
    await sleep(1200);
    await chalk.animation.fire(4000);
    console.log(chalk.Green("   ✓ Effect finished. Fire successfully extinguished!"));
    await sleep(1500);

    // 12. Matrix Rain (Full-screen alternate buffer)
    console.log("\n" + chalk.Yellow("12. Customized digital matrix rain in multiple colors (matrix):"));
    await sleep(1500);
    const matrixModes = [
        { id: "green", name: "Green (Classic)", m: "Green" },
        { id: "blue", name: "Blue (Cyber-Ocean)", m: "Blue" },
        { id: "orange", name: "Orange (Textured Fire)", m: "Orange" }
    ];
    for (const mode of matrixModes) {
        console.log(`   -> Activating matrix: ${chalk[mode.m](mode.name)}...`);
        await sleep(800);
        await chalk.animation.matrix(2000, mode.id);
    }

    // =================================================================
    // FINAL OF PRESENTATION
    // =================================================================
    console.clear();
    console.log(finalBanner);
    console.log(chalk.animation.gradient("    THE PACKAGE HAS EVOLVED INTO A POWERFUL CLI ENGINE    ", "LawnGreen", "Cyan"));
    console.log(finalBanner);
}

// Start the split presentation scenario
runSplitVersionTest().catch(console.error);
