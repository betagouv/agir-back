/**
 * Download the images from github (aides-jeune repo) and create the miniatures
 * from them.
 *
 * NOTE: wh
 */
import { aidesAvecLocalisation, miniatures } from '@betagouv/aides-velo/data';
import fs from 'fs';
import { join } from 'path';
import { exit } from 'process';
import sharp from 'sharp';

const currentPath = new URL('./', import.meta.url).pathname;
const rootPath = join(currentPath, '../');

const imgDir = join(rootPath, 'static/images/');
const thumbnailsManifestEntries = [];

for (const id in aidesAvecLocalisation) {
  let imgSrc = miniatures[id];
  if (!imgSrc) {
    continue;
  }

  const imgName = imgSrc.split('/').at(-1).split('.')[0] + '.webp';
  if (!fs.existsSync(join(imgDir, imgName))) {
    // NOTE: synchronous call to avoid crashing fetch on restricted wifi
    await generateImage(imgSrc, imgName);
  }
  thumbnailsManifestEntries.push([id, imgName]);
}

async function generateImage(imgSrc, imgName) {
  try {
    const resp = await fetch(imgSrc);
    const blob = await resp.blob();
    const buffer = await blob.arrayBuffer();
    const img = sharp(buffer);
    img.resize({ fit: 'inside', height: 500, width: 200 });
    console.log(`Generating image for ${imgSrc} as ${imgName}`);
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
