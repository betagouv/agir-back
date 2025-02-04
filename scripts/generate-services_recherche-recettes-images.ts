import { setTimeout } from 'timers/promises';
const fs = require('fs');
const sstk = require('shutterstock-api');

// sstk.setSandbox(true);
sstk.setAccessToken(process.env.SHUTTERSTOCK_API_TOKEN);

const computerVisionApi = new sstk.ComputerVisionApi();
const imagesApi = new sstk.ImagesApi();

const recettes = JSON.parse(
  fs
    .readFileSync(
      './src/infrastructure/repository/services_recherche/recettes/data/dump-recipes.2024-09-06.json',
    )
    .toString(),
);

const recettes_vege = recettes.filter(
  (r) =>
    !(
      r.ingredient_food_practice.includes('meat') ||
      r.ingredient_food_practice.includes('fish') ||
      r.ingredient_food_practice.includes('pork')
    ),
);

const recettes_vege_plats = recettes.filter(
  (r) =>
    !(
      r.ingredient_food_practice.includes('meat') ||
      r.ingredient_food_practice.includes('fish') ||
      r.ingredient_food_practice.includes('pork')
    ) && r.recipe_category === 'PLC',
);

fs.writeFileSync(
  'plats-veges.csv',
  `Nom plat;Nom fichier;Image déjà téléchargée
${recettes_vege_plats
  .map(({ name, slug }) => {
    return `"${name}";"${slug}";${
      fs.existsSync(`./static/images/recettes/${slug}.jpg`) ? 'oui' : 'non'
    }`;
  })
  .join('\n')}
`,
);

const recettes_vege_autres = recettes.filter(
  (r) =>
    !(
      r.ingredient_food_practice.includes('meat') ||
      r.ingredient_food_practice.includes('fish') ||
      r.ingredient_food_practice.includes('pork')
    ) && r.recipe_category !== 'PLC',
);

fs.writeFileSync(
  'desserts-entrees-veges.csv',
  `Nom plat;Nom fichier;Image déjà téléchargée
${recettes_vege_autres
  .map(({ name, slug }) => {
    return `"${name}";"${slug}";${
      fs.existsSync(`./static/images/recettes/${slug}.jpg`) ? 'oui' : 'non'
    }`;
  })
  .join('\n')}
`,
);

const plats_volailles = recettes.filter((r) => r.ranking.includes('VOL'));

fs.writeFileSync(
  'recettes-volailles.csv',
  `Nom plat;Nom fichier;Image déjà téléchargée
${plats_volailles
  .map(({ name, slug }) => {
    return `"${name}";"${slug}";${
      fs.existsSync(`./static/images/recettes/${slug}.jpg`) ? 'oui' : 'non'
    }`;
  })
  .join('\n')}
`,
);

const recettes_pas_vege = recettes.filter(
  (r) =>
    (r.ingredient_food_practice.includes('meat') ||
      r.ingredient_food_practice.includes('fish') ||
      r.ingredient_food_practice.includes('pork')) &&
    !r.ranking.includes('VOL'),
);

fs.writeFileSync(
  'recettes-non-vege.csv',
  `Nom plat;Nom fichier;Image déjà téléchargée
${recettes_pas_vege
  .map(({ name, slug }) => {
    return `"${name}";"${slug}";${
      fs.existsSync(`./static/images/recettes/${slug}.jpg`) ? 'oui' : 'non'
    }`;
  })
  .join('\n')}
`,
);

let nb_fetch = 0;

// const usersApi = new sstk.UsersApi();
//
// usersApi
//   .getUserSubscriptionList()
//   .then((data) => {
//     console.dir(data, { depth: null });
//   })
//   .catch((error) => {
//     console.error(error);
//   });

// downloadFromShutterstock();
//
//

function stats() {
  console.log('Total recettes sans viande:', recettes_vege.length);

  const vegeWithImage = recettes_vege.filter((r) =>
    fs.existsSync(`./static/images/recettes/${r.slug}.jpg`),
  );

  console.log('Total recettes sans viande avec image:', vegeWithImage.length);
}

async function downloadFromShutterstock() {
  const nbRecettes = recettes_vege.length;

  for (let i = 0; i < nbRecettes; i++) {
    const recette = recettes_vege[i];

    console.log(`\nProcessing ${i}/${nbRecettes}: ${recette.name}`);

    if (
      // !fs.existsSync(`./static/images/recettes/${recette.slug}.jpg`) &&
      fs.existsSync(`./static/images/shutterstock/${recette.slug}.jpg`)
    ) {
      console.log(`  Already downloaded, skipping...`);
      continue;
    }

    // const imageBuffer = fs.readFileSync(
    //   `./static/images/recettes/${recette.slug}.jpg`,
    // );
    // const uploadId = await uploadImageToSSTK(imageBuffer);
    const images = await searchImageSSTK(recette.name);
    if (images.length === 0) {
      console.log('  No image found, skipping...');
      continue;
    }
    const data = await getLicenceIdSSTK(images);
    const res = await fetch(data[0].download.url);
    const blob = await res.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const sstImageBuffer = Buffer.from(arrayBuffer);
    saveImageIn(
      `./static/images/shutterstock/${recette.slug}.jpg`,
      sstImageBuffer,
    );
  }
}

async function execute() {
  const nbRecettes = recettes_vege.length;

  for (let i = 0; i < recettes_vege.length; i++) {
    const recette = recettes_vege[i];

    console.log(`\nProcessing ${i}/${nbRecettes}: ${recette.name}`);

    if (fs.existsSync(`./static/images/recettes/${recette.slug}.jpg`)) {
      console.log(`  Already downloaded, skipping...`);
      continue;
    }

    let res = await fetchImage(i, recette.slug);

    if (!res.ok) {
      const capitilizedSlug = capitalizeFirstLetter(recette.slug);

      console.error('  Error while fetching image from: ', recette.slug);
      res = await fetchImage(i, capitilizedSlug);

      if (!res.ok) {
        console.error('  Error while fetching image from: ', capitilizedSlug);
        fs.writeFileSync('recettes-error.txt', `${recette.slug}\n`, {
          flag: 'a',
        });
        continue;
      } else {
        console.log('  Image found for: ', capitilizedSlug);
      }
    }

    console.log('  Fetch done, saving image...');
    const blob = await res.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);

    saveImageIn(`./static/images/recettes/${recette.slug}.jpg`, imageBuffer);
  }
}

async function uploadImageToSSTK(imgBuffer) {
  console.log('  Uploading image to Shutterstock...');
  const base64File = imgBuffer.toString('base64');
  const body = new sstk.ImageCreateRequest(base64File);
  const { upload_id } = await computerVisionApi.uploadImage(body);

  return upload_id;
}

async function searchImageSSTK(query) {
  console.log('  Searching for image on Shutterstock...');
  const { data } = await imagesApi.searchImages({
    query,
    page: 1,
    per_page: 20,
    language: 'fr',
    sort: 'relevance',
    image_type: 'photo',
    category: 'Food and Drink',
    people_number: 0,
  });

  return data;
}

async function getFirstSimilarImageSSTK(uploadId) {
  console.log('  Searching for similar images...');
  const { data } = await computerVisionApi.getSimilarImages(uploadId, {
    page: 1,
    per_page: 20,
    view: 'full',
  });

  return data;
}

async function getLicenceIdSSTK(images) {
  console.log('  Getting image license...');
  for (const { id } of images) {
    const { data } = await imagesApi.licenseImages({
      images: [
        {
          image_id: id,
          subscription_id: process.env.SHUTTERSTOCK_SUBSCRIPTION_ID,
          size: 'medium',
          price: 0,
          metadata: {
            customer_id: '',
          },
        },
      ],
    });
    if (!data[0].error) {
      return data;
    }
    console.log('  Error licensing image:', data);
  }
}

async function downloadImageSSTK(imageId) {
  console.log('  Downloading image from Shutterstock...');
  const data = await imagesApi.downloadImage(imageId, { size: 'huge' });

  return data;
}

function saveImageIn(path, imageBuffer) {
  const destFile = fs.createWriteStream(path);
  destFile.write(imageBuffer);
  console.log(`  Image saved in ${path}`);
}

function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

async function fetchImage(i, slug) {
  try {
    await setTimeout(5000);

    const res = await fetch(
      `https://www.mangerbouger.fr/manger-mieux/la-fabrique-a-menus/_next/image?url=https%3A%2F%2Fapi-prod-fam.mangerbouger.fr%2Fstorage%2Frecettes%2F${slug}.jpg&w=3840&q=75`,
    );

    nb_fetch++;

    return res;
  } catch (e) {
    console.log('\nERROR: last index: ', i, 'nb_fetch: ', nb_fetch);
    await setTimeout(1000 * 60 * 5);
    return fetchImage(i, slug);
  }
}
