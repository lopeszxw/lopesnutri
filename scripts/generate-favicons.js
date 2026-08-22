import sharp from "sharp";
import fs from "fs";
import path from "path";

const publicDir = path.resolve("public");
const logoSymbolDarkPath = path.join(publicDir, "logo-symbol-dark.png");
const logoSymbolPath = path.join(publicDir, "logo-symbol.png");

async function generateFavicons() {
  console.log("Generating modern favicon suite for LopesNutri...");

  // 1. Vector SVG Favicon
  // High-contrast dark badge (#111311) with pure white LopesNutri symbol + leaves
  const vectorSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <defs>
    <filter id="badgeShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000000" flood-opacity="0.25"/>
    </filter>
  </defs>

  <!-- Dark Badge Background for universal visibility in light & dark browser tabs -->
  <rect width="128" height="128" rx="28" fill="#111311" />

  <!-- LopesNutri Circular Ring -->
  <circle cx="68" cy="68" r="42" fill="none" stroke="#ffffff" stroke-width="4.5" stroke-linecap="round" />

  <!-- Three Leaves at top-left -->
  <!-- Top leaf -->
  <path d="M 44 42 C 44 26 56 16 56 16 C 56 16 64 28 58 42 C 54 44 46 44 44 42 Z" fill="#ffffff" />
  <!-- Middle diagonal leaf -->
  <path d="M 38 46 C 24 38 18 26 18 26 C 18 26 34 22 46 36 C 46 40 42 44 38 46 Z" fill="#ffffff" />
  <!-- Bottom horizontal leaf -->
  <path d="M 40 54 C 24 54 18 44 18 44 C 18 44 30 36 44 46 C 44 50 42 54 40 54 Z" fill="#ffffff" />

  <!-- Inner Monogram (L / N Leaf Silhouette) -->
  <!-- Left vertical pillar with smooth bottom scoop -->
  <path d="M 52 50 L 60 50 L 60 86 L 52 86 Z" fill="#ffffff" />
  
  <!-- Right organic curve & drop -->
  <path d="M 62 60 C 62 50 72 48 80 54 C 88 60 90 74 84 84 C 78 92 64 92 62 86 Z" fill="#ffffff" />
  
  <!-- Inner negative cutout inside the right curve -->
  <path d="M 68 62 C 72 62 76 66 74 72 C 72 78 64 80 62 76 Z" fill="#111311" />
  
  <!-- Silhouette head dot -->
  <circle cx="72" cy="62" r="4.5" fill="#111311" />
</svg>`;

  fs.writeFileSync(path.join(publicDir, "favicon.svg"), vectorSvg);
  console.log("-> Saved vector public/favicon.svg");

  // 2. Also generate high-resolution PNG favicons from the symbol with sharp
  // Load white symbol
  const symbolWhiteImg = sharp(path.join(publicDir, "logo-symbol-dark.png"));
  const symbolBuffer = await symbolWhiteImg
    .resize(96, 96, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  // Favicon 128x128 with rounded dark background
  const badge128 = await sharp({
    create: {
      width: 128,
      height: 128,
      channels: 4,
      background: { r: 17, g: 19, b: 17, alpha: 1 }
    }
  })
    .composite([
      { input: symbolBuffer, left: 16, top: 16 }
    ])
    .png()
    .toBuffer();

  // Save 32x32 Favicon PNG
  await sharp(badge128)
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, "favicon.png"));

  await sharp(badge128)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, "favicon-192.png"));

  await sharp(badge128)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, "apple-touch-icon.png"));

  // Also transparent variant favicon without background
  const transparentSymbol = await sharp(path.join(publicDir, "logo-symbol.png"))
    .resize(32, 32, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(publicDir, "favicon-transparent.png"));

  console.log("-> Saved public/favicon.png (32x32), favicon-192.png, and apple-touch-icon.png");
  console.log("Favicon suite generation completed!");
}

generateFavicons().catch(console.error);
