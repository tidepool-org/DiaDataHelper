const fs = require('fs');
const path = require('path');

function writeToFile(jsonData) {
  const fixtureDir = path.resolve(__dirname, '../fixtures');
  if (!fs.existsSync(fixtureDir)) {
    fs.mkdirSync(fixtureDir);
  }
  const filePath = path.join(fixtureDir, 'TLoop-fixture.json');
  fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2), 'utf8');
}

module.exports = { writeToFile };
