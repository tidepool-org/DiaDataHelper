const fs = require('fs');
const { DateTime } = require('luxon');
const { faker } = require('@faker-js/faker');
const { generateCbgDatum, generateBasalDatum, generateCarbDatum } = require('./utils/generateDatums');

const datasets = [[], [], [], [], [], []];
let date = DateTime.now().minus({ days: 91 });
let bg = faker.datatype.number({ min: 100, max: 200, precision: 0.0001 });
let carbs = 0;
let cob = 0;
let iob = 0;
let insulinDelivered = 0;

// Push data to the datasets array
function pushData(index, cbgdatum, carbdatum, basaldatum) {
  if (carbs > 100) {
    datasets[index].push(cbgdatum, carbdatum, basaldatum);
  } else {
    datasets[index].push(cbgdatum);
  }
}

// Eat a meal, give rescue carbs or bolus depending on bg
function generateCarbsAndIob(currentBg) {
  if (currentBg > 70 && bg < 200) {
    carbs = faker.datatype.number({ min: 10, max: 80, precision: 1.0 });
    insulinDelivered = (carbs / 15).toFixed(2);
    iob = insulinDelivered;
    cob = carbs;
  } else if (currentBg <= 70) {
    carbs = faker.datatype.number({ min: 20, max: 80, precision: 1.0 });
    insulinDelivered = 0;
    iob = 0;
    cob = carbs;
  } else {
    carbs = 0;
    insulinDelivered = 1;
    iob = 1;
    cob = carbs;
  }
  return [carbs, iob, insulinDelivered, cob];
}

// Loop to create enough CGM data for 90 days
for (let i = 0; i < 25920; i++) {
  date = date.plus({ minutes: 5 });

  // Generate a random number of carbs and iob every 6 hours using the function defined earlier
  if (i % (72) === 0) {
    [carbs, insulinDelivered, iob, cob] = generateCarbsAndIob(bg);
  } else {
    // carbs decaying over 3 hours evenly and insulin the same working with a 5 minute interval
    cob -= (cob / 180) * 5;
    iob -= (iob / 180) * 5;
    carbs = 0;
    insulinDelivered = 0;
    // in this model insluin takes down the carb effect by half
    const cobeffect = cob * 0.1;
    let iobeffect;
    if (cob > 0) {
      iobeffect = cob * 0.05;
    } else {
      iobeffect = bg * 0.025;
    }
    const deltabg = cobeffect - iobeffect;
    bg += deltabg;
  }

  // Clamp bg between 55 and 300
  bg = Math.min(Math.max(bg, 55), 300);

  // Reset carbs and iob if bg is too high or low
  if (bg === 300) {
    cob = 0;
    iob += 0.6;
  } else if (bg === 55) {
    cob += 3;
    iob = 0;
  }

  // Generate data for cbgdatum, basaldatum and carbdatum
  const cbgdatum = generateCbgDatum(date, bg);
  // console.log (`${bg} after cbgdatum function`)
  const basaldatum = generateBasalDatum(date, bg, iob);
  const carbdatum = generateCarbDatum(date, carbs, insulinDelivered);

  // Determine the index of the datasets array based on i
  const index = Math.floor(i / 5000);
  pushData(index, cbgdatum, carbdatum, basaldatum);
}

// Write the datasets array to different files using a loop or api will timeout
fs.mkdir('results', { recursive: true }, (mkdirErr) => {
  if (mkdirErr) {
    console.error(mkdirErr);
  } else {
    for (let j = 0; j < 5; j++) {
      fs.writeFile(
        `results/cbg_data${j + 1}.json`,
        JSON.stringify(datasets[j]),
        (writeFileErr) => {
          if (writeFileErr) {
            console.error(writeFileErr);
            return;
          }
          console.log(`Data Generated for dataset ${j}`);
        }
      );
    }
  }
});
