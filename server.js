// require express and other modules
const express = require('express');
const app = express();
// jwt is secure way to store and transmit encrupted authentication data
const jwt = require('jsonwebtoken');
// bcrypt is use for encryption and decryption
const bcrypt = require('bcrypt');
// dotenv is use to make use of process.env
const dotenv = require('dotenv').config();
// parse incoming urlencoded form data and populate the req.body object
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));

// allow cross origin requests (optional)
// https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

/************
 * DATABASE *
 ************/
// require models folder will import everythings from index.js which index.js centralize other models
const db = require('./models');

// after login find user use server.js from DB by given email in ajax, save that user to this global variable
// should set to null when logout / token expire, reset on login / signup
// var loggedInUserId;
var loggedInUser;

/**********
 * ROUTES *
 **********/

// Serve static files from the `/public` directory:
// i.e. `/images`, `/scripts`, `/styles`
app.use(express.static('public'));

/*
 * HTML Endpoints
 */
// root, display landing page
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/views/landing.html');
});
// display stockTracker page
app.get('/stockTracker', function (req, res) {
  res.sendFile(__dirname + '/views/stockTracker.html');
})

// when app.js need to check if localstorage token still alive EX: when page loaded, 
// send ajax pre-request with given jwt token,
// here we use jwt to encode given token to compare with browser header's encoded token.
// send back updated token,
// first use middleware to check for token store in header in the browser,
// if no token or bad token send status 403 no access, else get the token, next,
// this is like double verify, use jwt to verify the token
app.post('/verify', verifyToken,function (req, res) {
  console.log(req.token)
  jwt.verify(req.token, process.env.SECRETKEY, (err, authData) => {
    if(err) {
      res.sendStatus(403);
    } else {
      res.json({
        message: 'Post created',
        authData: authData
      });
    }
  });
});

// after login found the user in DB with correct password and created a new token, 
// do a nested ajax request to this route to check the token again, 
// before launch from landing page to stockTracker page
app.post('/stockTracker', verifyToken, (req, res) => {
  console.log(req.token)
  jwt.verify(req.token, process.env.SECRETKEY, (err, authData) => {
    if(err) {
      res.sendStatus(403);
    } else {
      res.json({
        message: 'Post created  in stockTracker',
        authData: authData
      });
    }
  });
});

/*
 * JSON API Endpoints
 */
// take ajax's new usr info, use bcrypt to hash the password, exclude the password, 
// save to DB, create a token and send the token back to ajax.
app.post('/signup', function (req, res) {
  var signupForm = req.body;
  var formEmail = signupForm.email;
  var formPassword = signupForm.password;
  var formImageURL = signupForm.imageURL;

  db.User.find({ email: formEmail }, function (err, foundUser) {
    if (err) { res.json({ err }) }
    // if foundUser's length >= 1
    // send a response back to user that email already exists
    // if foundUser's length === 0
    // we need to create a new user
    if (foundUser.length >= 1) {
      res.json({ message: 'email already exists', foundUser: foundUser });
    } else {
      bcrypt.hash(req.body.password, 10, (err, hash) => {
        if (err) {
          console.log("hashing error:", err);
          res.status(200).json({ error: err })
          // we now have a successful hashed password
        } else {
          db.User.create(
            { email: formEmail, password: hash, imageURL: formImageURL },
            { password: 0 },
            function (err, createdUser) {
              createdUser = createdUser[0]
              // create a json web token here, but we did not use for log in the use at the same time
              jwt.sign(
                { createdUser },
                process.env.SECRETKEY,
                (err, signedJwt) => {
                  res.status(200).json({
                    message: 'User Created',
                    createdUser: createdUser,
                    signedJwt: signedJwt
                  })
                }
              );
            }
          );
        }
      });
    }
  });
});
// use given user login data from ajax to find user in DB, 
// reinclude the password in, compare given password to the storeed hash version, 
// if match create a new token, send back to ajax.
app.post('/login', function (req, res) {
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
              console.log('error bcrypt: ',err);
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
              // loggedInUserId = foundUser[0]._id;
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
});

// this is a middleware to check for token store in header in the browser,
// if no token or bad token send status 403 no access, else get the token, do next
function verifyToken(req, res, next) {
  console.log("in verify...");
  // Get auth header value when we send our token, we want to send it in our header
  const bearerHeader = req.headers['authorization'];
  console.log('bearerHeader: ', bearerHeader)
  // Check if bearer is undefined
  if (typeof bearerHeader !== 'undefined') {
    const bearer = bearerHeader.split(' ');
    // Get token from array
    const bearerToken = bearer[1];
    // Set the token
    req.token = bearerToken;
    console.log('req.token', req.token);
    // Next middleware
    next();
  } else {
    // Forbidden
    res.sendStatus(403);
  }
}

// trade log, route GET, server get log data from database and send back to ajax request,
// about the schema, each trade log will have a user's id as reference, 
// that mean each user can have many trade logs and tagged on each log.
app.get('/api/log', (req, res) => {
  console.log('this trade log belong to logged in user id: ', loggedInUser._id);
  db.Trade.find({ user: [loggedInUser._id] })
    .populate('user')
    .exec(function (err, foundTrades) {
      if (err) { console.log('error trade log not found: ',err); return; }
      console.log('number of trade log found: ', foundTrades.length);
      for (var i = 0; i < foundTrades.length; i++) {
        console.log(foundTrades[i]);
      }
      res.json({ data: foundTrades });
    });
});

// trade log, route POST, server add new log to database and send back to ajax request, 
// app.js will call GET route to display again
app.post('/api/log', (req, res) => {
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
          console.log('error saved log',err);
        }
        console.log('success saved log' + savedTrade);
        res.json({ data: savedTrade });
      });
    } else {
      console.log('user not found, not add trade log');
    }
  });
});

// trade log, route DELETE, server delete clicked log from database and send back to ajax request,
// app.js will call GET route to display again
app.delete('/api/log/:id', function (req, res) {
  var logId = req.params.id;
  // find the index of the book we want to remove
  db.Trade.deleteOne(
    { _id: logId },
    (err, deletedLog) => {
      if (err) { return res.status(400).json({ err: "error has occured" }) }
      res.json(deletedLog);
    });
});

/**********
 * SERVER *
 **********/

// listen on the port that Heroku prescribes (process.env.PORT) OR port 3000
app.listen(process.env.PORT || 3000, () => {
  console.log('Express server is up and running on http://localhost:3000/');
});