// require express and other modules
const express = require('express');
const app = express();
const db = require('./models')

// parse incoming urlencoded form data
// and populate the req.body object
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));

// allow cross origin requests (optional)
// https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

/************
 * DATABASE *
 ************/



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
})


/**********
 * SERVER *
 **********/

// listen on the port that Heroku prescribes (process.env.PORT) OR port 3000
app.listen(process.env.PORT || 3000, () => {
    console.log('Express server is up and running on http://localhost:3000/');
});
