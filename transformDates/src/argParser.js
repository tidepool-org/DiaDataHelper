const yargs = require('yargs');

module.exports = function parseArgs() {
  const { argv } = yargs
    .option('file', {
      alias: 'f',
      type: 'array',
      description: 'Paths to the JSON file(s)',
      demandOption: true,
    })
    .usage('Usage: $0 --file <path> [--file <path> ...]')
    .help();

  return argv;
};
