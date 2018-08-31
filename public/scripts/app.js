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

$(document).ready(function () {
    /////////TRADE FORM BUTTONS//////////
    addToLog();
    /////////END OF TRADE FORM BUTTONS//////////

    // this way copied from postman
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

    ///////LANDING BUTTONS////////
    // shows the signup form when either buttons are clicked
    $('#signup-button').on('click', function (event) {
        event.preventDefault();
        $('#form-wrapper').removeClass('hidden');
    });

    // shows the login form when either buttons are clicked
    $('#login-button').on('click', function (event) {
        event.preventDefault();
        $('#form-wrapper').removeClass('hidden');
    });
    ///////END OF LANDING BUTTONS//////////////////////

    // end of document.ready
});

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
        // AJAX request
        getClosingByDate();
    });
}
/////////END OF TRADE FORM BUTTONS//////////

// get the closing price of the input stock symbol on the input date
function getClosingByDate(){
    $.ajax({
        async: true,
        crossDomain: true,
        method: 'GET',
        // url: 'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=AAPL&apikey=CUGQ1VDKVRZ77B9U',
        url: baseUrl + parsedFormSymbol + apiKey,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        success: function(response){
            var price = response["Time Series (Daily)"][parsedFormDate]["4. close"];
            parsedFormTotalCost = parsedFormShare * price;
            var newLog = `<p>${parsedFormSymbol}&nbsp;&nbsp;&nbsp;&nbsp;${parsedFormBoughtOrSoldData}&nbsp;&nbsp;&nbsp;&nbsp;${parsedFormShare}&nbsp;&nbsp;&nbsp;&nbsp;${parsedFormDate}&nbsp;&nbsp;&nbsp;&nbsp;${parsedFormTotalCost}</p>`;
            logArr.push(newLog);
            $('#divLog').append(newLog);
        },
        error: function(err){
            console.log(err);
        }
    });
}
