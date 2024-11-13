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

const currentPath = new URL('./', import.meta.url).pathname;
const rootPath = join(currentPath, '../');

const imgDir = join(rootPath, 'static/images/');
if (fs.existsSync(imgDir)) {
  fs.rmSync(imgDir, { recursive: true });
}
fs.mkdirSync(imgDir, { recursive: true });

const thumbnailsManifest = Object.keys(aidesAvecLocalisation).reduce(
  (acc, id) => {
    const imgSrc = miniatures[id];

    if (!imgSrc) {
      return acc;
    }

    const imgName = imgSrc.split('/').at(-1).split('.')[0] + '.webp';
    generateThumbnail(imgSrc, imgName);

    return { ...acc, [id]: imgName };
  },
  {},
);

async function generateThumbnail(imgSrc, imgName) {
  const resp = await fetch(imgSrc);
  const blob = await resp.blob();
  const buffer = await blob.arrayBuffer();
  const img = sharp(buffer);
  img.resize({ fit: 'inside', height: 500, width: 200 });
  img.webp().toFile(join(imgDir, imgName));
}

fs.writeFileSync(
  join(rootPath, 'src/infrastructure/data/miniatures.json'),
  JSON.stringify(thumbnailsManifest, null, 2),
);

console.log(
  `Correctly generated ${
    Object.keys(thumbnailsManifest).length
  } images in ./static/images/`,
);
