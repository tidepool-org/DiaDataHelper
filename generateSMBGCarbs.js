const fs = require('fs');
const { DateTime } = require('luxon');
const { faker } = require('@faker-js/faker');

const dataset = [];
const days = 120;
let date = DateTime.now().minus({ days: days });
let bg = faker.datatype.number({ min: 100, max: 300, precision: 0.0001 });
let carbs = 0;
let iob = 0;
for (let i = 0; i < days && date < DateTime.now().minus({ days: 1 }); i++) {
  date = date.plus({
    hours: faker.datatype.number({
      min: 3, max: 6, precision: 1,
    }),
    minutes: faker.datatype.number({
      min: 0, max: 30, precision: 1,
    }),
  });
  bg = bg + ((carbs) / 15) * 50 - (iob * 43);

  if (bg >= 300) {
    bg = 300;
    carbs = 0;
    iob += 1;
  } else if (bg <= 55) {
    bg = 55;
    carbs = 20;
    iob = 0;
  }

  const smbgdatum = {
    deviceId: 'Tidepool Testing Smart Meter',
    type: 'smbg',
    units: 'mg/dl',
    time: date.toFormat("yyyy-MM-dd'T'HH:mm:ss'Z'"),
    value: bg,
  };

  const carbdatum = {
    deviceId: 'Tidepool Testing Smart Meter',
    time: date.toFormat("yyyy-MM-dd'T'HH:mm:ss'Z'"),
    type: 'wizard',
    carbInput: carbs,
    bolus: {
      expectedNormal: iob,
      normal: iob,
      deviceId: 'Tidepool Testing Smart Meter',
      type: 'bolus',
      subType: 'normal',
      time: date.toFormat("yyyy-MM-dd'T'HH:mm:ss'Z'"),
    },
    carbUnits: 'grams',
    units: 'mg/dl',
  };

  if (carbs > 0) {
    dataset.push(smbgdatum, carbdatum);
  } else {
    dataset.push(smbgdatum);
  }

  if (i % (24 / 8) === 0) {
    if (bg > 70 && bg < 200) {
      carbs = faker.datatype.number({ min: 10, max: 80, precision: 1 });
      iob = Math.round(carbs / 15);
    } else if (bg <= 70) {
      carbs = faker.datatype.number({ min: 20, max: 80, precision: 1 });
      iob = 0;
    } else {
      carbs = faker.datatype.number({ min: 10, max: 60, precision: 1 });
      iob = Math.round(carbs / 15);
    }
  } else {
    iob *= 0.7;
  }
}

// Create a folder called "results" using fs.mkdir
fs.mkdir('results', { recursive: true }, (mkdirErr) => {
  if (mkdirErr) {
    console.error(mkdirErr);
    return;
  }
  fs.writeFile('results/smbg_carbs_data.json', JSON.stringify(dataset), (writeFileErr) => {
    if (writeFileErr) {
      console.error(writeFileErr);
      return;
    }
    console.log('Data Generated');
  });
});
