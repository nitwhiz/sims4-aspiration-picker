const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const file = process.argv[2];
const results = [];

const save = () => {
  Promise.all(
    results
      .map(
        (r) => axios.get(r.image, { responseType: 'arraybuffer' }).then(({ data }) => data)
      )
  ).then((images) => {
    images.forEach((iBuf, i) => {
      fs.writeFileSync(
        path.join(__dirname, '../src/assets/images/' + results[i].slug + '.png'),
        iBuf
      );

      delete results[i].image;
    });

    fs.writeFileSync(
      path.resolve(path.join(__dirname, '../src/assets/data/aspirations.json')),
      JSON.stringify(results, null, 2),
      'utf8'
    );
  }).catch((e) => {
    console.error(e);
  });
}

fs.createReadStream(file)
  .pipe(csv())
  .on('data', (data) => {
    results.push({
      slug: data.name_en.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_{2,}/g, '_'),
      names: {
        en: data.name_en,
      },
      image: data.image.split('.png')[0] + '.png',
      isAdult: data.is_adult === '1',
      isTeen: data.is_teen === '1',
      isChild: data.is_child === '1',
    });
  })
  .on('end', () => {
    save();
  });
