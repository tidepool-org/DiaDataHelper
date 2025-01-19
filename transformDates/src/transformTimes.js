/* eslint-disable no-restricted-syntax */
function gatherDates(data, fieldName) {
  let dates = [];

  if (Array.isArray(data)) {
    for (const item of data) {
      dates = dates.concat(gatherDates(item, fieldName));
    }
  } else if (data && typeof data === 'object') {
    for (const key of Object.keys(data)) {
      if (key === fieldName) {
        const d = new Date(data[key]);
        if (!Number.isNaN(d.getTime())) dates.push(d);
      } else {
        dates = dates.concat(gatherDates(data[key], fieldName));
      }
    }
  }

  return dates;
}

function applyOffset(data, fieldName, offset, isDeviceTime = false) {
  if (Array.isArray(data)) {
    for (const item of data) {
      applyOffset(item, fieldName, offset, isDeviceTime);
    }
  } else if (data && typeof data === 'object') {
    const updatedData = { ...data };
    for (const key of Object.keys(updatedData)) {
      if (key === fieldName) {
        const original = new Date(updatedData[key]);
        if (!Number.isNaN(original.getTime())) {
          const newTime = new Date(original.getTime() + offset);
          let newTimeStr = newTime.toISOString();

          if (isDeviceTime) {
            // Remove milliseconds and trailing 'Z'
            newTimeStr = newTimeStr.substring(0, 19);
          }

          updatedData[key] = newTimeStr;
        }
      } else {
        applyOffset(updatedData[key], fieldName, offset, isDeviceTime);
      }
    }
    Object.assign(data, updatedData);
  }
}

function calculateOffset(dates) {
  if (dates.length === 0) return null;

  const maxDate = new Date(Math.max(...dates));
  const now = new Date();
  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    maxDate.getHours() - 3,
    maxDate.getMinutes(),
    maxDate.getSeconds(),
    maxDate.getMilliseconds(),
  );

  return today.getTime() - maxDate.getTime();
}

/**
 * Given multiple datasets (one per file),
 * compute a single offset from the `time` fields of all combined data,
 * then apply that offset to both `time` and `deviceTime` fields in each dataset.
 *
 * @param {Array<Array|Object>} allDataSets - An array of parsed JSON data sets (one per file).
 */
function transformAllWithSingleOffset(allDataSets) {
  // Gather all `time` fields from all datasets combined
  let allTimeDates = [];
  for (const data of allDataSets) {
    allTimeDates = allTimeDates.concat(gatherDates(data, 'time'));
  }

  const offset = calculateOffset(allTimeDates);
  if (offset === null) {
    console.log('No "time" fields found across all files. No transformations will be applied.');
    return;
  }

  // Apply to each dataset
  for (const data of allDataSets) {
    applyOffset(data, 'time', offset, false);
    applyOffset(data, 'deviceTime', offset, true);
  }
}

module.exports = {
  transformAllWithSingleOffset,
};
