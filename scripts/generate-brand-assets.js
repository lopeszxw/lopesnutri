import sharp from "sharp";
import fs from "fs";
import path from "path";

const inputPath = "C:/Users/Aluno/.gemini/antigravity-ide/brain/b74e2f34-a303-49cb-a820-e6130d343e30/.user_uploaded/media_1787428811668.jpg";
const publicDir = path.resolve("public");

async function generateAssets() {
  console.log("Generating complete brand asset suite...");
  const rawImage = sharp(inputPath);
  const metadata = await rawImage.metadata();
  const { width, height } = metadata;
  console.log(`Original: ${width}x${height}`);

  const { data, info } = await rawImage.raw().toBuffer({ resolveWithObject: true });

  const bgThreshold = 35;
  const whiteThreshold = 200;

  const whiteBuffer = Buffer.alloc(width * height * 4);
  const darkBuffer = Buffer.alloc(width * height * 4);

  for (let i = 0; i < width * height; i++) {
    const srcIdx = i * info.channels;
    const dstIdx = i * 4;

    const r = data[srcIdx];
    const g = data[srcIdx + 1];
    const b = data[srcIdx + 2];
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;

    let alpha = 0;
    if (lum > bgThreshold) {
      alpha = Math.min(255, Math.max(0, Math.round(((lum - bgThreshold) / (whiteThreshold - bgThreshold)) * 255)));
    }

    // White version
    whiteBuffer[dstIdx] = 255;
    whiteBuffer[dstIdx + 1] = 255;
    whiteBuffer[dstIdx + 2] = 255;
    whiteBuffer[dstIdx + 3] = alpha;

    // Dark charcoal version (#111311)
    darkBuffer[dstIdx] = 17;
    darkBuffer[dstIdx + 1] = 19;
    darkBuffer[dstIdx + 2] = 17;
    darkBuffer[dstIdx + 3] = alpha;
  }

  // 1. Full Stacked Logo (trimmed)
  await sharp(whiteBuffer, { raw: { width, height, channels: 4 } })
    .trim()
    .png({ quality: 100 })
    .toFile(path.join(publicDir, "logo-dark.png"));

  await sharp(darkBuffer, { raw: { width, height, channels: 4 } })
    .trim()
    .png({ quality: 100 })
    .toFile(path.join(publicDir, "logo.png"));

  console.log("-> Saved full stacked logo-dark.png and logo.png");

  // 2. Crop Symbol Only (top 68% of raw buffer)
  const symbolH = Math.floor(height * 0.68);
  const symbolWhiteRaw = Buffer.alloc(width * symbolH * 4);
  const symbolDarkRaw = Buffer.alloc(width * symbolH * 4);

  for (let y = 0; y < symbolH; y++) {
    for (let x = 0; x < width; x++) {
      const src = (y * width + x) * 4;
      const dst = (y * width + x) * 4;
      symbolWhiteRaw[dst] = whiteBuffer[src];
      symbolWhiteRaw[dst + 1] = whiteBuffer[src + 1];
      symbolWhiteRaw[dst + 2] = whiteBuffer[src + 2];
      symbolWhiteRaw[dst + 3] = whiteBuffer[src + 3];

      symbolDarkRaw[dst] = darkBuffer[src];
      symbolDarkRaw[dst + 1] = darkBuffer[src + 1];
      symbolDarkRaw[dst + 2] = darkBuffer[src + 2];
      symbolDarkRaw[dst + 3] = darkBuffer[src + 3];
    }
  }

  const symbolWhite = await sharp(symbolWhiteRaw, { raw: { width, height: symbolH, channels: 4 } })
    .trim()
    .png()
    .toBuffer();

  const symbolDark = await sharp(symbolDarkRaw, { raw: { width, height: symbolH, channels: 4 } })
    .trim()
    .png()
    .toBuffer();

  await sharp(symbolWhite).toFile(path.join(publicDir, "logo-symbol-dark.png"));
  await sharp(symbolDark).toFile(path.join(publicDir, "logo-symbol.png"));
  console.log("-> Saved symbol-only assets");

  // 3. Crop Wordmark Text Only (bottom 30% of raw buffer)
  const textTop = Math.floor(height * 0.70);
  const textH = height - textTop;
  const textWhiteRaw = Buffer.alloc(width * textH * 4);
  const textDarkRaw = Buffer.alloc(width * textH * 4);

  for (let y = 0; y < textH; y++) {
    for (let x = 0; x < width; x++) {
      const src = ((textTop + y) * width + x) * 4;
      const dst = (y * width + x) * 4;
      textWhiteRaw[dst] = whiteBuffer[src];
      textWhiteRaw[dst + 1] = whiteBuffer[src + 1];
      textWhiteRaw[dst + 2] = whiteBuffer[src + 2];
      textWhiteRaw[dst + 3] = whiteBuffer[src + 3];

      textDarkRaw[dst] = darkBuffer[src];
      textDarkRaw[dst + 1] = darkBuffer[src + 1];
      textDarkRaw[dst + 2] = darkBuffer[src + 2];
      textDarkRaw[dst + 3] = darkBuffer[src + 3];
    }
  }

  const textWhite = await sharp(textWhiteRaw, { raw: { width, height: textH, channels: 4 } })
    .trim()
    .png()
    .toBuffer();

  const textDark = await sharp(textDarkRaw, { raw: { width, height: textH, channels: 4 } })
    .trim()
    .png()
    .toBuffer();

  await sharp(textWhite).toFile(path.join(publicDir, "logo-text-dark.png"));
  await sharp(textDark).toFile(path.join(publicDir, "logo-text.png"));
  console.log("-> Saved text-only assets");

  // 4. Create Horizontal Lockup (Symbol on left + Text on right)
  const targetH = 90;
  const symResized = await sharp(symbolWhite)
    .resize({ height: targetH, fit: "contain" })
    .toBuffer();
  const symResMeta = await sharp(symResized).metadata();

  const textTargetH = 34;
  const textResized = await sharp(textWhite)
    .resize({ height: textTargetH, fit: "contain" })
    .toBuffer();
  const textResMeta = await sharp(textResized).metadata();

  const gap = 18;
  const horizW = symResMeta.width + gap + textResMeta.width;
  const horizH = targetH;
  const textOffsetY = Math.round((horizH - textResMeta.height) / 2);

  await sharp({
    create: {
      width: horizW,
      height: horizH,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
    .composite([
      { input: symResized, left: 0, top: 0 },
      { input: textResized, left: symResMeta.width + gap, top: textOffsetY }
    ])
    .png()
    .toFile(path.join(publicDir, "logo-horizontal-dark.png"));

  const symDarkResized = await sharp(symbolDark)
    .resize({ height: targetH, fit: "contain" })
    .toBuffer();
  const textDarkResized = await sharp(textDark)
    .resize({ height: textTargetH, fit: "contain" })
    .toBuffer();

  await sharp({
    create: {
      width: horizW,
      height: horizH,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
    .composite([
      { input: symDarkResized, left: 0, top: 0 },
      { input: textDarkResized, left: symResMeta.width + gap, top: textOffsetY }
    ])
    .png()
    .toFile(path.join(publicDir, "logo-horizontal.png"));

  console.log("-> Saved horizontal lockups logo-horizontal-dark.png and logo-horizontal.png");

  // 5. Favicons
  const favBuffer = await sharp(symbolWhite)
    .resize(64, 64, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  const base64Fav = favBuffer.toString("base64");
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <image width="64" height="64" href="data:image/png;base64,${base64Fav}" />
</svg>`;
  fs.writeFileSync(path.join(publicDir, "favicon.svg"), svgContent);

  await sharp(symbolDark)
    .resize(64, 64, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(publicDir, "favicon.png"));

  console.log("-> Generated favicon.svg and favicon.png");
  console.log("All brand assets generated successfully!");
}

generateAssets().catch(console.error);
