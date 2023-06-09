# DiaData

This is a generator for cgm and bgm values for Tidepool testing. This is not a diabetes data simulator to be used for research purposes as the math being used here is not representative of any widely accepted simulator models. This data is currently saved in the Tidepool data model format.

## Generating Data

1. Clone the repo. Have you tried github desktop? https://desktop.github.com/

2. Use `npm install` (only need to do once when you first clone the repo)

### SMBG Data

For generating meter data only. This will generate your specified number of days ( not to exceed 120 ) with bg meter data. Each data point has somewhere between a 3 or 6 hour and 30 minute gap between the next data point.

 `node generateSMBG.js --days 90`

 `--days [number]` is the number of days you want to generate data for.
## generateCGM

For generating cgm data only. This does not include basal or carb data (yet) This will generate a desired cgm use for your specified number of cumulative days ( not to exceed 120 ) with cgm data using the service you choose. Cumulative means that you can hit the desired day filter in the summary stats that you are looking for. For example, CGM use at 70% for 30 days would not amount to a full 30 days of cumulative CGM data and if you chose the 30 day filter in the population health dashboard to view the TIR for that user, you would have a cgm use less than 30%. This is why we calculate cumulative days. So, specifying 30 in the command line argument may get you 40 or more days on the daily view depending on your cgm use.

CGM use is also rounded up on the front end and if your data ends in the middle of an hour then summary stats calculates the cgm use slightly higher than what we define here. Keep this in mind if generating data for a small amount of days and trying to hit that below [x] cgm use breakpoint. 

 `node generateCGM.js --use 70 --days 30 --service jellyfish`

`--use [number]` is the percent of CGM use you desire everyday for your chosen number of days.
`--days [number]` is the number of days you want to generate data for. Don't worry about doing cumulative math here. Use the number you want to hit a certain filter and we'll take care of the rest.
`--service [string]` the service you wish to use to upload data i.e. "jellyfish" or "platform"


## Uploading via Jellyfish