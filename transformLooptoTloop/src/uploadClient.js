const fs = require('fs');
const envConfig = require('./envConfig');
const { openUploadSession } = require('./uploadSessionClient');

async function uploadData({ environment, username, password }) {
  const { baseUrl } = envConfig[environment];
  if (!baseUrl) {
    throw new Error(`No configuration found for environment: ${environment}`);
  }

  const { token, id } = await openUploadSession({ username, password, environment });

  const url = `${baseUrl}/dataservices/v1/datasets/${id}/data`;
  const fixtureContent = fs.readFileSync('../fixtures/TLoop-fixture.json', 'utf8');
  const fixtureData = JSON.parse(fixtureContent);
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'x-tidepool-session-token': `${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(fixtureData),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

module.exports = { uploadData };
