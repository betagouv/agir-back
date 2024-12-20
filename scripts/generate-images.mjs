/**
 * Download the images from github (aides-jeune repo) and create the miniatures
 * from them.
 *
 * NOTE: wh
 */
import fs from 'fs';
import sharp from 'sharp';
import { join } from 'path';
import { miniatures, aidesAvecLocalisation } from '@betagouv/aides-velo/data';
import { exit } from 'process';

const currentPath = new URL('./', import.meta.url).pathname;
const rootPath = join(currentPath, '../');

const imgDir = join(rootPath, 'static/images/');
if (fs.existsSync(imgDir)) {
  fs.rmSync(imgDir, { recursive: true });
}
fs.mkdirSync(imgDir, { recursive: true });

const thumbnailsManifestEntries = [];

for (const id in aidesAvecLocalisation) {
  const imgSrc = miniatures[id];
  if (!imgSrc) {
    continue;
  }

  const imgName = imgSrc.split('/').at(-1).split('.')[0] + '.webp';
  // NOTE: synchronous call to avoid crashing fetch on restricted wifi
  await generateImage(imgSrc, imgName);
  thumbnailsManifestEntries.push([id, imgName]);
}

async function generateImage(imgSrc, imgName) {
  try {
    const resp = await fetch(imgSrc);
    const blob = await resp.blob();
    const buffer = await blob.arrayBuffer();
    const img = sharp(buffer);
    img.resize({ fit: 'inside', height: 500, width: 200 });
    img.webp().toFile(join(imgDir, imgName));
  } catch (e) {
    console.error(`Error while generating image for ${imgSrc}: ${e.message}`);
    exit(1);
  }
}

fs.writeFileSync(
  join(rootPath, 'src/infrastructure/data/miniatures.json'),
  JSON.stringify(Object.fromEntries(thumbnailsManifestEntries), null, 2),
);

console.log(
  `Correctly generated ${thumbnailsManifestEntries.length} images in ./static/images/`,
);
