const { faker } = require('@faker-js/faker')

function generateCarbDatum(date, carbs, insulinDelivered) {
  return {
    deviceId: "Tidepool Testing Smart Meter",
    time: date.toFormat("yyyy-MM-dd'T'HH:mm:ss'.000Z'"),
    type: "wizard",
    carbInput: carbs,
    bolus: {
      expectedNormal: insulinDelivered,
      normal: insulinDelivered,
      deviceId: "Tidepool Testing Pump",
      type: "bolus",
      subType: "normal",
      time: date.toFormat("yyyy-MM-dd'T'HH:mm:ss'Z'"),
    },
    carbUnits: "grams",
    units: "mg/dl",
  };
}

function generateCbgDatum(date, bg) {
  return {
    deviceId: "Tidepool Testing Pump",
    deviceTime: date.toFormat("yyyy-MM-dd'T'HH:mm:ss"),
    type: "cbg",
    units: "mg/dl",
    time: date.toFormat("yyyy-MM-dd'T'HH:mm:ss'Z'"),
    value: bg,
  };
}

function generateBasalDatum(date, bg, iob) {
  return {
    time: date.toFormat("yyyy-MM-dd'T'HH:mm:ss'.000Z'"),
    deviceId: "Tidepool Testing Pump",
    type: "basal",
    deliveryType: "automated",
    scheduleName: "school",
    rate: faker.datatype.number({ min: 0, max: 5, precision: 0.1 }) + (bg - iob) / 1000,
    duration: 21600000,
  };
}

module.exports = {
  generateCarbDatum,
  generateCbgDatum,
  generateBasalDatum
};
