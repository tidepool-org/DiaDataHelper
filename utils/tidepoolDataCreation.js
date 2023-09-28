const { faker } = require('@faker-js/faker');

function createMealBolusEntry(date, carbs, insulinDelivered, config, bg, iob, dailyCgmUseNotMet) {
  if (config.service === 'platform' && dailyCgmUseNotMet && config.dataTypes !== 'bgm') {
    return {
      deviceId: 'tandemCIQ1003717775089',
      time: date.toFormat("yyyy-MM-dd'T'HH:mm:ss'.000Z'"),
      type: 'wizard',
      carbInput: carbs,
      bolus: {
        expectedNormal: insulinDelivered,
        normal: insulinDelivered,
        deviceId: 'tandemCIQ1003717775089',
        type: 'bolus',
        subType: 'normal',
        time: date.toFormat("yyyy-MM-dd'T'HH:mm:ss'Z'"),
      },
      bgInput: bg,
      insulinSensitivity: 40,
      insulinOnBoard: iob,
      insulinCarbRatio: 10,
      carbUnits: 'grams',
      units: 'mg/dl',
    };
  }

  if (dailyCgmUseNotMet && config.dataTypes !== 'bgm') {
    return {
      deviceId: 'tandemCIQ1003717775089',
      time: date.toFormat("yyyy-MM-dd'T'HH:mm:ss'.000Z'"),
      deviceTime: date.toFormat("yyyy-MM-dd'T'HH:mm:ss'"),
      type: 'wizard',
      carbInput: carbs,
      bolus: {
        expectedNormal: insulinDelivered,
        normal: insulinDelivered,
        deviceId: 'tandemCIQ1003717775089',
        type: 'bolus',
        subType: 'normal',
        time: date.toFormat("yyyy-MM-dd'T'HH:mm:ss'Z'"),
      },
      bgInput: bg,
      insulinSensitivity: 40,
      insulinOnBoard: iob,
      insulinCarbRatio: 10,
      carbUnits: 'grams',
      units: 'mg/dl',
      uploadId: faker.datatype.uuid().replace(/-/g, ''),
    };
  }
}

function createAutomatedBolusEntry(date, insulinDelivered, config, dailyCgmUseNotMet) {
  if (config.service === 'platform' && dailyCgmUseNotMet && config.dataTypes !== 'bgm') {
    return {
      deviceId: 'tandemCIQ1003717775089',
      time: date.toFormat("yyyy-MM-dd'T'HH:mm:ss'.000Z'"),
      type: 'bolus',
      normal: insulinDelivered,
      subType: 'automated',
    };
  } if (dailyCgmUseNotMet && config.dataTypes !== 'bgm') {
    return {
      deviceId: 'tandemCIQ1003717775089',
      time: date.toFormat("yyyy-MM-dd'T'HH:mm:ss'.000Z'"),
      deviceTime: date.toFormat("yyyy-MM-dd'T'HH:mm:ss'"),
      type: 'bolus',
      normal: insulinDelivered,
      subType: 'automated',
      tags: ['automated'],
      uploadId: faker.datatype.uuid().replace(/-/g, ''),
    };
  }
}

function createCbgEntry(date, bg, service) {
  if (service === 'platform') {
    return {
      deviceId: 'tandemCIQ1003717775089',
      deviceTime: date.toFormat("yyyy-MM-dd'T'HH:mm:ss"),
      type: 'cbg',
      units: 'mg/dl',
      time: date.toFormat("yyyy-MM-dd'T'HH:mm:ss'Z'"),
      value: bg,
    };
  }
  return {
    deviceId: 'tandemCIQ1003717775089',
    deviceTime: date.toFormat("yyyy-MM-dd'T'HH:mm:ss"),
    type: 'cbg',
    units: 'mg/dl',
    time: date.toFormat("yyyy-MM-dd'T'HH:mm:ss'Z'"),
    value: bg,
    uploadId: faker.datatype.uuid().replace(/-/g, ''),
  };
}

function createSmbgEntry(date, bg, service) {
  const smbgVariation = Math.random() < 0.5 ? -15 : 15; // just adding a bit of variety for realism
  const smbg = bg + smbgVariation;
  if (service === 'platform') {
    return {
      deviceId: 'OneTouchVerioIQ-TCF',
      deviceTime: date.toFormat("yyyy-MM-dd'T'HH:mm:ss"),
      type: 'smbg',
      units: 'mg/dl',
      time: date.toFormat("yyyy-MM-dd'T'HH:mm:ss'Z'"),
      value: smbg,
    };
  }
  return {
    deviceId: 'OneTouchVerioIQ-TCF',
    deviceTime: date.toFormat("yyyy-MM-dd'T'HH:mm:ss"),
    type: 'smbg',
    units: 'mg/dl',
    time: date.toFormat("yyyy-MM-dd'T'HH:mm:ss'Z'"),
    value: smbg,
    uploadId: faker.datatype.uuid().replace(/-/g, ''),
  };
}

function createBasalEntry(date, basalRate, service) {
  const endTime = date.plus({ minutes: 5 });
  if (service === 'platform') {
    return {
      time: date.toFormat("yyyy-MM-dd'T'HH:mm:ss'.000Z'"),
      deviceId: 'tandemCIQ1003717775089',
      type: 'basal',
      deliveryType: 'automated',
      scheduleName: 'school',
      rate: basalRate,
      duration: 300000,
      suppressed: {
        deliveryType: 'scheduled',
        type: 'basal',
        rate: 0.3,

      },
    };
  }
  return {
    time: date.toFormat("yyyy-MM-dd'T'HH:mm:ss'.000Z'"),
    deviceTime: date.toFormat("yyyy-MM-dd'T'HH:mm:ss'"),
    deviceId: 'tandemCIQ1002717664069',
    deviceSerialNumber: '664049',
    type: 'basal',
    subType: 'automated',
    deliveryType: 'automated',
    scheduleName: 'school',
    rate: basalRate,
    duration: 300000,
    normalEnd: endTime.toFormat("yyyy-MM-dd'T'HH:mm:ss'"),
    normalTime: date.toFormat("yyyy-MM-dd'T'HH:mm:ss'"),
    suppressed: {
      deliveryType: 'scheduled',
      subType: 'scheduled',
      type: 'basal',
      deviceTime: date.toFormat("yyyy-MM-dd'T'HH:mm:ss'"),
      time: date.toFormat("yyyy-MM-dd'T'HH:mm:ss'"),
      normalEnd: endTime.toFormat("yyyy-MM-dd'T'HH:mm:ss'"),
      normalTime: date.toFormat("yyyy-MM-dd'T'HH:mm:ss'"),
      duration: 300000,
      rate: 0.3,

    },
    tags: { suspend: false, temp: false },
    source: 'Tandem',
    uploadId: faker.datatype.uuid().replace(/-/g, ''),
  };
}

module.exports = {
  createMealBolusEntry,
  createCbgEntry,
  createBasalEntry,
  createSmbgEntry,
  createAutomatedBolusEntry,
};
