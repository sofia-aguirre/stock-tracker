console.log("Sanity Check: JS is working!");
// (placeholder) logArr store new log, later replace array with mongodb
var logArr = [];
var baseUrl = "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=";
var apiKey = "&apikey=CUGQ1VDKVRZ77B9U";
var parsedFormSymbol;
var parsedFormDate;
var parsedFormShare;
var parsedFormTotalCost;
var parsedFormBoughtOrSoldData;
var user;

$(document).ready(function () {

    autoLogin();

    /////////TRADE FORM BUTTONS//////////
    addToLog();
    /////////END OF TRADE FORM BUTTONS//////////

    getStockTrackFromDB();

    ///////LANDING BUTTONS////////
    // shows the signup form when either buttons are clicked
    $('#signup-button').on('click', function (event) {
        event.preventDefault();
        $('#signup-form-wrapper').toggleClass('hidden');
        // look for signup sumbit button
        $('#submit-signup-button').on('click', function (event) {
            event.preventDefault();
            var signupSerialize = $('#signup-form').serializeArray();
            var emailSerialize = signupSerialize[0].value;
            var passwordSerialize = signupSerialize[1].value;
            // console.log(`HELLO ${emailSerialize}, your password is: ${passwordSerialize}`);
            $.ajax({
                method: 'POST',
                url: '/signup',
                data: { email: emailSerialize, password: passwordSerialize },
                success: function (json) {
                    console.log('signed up status', json);
                    localStorage.jwtToken = json.signedJwt;
                    // console.log('token for new signed up user',localStorage.jwtToken);
                },
                error: function (e1, e2, e3) { console.log('ERROR ', e2) },
            });
        });
    });

    // shows the login form when either buttons are clicked
    $('#login-button').on('click', function (event) {
        event.preventDefault();
        $('#login-form-wrapper').toggleClass('hidden');
        $('#submit-login-button').on('click', function (event) {
            event.preventDefault();
            var loginSerialize = $('#login-form').serializeArray();
            var emailSerialize = loginSerialize[0].value;
            var passwordSerialize = loginSerialize[1].value;
            // console.log(`HELLO ${emailSerialize}, your password is: ${passwordSerialize}`);
            $.ajax({
                method: 'POST',
                url: '/login',
                data: { email: emailSerialize, password: passwordSerialize },
                success: function (json) {
                    console.log('json.userId: ', json.userId);
                    localStorage.jwtToken = json.token;
                    console.log('localStorage.jwtToken: ', localStorage.jwtToken);
                    verifyStockTracker();
                    // if (window.location.pathname == '/') {
                    //     location.href = `/stockTracker`;
                    // }
                    // $.ajax({
                    //     method: 'GET',
                    //     url: '/stockTracker',
                    //     // data: {userId: json.userId},
                    //     success: function (json) {
                    //         console.log('go to stockTracker page: ', json);
                    //     },
                    //     error: function (e) {
                    //         console.log('go to stockTracker page error!');
                    //     }
                    // });
                },
                error: function (e1, e2, e3) { console.log('ERROR ', e2) },
            });
        });
    });
    ///////END OF LANDING BUTTONS//////////////////////
    // end of document.ready
});

// do ajax GET, server get data from database to append to html page
function getStockTrackFromDB() {
    $.ajax({
        method: 'GET',
        url: '/api/log',
        success: function handleSuccess(json) {
            console.log('successfully load stock log: ', json);
            $('#divLog').empty();
            for (var i = 0; i < json.data.length; i++) {
                var curID = json.data[i]._id;
                var curSymbol = json.data[i].symbol;
                var curBought_or_sold = json.data[i].bought_or_sold;
                var curNumShares = json.data[i].numShares;
                var curTrade_date = json.data[i].trade_date;
                var curTradedPrice = json.data[i].tradedPrice;
                var curUser = json.data[i].user[0].email;
                $('#divLog').append(
                    `<p> Stock: ${curSymbol} -  ${curBought_or_sold} ${curNumShares} share(s) worth $${curTradedPrice} on ${curTrade_date} - Trade #:${curID}</p>
            <button id='btnDeleteLog' data-id=${curID}>Delete Log</button>`
                );
            }
        },
        error: function (e) {
            console.log('Load stock log error!');
            $('#divLog').text('Load stock log error!');
        }
    });
}
function postStockTrackToDB(formDataObj, parsedFormTotalCost) {
    formDataObj.tradedPrice = parsedFormTotalCost;
    console.log('formDataObj: ', formDataObj);

    $.ajax({
        method: 'POST',
        url: '/api/log',
        data: formDataObj,
        success: function (json) {
            // console.log('added stock log: ', json.data.tradedPrice);
            getStockTrackFromDB();
        },
        error: function (e) {
            console.log('add stock log error!');
            $('#divLog').text('add stock log error!');
        }
    });
}
$('#divLog').on('click', '#btnDeleteLog', function (event) {
    event.preventDefault();
    console.log('clicked delete log button, log id is: ', $(this).attr('data-id'));
    deleteStockTrackFromDB($(this).attr('data-id'));
});
function deleteStockTrackFromDB(dataId) {
    $.ajax({
        method: 'DELETE',
        url: '/api/log/' + dataId,
        success: function (json) {
            console.log('deleted stock log: ', json);
            getStockTrackFromDB();
        },
        error: function (e) {
            console.log('delete stock log error!');
            $('#divLog').text('delete stock log error!');
        }
    });
}


/////////TRADE FORM BUTTONS//////////
// listen to 'tradeForm' 'addToLog' button that submit form data,
// (as placeholder) select 'divLog' and append form data to array
function addToLog() {
    $('#tradeForm').on('click', '#addToLog', function (event) {
        event.preventDefault();
        // serializeArray return array of object instead of string
        var formDataArr = $(this).parent().serializeArray();
        parsedFormSymbol = formDataArr.filter(formData => formData.name == 'symbol')[0].value;
        parsedFormShare = formDataArr.filter(formData => formData.name == 'share')[0].value;
        parsedFormDate = formDataArr.filter(formData => formData.name == 'date')[0].value;
        parsedFormBoughtOrSoldData = formDataArr.filter(formData => formData.name == 'boughtOrSold')[0].value;
        var formDataObj = { symbol: parsedFormSymbol, numShares: parsedFormShare, trade_date: parsedFormDate, bought_or_sold: parsedFormBoughtOrSoldData };
        // AJAX requests
        getClosingByDate(formDataObj);
    });
}
/////////END OF TRADE FORM BUTTONS//////////

// get the closing price of the input stock symbol on the input date
function getClosingByDate(formDataObj) {
    $.ajax({
        async: true,
        crossDomain: true,
        method: 'GET',
        // url: 'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=AAPL&apikey=CUGQ1VDKVRZ77B9U',
        url: baseUrl + parsedFormSymbol + apiKey,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        success: function (response) {
            var price = response["Time Series (Daily)"][parsedFormDate]["4. close"];
            console.log('price: ', price);
            parsedFormTotalCost = parsedFormShare * price;
            postStockTrackToDB(formDataObj, parsedFormTotalCost);
        },
        error: function (err) {
            console.log(err);
        }
    });
}

function autoLogin() {
    if (localStorage.length > 0) {
        // delete localStorage.jwtToken;
        console.log('localStorage.jwtToken: ', localStorage.jwtToken);
        $.ajax({
            type: "POST",
            url: '/verify',
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", 'Bearer ' + localStorage.jwtToken);
            },
            success: function (response) {
                console.log('login or have token', response)
                window.setInterval(function () {
                    if (Date.now() / 1000 - response.authData.exp > 0) {
                        console.log('time is up');
                        clearInterval();
                        delete localStorage.jwtToken;
                        location.href = '/';
                    } else {
                        console.log('still alive');
                    }
                }, 1000);
                
                // if (Date.now() / 1000 - response.authData.exp > 0) {
                //     console.log('time is up');
                // } else {
                //     console.log('still alive');
                // }
                // user = { email: response.authData.email, _id: response.authData._id }
                // console.log("you can access variable user: ", user)
                // if (window.location.pathname == '/') {
                //     location.href = '/stockTracker';
                // } else {
                //     console.log('page: ', window.location.pathname);
                // }
            },
            error: function (err) {
                console.log('not login or token expired', err);
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
function verifyStockTracker() {
    if (localStorage.length > 0) {
        // delete localStorage.jwtToken;
        console.log('localStorage.jwtToken: ', localStorage.jwtToken);
        $.ajax({
            type: "POST",
            url: '/stockTracker',
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", 'Bearer ' + localStorage.jwtToken);
            },
            success: function (response) {
                console.log('login or have token 2', response)
                // user = { email: response.authData.email, _id: response.authData._id }
                // console.log("you can access variable user: ", user)
                if (window.location.pathname == '/') {
                    location.href = '/stockTracker';
                } else {
                    console.log('page: ', window.location.pathname);
                }
            },
            error: function (err) {
                console.log('not login or token expired', err);
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

// logout from stockTracker page back to landing page
// $('#logOut').on('click', function (event) {
//     event.preventDefault();
//     console.log('localStorage.jwtToken: ', localStorage.jwtToken);
//     delete localStorage.jwtToken;
//     console.log('localStorage.jwtToken: ', localStorage.jwtToken);
//     // checkForLogin();

//     // I want to use token here
//     // like remove the token or something
//     // then not allow user to access /stockTracker page, which require login again
//     // if (window.location.pathname == '/stockTracker') {
//     //     location.href = `/`;
//     // }
// });

$('#logOut').on('click', function (event) {
    event.preventDefault();
    console.log('localStorage.jwtToken: ', localStorage.jwtToken);
    delete localStorage.jwtToken;
    console.log('localStorage.jwtToken: ', localStorage.jwtToken);
    // checkForLogin();

    // I want to use token here
    // like remove the token or something
    // then not allow user to access /stockTracker page, which require login again
    // if (window.location.pathname == '/stockTracker') {
    //     location.href = `/`;
    // }
});

// postman ajax example
// var settings = {
//     "async": true,
//     "crossDomain": true,
//     // "url": "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=AAPL&apikey=CUGQ1VDKVRZ77B9U",
//     "url": "https://api.iextrading.com/1.0/stock/aapl/chart/5y",
//     "method": "GET",
//     "headers": {
//         "Content-Type": "application/x-www-form-urlencoded",
//     }
// }
// $.ajax(settings)
// .done(function (response) {console.log(response);})
// .fail(function (err) {console.log(err);})