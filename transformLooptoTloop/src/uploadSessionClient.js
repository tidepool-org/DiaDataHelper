const envConfig = require('./envConfig');
const { getAuthToken } = require('./authClient');

async function openUploadSession({ environment, username, password }) {
  const { baseUrl } = envConfig[environment];
  if (!baseUrl) {
    throw new Error(`No configuration found for environment: ${environment}`)
  }

  const { token, userid } = await getAuthToken({ username, password, environment });

  // hardcoded new userid for a moment
  const url = `${baseUrl}/v1/users/d66b3348-2a72-4ac9-a8f8-3ea1a87daa08/datasets`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'x-tidepool-session-token': `${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'upload',
      dataSetType: 'continuous',
      deviceTags: [
        'bgm',
        'cgm',
        'insulin-pump',
      ],
      client: {
        name: 'org.tidepool.Loop',
        version: '1.3.0+7557',
      },
      deduplicator: {
        name: 'org.tidepool.deduplicator.dataset.delete.origin',
        version: '1.0.0',
      },
      id: '7599ee7eaa134b3590046f33f224c1b8',
    }),
  });

  if (!response.ok) {
    console.error('Failed request:', response.status, response.statusText);
    console.error('Response body:', await response.text());
    throw new Error(`Failed to open upload session: ${response.status} ${response.statusText}`);
  }
  const jsonData = await response.json();
  const { id } = jsonData;

  return { token, id };
}

module.exports = { openUploadSession };
