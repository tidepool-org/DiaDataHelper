function transformCBG(item) {
  const transformed = {
    ...item,
    deviceId: 'Dexcom_G6_866PAF',
    origin: {
      ...item.origin,
      name: 'org.tidepool.Loop',
      type: 'application',
      version: '1.3.0+7634',
    },
  };

  delete transformed.provenance;

  return transformed;
}

function transformSMBG(item) {
  const transformed = {
    ...item,
    origin: {
      ...item.origin,
      name: 'org.tidepool.Loop',
      type: 'application',
      version: '1.3.0+7634',
    },
  };
  delete transformed.provenance;
  return transformed;
}

function transformBolus(item) {
  const transformed = {
    ...item,
    origin: {
      ...item.origin,
      name: 'org.tidepool.Loop',
      type: 'application',
      version: '1.3.0+7634',
    },
  };
  delete transformed.provenance;
  return transformed;
}

function transformFood(item) {
  const transformed = {
    ...item,
    origin: {
      ...item.origin,
      name: 'org.tidepool.Loop',
      type: 'application',
      version: '1.3.0+7634',
    },
  };
  delete transformed.provenance;
  return transformed;
}

function transformBasal(item) {
  const transformed = {
    ...item,
    origin: {
      ...item.origin,
      name: 'org.tidepool.Loop',
      type: 'application',
      version: '1.3.0+7634',
    },
  };
  delete transformed.provenance;
  return transformed;
}
function transformPumpSettings(item) {
  const transformed = {
    ...item,
    origin: {
      ...item.origin,
      name: 'org.tidepool.Loop',
      type: 'application',
      version: '1.3.0+7634',
    },
  };
  delete transformed.provenance;
  delete transformed.overridePresets;
  return transformed;
}
function transformDeviceEvent(item) {
  const transformed = {
    ...item,
    origin: {
      ...item.origin,
      name: 'org.tidepool.Loop',
      type: 'application',
      version: '1.3.0+7634',
    },
  };
  delete transformed.provenance;
  return transformed;
}
function transformDosingDecision(item) {
  const transformed = {
    ...item,
    origin: {
      ...item.origin,
      name: 'org.tidepool.Loop',
      type: 'application',
      version: '1.3.0+7634',
    },
  };
  delete transformed.provenance;
  return transformed;
}

function transformData(data) {
  return data.reduce((acc, item) => {
    switch (item.type) {
      case 'cbg':
        acc.push(transformCBG(item));
        break;
      case 'smbg':
        acc.push(transformSMBG(item));
        break;
      case 'basal':
        acc.push(transformBasal(item));
        break;
      case 'food':
        acc.push(transformFood(item));
        break;
      case 'pumpSettings':
        acc.push(transformPumpSettings(item));
        break;
      case 'dosingDecision':
        acc.push(transformDosingDecision(item));
        break;
      case 'bolus':
        if (item.subType !== 'automated') {
          acc.push(transformBolus(item));
        }
        break;
      case 'deviceEvent':
        if (item.overrideType !== 'preset') {
          acc.push(transformDeviceEvent(item));
        }
        break;
      default:
        acc.push(item);
    }
    return acc;
  }, []);
}

module.exports = { transformData };
