function bgRandomInterval() {
  const randomHourIntervalsMap = [48, 72, 96];
  const randomInterval = Math.floor(Math.random() * randomHourIntervalsMap.length);
  return randomHourIntervalsMap[randomInterval];
}

function calculateTotalIterations(days, config, cgmUsePercentage, bgCalculationsPerDay) {
  const numberOfDaysAdjusted = Math.ceil(days / cgmUsePercentage);
  const totalIterations = numberOfDaysAdjusted * bgCalculationsPerDay;
  const subarraySize = config.service === 'platform' ? 5000 : 4000;
  const numberOfSubarrays = Math.ceil(totalIterations / subarraySize);
  return [totalIterations, numberOfSubarrays, numberOfDaysAdjusted];
}

function pushData(...args) {
  const dataToPush = args.filter(datum => datum);
  return dataToPush;
}

module.exports = {
  bgRandomInterval,
  calculateTotalIterations,
  pushData,
};
