import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const iconPath = path.join(root, 'public', 'app-icon.svg');
const resourcesPath = path.join(root, 'android', 'app', 'src', 'main', 'res');
const iconSizes = {
  mdpi: 48,
  hdpi: 72,
  xhdpi: 96,
  xxhdpi: 144,
  xxxhdpi: 192,
};
const adaptiveIconSizes = {
  mdpi: 108,
  hdpi: 162,
  xhdpi: 216,
  xxhdpi: 324,
  xxxhdpi: 432,
};

const adaptiveForeground = Buffer.from(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
    <path d="M154 260.5 223.5 330l124.8-143.1" fill="none" stroke="white" stroke-width="28" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M178 144.5c10.6-17.5 31.2-30.6 53.8-31.7 29.3-1.3 57.8 17.5 71.6 42.6" fill="none" stroke="white" stroke-opacity=".9" stroke-width="12" stroke-linecap="round"/>
    <path d="M188 170c20.8-15.9 44.1-25 67.8-26.8" fill="none" stroke="white" stroke-opacity=".7" stroke-width="8" stroke-linecap="round"/>
  </svg>
`);

for (const [density, size] of Object.entries(iconSizes)) {
  const directory = path.join(resourcesPath, `mipmap-${density}`);
  await fs.mkdir(directory, { recursive: true });
  await sharp(iconPath).resize(size, size).png().toFile(path.join(directory, 'ic_launcher.png'));
  await sharp(iconPath).resize(size, size).png().toFile(path.join(directory, 'ic_launcher_round.png'));

  const foregroundSize = adaptiveIconSizes[density];
  await sharp(adaptiveForeground)
    .resize(foregroundSize, foregroundSize)
    .png()
    .toFile(path.join(directory, 'ic_launcher_foreground.png'));
}
