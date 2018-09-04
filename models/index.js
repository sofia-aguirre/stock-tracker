const mongoose = require('mongoose');

mongoose.connect( process.env.MONGODB_URI || "mongodb://localhost/stock-tracker10",  { useMongoClient: true });

module.exports.User = require('./user.js');
module.exports.Trade = require('./trade.js');