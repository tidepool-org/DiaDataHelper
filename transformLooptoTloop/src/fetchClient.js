const envConfig = require('./envConfig');
const { getAuthToken } = require('./authClient');

async function fetchData({ environment, username, password }) {
  const { baseUrl } = envConfig[environment];
  if (!baseUrl) {
    throw new Error(`No configuration found for environment: ${environment}`)
  }

  const { token, userid } = await getAuthToken({ username, password, environment });

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 31);
  const startDateISO = startDate.toISOString();
  const startDateEncoded = encodeURIComponent(startDateISO);

  const endDate = new Date();
  const endDateISO = endDate.toISOString();
  const endDateEncoded = encodeURIComponent(endDateISO);

  const url = `${baseUrl}/data/${userid}?startDate=${startDateEncoded}&endDate=${endDateEncoded}&type=bolus,cbg,food,basal,pumpSettings,deviceEvent,dosingDecision`;
  console.warn(url)
  const response = await fetch(url, {
    headers: {
      'x-tidepool-session-token': `${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

module.exports = { fetchData };
