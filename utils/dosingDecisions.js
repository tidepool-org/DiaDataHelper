const { faker } = require('@faker-js/faker');

const carbDuration = 170;
const insulinDuration = 160;
/**
 * Calculate the effect of injected insulin on blood glucose level
 *
 * @param {number} tInsulin - Time passed in minutes since last insulin injection
 * @param {number} iob - Amount of insulin taken
 * @param {number} bg - Current blood glucose level
 * @param {number} isf - Insulin Sensitivity Factor
 * @param {number} insulinDuration - Insulin duration in minutes
 * @return {number} - Updated blood glucose level
 */
function calculateInsulinAction(tInsulin, iob, bg, isf) {
  let updatedBg = bg;
  if (iob >= 1) {
    const insulinActionIntervals = tInsulin / 15;
    const insulinEffectPerInterval = (insulinDuration / isf);
    updatedBg = bg - insulinEffectPerInterval * insulinActionIntervals;
  }
  return updatedBg;
}

/**
 * Calculate the effect of consumed carbs on blood glucose level
 *
 * @param {number} tCarbs - Time passed in minutes since last carb consumption
 * @param {number} cob - Amount of total carbs consumed/on board
 * @param {number} bg - Current blood glucose level
 * @param {number} isf - Insulin Sensitivity Factor
 * @param {number} icr - Insulin to Carb Ratio
 * @return {number} - Updated blood glucose in mg/dl
 */
function calculateCarbAction(tCarbs, cob, bg, isf, icr) {
  let updatedBg = bg;
  if (cob >= 1) {
    const carbActionIntervals = tCarbs / 30;
    const carbEffectPerInterval = (isf / icr);
    updatedBg = bg + carbEffectPerInterval * carbActionIntervals;
  }
  return updatedBg;
}

function calculateBg(bg, cob, iob, tCarbs, tInsulin, isf, icr) {
  const modifiedBgFromCarbsOnBoard = calculateCarbAction(tCarbs, cob, bg, isf, icr);
  const modifiedBgFromInsulinOnBoard = calculateInsulinAction(tInsulin, iob, bg, isf);
  const avgOfBgChanges = (modifiedBgFromCarbsOnBoard + modifiedBgFromInsulinOnBoard) / 2;
  let adjustedBg = Math.min(Math.max(avgOfBgChanges, 49), 301);
  // add noise
  adjustedBg += faker.datatype.number({ min: -3, max: 3, precision: 1.0 });

  return adjustedBg;
}

function eatMeal(bg, targetBg, icr, isf) {
  const mealCarbs = faker.datatype.number({ min: 10, max: 80, precision: 1.0 });
  let bolus = 0;
  if (bg > 60) {
    bolus += mealCarbs / icr;
    if (bg > targetBg) {
      bolus += (bg - targetBg) / isf;
    }
  }
  return [mealCarbs, bolus, 0, 0];
}

function adjustBasalRate(bg, currentBasalRate) {
  let basalRate = currentBasalRate;
  if (bg > 200) {
    basalRate += 0.06;
  } else if (bg < 120) {
    basalRate += -0.03;
  }
  if (basalRate < 0) {
    basalRate = 0.0;
  } else if (basalRate > 5.0) {
    basalRate = 5.0;
  }
  return basalRate;
}

function handleMeal(bg, targetBg, cob, iob, basalRate, isf, icr) {
  let adjustedCob = cob;
  let adjustedIob = iob;
  let adjustedBasalRate = basalRate;
  const [carbs, insulinDelivered, tCarbs, tInsulin] = eatMeal(bg, targetBg, icr, isf);
  adjustedCob += carbs;
  adjustedIob += insulinDelivered;
  adjustedBasalRate = adjustBasalRate(bg, basalRate);
  return [
    adjustedCob,
    adjustedIob,
    tCarbs,
    tInsulin,
    carbs,
    insulinDelivered,
    adjustedBasalRate,
    bg,
  ];
}

function handleRescueCarbs(cob, iob, tInsulin, bg, basalRate, tCarbs) {
  let adjustedCob = cob;
  let adjustedIob = iob;
  let adjustedBasalRate = basalRate;
  let adjustedtCarbs = tCarbs;
  let carbs = 0;
  let insulinDelivered = 0;
  if (cob < 5) {
    carbs = 15;
    insulinDelivered = 0;
    adjustedtCarbs = 0;
    adjustedCob += carbs;
    adjustedIob += insulinDelivered;
    adjustedBasalRate = adjustBasalRate(bg, basalRate);
  }
  return [
    adjustedCob,
    adjustedIob,
    adjustedtCarbs,
    tInsulin,
    carbs,
    insulinDelivered,
    adjustedBasalRate,
  ];
}

function handleCorrectionBolus(iob, tInsulin, bg, basalRate, targetBg, isf) {
  let adjustedtInsulin = tInsulin;
  let insulinDelivered;
  let adjustedIob = iob;
  let adjustedBasalRate = basalRate;
  if (iob < 2) {
    adjustedtInsulin = 0;
    insulinDelivered = Math.round(((bg - targetBg) / isf));
    adjustedIob += insulinDelivered;
    adjustedBasalRate = adjustBasalRate(bg, basalRate);
  }
  return [
    adjustedIob,
    adjustedtInsulin,
    insulinDelivered,
    adjustedBasalRate,
  ];
}

function handleDecay(bg, cob, iob, tCarbs, tInsulin, basalRate, isf, icr) {
  let adjustedtCarbs = tCarbs;
  let adjustedtInsulin = tInsulin;
  let adjustedIob = iob;
  let adjustedCob = cob;
  adjustedtCarbs += 5;
  adjustedtInsulin += 5;
  const adjustedBg = calculateBg(bg, cob, iob, adjustedtCarbs, adjustedtInsulin, isf, icr);
  if (iob !== 0) {
    const remainingInsulinDurationMinutes = insulinDuration - adjustedtInsulin;
    const insulinDecayPerMinute = (iob / remainingInsulinDurationMinutes);
    adjustedIob = iob - Math.max(insulinDecayPerMinute * 5, 0);
  }
  if (cob !== 0) {
    const remainingCarbDurationMinutes = carbDuration - adjustedtCarbs;
    const carbDecayPerMinute = (cob / remainingCarbDurationMinutes);
    adjustedCob = cob - Math.max(carbDecayPerMinute * 5, 0);
  }
  const adjustedBasalRate = adjustBasalRate(adjustedBg, basalRate);
  return [
    adjustedBg,
    adjustedCob,
    adjustedIob,
    adjustedBasalRate,
    adjustedtCarbs,
    adjustedtInsulin];
}

module.exports = {
  calculateInsulinAction,
  calculateCarbAction,
  calculateBg,
  eatMeal,
  handleMeal,
  handleRescueCarbs,
  adjustBasalRate,
  handleCorrectionBolus,
  handleDecay,
};
