/* eslint-disable comma-dangle */
const fs = require('fs');
const { DateTime } = require('luxon');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const {
  createCbgEntry, createBasalEntry, createMealBolusEntry, createSmbgEntry, createAutomatedBolusEntry
} = require('./utils/tidepoolDataCreation');
const { patientProfile } = require('./utils/profiles');
const {
  handleMeal, handleRescueCarbs, handleCorrectionBolus, handleDecay
} = require('./utils/dosingDecisions');
const { bgRandomInterval, calculateTotalIterations, pushData } = require('./utils/helpers');

const config = yargs(hideBin(process.argv))
  .options({
    dataTypes: {
      alias: 't',
      default: ['cgm', 'bgm'],
      type: 'array',
      demandOption: true,
      coerce: (arg) => arg.map((v) => v.toLowerCase()),
    },
    cgmUse: {
      alias: 'u',
      default: 100,
      describe: 'Percentage of CGM usage (0-100)',
      type: 'number',
    },
    days: {
      alias: 'd',
      describe: 'Number of days of data needed to generate. This is cumulative if you are selecting less than 100% cgm use',
      type: 'number',
      default: 30,
      demandOption: true,
    },
    timeInRange: {
      alias: 'tir',
      describe: '',
      default: 'mid',
      type: 'string',
      coerce: (arg) => arg.toLowerCase(),
    },
    service: {
      alias: 's',
      describe: 'service used to upload',
      type: 'string',
      default: 'platform',
      coerce: (arg) => arg.toLowerCase(),
    },
  })
  .check((config) => {
    if (config.cgmUse >= 1 && config.cgmUse <= 100) {
      return true;
    }
    throw new Error('CGM usage must be between 1 and 100 percent');
  }).argv;

const cgmUsePercentage = config.cgmUse / 100;
const bgCalculationsPerDay = 288;
const [
  totalIterations,
  numberOfSubarrays,
  numberOfDaysAdjusted
] = calculateTotalIterations(config.days, config, cgmUsePercentage, bgCalculationsPerDay);
const datasets = Array.from({ length: numberOfSubarrays }, () => []);
let date = DateTime.now().minus({
  days: numberOfDaysAdjusted,
  hours: DateTime.now().hour,
  minutes: DateTime.now().minute,
  seconds: DateTime.now().second
});
const {
  targetBg, lowBg, highBg, isf, icr
} = patientProfile[`${config.timeInRange}`];
let bg = targetBg;
let basalRate = 0.3;
let cob = 0;
let iob = 0;
let tCarbs = 0;
let tInsulin = 0;
let dataToPush;

for (let i = 0; i < totalIterations; i++) {
  dataToPush = [];
  let carbs = 0;
  let insulinDelivered = 0;
  const index = Math.floor(i / 5000);
  const mealFrequencyHours = 6;
  const bgCalculationsPerHour = 12;
  const mealFrequency = mealFrequencyHours * bgCalculationsPerHour;
  const finalBgCalcPerDay = Math.ceil(bgCalculationsPerDay * cgmUsePercentage);
  // this may be wrong below ...
  const dailyCgmUseNotMet = (i % bgCalculationsPerDay) < finalBgCalcPerDay;
  const bgRandomHourlyInterval = bgRandomInterval();
  let bolusdatum;
  let carbdatum;
  let smbgdatum;
  let basaldatum;
  let cbgdatum;
  date = date.plus({ minutes: 5 });

  [
    bg,
    cob,
    iob,
    basalRate,
    tCarbs,
    tInsulin,
  ] = handleDecay(bg, cob, iob, tCarbs, tInsulin, basalRate, isf, icr);

  if (bg > highBg) {
    [
      iob,
      tInsulin,
      insulinDelivered,
      basalRate] = handleCorrectionBolus(iob, tInsulin, bg, basalRate, targetBg, isf);
      if (insulinDelivered){
    bolusdatum = createAutomatedBolusEntry(date, insulinDelivered, config, dailyCgmUseNotMet);
    dataToPush.push(bolusdatum); }
  } else if (bg < lowBg) {
    [
      cob,
      iob,
      tCarbs,
      tInsulin,
      carbs,
      insulinDelivered,
      basalRate] = handleRescueCarbs(cob, iob, tInsulin, bg, basalRate, tCarbs);
  } else if (i % mealFrequency === 0) {
    [
      cob,
      iob,
      tCarbs,
      tInsulin,
      carbs,
      insulinDelivered,
      basalRate,
      bg,
    ] = handleMeal(bg, targetBg, cob, iob, basalRate, isf, icr);
    carbdatum = createMealBolusEntry(date, carbs, insulinDelivered, config, bg, iob, dailyCgmUseNotMet);
    dataToPush.push(carbdatum);
  }

  if (config.dataTypes === 'bgm' && i % bgRandomHourlyInterval === 0 && dailyCgmUseNotMet) {
    smbgdatum = createSmbgEntry(date, Math.round(bg), config.service);
    dataToPush.push(smbgdatum);
  } else if (config.dataTypes.includes('bgm') && tCarbs === 60 && dailyCgmUseNotMet) {
    smbgdatum = createSmbgEntry(date, Math.round(bg), config.service);
    cbgdatum = createCbgEntry(date, bg, config.service);
    basaldatum = createBasalEntry(date, basalRate, config.service);
    dataToPush.push(smbgdatum, cbgdatum, basaldatum);
  } else if (dailyCgmUseNotMet) {
    cbgdatum = createCbgEntry(date, bg, config.service);
    basaldatum = createBasalEntry(date, basalRate, config.service);
    dataToPush.push(cbgdatum, basaldatum);
  }
  datasets[index].push(...dataToPush);
}

// Write the datasets array to different files using a loop or api will timeout
try {
  fs.mkdirSync('results', { recursive: true });
  for (let j = 0; j < numberOfSubarrays; j++) {
    const filename = `results/${config.timeInRange}TIR_${config.cgmUse}cgmUse_${numberOfDaysAdjusted}Days_${config.service}Service${j + 1}.json`;
    fs.writeFileSync(filename, JSON.stringify(datasets[j]));
    console.log(`Data Generated for dataset ${j}`);
  }
  console.log('All datasets generated!');
} catch (err) {
  console.error(err);
}
