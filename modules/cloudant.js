var Cloudant = require("cloudant");
var cloudant = Cloudant(process.env.CLOUDANT_URL);

function generateAPIKeyForDB(db) {
    var result;

    cloudant.generate_api_key(function(er, api) {
        var security = {};
        var currentDatabase;

        if (er) {
            throw er;
        }

        result = api;
        console.log("API key: %s", api.key);
        console.log("Password for this key: %s", api.password);

        security[api.key] = [ "_reader", "_writer" ];

        currentDatabase = cloudant.db.use(db);
        currentDatabase.set_security(security, function(er, result) {
            if (er) {
              throw er;
            }

            console.log("Set security for " + db);
            console.log(result);
            console.log("");

            // Or you can read the security settings from a database.
            // my_database.get_security(function(er, result) {
            //   if (er) {
            //     throw er;
            //   }
            //
            //   console.log("Got security for " + db);
            //   console.log(result);
            // });
        });
    });

    return result;
}
