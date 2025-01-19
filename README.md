## Table of Contents
- [Table of Contents](#table-of-contents)
- [Installation](#installation)
- [Data Generator](#data-generator)
  - [Usage](#usage)
  - [Options](#options)
  - [Example](#example)
- [Date Transformations](#date-transformations)
  - [Usage](#usage-1)
  - [Code Overview](#code-overview)
- [DIY Loop to Tidepool Loop Transformation](#diy-loop-to-tidepool-loop-transformation)
  - [Usage](#usage-2)
  - [Code Overview](#code-overview-1)
- [Linting and Style Guide](#linting-and-style-guide)
- [Contributing](#contributing)

## Installation

First, you need to clone the repository:

Have you tried github desktop? https://desktop.github.com/

Next, install the dependencies:

```nodejs
npm install
```

## Data Generator

The Diabetes Data Generator CLI is a command line application that generates synthetic diabetes data, with customizable parameters. The output data is generated in JSON format that conforms to the Tidepool data model and can be readily uploaded via the Tidepool API (https://tidepool.stoplight.io/.

### Usage

To use the CLI, use the following command syntax:

```node.js
node generateCGM.js --cgmUse <value> --days <value> --fingersticks <boolean> --bgRange <value> --service <value>
```

### Options

Here's a list of available options you can use with the command:

- `--cgmUse, -use` : Percentage of CGM usage (0-100)
- `--days, -d` : Number of days to generate data for
- `--fingersticks, -f` : Whether the user also uses a bg meter (true/false)
- `--bgRange, -range` : CGM and/or BGM range skew (high/mid/low)
- `--service, -s` : Service used to upload data (Jellyfish or Platform)

All options are required.

### Example

Here's an example of how you can use the command:

```bash
node index.js --cgmUse 70 --days 30 --fingersticks true --bgRange mid --service exampleService
```
## Date Transformations
This script modifies JSON files to update timestamps (time and deviceTime) using a calculated offset. Useful for refreshing demo patient data.

### Usage
```bash
node transformdates/src/index.js --file <path-to-json-file> [--file <additional-json-file>]
```

Process:
- Reads and validates the input JSON files.
- Gathers all time fields and calculates an offset to 
- align the latest timestamp with the current date.
- Applies the calculated offset to time and deviceTime fields.
- Writes the updated data back to the original files.

### Code Overview
Located in `diadatahelper/transformdates/src/transformTimes.js`, the main functions include:

`gatherDates`: Recursively collects all date fields (time, deviceTime) from a dataset.
`applyOffset`: Updates the date fields with a calculated offset.
`calculateOffset`: Computes the offset to align dates with the current day.
`transformAllWithSingleOffset`: Main function to orchestrate the transformation across datasets.


## DIY Loop to Tidepool Loop Transformation
This script processes DIY Loop JSON data to normalize it into a Tidepool Loop-compatible format, removing unsupported fields and adjusting metadata.

### Usage

```bash
node transformDIY/src/index.js --username <username> --password <password> --environment <environment>
```
Process:
- Fetch Data: 
  - Retrieves JSON data from the specified account.
- Transform Data:
  - Converts DIY Loop metadata into Tidepool Loop format.
  - Removes provenance, overridePresets, and unsupported fields.
  - Filters out custom presets and automated boluses.
- Save Transformed Data: 
  - Writes the output to fixtures/fixture.json.

### Code Overview
Located in `diadatahelper/transformDIY/src/transformer.js`, the main functions include:

`transformData`: Routes each dataset item to its specific transformation function based on type.

Transformers (`transformCBG`, `transformBolus`, etc.): Adjust fields and remove unsupported data for:
- Continuous Blood Glucose (CBG)
- Self-Monitored Blood Glucose (SMBG)
- Basal rates, food, pump settings, device events, and dosing decisions.

## Linting and Style Guide
This project adheres to the Airbnb JavaScript Style Guide. To lint the code:

``` bash
npm run lint
```



## Contributing

Contributions are welcome! If you'd like to contribute:

1) Fork the repository.
2) Create a feature branch.
3) Submit a pull request for review.
