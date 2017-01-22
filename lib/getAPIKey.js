var Cloudant = require("cloudant");
var cloudant = Cloudant({account: process.env.CLOUDANT_USERNAME,
                            password: process.env.CLOUDANT_PASSWORD});
// TODO: Promisify?
module.exports = function generateAPIKey(db, callback) {
    cloudant.generate_api_key(function(er, api) {
        var security = {};
        var currentDatabase;

        if (er) {
            throw er;
        }

        security[api.key] = [ "_reader", "_writer" ];

        cloudant.db.create(db, function(err, body) {
            currentDatabase = cloudant.db.use(db);

            currentDatabase.set_security(security, function(er, result) {
                if (er) {
                  throw er;
                }

                callback(api);
            });
        });
    });
}
