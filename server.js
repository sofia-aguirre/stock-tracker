// require express and other modules
const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt')

// parse incoming urlencoded form data
// and populate the req.body object
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
const db = require('./models');

// should set to null when logout / token expire, reset on login / signup
var loggedInUserId;
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
app.get('/', function homepage(req, res) {
  res.sendFile(__dirname + '/views/landing.html');
  // res.sendFile(__dirname + '/views/stockTracker.html');
});

app.get('/stockTracker', function homepage(req, res) {
  res.sendFile(__dirname + '/views/stockTracker.html');
})

app.post('/verify', verifyToken, (req, res) => {
  let verified = jwt.verify(req.token, 'pokemonsecretkey')
  console.log("verified: ", verified)
  res.json(verified)
});

/*
 * JSON API Endpoints
 */
app.post('/signup', function signup(req, res) {
  var signupForm = req.body;
  var formEmail = signupForm.email;
  var formPassword = signupForm.password;

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
            { email: formEmail, password: hash },
            { password: 0 },
            function (err, createdUser) {
              createdUser = createdUser[0]
              jwt.sign(
                { createdUser },
                "pokemonsecretkey",
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
app.post('/login', function signup(req, res) {
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
          console.log("PASSAWORD1: ", formPassword)
          console.log("foundUser[0].password: ", foundUser[0].password)
          bcrypt.compare(formPassword, foundUser[0].password, function (err, match) {
            if (err) {
              console.log(err);
              return res.status(500).json({ err, level: "bcrypt compare" });
            }
            if (match) {
              console.log("MATCH: ", match);
              // create a json web token
              const token = jwt.sign(
                {
                  // add some identifying information
                  email: foundUser[0].email,
                  _id: foundUser[0]._id
                },
                // add our super secret key (which should be hidden, not plaintext like this)
                "pokemonsecretkey",
                // these are options, not necessary
                {
                  // its good practice to have an expiration amount for jwt tokens.
                  expiresIn: "3h"
                },
              );
              console.log("NEW TOKEN: ", token);
              loggedInUserId = foundUser[0]._id;
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

// when requet for route /verify,
// first use middleware to check for token store in header in the browser,
// if no token or bad token send status 403 no access, else get the token, next,
// this is like double verify, use jwt to verify the token
app.post('/verify', verifyToken, function (req, res) {
  console.log(req.token)
  jwt.verify(req.token, 'pokemonsecretkey', (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      res.json({
        message: 'Post created',
        authData: authData
      });
    }
  });
});

function verifyToken(req, res, next) {
  console.log("in verify...");
  // Get auth header value
  // when we send our token, we want to send it in our header
  const bearerHeader = req.headers['authorization'];
  console.log('testing2', bearerHeader)
  // Check if bearer is undefined
  if (typeof bearerHeader !== 'undefined') {
    const bearer = bearerHeader.split(' ');
    // Get token from array
    const bearerToken = bearer[1];
    // Set the token
    req.token = bearerToken;
    console.log('req.token', req.token);
    ///if verified then send to stocktracker
    app.get('/stockTracker', function homepage(req, res) {
      res.sendFile(__dirname + '/views/stockTracker.html');
    })
    // Next middleware
    next();
  } else {
    // Forbidden
    res.sendStatus(403);
  }
}

// do route GET, server get data from database and send back to ajax request
app.get('/api/log', (req, res) => {
  // db.Trade.find({ user: ['5b8d95118aaa70370b49e1c4'] })
  console.log('loggedInUser._id: ', loggedInUser._id);
  
  db.Trade.find({ user: [loggedInUser._id] })
    .populate('user')
    .exec(function (err, foundTrades) {
      if (err) { console.log(err); return; }
      console.log('foundTrades with length: ', foundTrades.length);
      for (var i = 0; i < foundTrades.length; i++) {
        console.log(foundTrades[i]);
      }
      res.json({ data: foundTrades });
    });
});

// do route POST, server add new data to database and send back to ajax request
app.post('/api/log', (req, res) => {
  console.log('req.body: ', req.body);
  var trade = new db.Trade({
    symbol: req.body.symbol,
    bought_or_sold: req.body.bought_or_sold,
    numShares: req.body.numShares,
    trade_date: req.body.trade_date,
    tradedPrice: req.body.tradedPrice
  });
  // db.User.findOne({ email: 'a@a.com' }, 
  db.User.findOne({ email: loggedInUser.email }, 
  function (err, foundUser) {
    if (foundUser != null) {
      trade.user.push(foundUser);
      trade.save(function (err, savedTrade) {
        if (err) {
          console.log(err);
        }
        console.log('saved ' + savedTrade);
        res.json({ data: savedTrade });
      });
    } else {
      console.log('user not found, not add trade log');
    }
  });
});

//DELETE route
app.delete('/api/log/:id', function (req, res) {
  // console.log('log delete', req.params);
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