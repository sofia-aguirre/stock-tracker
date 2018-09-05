console.log("LOGCONTROLLER FILE IS NOW REQUIRED")
const db = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
// after login find user use server.js from DB by given email in ajax, save that user to this global variable
// should set to null when logout / token expire, reset on login / signup
let loggedInUser;

// trade log, route GET, server get log data from database and send back to ajax request,
// about the schema, each trade log will have a user's id as reference, 
// that mean each user can have many trade logs and tagged on each log.
const getUserTrades = function (req, res) {
  console.log('this trade log belong to logged in user id: ', loggedInUser._id);
  db.Trade.find({ user: [loggedInUser._id] })
    .populate('user')
    .exec(function (err, foundTrades) {
      if (err) { console.log('error trade log not found: ', err); return; }
      console.log('number of trade log found: ', foundTrades.length);
      for (var i = 0; i < foundTrades.length; i++) {
        console.log(foundTrades[i]);
      }
      res.json({ data: foundTrades });
    });
}
// trade log, route POST, server add new log to database and send back to ajax request, 
// app.js will call GET route to display again
var postUserTrades = function (req, res) {
  var trade = new db.Trade({
    symbol: req.body.symbol,
    bought_or_sold: req.body.bought_or_sold,
    numShares: req.body.numShares,
    trade_date: req.body.trade_date,
    tradedPrice: req.body.tradedPrice
  });
  db.User.findOne({ email: loggedInUser.email },
    function (err, foundUser) {
      if (foundUser != null) {
        trade.user.push(foundUser);
        trade.save(function (err, savedTrade) {
          if (err) {
            console.log('error saved log', err);
          }
          console.log('success saved log' + savedTrade);
          res.json({ data: savedTrade });
        });
      } else {
        console.log('user not found, not add trade log');
      }
    });
}

// use given user login data from ajax to find user in DB, 
// reinclude the password in, compare given password to the storeed hash version, 
// if match create a new token, send back to ajax.
const loginTheUser = function (req, res) {
  var loginForm = req.body;
  var formEmail = loginForm.email;
  var formPassword = loginForm.password;
  // need to reenable password, because we disableed password
  db.User.find({ email: formEmail })
    .select("+password")
    .exec(
      function (err, foundUser) {
        if (err) { res.json({ err, level: "finding users" }) }
        if (foundUser.length === 0) {
          res.json({ message: "Email/Password incorrect" });
        } else {
          console.log("foundUser id: ", foundUser[0]._id);
          console.log("form Password: ", formPassword)
          console.log("foundUser[0].password: ", foundUser[0].password)
          bcrypt.compare(formPassword, foundUser[0].password, function (err, match) {
            if (err) {
              console.log('error bcrypt: ', err);
              return res.status(500).json({ err, level: "bcrypt compare" });
            }
            if (match) {
              console.log("MATCH: ", match);
              // create a json web token here
              // then save to frondend browser localstorage
              const token = jwt.sign(
                {
                  // add some identifying information
                  email: foundUser[0].email,
                  _id: foundUser[0]._id,
                  imageURL: foundUser[0].imageURL
                },
                // add our super secret key (which should be hidden, not plaintext like this)
                process.env.SECRETKEY,
                // these are options, not necessary
                {
                  // its good practice to have an expiration amount for jwt tokens.
                  expiresIn: "24h"
                },
              );
              console.log("NEW TOKEN: ", token);
              loggedInUser = foundUser[0];
              console.log("current User id: ", foundUser[0]._id);
              return res.status(200).json(
                {
                  message: 'Auth successful',
                  token: token,
                  userId: foundUser[0]._id
                }
              )
            } else {
              console.log("NOT A MATCH")
              res.status(401).json({ message: "Email/Password incorrect" })
            }
          });
        }
      }
    );
}

// trade log, route DELETE, server delete clicked log from database and send back to ajax request,
// app.js will call GET route to display again
const deleteOneLog = function (req, res) {
  var logId = req.params.id;
  // find the index of the book we want to remove
  db.Trade.deleteOne(
    { _id: logId },
    (err, deletedLog) => {
      if (err) { return res.status(400).json({ err: "error has occured" }) }
      res.json(deletedLog);
    });
}

module.exports = {
  getUserTrades,
  postUserTrades,
  loginTheUser,
  deleteOneLog
}