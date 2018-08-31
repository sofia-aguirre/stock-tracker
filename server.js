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
      res.json({ message: 'email already exists' });
    } else {
      bcrypt.hash(req.body.password, 10, (err, hash) => {
        if(err){ 
          console.log("hashing error:", err);
          res.status(200).json({error: err})
        // we now have a successful hashed password
        }else{
          db.User.create(
            {email: formEmail, password: hash},
            {password: 0},
            function (err, createdUser) {
              createdUser = createdUser[0]
              jwt.sign(
                {createdUser},
                "pokemonsecretkey",
                (err, signedJwt) => {
                res.status(200).json({
                  message: 'User Created',
                  createdUser: createdUser,
                  signedJwt: signedJwt
                })
              });
              
              // if (err) {
              //   res.json({ err });
              // }
              // res.json(createdUser);
            });
        }
      });
      
    }
  });
})


/**********
 * SERVER *
 **********/

// listen on the port that Heroku prescribes (process.env.PORT) OR port 3000
app.listen(process.env.PORT || 3000, () => {
  console.log('Express server is up and running on http://localhost:3000/');
});
