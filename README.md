# Instagram Post Bot

## What's this about?
Post images and captions from a google spreadsheet to instagram. The app is written in nodejs and best hosted (for free) on heroku.
The app will fetch a random row from the spread and post it along with the caption. An additional caption string can be set in the code. After posting it will mark the row as posted in the spreadsheet so it will not be posted again.

## How to set things up

1. Set up a google spreadsheet with columns **exactly** like [this demo](https://docs.google.com/spreadsheets/d/1t-lCq91ExjEOA8wAEpxunzyDcpPMjGzsLTA5iYwEMNA/edit?usp=sharing)
It's important to keep the columns in this order and with these names as they will be used as object keys.

2. Follow step 1 from this [Google API tutorial](https://developers.google.com/sheets/api/quickstart/nodejs) for nodejs. Store this file under `.credentials/client_secret.json` in the root folder.

3. Set your keys and passwords in the config.js file. All keys but "ADD_TO_CAPTION" can also be set as heroku environment variables. Use "/r" for line breaks in ADD_TO_CAPTION. Add a Heroku URL to automatically ping the app every 5 minutes to keep it alive.

Use cron notation to set post interval:

```
 *    *    *    *    *
 ┬    ┬    ┬    ┬    ┬
 │    │    │    │    │
 │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
 │    │    │    └───── month (1 - 12)
 │    │    └────────── day of month (1 - 31)
 │    └─────────────── hour (0 - 23)
 └──────────────────── minute (0 - 59)
 ```

 4. Run app locally with `npm start`. Open your Browser at localhost:5000 and hit the button. You will be prompted in the commandline to authenticate this app with google. AuthToken will be saved to `credentials/`. Follow the instructions and post the verification code to the commandline. You should be automatically logged in to instagram. The session also will be saved to `credentials/`.

 5. If everything works remove `credentials/*` from `.gitignore` and deploy the app along with the credentials to heroku

## Frameworks Used
- nodejs / express / some npm modules
- vue.js
- [Skeleton](https://github.com/dhg/Skeleton)
