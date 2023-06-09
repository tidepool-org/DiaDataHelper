# Diabetes Data Generator CLI 

The Diabetes Data Generator CLI is a command line application that generates synthetic diabetes data, with customizable parameters. The output data is generated in JSON format that conforms to the Tidepool data model and can be readily uploaded via the Tidepool API (https://tidepool.stoplight.io/.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Options](#options)
- [Example](#example)
- [Contributing](#contributing)
- [License](#license)

## Installation

First, you need to clone the repository:

Have you tried github desktop? https://desktop.github.com/

Next, install the dependencies:

```nodejs
npm install
```

## Usage

To use the CLI, use the following command syntax:

```node.js
node generateCGM.js --cgmUse <value> --days <value> --fingersticks <boolean> --bgRange <value> --service <value>
```

## Options

Here's a list of available options you can use with the command:

- `--cgmUse, -use` : Percentage of CGM usage (0-100)
- `--days, -d` : Number of days to generate data for
- `--fingersticks, -f` : Whether the user also uses a bg meter (true/false)
- `--bgRange, -range` : CGM and/or BGM range skew (high/mid/low)
- `--service, -s` : Service used to upload data (Jellyfish or Platform)

All options are required.

## Example

Here's an example of how you can use the command:

```bash
node index.js --cgmUse 70 --days 30 --fingersticks true --bgRange mid --service exampleService
```

## Contributing

Contributions are always welcome! Feel free to open a pull request.
