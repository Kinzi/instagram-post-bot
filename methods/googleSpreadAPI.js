var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
var q = require('q');
var path = require('path');
var appDir = path.dirname(require.main.filename);
var config = require('../config.js');

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/sheets.googleapis.com-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
var TOKEN_DIR = appDir  + '/credentials/';
console.log(TOKEN_DIR);
var TOKEN_PATH = TOKEN_DIR + 'sheets.googleapis.com-nodejs-quickstart.json';

var googleFunctions = {

    storeToken: function(token) {
        /**
         * Store token to disk be used in later program executions.
         *
         * @param {Object} token The token to store to disk.
         */
        try {
            fs.mkdirSync(TOKEN_DIR);
        } catch (err) {
            if (err.code != 'EEXIST') {
                throw err;
            }
        }
        fs.writeFile(TOKEN_PATH, JSON.stringify(token));
        console.log('Token stored to ' + TOKEN_PATH);
    },

    getNewToken: function(oauth2Client) {
        var deferred = q.defer();
        var authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES
        });
        console.log('Authorize this app by visiting this url: ', authUrl);
        var rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        rl.question('Enter the code from that page here: ', function(code) {
            rl.close();
            oauth2Client.getToken(code, function(err, token) {
                if (err) {
                    console.log('Error while trying to retrieve access token', err);
                    return;
                }
                oauth2Client.credentials = token;
                googleFunctions.storeToken(token);
                deferred.resolve(oauth2Client);
            });
        });

        return deferred.promise;
    },

    authorize: function(credentials) {
        var deferred = q.defer();
        /**
         * Create an OAuth2 client with the given credentials, and then execute the
         * given callback function.
         *
         * @param {Object} credentials The authorization client credentials.
         * @param {function} callback The callback to call with the authorized client.
         */
        var clientSecret = credentials.installed.client_secret;
        var clientId = credentials.installed.client_id;
        var redirectUrl = credentials.installed.redirect_uris[0];
        var auth = new googleAuth();
        var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

        // Check if we have previously stored a token.
        fs.readFile(TOKEN_PATH, function(err, token) {
            if (err) {
                googleFunctions.getNewToken(oauth2Client).then(function(res) {
                    deferred.resolve(res);
                })

            } else {
                oauth2Client.credentials = JSON.parse(token);
                deferred.resolve(oauth2Client);
            }
        });

        return deferred.promise;
    },

    authenticate: function() {
        var deferred = q.defer();

        // Load client secrets from a local file.
        fs.readFile('./credentials/client_secret.json', function processClientSecrets(err, content) {
            if (err) {
                console.log('Error loading client secret file: ' + err);
                return;
            }
            // Authorize a client with the loaded credentials, then call the
            // Google Sheets API.
            googleFunctions.authorize(JSON.parse(content)).then(function(oauth2Client) {
                deferred.resolve(oauth2Client);
            });

        });

        return deferred.promise;
    },

    getPostsFromTable: function() {

        var deferred = q.defer();

        // Load client secrets from a local file.
        fs.readFile('./credentials/client_secret.json', function processClientSecrets(err, content) {
            if (err) {
                console.log('Error loading client secret file: ' + err);
                return;
            }
            // Authorize a client with the loaded credentials, then call the
            // Google Sheets API.
            googleFunctions.authorize(JSON.parse(content)).then(function(oauth2Client) {
                deferred.resolve(googleFunctions.getAllValuesFromSpreadsheet(oauth2Client));
            });

        });

        return deferred.promise;
    },

    updatePostStatusOfRow: function(index) {
        var deferred = q.defer();

        // Load client secrets from a local file.
        fs.readFile('./credentials/client_secret.json', function processClientSecrets(err, content) {
            if (err) {
                console.log('Error loading client secret file: ' + err);
                return;
            }
            // Authorize a client with the loaded credentials, then call the
            // Google Sheets API.
            googleFunctions.authorize(JSON.parse(content)).then(function(oauth2Client) {
                deferred.resolve(googleFunctions.updateRowAtSpreadsheet(oauth2Client, index));
            });

        });

        return deferred.promise;
    },

    updateRowAtSpreadsheet: function(auth, index) {

        var deferred = q.defer();

        console.log('here');

        var sheets = google.sheets('v4');
        var spreadID = process.env.SPREAD_ID || config.SPREAD_ID;

        sheets.spreadsheets.values.update({
            auth: auth,
            spreadsheetId: spreadID,
            range: 'Sheet1!A' + index,
            valueInputOption: 'USER_ENTERED',
            resource: {
                majorDimension: "ROWS",
                range: "Sheet1!A" + index,
                values: [
                    [
                        "TRUE"
                    ]
                ]
            }
        }, function(err, response) {
            if (err) {
                console.error(err);
                return;
            }

            // TODO: Change code below to process the `response` object:
            console.log(JSON.stringify(response, null, 2));
            deferred.resolve(response);
        });

        return deferred.promise;
    },

    getAllValuesFromSpreadsheet: function(auth) {

        var deferred = q.defer();

        var sheets = google.sheets('v4');
        var spreadID = process.env.SPREAD_ID || config.SPREAD_ID;

        sheets.spreadsheets.values.get({
            auth: auth,
            spreadsheetId: spreadID,
            range: 'Sheet1',
        }, function(err, tableData) {
            if (err) {
                console.log('The API returned an error: ' + err);
                return;
            }

            // Get keys and row values
            var keys = tableData.values[0];
            tableData.values.shift();
            var rows = tableData.values;

            // Make proper key value pairs
            var posts = [];
            rows.forEach(function(row, rowIndex) {
                var item = {};
                for (var i = 0; i < keys.length; i++) {
                    item[keys[i]] = row[i];
                }
                item.rowIndex = rowIndex + 2;
                item.origArray = row;
                posts.push(item);
            })

            // return array of rows objects
            deferred.resolve(posts);

        });


        return deferred.promise;

    }
};

module.exports = googleFunctions;
