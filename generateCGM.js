/* eslint-disable comma-dangle */
const fs = require('fs');
const { DateTime } = require('luxon');
const { faker } = require('@faker-js/faker');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const { generateCbgDatum, generateBasalDatum, generateCarbDatum } = require('./utils/generateDatums');

const { cgmuse, days, service } = yargs(hideBin(process.argv))
  .options({
    cgmuse: {
      alias: 'use',
      describe: 'Percentage of CGM usage (0-100)',
      type: 'number',
      demandOption: true,
    },
    days: {
      alias: 'd',
      describe: 'Number of cumulative days',
      type: 'number',
      demandOption: true,
    },
    service: {
      alias: 's',
      describe: 'service used to upload',
      type: 'string',
      demandOption: true,
    },
  })
  .check((argv) => {
    if (argv.cgmuse >= 0 && argv.cgmuse <= 100) {
      return true;
    }
    throw new Error('CGM usage must be between 0 and 100');
  }).argv;

const cumulativeDays = days;
const cgmUse = cgmuse / 100;
const numberOfDays = Math.ceil(cumulativeDays / cgmUse);
const iterationsPerDay = 288;
const totalIterations = numberOfDays * iterationsPerDay;
const subarraySize = 5000;
const numberOfSubarrays = Math.ceil(totalIterations / subarraySize);
const datasets = Array.from({ length: numberOfSubarrays }, () => []);

let date = DateTime.now().startOf('day').minus({
  // eslint-disable-next-line max-len
  days: numberOfDays, hours: DateTime.now().hour, minutes: DateTime.now().minute, seconds: DateTime.now().second
});
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
// Loop to create enough CGM data for 2 days
for (let i = 0; i < totalIterations; i++) {
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
    // in this model insulin takes down the carb effect by half
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

  // Clamp bg between 53 and 300
  bg = Math.min(Math.max(bg, 53), 300);

  // Reset carbs and iob if bg is too high or low
  if (bg === 300) {
    cob = 0;
    iob += 0.6;
  } else if (bg === 55) {
    cob += 3;
    iob = 0;
  }

  // Generate data for cbgdatum, basaldatum and carbdatum
  const cbgdatum = generateCbgDatum(date, bg, service);
  // console.log (`${bg} after cbgdatum function`)
  const basaldatum = generateBasalDatum(date, bg, iob);
  const carbdatum = generateCarbDatum(date, carbs, insulinDelivered);

  // Determine the index of the datasets array based on i
  const index = Math.floor(i / 5000);

  if ((i % iterationsPerDay) < Math.ceil(iterationsPerDay * cgmUse)) {
    pushData(index, cbgdatum, carbdatum, basaldatum);
  }
}

// Write the datasets array to different files using a loop or api will timeout
try {
  fs.mkdirSync('results', { recursive: true });
  for (let j = 0; j < numberOfSubarrays; j++) {
    const filename = `results/${service}cbg_${cgmuse}use_over${numberOfDays}days_cumulative${cumulativeDays}days${j + 1}.json`;
    fs.writeFileSync(filename, JSON.stringify(datasets[j]));
    console.log(`Data Generated for dataset ${j}`);
  }
  console.log('All datasets generated!');
} catch (err) {
  console.error(err);
}
