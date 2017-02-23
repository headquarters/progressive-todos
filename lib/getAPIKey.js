var Cloudant = require("cloudant");
var cloudant = Cloudant({account: process.env.CLOUDANT_USERNAME,
                            password: process.env.CLOUDANT_PASSWORD});
// TODO: Promisify?
module.exports = function generateAPIKey(db, callback) {
    cloudant.generate_api_key(function(err, api) {
        var security = {};
        var currentDatabase;

        if (err) {
            throw err;
        }

        security[api.key] = [ "_reader", "_writer" ];

        cloudant.db.create(db, function(err, body) {
            currentDatabase = cloudant.db.use(db);

            currentDatabase.set_security(security, function(err, result) {
                if (err) {
                  throw err;
                }

                callback(api);
            });
        });
    });
}
