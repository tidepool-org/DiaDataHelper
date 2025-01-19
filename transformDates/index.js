#!/usr/bin/env node
/* eslint-disable consistent-return */
/* eslint-disable array-callback-return */

const fs = require('fs');
const path = require('path');
const parseArgs = require('./src/argParser');
const { transformAllWithSingleOffset } = require('./src/transformTimes');

(async function main() {
  const argv = parseArgs();
  const filePaths = argv.file.map((fp) => path.resolve(fp));

  // Load all files
  const allDataSets = filePaths.map((filePath) => {
    if (!fs.existsSync(filePath)) {
      console.error(`Error: File not found at ${filePath}`);
      process.exit(1);
    }
    try {
      const rawData = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(rawData);
    } catch (err) {
      console.error(`Error reading or parsing JSON from ${filePath}: ${err.message}`);
      process.exit(1);
    }
  });

  // Transform all data sets using a single offset
  transformAllWithSingleOffset(allDataSets);

  // Write out updated data
  filePaths.forEach((filePath, index) => {
    const data = allDataSets[index];
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      console.log(`Successfully updated date fields in ${filePath}`);
    } catch (err) {
      console.error(`Error writing updated JSON to ${filePath}: ${err.message}`);
      process.exit(1);
    }
  });

  process.exit(0);
}());
