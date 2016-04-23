var mongoose = require('mongoose');
    config = require('../config/config')
exports.mongoose = mongoose;

var mongoOptions = { db: { safe: true } };

// Connect to Database
console.log(process.env.NODE_ENV);
var db_link = config.db[process.env.NODE_ENV];
exports.db = mongoose.connect(db_link, mongoOptions, function (err, res) {
  if (err) {
    console.log ('ERROR connecting to: ' + db_link + '. ' + err);
  } else {
    console.log ('Successfully connected to: ' + db_link);
  }
});
