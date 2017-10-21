var q = require('q');
var Client = require('instagram-private-api').V1;
var device = new Client.Device('ledersattel');
var storage = new Client.CookieFileStorage('./credentials/instauser.json');

var path = require("path");
var img_dir = path.join(process.cwd(), 'images/');

module.exports = function(post, addToCaption) {

    var deferred = q.defer();
    var session;

    var user = process.env.INSTA_USER || config.INSTA_USER;
    var password = process.env.INSTA_PW || config.INSTA_PW;

    // post to instagram
    Client.Session.create(device, storage, user, password)
        .then(function(thisSession) {
            session = thisSession
            // Now you have a session, upload image
            return Client.Upload.photo(session, img_dir + post.image_name)
        })
        .then(function(upload) {
            // upload instanceof Client.Upload
            // nothing more than just keeping upload id
            console.log(upload.params.uploadId);

            // set caption to photo
            return Client.Media.configurePhoto(session, upload.params.uploadId, post.Caption + addToCaption);

        })
        .then(function(medium) {
            // we configure medium, it is now visible with caption
            console.log(medium.params)

            deferred.resolve(medium.params);

        })

    return deferred.promise;
};
