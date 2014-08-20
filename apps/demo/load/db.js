/**
 * Module dependencies
 */

var mongoose = require('mongoose'),
  db = mongoose.connection,
  dbPath,
  config;

module.exports.connect = function connect(callback) {

  config = require('../../config')(process.env.NODE_ENV);
  dbPath = config.dbPath;

  mongoose.connect(dbPath, function onMongooseError(err) {

    if (err) {
      console.log('   DB CONNECTION ERROR:', err);
    }

  });

  db.on('error', console.error.bind(console, 'connection error:'));

  db.once('open', function dbCallback() {

    if (callback) {
      return callback(null, db);
    }

  });

};

module.exports.disconnect = function disconnect(callback) {

  mongoose.disconnect();
  if (callback) return callback();

};
