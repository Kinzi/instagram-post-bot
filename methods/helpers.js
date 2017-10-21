var http = require('https');
var fs = require('fs');
var q = require('q');

var path = require("path");
var img_dir = path.join(path.dirname(require.main.filename), 'images/');

var helpers = {
    getPost: function(posts, count) {

        var item = posts[Math.floor(Math.random() * posts.length)];

        if (item.Use === 'TRUE' && item.Used === 'FALSE') {
            return item;
        } else if (count === posts.length) {

            console.log('WARNING: All posts posted!');
            return null;

        } else {
            count++
            getPost(posts, count);
        }

    },

    downloadPicture: function(url, path) {
        // fetch picture
        var deferred = q.defer();

        // make sure folder exists
        if (!fs.existsSync(img_dir)) fs.mkdirSync(img_dir);

        var file = fs.createWriteStream(img_dir + path);

        var request = http.get(url, function(response) {
            response.pipe(file);
            file.on('finish', function() {
                console.log('file download done');
                file.close(deferred.resolve()); // close() is async, call cb after close completes.
            });
        }).on('error', function(err) { // Handle errors
            fs.unlink(dest); // Delete the file async. (But we don't check the result)
            console.log(err);
            deferred.reject(err.message);
        });

        return deferred.promise;
    },

    deletePicture: function(file) {
        fs.unlink(img_dir + file);
    }
};

module.exports = helpers;
