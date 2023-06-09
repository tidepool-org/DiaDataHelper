/* eslint-disable comma-dangle */
const fs = require('fs');
const { DateTime } = require('luxon');
const { faker } = require('@faker-js/faker');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const {
  generateCbgDatum, generateBasalDatum, generateCarbDatum, generateSmbgDatum, generateBolusDatum
} = require('./utils/generateDatums');
// 33 is standard deviation
const {
  cgmUse, days, fingersticks, bgRange, service
} = yargs(hideBin(process.argv))
  .options({
    cgmUse: {
      alias: 'use',
      describe: 'Percentage of CGM usage (0-100)',
      type: 'number',
      demandOption: true,
    },
    days: {
      alias: 'd',
      describe: 'Number of days',
      type: 'number',
      demandOption: true,
    },
    fingersticks: {
      alias: 'f',
      describe: 'whether the user also uses a bg meter',
      type: 'boolean',
      demandOption: true,
    },
    bgRange: {
      alias: 'range',
      describe: 'bg range skew',
      type: 'string',
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
    if (argv.cgmUse >= 0 && argv.cgmUse <= 100) {
      return true;
    }
    throw new Error('CGM usage must be between 0 and 100');
  }).argv;

const cumulativeDays = days;
const cgmUsePercentage = cgmUse / 100;
const numberOfDays = Math.ceil(cumulativeDays / cgmUsePercentage);
const iterationsPerDay = 288;
const totalIterations = numberOfDays * iterationsPerDay;
const subarraySize = 5000;
const numberOfSubarrays = Math.ceil(totalIterations / subarraySize);
const datasets = Array.from({ length: numberOfSubarrays }, () => []);
const rangeSettingsMap = {
  high: {
    targetBg: 130, // increasing only target bg increases high amount
    lowBg: 90,
    highBg: 300
  },
  mid: {
    targetBg: 120,
    lowBg: 75,
    highBg: 170

  },
  low: {
    targetBg: 110, // increasing only target bg decreases high amount
    lowBg: 50,
    highBg: 180
  }
};

let date = DateTime.now().startOf('day').minus({
  // eslint-disable-next-line max-len
  days: numberOfDays, hours: DateTime.now().hour, minutes: DateTime.now().minute, seconds: DateTime.now().second
});
const { targetBg, lowBg, highBg } = rangeSettingsMap[`${bgRange}`];
let bg = targetBg;
let carbs = 0;
let cob = 0;
let iob = 0;
let insulinDelivered = 0;
let tCarbs = 0;
let tInsulin = 0;
let insulinEffect = 0;

function generateRange(start, end, step) {
  return Array.from({ length: Math.floor((end - start) / step) + 1 }, (_, i) => start + (i * step));
}

const generateSmbgValues = generateRange(65, 285, 94);
console.log(generateSmbgValues)

// Push data to the datasets array
function pushData(index, cbgdatum, carbdatum, smbgdatum, basaldatum, bolusdatum) {
  const dataToPush = [];

  dataToPush.push(cbgdatum, basaldatum);

  if (carbdatum) {
    dataToPush.push(carbdatum);
  }

  if (smbgdatum) {
    dataToPush.push(smbgdatum);
  }
  if (bolusdatum) {
    dataToPush.push(bolusdatum);
  }

  datasets[index].push(...dataToPush);
}

// Eat a meal, give rescue carbs or bolus depending on bg
function eatMeal(currentBg, target) {
  const mealCarbs = faker.datatype.number({ min: 10, max: 80, precision: 1.0 });
  let bolus;
  if (currentBg < 70) {
    bolus = 0;
  } else {
    bolus = Math.round((((currentBg - target) / 50) + (mealCarbs / 10)));
  }
  return [mealCarbs, bolus, 0, 0];
}

function giveCorrectionBolus(currentBg, target) {
  const bolus = Math.round(((currentBg - target) / 50));
  return [0, bolus, 0];
}

function calculateInsulinAction(time) {
  let a; let b; let
    c;
  a = 2.867;
  b = 0.056;
  c = 2.878;
  const d = 0.00001;
  const newInsulinEffect = a * Math.exp(-b * time) - c * Math.exp(-d * time);
  return newInsulinEffect;
}

function calculateCarbAction(time) {
  let a; let b; let
    c;
  a = 1.567;
  b = 0.056;
  c = 1.578;
  const d = 0.0001;
  const newCarbEffect = a * Math.exp(-b * time) - c * Math.exp(-d * time);
  return newCarbEffect;
}

function calculateBg(currentBg, carbsOnBoard, insulinOnBoard, timeCarbs, timeInsulin) {
  const carbEffect = calculateCarbAction(timeCarbs);
  const insulinEffect = calculateInsulinAction(timeInsulin);
  const bgChangeFromInsulin = insulinEffect * insulinOnBoard;
  const bgChangeFromCarbs = carbEffect * carbsOnBoard;
  const newBg = currentBg + bgChangeFromInsulin - bgChangeFromCarbs;
  bg = Math.min(Math.max(newBg, 50), 300);
  // console.log(` calculate bg func - iob: ${insulinOnBoard}, cob: ${carbsOnBoard}, cobeffect: ${carbEffect}, insulinEffect: ${insulinEffect}, currentBg: ${currentBg}, newBg: ${newBg}`);

  return [bg, insulinEffect];
}

// Loop to create enough CGM data for 2 days
for (let i = 0; i < totalIterations; i++) {
  date = date.plus({ minutes: 5 });
  tCarbs += 5;
  tInsulin += 5;
  iob = Math.max(iob - iob * 0.05, 0);
  cob = Math.max(cob - cob * 0.3, 0);

  // Generate a random number of carbs and iob every 6 hours using the function defined earlier
  if (i % (72) === 0) {
    [carbs, insulinDelivered, tCarbs, tInsulin] = eatMeal(bg, targetBg);
    cob += carbs;
    iob += insulinDelivered;
    [bg, insulinEffect] = calculateBg(bg, cob, iob, tCarbs, tInsulin);
    iob = Math.max(iob - insulinEffect, 0);
    cob = Math.max(cob - calculateCarbAction(tCarbs, cob), 0);
    // console.log(`eat meal Carbs Created: ${carbs}, Insulin Delivered: ${insulinDelivered}, iob: ${iob}, cob: ${cob}`);
  } else if (bg < lowBg && cob < 5) {
    // rescue carbs
    carbs = 15;
    insulinDelivered = 0;
    tCarbs = 0;
    cob += carbs;
    iob += insulinDelivered;
    [bg, insulinEffect] = calculateBg(bg, cob, iob, tCarbs, tInsulin);
    console.log(`rescue carbs: Carbs Created: ${carbs}, Insulin Delivered: ${insulinDelivered}, iob: ${iob}, cob: ${cob}`);
  } else if (bg > highBg && iob < 3) {
    [carbs, insulinDelivered, tInsulin] = giveCorrectionBolus(bg, targetBg);
    cob += carbs;
    iob += insulinDelivered;
    [bg, insulinEffect] = calculateBg(bg, cob, iob, tCarbs, tInsulin);
    // console.log(`correction bolus: Carbs Created: ${carbs}, Insulin Delivered: ${insulinDelivered}, iob: ${iob}, cob: ${cob}`);
  } else {
    carbs = 0;
    insulinDelivered = 0;
    cob += carbs;
    iob += insulinDelivered;
    [bg, insulinEffect] = calculateBg(bg, cob, iob, tCarbs, tInsulin);
    bg += faker.datatype.number({ min: 0, max: 5, precision: 1.0 });
    // console.log(`other: Carbs Created: ${carbs}, Insulin Delivered: ${insulinDelivered}, iob: ${iob}, cob: ${cob}`);
  }

  // Generate data for cbgdatum, basaldatum and carbdatum
  const cbgdatum = generateCbgDatum(date, bg, service);
  // console.log (`${bg} after cbgdatum function`)
  const basaldatum = generateBasalDatum(date, bg, service);

  let bolusdatum;
  if (insulinDelivered && !carbs) {
    bolusdatum = generateBolusDatum(date, insulinDelivered);
  }

  let carbdatum;
  if (carbs && insulinDelivered) {
    carbdatum = generateCarbDatum(date, carbs, insulinDelivered, bg, iob);
  }

  let smbgdatum;
  if (generateSmbgValues.includes(Math.round(bg)) && fingersticks) {
    console.log(Math.round(bg))
    smbgdatum = generateSmbgDatum(date, Math.round(bg), service);
    console.log(smbgdatum)
  }
  // Determine the index of the datasets array based on i
  const index = Math.floor(i / 5000);

  if ((i % iterationsPerDay) < Math.ceil(iterationsPerDay * cgmUsePercentage)) {
    pushData(index, cbgdatum, carbdatum, smbgdatum, basaldatum, bolusdatum);
  }
}
// Write the datasets array to different files using a loop or api will timeout
try {
  fs.mkdirSync('results', { recursive: true });
  for (let j = 0; j < numberOfSubarrays; j++) {
    const filename = `results/${bgRange}TIR_${cgmUse}cgmUse_${cumulativeDays}Days_${service}Service${j + 1}.json`;
    fs.writeFileSync(filename, JSON.stringify(datasets[j]));
    console.log(`Data Generated for dataset ${j}`);
  }
  console.log('All datasets generated!');
} catch (err) {
  console.error(err);
}
