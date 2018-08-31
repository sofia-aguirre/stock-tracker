const mongoose = require('mongoose');

// mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:3000');
mongoose.connect( process.env.MONGODB_URI || "mongodb://localhost/stock-tracker",  { useNewUrlParser: true });

module.exports.User = require('./user.js');