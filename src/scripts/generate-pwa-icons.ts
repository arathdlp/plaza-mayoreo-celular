/**
 * Genera íconos y screenshots PWA (PNG) para Play Store / instalación.
 * Uso: npx tsx src/scripts/generate-pwa-icons.ts
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const BRAND = "#0066FF";
const OUT = path.join(process.cwd(), "public", "icons");
const SHOTS = path.join(process.cwd(), "public", "screenshots");

function iconSvg(size: number, maskable: boolean): string {
  const fontSize = Math.round(size * (maskable ? 0.34 : 0.44));
  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="${BRAND}"/>
  <text
    x="50%"
    y="50%"
    dominant-baseline="central"
    text-anchor="middle"
    fill="#FFFFFF"
    font-family="Arial, Helvetica, sans-serif"
    font-weight="700"
    font-size="${fontSize}"
  >PM</text>
</svg>`;
}

function screenshotSvg(width: number, height: number, title: string, subtitle: string): string {
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0066FF"/>
      <stop offset="100%" stop-color="#0047b3"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <rect x="${width * 0.08}" y="${height * 0.12}" width="${width * 0.84}" height="${height * 0.76}" rx="24" fill="#ffffff" opacity="0.96"/>
  <text x="50%" y="${height * 0.38}" text-anchor="middle" fill="${BRAND}" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="${Math.round(width * 0.06)}">Plaza Mayoreo del Celular</text>
  <text x="50%" y="${height * 0.48}" text-anchor="middle" fill="#111827" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="${Math.round(width * 0.045)}">${title}</text>
  <text x="50%" y="${height * 0.56}" text-anchor="middle" fill="#6b7280" font-family="Arial, Helvetica, sans-serif" font-size="${Math.round(width * 0.028)}">${subtitle}</text>
  <rect x="${width * 0.2}" y="${height * 0.64}" width="${width * 0.6}" height="${height * 0.08}" rx="999" fill="${BRAND}"/>
  <text x="50%" y="${height * 0.69}" text-anchor="middle" dominant-baseline="central" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-weight="600" font-size="${Math.round(width * 0.026)}">Ver catálogo</text>
</svg>`;
}

async function writePng(svg: string, filePath: string) {
  await sharp(Buffer.from(svg)).png().toFile(filePath);
  console.log("✓", path.relative(process.cwd(), filePath));
}

async function main() {
  await mkdir(OUT, { recursive: true });
  await mkdir(SHOTS, { recursive: true });

  const icons: { name: string; size: number; maskable: boolean }[] = [
    { name: "icon-192.png", size: 192, maskable: false },
    { name: "icon-512.png", size: 512, maskable: false },
    { name: "icon-maskable-192.png", size: 192, maskable: true },
    { name: "icon-maskable-512.png", size: 512, maskable: true },
  ];

  for (const { name, size, maskable } of icons) {
    await writePng(iconSvg(size, maskable), path.join(OUT, name));
  }

  await writePng(
    screenshotSvg(1280, 720, "Refacciones y accesorios", "Morelia · Envío y asesoría"),
    path.join(SHOTS, "wide-1280x720.png"),
  );
  await writePng(
    screenshotSvg(750, 1334, "Tu tienda de celular", "Productos · Servicios · Pedidos"),
    path.join(SHOTS, "narrow-750x1334.png"),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
