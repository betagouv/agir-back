import * as fs from 'fs';

const recettes = JSON.parse(
  fs.readFileSync(
    './src/infrastructure/repository/services_recherche/recettes/data/dump-recipes.2024-09-06.json',
  ),
);

for (let i = 0; i < 10; i++) {
  const recette = recettes[i];
  console.log('\nFetching image for recette: ', recette.name);
  // NOTE: potentially try with the capitalized letter for the slug if the fetch fails
  const url = `https://www.mangerbouger.fr/manger-mieux/la-fabrique-a-menus/_next/image?url=https%3A%2F%2Fapi-prod-fam.mangerbouger.fr%2Fstorage%2Frecettes%2F${recette.slug}.jpg&w=3840&q=75`;
  const res = await fetch(url);

  if (!res.ok) {
    console.error('Error while fetching image for recette: ', url);
    continue;
  }

  console.log('  Fetch done, saving image...');
  const destFile = fs.createWriteStream(
    `./static/images/recettes/${recette.slug}.jpg`,
  );
  const blob = await res.blob();
  var arrayBuffer = await blob.arrayBuffer();
  // NOTE: take care of the drain event
  destFile.write(Buffer.from(arrayBuffer));
  console.log(`  Image saved in ./static/images/recettes/${recette.slug}.jpg`);
}
