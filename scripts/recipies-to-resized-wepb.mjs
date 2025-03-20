import fs from 'fs';
import { join } from 'path';
import sharp from 'sharp';

const currentPath = new URL('./', import.meta.url).pathname;
const rootPath = join(currentPath, '../');

const srcDir = join(rootPath, 'static/images/shutterstock/');

const destDir = join(rootPath, 'static/images/shutterstock-webp/');
if (fs.existsSync(destDir)) {
  fs.rmSync(destDir, { recursive: true });
}
fs.mkdirSync(destDir, { recursive: true });

const images = fs.readdirSync(srcDir);

console.log(`[LOG] Found ${images.length} images to convert to webp`);

await Promise.all(
  images.map(async (imgName) => {
    console.log(`[LOG] ${imgName}`);
    const img = sharp(join(srcDir, imgName));
    // downscale the image to a max width of 1200px
    img.resize({ width: 1200 });
    try {
      const webpName = imgName.split('.')[0] + '.webp';
      img.webp().toFile(join(destDir, webpName));
    } catch (e) {
      console.error(`[ERR]   ${e.message}`);
    }
  }),
);
