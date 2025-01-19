#!/usr/bin/env node

const { fetchData } = require('./src/fetchClient');
const { transformData } = require('./src/transformer');
const { writeToFile } = require('./src/fileWriter');
const { parseArgs } = require('./src/argParser');
const { uploadData } = require('./src/uploadClient');

async function main() {
  const argv = parseArgs(process.argv);

  const { username, password, environment } = argv;

  try {
    // Fetch data from production
    const originalData = await fetchData({ username, password, environment });

    // Transform data
    const transformed = transformData(originalData);

    // Write to file
    writeToFile(transformed);

    // uploadData({ environment, username, password });

    console.log('Fixture created at fixtures/fixture.json');
  } catch (err) {
    console.error('Error creating fixture:', err);

    process.exit(1);
  }
}

main();
