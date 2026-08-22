import sharp from "sharp";
import fs from "fs";
import path from "path";

const inputPath = "C:/Users/Aluno/.gemini/antigravity-ide/brain/b74e2f34-a303-49cb-a820-e6130d343e30/.user_uploaded/media_1787428811668.jpg";
const publicDir = path.resolve("public");

async function processLogo() {
  console.log("Reading source image...");
  const image = sharp(inputPath);
  const metadata = await image.metadata();
  console.log(`Dimensions: ${metadata.width}x${metadata.height}`);

  // Get raw pixel buffer (RGBA or RGB)
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  // 1. Create Transparent Dark-Mode Logo (White graphic on transparent bg)
  const darkBuffer = Buffer.alloc(width * height * 4);
  // 2. Create Transparent Light-Mode Logo (Dark Charcoal #19211C graphic on transparent bg)
  const lightBuffer = Buffer.alloc(width * height * 4);

  // Background threshold: below this brightness is considered pure background
  const bgThreshold = 45;
  const whiteThreshold = 210;

  for (let i = 0; i < width * height; i++) {
    const srcIdx = i * channels;
    const dstIdx = i * 4;

    const r = data[srcIdx];
    const g = data[srcIdx + 1];
    const b = data[srcIdx + 2];

    // Compute luminance
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;

    let alpha = 0;
    if (lum > bgThreshold) {
      // Normalize alpha between 0 and 255
      alpha = Math.min(255, Math.max(0, Math.round(((lum - bgThreshold) / (whiteThreshold - bgThreshold)) * 255)));
    }

    // Dark Mode Logo: White with alpha
    darkBuffer[dstIdx] = 255;
    darkBuffer[dstIdx + 1] = 255;
    darkBuffer[dstIdx + 2] = 255;
    darkBuffer[dstIdx + 3] = alpha;

    // Light Mode Logo: Dark Charcoal (#18201B) with alpha
    lightBuffer[dstIdx] = 24;
    lightBuffer[dstIdx + 1] = 32;
    lightBuffer[dstIdx + 2] = 27;
    lightBuffer[dstIdx + 3] = alpha;
  }

  // Trim and save dark mode logo
  await sharp(darkBuffer, { raw: { width, height, channels: 4 } })
    .trim()
    .png({ quality: 100 })
    .toFile(path.join(publicDir, "logo-dark.png"));
  console.log("Saved public/logo-dark.png");

  // Trim and save light mode logo
  await sharp(lightBuffer, { raw: { width, height, channels: 4 } })
    .trim()
    .png({ quality: 100 })
    .toFile(path.join(publicDir, "logo.png"));
  console.log("Saved public/logo.png");

  // 3. Extract Favicon Symbol (top circular mark with leaves only)
  // The circle mark is in the upper ~70% of the image
  const cropHeight = Math.round(height * 0.72);
  const symbolBuffer = Buffer.alloc(width * cropHeight * 4);

  for (let y = 0; y < cropHeight; y++) {
    for (let x = 0; x < width; x++) {
      const srcIdx = (y * width + x) * 4;
      const dstIdx = (y * width + x) * 4;

      symbolBuffer[dstIdx] = lightBuffer[srcIdx];
      symbolBuffer[dstIdx + 1] = lightBuffer[srcIdx + 1];
      symbolBuffer[dstIdx + 2] = lightBuffer[srcIdx + 2];
      symbolBuffer[dstIdx + 3] = lightBuffer[srcIdx + 3];
    }
  }

  // Save symbol icon for favicon
  await sharp(symbolBuffer, { raw: { width, height: cropHeight, channels: 4 } })
    .trim()
    .resize(192, 192, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(publicDir, "favicon.png"));
  console.log("Saved public/favicon.png");

  // Also dark version of symbol
  const symbolDarkBuffer = Buffer.alloc(width * cropHeight * 4);
  for (let y = 0; y < cropHeight; y++) {
    for (let x = 0; x < width; x++) {
      const srcIdx = (y * width + x) * 4;
      const dstIdx = (y * width + x) * 4;

      symbolDarkBuffer[dstIdx] = darkBuffer[srcIdx];
      symbolDarkBuffer[dstIdx + 1] = darkBuffer[srcIdx + 1];
      symbolDarkBuffer[dstIdx + 2] = darkBuffer[srcIdx + 2];
      symbolDarkBuffer[dstIdx + 3] = darkBuffer[srcIdx + 3];
    }
  }

  await sharp(symbolDarkBuffer, { raw: { width, height: cropHeight, channels: 4 } })
    .trim()
    .resize(192, 192, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(publicDir, "favicon-dark.png"));
  console.log("Saved public/favicon-dark.png");

  console.log("Logo processing completed successfully!");
}

processLogo().catch(console.error);
