// src/argParser.js
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

function parseArgs(processArgs) {
  return yargs(hideBin(processArgs))
    .usage('Usage: $0 --username <username> --password <password> --environment <prd>')
    .option('username', {
      alias: 'u',
      type: 'string',
      description: 'The username for the account to pull data from',
      demandOption: true,
    })
    .option('password', {
      alias: 'p',
      type: 'string',
      description: 'The password for the account',
      demandOption: true,
    })
    .option('environment', {
      alias: 'e',
      type: 'string',
      description: 'The password for the account',
      demandOption: true,
      choices: ['qa1', 'qa2', 'qa3', 'qa4', 'qa5', 'prd'],
    })
    .check((argv) => {
      if (!argv.username || !argv.password) {
        throw new Error('All of --environment, --username and --password are required.');
      }
      return true;
    })
    .help()
    .argv;
}

module.exports = { parseArgs };
