import { v2 as cloudinary } from 'cloudinary';
import { readdirSync } from 'fs';

cloudinary.config({
  cloud_name: 'dq023imd8',
  api_key: '523825454186795',
  api_secret: 'XXXXX',
  secure: true,
});

const srcDir = './static/images/shutterstock-webp/';

run();

async function run() {
  const images = readdirSync(srcDir);

  for (let i = 100; i < images.length; i++) {
    const imgName = images[i];
    console.log(`[LOG] ${imgName}`);
    const prevName = `services/recettes/${imgName}`;
    const newImgName = `services/recettes/${imgName.split('.')[0]}`;
    // const prevRes =
    await cloudinary.api
      .resource(prevName, async (err, _) => {
        if (err?.http_code !== 404) {
          await cloudinary.uploader
            .rename(
              prevName,
              newImgName,
              {
                overwrite: true,
                resource_type: 'image',
              },
              (err, res) => {
                if (err?.http_code !== 404) {
                  console.log(`[LOG][${i}]  renamed: ${res.url}`);
                }
              },
            )
            .catch((err) =>
              console.error(`[ERR][${i}]  rename:${err.message}`),
            );
        }
      })
      .catch((err) => console.error(`[ERR][${i}]  ressource:${err.message}`));
  }

  // return cloudinary.uploader
  //   .upload(srcDir + imgName, {
  //     folder: 'services/recettes',
  //     public_id: imgName,
  //     async: true,
  //     overwrite: true,
  //     resource_type: 'image',
  //   })
  //   .then((res) => console.log(`[LOG]   ${res.url}`))
  //   .catch((err) => console.error(`[ERR]   ${err.message}`));
}
