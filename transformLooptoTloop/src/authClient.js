const envConfig = require('./envConfig');

async function getAuthToken({ username, password, environment }) {
  const { baseUrl } = envConfig[environment];
  if (!baseUrl) {
    throw new Error(`No configuration found for environment: ${environment}`);
  }

  const authUrl = `${baseUrl}/auth/login`;
  const response = await fetch(authUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`,
    },
  });

  const token = response.headers.get('x-tidepool-session-token');
  if (!token) {
    throw new Error('No session token returned by the auth endpoint.');
  }

  const jsonData = await response.json();
  const { userid } = jsonData;
  if (!userid) {
    console.warn('Response body:', await response.text());
    throw new Error('No userid found in authentication response.');
  }

  return { token, userid };
}

module.exports = { getAuthToken };
