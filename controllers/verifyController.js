console.log('VERIFY CONTROLLER REQUIRED');
const db = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// when app.js need to check if localstorage token still alive EX: when page loaded, 
// send ajax pre-request with given jwt token,
// here we use jwt to encode given token to compare with browser header's encoded token.
// send back updated token,
// first use middleware to check for token store in header in the browser,
// if no token or bad token send status 403 no access, else get the token, next,
// this is like double verify, use jwt to verify the token
// after login found the user in DB with correct password and created a new token, 
// do a nested ajax request to this route to check the token again, 
// before launch from landing page to stockTracker page
const compareToken = function (req, res) {
    console.log(req.token)
    jwt.verify(req.token, process.env.SECRETKEY, (err, authData) => {
        if (err) {
            res.sendStatus(403);
        } else {
            res.json({
                message: 'Post created',
                authData: authData
            });
        }
    });
}

// take ajax's new usr info, use bcrypt to hash the password, exclude the password, 
// save to DB, create a token and send the token back to ajax.
const signupTheUser = function (req, res) {
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
}

// this is a middleware to check for token store in header in the browser,
// if no token or bad token send status 403 no access, else get the token, do next
var verifyToken = function (req, res, next) {
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

module.exports = {
    compareToken,
    verifyToken,
    signupTheUser
}