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
const controller = require('./controllers');
const routes = require('./config');

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
// var loggedInUser;

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
app.post('/verify', controller.verifyCont.verifyToken, controller.verifyCont.compareToken);

// after login found the user in DB with correct password and created a new token, 
// do a nested ajax request to this route to check the token again, 
// before launch from landing page to stockTracker page
app.post('/stockTracker', controller.verifyCont.verifyToken, controller.verifyCont.compareToken);

/*
 * JSON API Endpoints
 */
// take ajax's new usr info, use bcrypt to hash the password, exclude the password, 
// save to DB, create a token and send the token back to ajax.
app.post('/signup', controller.verifyCont.signupTheUser);

// use given user login data from ajax to find user in DB, 
// reinclude the password in, compare given password to the storeed hash version, 
// if match create a new token, send back to ajax.
app.post('/login', controller.log.loginTheUser);

// trade log, route GET, server get log data from database and send back to ajax request,
// about the schema, each trade log will have a user's id as reference, 
// that mean each user can have many trade logs and tagged on each log.

// trade log, route POST, server add new log to database and send back to ajax request, 
// app.js will call GET route to display again

// trade log, route DELETE, server delete clicked log from database and send back to ajax request,
// app.js will call GET route to display again
app.use(    '/api/log', routes.logRoutes);



/**********
 * SERVER *
 **********/

// listen on the port that Heroku prescribes (process.env.PORT) OR port 3000
app.listen(process.env.PORT || 3000, () => {
  console.log('Express server is up and running on http://localhost:3000/');
});