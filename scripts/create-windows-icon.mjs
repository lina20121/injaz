import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import pngToIco from 'png-to-ico';

const root = process.cwd();
const svgPath = path.join(root, 'public', 'app-icon.svg');
const iconPath = path.join(root, 'assets', 'injaz.ico');
const png = await sharp(svgPath).resize(256, 256).png().toBuffer();
const ico = await pngToIco(png);
await fs.writeFile(iconPath, ico);
console.log(`Created ${iconPath}`);
