console.log("Sanity Check: JS is working!");

//global variables
var baseUrl = "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=";
var apiKey = "&apikey=CUGQ1VDKVRZ77B9U";
var parsedFormSymbol;
var parsedFormDate;
var parsedFormShare;
var parsedFormTotalCost;
var parsedFormBoughtOrSoldData;
var user;
var totalBought = 0;
var totalSold = 0;

$(document).ready(function () {

    //allows access to user's data in /stockTracker if token is still valid
    autoLogin();
    //serializes all forms inside /stockTrader to add to the log
    addToLog();

    ///////LANDING BUTTONS////////
    // toggles the signup form when corresponding button is clicked
    $('#signup-button').on('click', function (event) {
        event.preventDefault();
        $('#signup-form-wrapper').toggleClass('hidden');
        // when the signup sumbit button is clicked, form data is serialized and sent to server
        $('#submit-signup-button').on('click', function (event) {
            event.preventDefault();
            var signupSerialize = $('#signup-form').serializeArray();
            var emailSerialize = signupSerialize[0].value;
            var passwordSerialize = signupSerialize[1].value;
            var imageURLSerialize = signupSerialize[2].value;
            // console.log(`HELLO ${emailSerialize}, your password is: ${passwordSerialize}`);

            //post method to add the user's data to the database and assign a token
            $.ajax({
                method: 'POST',
                url: '/signup',
                data: { email: emailSerialize, password: passwordSerialize, imageURL: imageURLSerialize },
                success: function (json) {
                    // console.log('signed up status', json);
                    //places the jwt token from server.js inside the local storage
                    localStorage.jwtToken = json.signedJwt;
                    // console.log('token for new signed up user',localStorage.jwtToken);
                },
                error: function (e1, e2, e3) { console.log('ERROR ', e2) },
            });
        });
    });

    // toggles the login form when corresponding button is clicked
    $('#login-button').on('click', function (event) {
        event.preventDefault();
        $('#login-form-wrapper').toggleClass('hidden');
            // when the login sumbit button is clicked, form data is serialized and sent to server
        $('#submit-login-button').on('click', function (event) {
            event.preventDefault();
            var loginSerialize = $('#login-form').serializeArray();
            var emailSerialize = loginSerialize[0].value;
            var passwordSerialize = loginSerialize[1].value;
            // console.log(`HELLO ${emailSerialize}, your password is: ${passwordSerialize}`);
            $.ajax({
                method: 'POST',
                url: '/login',
                data: { email: emailSerialize, password: passwordSerialize},
                success: function (json) {
                    console.log('json.userId: ', json.userId);
                    //places a new jwt token from server.js inside the local storage
                    localStorage.jwtToken = json.token;
                    console.log('localStorage.jwtToken: ', localStorage.jwtToken);
                    //calls method to verify the token is valid, if valid redirects to tracker page
                    verifyStockTracker();
                },
                error: function (e1, e2, e3) { console.log('ERROR ', e2) },
            });
        });
    });
    ///////END OF LANDING BUTTONS//////////////////////

    // end of document.ready
});

// GET req through server to grab specific stock data from API and then append to html page
function getStockTrackFromDB() {
    $.ajax({
        method: 'GET',
        url: '/api/log',
        success: function handleSuccess(json) {
            totalBought = 0;
            totalSold = 0;
            // console.log('Successfully loaded stock log: ', json);
            //if successful, the log will empty
            $('#divLog').empty();
            //then will cycle through the stock api to grab the values for the following
            for (var i = 0; i < json.data.length; i++) {
                var curID = json.data[i]._id;
                var curSymbol = json.data[i].symbol;
                var curBought_or_sold = json.data[i].bought_or_sold;
                var curNumShares = json.data[i].numShares;
                var curTrade_date = json.data[i].trade_date;
                var curTradedPrice = json.data[i].tradedPrice;
                var curUser = json.data[i].user[0].email;
                //when values are grabbed from API, use string literals to make a new "log" in the html
                //inside the #divLog element
                $('#divLog').append(
                    `<p> Stock: ${curSymbol} -  ${curBought_or_sold} ${curNumShares} share(s) worth $${curTradedPrice} on ${curTrade_date} - Trade #:${curID}</p>
            <button id='btnDeleteLog' data-id=${curID}>Delete Log</button>`
                );
                //also, use the grabbed values from above to calculate the total bought/sold values
                //by making an accumulator for each section and insert them inside the 
                //boxes in the html (replacing the text of those elements entirely)
                if (curBought_or_sold === 'bought'){
                    totalBought += parseFloat(curTradedPrice);
                    $('#boughtTotal').text(`-$${(totalBought).toFixed(2)}`);
                } else if (curBought_or_sold === 'sold') {
                    totalSold += parseFloat(curTradedPrice);
                    $('#soldTotal').text(`+$${(totalSold).toFixed(2)}`);
                }
            }
        },
        error: function (e) {
            //if error, makes sure that the only thing that shows in the log is an error message
            console.log('Load stock log error, please log in!');
            $('#divLog').text('Load stock log error, please log in!');
        }
    });
}

//sends the data in the tracker fields for use in other ajax requests
function postStockTrackToDB(formDataObj, parsedFormTotalCost) {
    //sets the traded price as a parsed version of the number
    formDataObj.tradedPrice = parsedFormTotalCost;
    console.log('formDataObj: ', formDataObj);
    $.ajax({
        method: 'POST',
        url: '/api/log',
        data: formDataObj,
        success: function (json) {
            //on success, post this info to the following method
            getStockTrackFromDB();
        },
        error: function (e) {
            console.log('Error! Cannot add to stock log. Please make sure to log in!');
            $('#divLog').text('Error! Cannot add to stock log. Please make sure to log in!');
        }
    });
}

//adds a delete button to every log and calls delete function
$('#divLog').on('click', '#btnDeleteLog', function (event) {
    event.preventDefault();
    // console.log('clicked delete log button, log id is: ', $(this).attr('data-id'));
    deleteStockTrackFromDB($(this).attr('data-id'));
});

//grabs the id of the data requested and deletes it from the database
function deleteStockTrackFromDB(dataId) {
    $.ajax({
        method: 'DELETE',
        url: '/api/log/' + dataId,
        success: function (json) {
            console.log('deleted stock log: ', json);
            //re runs the following method
            getStockTrackFromDB();
        },
        error: function (e) {
            //tells the user on error to reload/login again
            console.log('ERROR: Cannot delete stock log, please reload/login again!');
            $('#divLog').text('ERROR: Cannot delete stock log, please reload/login again!');
        }
    });
}

// listen to 'tradeForm' 'addToLog' button that submit form data,
// (as placeholder) selects 'divLog' and appends form data to array
function addToLog() {
    $('#tradeForm').on('click', '#addToLog', function (event) {
        event.preventDefault();
        // serializeArray returns an array of object instead of strings
        // sets values inside global variables
        var formDataArr = $(this).parent().serializeArray();
        parsedFormSymbol = formDataArr.filter(formData => formData.name == 'symbol')[0].value;
        parsedFormShare = formDataArr.filter(formData => formData.name == 'share')[0].value;
        parsedFormDate = formDataArr.filter(formData => formData.name == 'date')[0].value;
        parsedFormBoughtOrSoldData = formDataArr.filter(formData => formData.name == 'boughtOrSold')[0].value;
        var formDataObj = { symbol: parsedFormSymbol, numShares: parsedFormShare, trade_date: parsedFormDate, bought_or_sold: parsedFormBoughtOrSoldData };
        // sends the entire serialized data from the trade form as a parameter for the following method
        getClosingByDate(formDataObj);
    });
}

//GETS the closing price of the input stock symbol on the input date using the
//serialized form data from above
function getClosingByDate(formDataObj) {
    $.ajax({
        async: true,
        crossDomain: true,
        method: 'GET',
        //the url variables are divided into sections in order to conform
        //to the url set by the API: 'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=AAPL&apikey=CUGQ1VDKVRZ77B9U',
        url: baseUrl + parsedFormSymbol + apiKey,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        success: function (response) {
            //grabs the json value of specific stock
            //from the API for Daily, uses user's serialized date specification, grabs that date's closing price
            var price = response["Time Series (Daily)"][parsedFormDate]["4. close"];
            // console.log('The single price for the selected stock is: ', price);
            //calculates the total cost of of the shares (shares times single price)
            parsedFormTotalCost = parsedFormShare * price;
            //sends data to following method as params
            postStockTrackToDB(formDataObj, parsedFormTotalCost);
        },
        error: function (err) {
            console.log(err);
        }
    });
}

//redirects if token is verified
function autoLogin() {
    //if there is a token in the client, then
    if (localStorage.length > 0) {
        //if the token is valid, then grab the user's log from database
        if(localStorage.jwtToken != undefined){
            getStockTrackFromDB();
        }
        // delete localStorage.jwtToken;
        // console.log('Your token is: ', localStorage.jwtToken);

        //verify the token
        $.ajax({
            type: "POST",
            url: '/verify',
            beforeSend: function (xhr) {
                //send token to header
                xhr.setRequestHeader("Authorization", 'Bearer ' + localStorage.jwtToken);
            },
            success: function (response) {
                // console.log('Success: Login or has token', response)
                //on success make the user's image url the source for the picture in the html
                $('#imageURL').attr("src",response.authData.imageURL);
                //for devs, set a counter of the token's expiration
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
            },
            error: function (err) {
                //makes sure to send the user back to home when token expires on page reload
                console.log('ERROR: not logged in or token is expired', err);
                if (window.performance) {
                    console.info("window.performance works fine on this browser");
                }
                if (performance.navigation.type == 1) {
                    console.info("This page is reloaded");
                    location.href = '/';
                } else {
                    console.info("This page is not reloaded");
                }
            }
        })
    }
}

//calls method to verify the token is valid, if valid redirects to tracker page
function verifyStockTracker() {
    if (localStorage.length > 0) {
        // deletes the client's localStorage.jwtToken
        // console.log('This client's token is: ', localStorage.jwtToken);
        $.ajax({
            type: "POST",
            url: '/stockTracker',
            //will post the token in the header to compare with client token
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", 'Bearer ' + localStorage.jwtToken);
            },
            success: function (response) {
                // console.log('has valid token from login', response)
                //upon token verification from backend, if successfull and current page is /
                //then page will redirect to /stockTracker page
                if (window.location.pathname == '/') {
                    location.href = '/stockTracker';
                } else {
                    // console.log('Your current page is: ', window.location.pathname);
                }
            },
            error: function (err) {
                //if the verification of token fails in backend, tell user in console:
                console.log('not logged in or token is expired', err);
                if (window.performance) {
                    console.info("window.performance works fine on this browser");
                }
                //and redirects back to homepage /
                if (performance.navigation.type == 1) {
                    console.info("This page is reloaded");
                    location.href = '/';
                } else {
                    console.info("This page is not reloaded");
                }
            }
        })
    }
}

//constantly checks the header against the client token
function checkForLogin() {
    if (localStorage.length > 0) {
        $.ajax({
            type: "POST",
            url: '/verify',
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", 'Bearer ' + localStorage.jwtToken);
            },
            success: function (response) {
                console.log(response)
            },
            error: function (err) {
                console.log(err);
            }
        });
    }
}

//makes logout button functional
$('#logOut').on('click', function (event) {
    event.preventDefault();
    // console.log('Your token is: ', localStorage.jwtToken);
    //deletes token from client's local storage
    delete localStorage.jwtToken;
    // console.log('Your token is: ', localStorage.jwtToken);
    //once token is deleted, send user back to home /
    if (window.location.pathname == '/stockTracker') {
        location.href = `/`;
    }
});