const { faker } = require('@faker-js/faker');

function generateCarbDatum(date, carbs, insulinDelivered, service, bg, iob) {
  if (service === 'platform') {
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
    uploadId: faker.datatype.uuid().replace(/-/g, ''),
  };
}

function generateBolusDatum(date, insulinDelivered, service) {
  if (service === 'platform') {
    return {
      deviceId: 'tandemCIQ1003717775089',
      time: date.toFormat("yyyy-MM-dd'T'HH:mm:ss'.000Z'"),
      type: 'bolus',
      normal: insulinDelivered,
      subType: 'automated',
    };
  }
  return {
    deviceId: 'tandemCIQ1003717775089',
    time: date.toFormat("yyyy-MM-dd'T'HH:mm:ss'.000Z'"),
    type: 'bolus',
    normal: insulinDelivered,
    subType: 'automated',
    tags: ['automated'],
    uploadId: faker.datatype.uuid().replace(/-/g, ''),
  };
}

function generateCbgDatum(date, bg, service) {
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

function generateSmbgDatum(date, bg, service) {
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

function generateBasalDatum(date, bg, service) {
  let rate = 0.0;
  if (bg < 70) {
    rate = 0.0;
  } else {
    rate = Math.round(bg) / 1000;
  }
  if (service === 'platform') {
    return {
      time: date.toFormat("yyyy-MM-dd'T'HH:mm:ss'.000Z'"),
      deviceId: 'tandemCIQ1003717775089',
      type: 'basal',
      deliveryType: 'automated',
      scheduleName: 'school',
      rate,
      duration: 300000,
      suppressed: {
        deliveryType: 'scheduled',
        type: 'basal',
        rate: 0.1,

      },
    };
  }
  return {
    time: date.toFormat("yyyy-MM-dd'T'HH:mm:ss'.000Z'"),
    deviceId: 'tandemCIQ1003717775089',
    type: 'basal',
    deliveryType: 'automated',
    scheduleName: 'school',
    rate,
    duration: 300000,
    uploadId: faker.datatype.uuid().replace(/-/g, ''),
  };
}

module.exports = {
  generateCarbDatum,
  generateCbgDatum,
  generateBasalDatum,
  generateSmbgDatum,
  generateBolusDatum,
};
