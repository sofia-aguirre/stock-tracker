# Project 1: stock-tracker
##### by Sofia Aguirre, and Yi Liu
## Stock Tracker is like a log book for user to track their trades date back 20 years.

## Technologies Used
- __Express API__ Build JSON endpoints.
- __RESTful Routes__ Design GET, POST, DELETE routes.
- __AJAX__ Fetch JSON data from the backend.
- __jQuery__ Interactivity and render log data.
- __Templating__ Using template strings.
- __MongoDB__ Persist two models to a Mongo Database. Use one one-to-many relationship between models with reference data.
- __dotenv__ Hides key:value pairs inside a hidden file for server use.
- __Git__ Using Git and github.
- __Code Style__ Using CSS.
- __Visual Design__ Use Flexbox, CSS Grid, Bootstrap.
- __Heroku__ [Heroku link](https://fast-beach-84181.herokuapp.com/).
- __mLab__ Heroku module to process MongoDB databases for use with node applications
- __Documentation__ This README.md file and inline comments. 

## Existing Features
- Signup.
- Login.
![login landing page](/public/images/landing-page-shot.png)
- Logout.
- User input image url for profile picture.
- Verify jsonwebtoken (secret key is hidden in dotenv environment).
- Authentication.
- bcrypt password.
- Fetch old stock data (up to 20 years).
- Display trade logs by current logged in uer.
![fetch stock data display log](/public/images/tracker-page-shot.png)
- GET, POST, DELETE from mongoDB for users and logs.
- Note on CRUD development: no UPDATE is a design choice, as team felt it defeated the purpose of a tracking app.
- Calculate the total bought and total sold worth of shares.

## Planned Features
- Find out how to user token store in browser header.
- Auto login.
- Fix CSS image max height
- Recalculate the portfolio worth on delete
- This project should be a one page app. 
This project should only use ajax request to server, and server can redirect to other html.
We are using 2 pages.
We use 2 different tools to navigate, both ajax request express route sendfile, and location href to express route sendfile. In the future we will implement only server-side redirects.

## Work flows
1)
https://www.sap.com/developer/tutorials/webide-github-merge-pull-request.html
create basic file structure

2)
npm install bcrypt --save
npm install body-parser --save
npm install express --save
npm install jws --save
npm install mongoose --save

3)
added front end
landing.html
stockTracker.html
landing.css
stockTracker.css
normalize.css

4)
https://www.npmjs.com/package/dotenv
installed dotenv.
when need hide variable that this web site need such as access token and should not upload to github,
we will use heroku enviornment variable tool to store our hiden variable.
we then add those hidden variables to gitignore file, so not to upload them.

5)
app.js boilerplate
server.js boilerplate (with landing page html endpoint)

6)
stockTracker.html added layout style

7)
app.js add landing page buttons function show signup/login form

8)
app.js add tracker page button function add new trade log as array

9)
app.js refactor tracker page button function add new trade log as a function

10)
review the web development CURD flow
https://docs.google.com/drawings/d/12oC-gsSE5J3Mh7YE-H9qabpAbrbDdlG6AksXz_gjo5w/edit
https://docs.google.com/drawings/d/1rclTondYQLozH8-VZWBEJfDUXLQz3VGx5ZCOQFEZ4dg/edit

11)
the 2 stock market api
https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=AAPL&apikey=CUGQ1VDKVRZ77B9U
https://api.iextrading.com/1.0/stock/aapl/chart/5y

12)
app.js, begin pair program.
the goal here is to get form data, ajax get request stock api, filter the response json data, format the data to store in log.
when add new trade info to log, use the form's stock symbol and date as filtering criteria for ajax request.
ajax request from stock data for 5 to 20 years (depends on which api).

13)
ajax get request stock app for stock data,
filter response json data.

14)
jquery string litteral of data to stocktracker page, as log.

15)
signup button creates user in database.
user bcrypt to hash password, then store into database.

16)
login button fetch user from database and redirect to tracker page.
signup and login button add json web token and checks verify on page refresh.

17)
one user to many trade database reference. trade model find one user with thte same user id.
just display logs belongs to that userwho singed in.

18) 
Heroku lessons learned:
- must include [ mongoose.connect( process.env.MONGODB_URI || "mongodb://localhost/stock-tracker10",  { useMongoClient: true }); ] inside the models index.js
- heroku only takes master branch
- must include Procfile containing "web: node server.js" (replace server.js with wherever your project begins)
- env variable needs to be implemented into heroku app

19) 
edited the user model to include a property for the user's image url
- added a input field in the sign up form for the image url
- edit the placeholder for the image in the html file to include an id to which add the source url
- ajax + server req/res for the image url in database
- use ajax to push image url into string literal and make the image source the user's url from database

20) 
- npm install dotenv module (for env)
- touch new file ".env" in root directory
- set up env file to include the token's secret key
- git ignore .env file in order to hide from git along with other node modules
- replace all instances of the secret key in the server.js file with the process.env.VARIABLENAME method

21) 
Backend Refactoring
- made controllers for functions
- made config routes for repeating routes
- made a smaller server.js by combining controllers and routing


### extra
toggle button for buy/sell
http://jsfiddle.net/sumw4/13/


### git tutorial
As a team member work on 1 branch as a collaborater, initialy create a project repo on github, each member will clone to their own local branch, after is ready to upload, check if I am behind master, then I pull from master, else upload to own branch first, pull request master branch
1) create a github remote repo
2) on github create 2 branches
3) clone the master to local
4) create local branch to match the name of remote branch, and work on that branch
5) do something
6) from my local branch, add, commit, 
7) fetch origin master / go to github to see if behind, to check if master more up to date me me
8) pull origin master
9) push to origin my branch name
10) go to github, click to crate pull request, click merge 2 times
11) back to terminal, swithch to local mater branch
12) pull origin master
13) swithc to my local branch
14) fetch origin master
15) pull origin master
16) push origin YI
17) for changes that not stage and you want to remove use git stash or git checkout -- filename or git reset --hard

# Code snippets:

1)
Show how to refactor server.js  -->  controllers folder for all callback functions --> config folder for shorten the route.

- Start from one big server.js file contain many routes like this one with anonymous callback function.
```
app.post('/verify', verifyToken, function (req, res) {
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
```
- Cut the anonymous callback function out.
```
app.post('/verify', verifyToken, );
```
- Create a folder controllers, create a file index.js, create a file verifyController.js
- Paste the cut out anonymous callback function into verifyController.js and give the function a name.
```
const compareToken = function (req, res) {
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
}
```
- In verifyController.js, do require to import modules that needed for this file, so we need jsonwebtoken.
```
const jwt = require('jsonwebtoken');
```
- At the bottom of the page export this function.
```
module.exports = {
    compareToken
}
```
- In index.js, centralize export each require controller files and give them a name.
```
module.exports = {
    verifyCont: require('./verifyController')
}
```
- In server.js, do require to import controllers folder and give it a name.
```
const controller = require('./controllers');
```
- In server.js, fill in the empty 3rd parameter with imported controllers folder variable name (.) index.js export file variable name (.) verifyController.js export function name.
```
app.post('/verify', verifyToken, controller.verifyCont.compareToken);
```
- Now verifyController.js has this code.
```
const jwt = require('jsonwebtoken');
const compareToken = function (req, res) {
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
}
module.exports = {
    compareToken
}
```
- Now index.js has this code.
```
module.exports = {
    verifyCont: require('./verifyController')
}
```
- Now server.js has this code.
```
const controller = require('./controllers');
app.post('/verify', verifyToken, controller.verifyCont.compareToken);
```
- Next is to put part of the repeating routes in other files.
- After refactor to controller, server.js has these 3 routes with repeating parts /api/log.
```
app.get('/api/log', controller.log.getUserTrades);
app.post('/api/log', controller.log.postUserTrades);
app.delete('/api/log/:id', controller.log.deleteOneLog);
```
- We want to put them in another file, create config folder, index.js file, logRoutes.js file.
- In logRoutes.js, do require to import modules that needed for this file, so we need express to create Router() instance, we also need controllers folder because the route was referring to controllers folder and give it a name. use the Router() instance with (.) to chain each CRUD methods. First parameter is the right hand side of the route which is the non repeating part. Second parameter is the similar to what we had in controller but with the controllers folder variable name. Then export them.
- Now logRoutes.js has this code.
```
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers');
module.exports = router
        // route: /api/log/ method: get
    .get (      '/',    ctrl.log.getUserTrades)
        // route: /api/log/ method: post
    .post(      '/',    ctrl.log.postUserTrades)
        // route: /api/log/:id  method: delete
    .delete(    '/:id', ctrl.log.deleteOneLog);
```
- Now index.js has this code. similar to controller.
```
module.exports = {
    logRoutes: require('./logRoutes')
}
```
- Now server.js has this code. Do require config folder. Original 3 routes become 1 use(). routes.logRoutes means in the config folder look for logRoutes file look, prepend /api/log to each routes.
```
const routes = require('./config');
app.use(    '/api/log', routes.logRoutes);
```

2)
Show how to do mongodb one to many relationship use reference.
- There are 2 schemas, user.js and trade.js. One user can have many trades.
- Relationship with reference is each trade will have a property refer to user's mongodb given _id.
-Create models folder, index.js file, user.js file, trade.js file.
-In index.js, connect to mongodb to create a DB name stock-tracker10, centralize each models, require and export them.
```
const mongoose = require('mongoose');
mongoose.connect( process.env.MONGODB_URI || "mongodb://localhost/stock-tracker10",  { useMongoClient: true });
module.exports.User = require('./user.js');
module.exports.Trade = require('./trade.js');
```
- In user.js, just a normal schema, create model name User, export it.
```
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const UserSchema = new Schema({
    email: { 
        type: String, 
        required: true, 
        unique: true, 
        match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/ },
        password: { type: String, required: true , select: false},
        imageURL: String
})
var User = mongoose.model('User', UserSchema);
module.exports = User;
```
- In trade.js, user property is referring to User model and need to look like type: Schema.Types.ObjectId, and the whole property is an array. That means array[0] is the user's id, only store the id.
```
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const TradeSchema = new Schema({
    symbol: String,
    user: 
        [{type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    bought_or_sold: String,
    numShares: Number,
    trade_date: Date,
    tradedPrice: Number
});
var Trade = mongoose.model('Trade', TradeSchema);
module.exports = Trade;

```
- In server.js, access User collection regularly, but access Trade needs to populate() the user's data from user's id. The following code means find trades that have user id and include user's data in each trade
```
const db = require('../models');
db.Trade.find({ user: [loggedInUser._id] })
    .populate('user')
    .exec(function (err, foundTrades) {
      if (err) { console.log('error trade log not found: ', err); return; }
      res.json({ data: foundTrades });
    });
```

3)
How to start and setup this project, from install tools, initialize the node express project, setup local mongodb, setup/push to/run on heroku.
	1)
	Make a new project folder
	2)
	create package.json file by:
```
npm init
```
3)
install needed modules:
npm install --save EACH_OF_MODULE_NAMES
4)
Git heroku create + login
5)
Git heroku push master (deploys to the heroku app and adds mLab)

4)
Server side environment variable with dotenv, setup and use.
- Use server side environment variable to store value that you don't want people to see in process.env, such as secret key.
- Install dotenv.
```
npm install dotenv 
```
- Create hidden .env file on root level of project directory. Store variable in it.
```
SECRETKEY = "pokemonsecretkey"
```
- In .ignore file include .env file.
```
.env
```
- In server.js, require dotenv. Within the file I can access the environment variable use process.env.VARIABLENAME.
```
const dotenv = require('dotenv').config();
jwt.verify(req.token, process.env.SECRETKEY, (err, authData) => {
```
- In Heroku, there are 2 way to set the same environment variable.
	1)
	One way is create .env in Heroku terminal, because .gitignore will not upload .env file to Heroku.
	2)
	The easiest way is in Heroku setting, in config vars, enter environment variable.
	![login landing page](/public/images/heroku-config-vars.png)
	
	Click Reveal Config Vars, then you will see.

5)
Encrypt password with bcrypt hash.
- Install bcrypt.
```
npm install bcrypt
```
- In server.js, require bcrypt, in POST /signup route's callback function, use bcrypt to encrypt plain text password, give a number of Salt, return a hashcode. Usually store the return hash to database.
```
const bcrypt = require('bcrypt');
bcrypt.hash(req.body.password, 10, (err, hash) => {
                if (err) {
                    console.log("hashing error:", err);
                    res.status(200).json({ error: err })
                    // we now have a successful hashed password
                } else {
                    // store hash to database, or do something with it.
                }
            }

```
- In server.js, in POST /login route's callback function, use bcrypt to compare plain text password to stored and encrypted password, then send back a match result from a callback.
```
bcrypt.compare(formPassword, foundUser[0].password, function (err, match) {
            if (err) {
              console.log('error bcrypt: ', err);
              return res.status(500).json({ err, level: "bcrypt compare" });
            }
            if (match) {
              console.log("MATCH: ", match);	//match is boolean
            } else {
              console.log("NOT A MATCH")
              res.status(401).json({ message: "Email/Password incorrect" })
            }
          }
```

6)
Jwt use, create and compare token. (I know little about jwt, I include other resource)
https://blog.codecentric.de/en/2017/08/use-json-web-tokens-services/
https://medium.com/vandium-software/5-easy-steps-to-understanding-json-web-tokens-jwt-1164c0adfcec
- We use jwt to who logged on, kind like a name tag people has in a workplace.
- Install jsonwebtoken.
```
npm install jsonwebtoken
```
- In server.js, require jsonwebtoken, To create a token use jwt.sign(payload, secretOrPrivateKey, [options, callback]). I send the token from server.js back to app.js's ajax call and store token to localStorage in web browser.
```
const jwt = require('jsonwebtoken');
const token = jwt.sign(
                {
                  // add some identifying information
                  email: foundUser[0].email,
                  _id: foundUser[0]._id,
                  imageURL: foundUser[0].imageURL
                },
                // add our super secret key (which should be hidden, not plaintext)
                process.env.SECRETKEY,
                // these are options, not necessary
                {
                  // its good practice to have an expiration amount for jwt tokens.
                  expiresIn: "24h"
                },
              );
return res.status(200).json(
                {
                  message: 'Auth successful',
                  token: token,
                  userId: foundUser[0]._id
                }
              )
```
- In app.js, store token from server side to client side localStorage in web browser.
```
success: function (json) {
                    //places the jwt token from server.js inside the local storage
                    localStorage.jwtToken = json.signedJwt;
                }
```
- In server.js, to verify a token use jwt.verify(token, secretOrPublicKey, [options, callback]). I use it to check the expiration of the token every second, if token expired I delete the localStorage token and redirect to the login page.
- The authData from callback has the token data.
```
jwt.verify(req.token, process.env.SECRETKEY, (err, authData) => {
        if (err) {
            res.sendStatus(403);
        } else {
            res.json({
                message: 'Post created',
                authData: authData
            });
        }
    }
```
- In app.js, I check token expiration, token live time is: create_time + expire_time = now. delete local token, redirect to home page.
```
window.setInterval(function () {
                    if (Date.now() / 1000 - response.authData.exp > 0) {
                        // console.log('time is up localStorage.jwtToken:', localStorage.jwtToken);
                        clearInterval();
                        //upon token expiration, delete the token from client!
                        delete localStorage.jwtToken;
                        //immediate redirect to home /
                        location.href = '/';
                    } else {
                        // console.log('still alive localStorage.jwtToken: ',localStorage.jwtToken);
                    }
                }, 1000);
```

7)
HTTP Authorization header info
- Before jwt.verify(), we need to compare local token to browser header token. (I don't understand much between header token and jwt yet).
- In app.js, to check for login, send localStorage token to browser header use setRequestHeader() in ajax.
```
$.ajax({
            type: "POST",
            url: '/verify',
            beforeSend: function (xhr) {
                //send token to header
                xhr.setRequestHeader("Authorization", 'Bearer ' + localStorage.jwtToken);
            },
            success: function (response) {},
            error: function (err) {}
```
- In app.js, as a middleware execute before callback in /verify route:
```
app.post('/verify', verifyToken, function (req, res) {
```
- In server.js, to check if browser header token valid use req.headers['authorization'], assign token to req.token for the callback function to verify the second time. (That is all I understand so far)
```
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

```





