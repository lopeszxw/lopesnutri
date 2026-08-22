import sharp from "sharp";
import fs from "fs";
import path from "path";

const publicDir = path.resolve("public");

async function generateRoundFavicons() {
  console.log("Generating perfectly round favicon suite for LopesNutri...");

  // 1. Vector SVG Favicon with a 100% PERFECT CIRCLE background
  const vectorSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <!-- Perfect Circle Background -->
  <circle cx="64" cy="64" r="64" fill="#111311" />

  <!-- LopesNutri Circular Ring -->
  <circle cx="68" cy="68" r="41" fill="none" stroke="#ffffff" stroke-width="4.5" stroke-linecap="round" />

  <!-- Three Leaves at top-left -->
  <!-- Top leaf -->
  <path d="M 44 42 C 44 26 56 16 56 16 C 56 16 64 28 58 42 C 54 44 46 44 44 42 Z" fill="#ffffff" />
  <!-- Middle diagonal leaf -->
  <path d="M 38 46 C 24 38 18 26 18 26 C 18 26 34 22 46 36 C 46 40 42 44 38 46 Z" fill="#ffffff" />
  <!-- Bottom horizontal leaf -->
  <path d="M 40 54 C 24 54 18 44 18 44 C 18 44 30 36 44 46 C 44 50 42 54 40 54 Z" fill="#ffffff" />

  <!-- Inner Monogram (L / N Leaf Silhouette) -->
  <!-- Left vertical pillar -->
  <path d="M 52 50 L 60 50 L 60 86 L 52 86 Z" fill="#ffffff" />
  
  <!-- Right organic curve & drop -->
  <path d="M 62 60 C 62 50 72 48 80 54 C 88 60 90 74 84 84 C 78 92 64 92 62 86 Z" fill="#ffffff" />
  
  <!-- Inner negative cutout inside the right curve -->
  <path d="M 68 62 C 72 62 76 66 74 72 C 72 78 64 80 62 76 Z" fill="#111311" />
  
  <!-- Silhouette head dot -->
  <circle cx="72" cy="62" r="4.5" fill="#111311" />
</svg>`;

  fs.writeFileSync(path.join(publicDir, "favicon.svg"), vectorSvg);
  console.log("-> Saved perfectly round vector public/favicon.svg");

  // 2. Create Perfect Circle PNGs with sharp
  const size = 512;
  // Circular mask SVG
  const circleMaskSvg = `<svg width="${size}" height="${size}"><circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="#ffffff"/></svg>`;
  const circleMask = Buffer.from(circleMaskSvg);

  // Load high-res white symbol
  const symbolWhiteImg = sharp(path.join(publicDir, "logo-symbol-dark.png"));
  const symbolBuffer = await symbolWhiteImg
    .resize(Math.round(size * 0.78), Math.round(size * 0.78), { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  const symMeta = await sharp(symbolBuffer).metadata();
  const leftOffset = Math.round((size - symMeta.width) / 2) + Math.round(size * 0.02);
  const topOffset = Math.round((size - symMeta.height) / 2) + Math.round(size * 0.02);

  // Compose on solid dark circle and mask into a perfect circle with transparent outer corners
  const roundBadge512 = await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 17, g: 19, b: 17, alpha: 1 }
    }
  })
    .composite([
      { input: symbolBuffer, left: leftOffset, top: topOffset }
    ])
    .composite([
      { input: circleMask, blend: "dest-in" }
    ])
    .png()
    .toBuffer();

  // Export round PNG favicons
  await sharp(roundBadge512)
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, "favicon.png"));

  await sharp(roundBadge512)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, "favicon-192.png"));

  await sharp(roundBadge512)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, "apple-touch-icon.png"));

  console.log("-> Saved perfectly round favicon.png, favicon-192.png and apple-touch-icon.png");
  console.log("Completed round favicon generation!");
}

generateRoundFavicons().catch(console.error);
