console.log("Sanity Check: JS is working!");
// (placeholder) logArr store new log, later replace array with mongodb
var logArr = [];
$(document).ready(function () {
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


    /////////TRADE FORM BUTTONS//////////
    addToLog();
    /////////END OF TRADE FORM BUTTONS//////////

    // end of document.ready
});

/////////TRADE FORM BUTTONS//////////
// listen to 'tradeForm' 'addToLog' button that submit form data,
// (as placeholder) select 'divLog' and append form data to array
function addToLog(){
    $('#tradeForm').on('click', '#addToLog', function (event) {
        event.preventDefault();
        // serializeArray return array of object instead of string
        var formDataArr = $(this).parent().serializeArray();
        // console.log('clicked add to log button, form data array: ', formDataArr);
        var symbolData = formDataArr.filter(formData => formData.name == 'symbol')[0].value;
        var shareData = formDataArr.filter(formData => formData.name == 'share')[0].value;
        var dateData = formDataArr.filter(formData => formData.name == 'date')[0].value;
        var boughtOrSoldData = formDataArr.filter(formData => formData.name == 'boughtOrSold')[0].value;
        var newLog = `<p>${symbolData}&nbsp;&nbsp;&nbsp;&nbsp;${boughtOrSoldData}&nbsp;&nbsp;&nbsp;&nbsp;${shareData}&nbsp;&nbsp;&nbsp;&nbsp;${dateData}&nbsp;&nbsp;&nbsp;&nbsp;(# of share * price at that date)</p>`;
        // console.log(newLog);
        logArr.push(newLog);
        console.log(logArr);
        $('#divLog').append(newLog);
    });
}

/////////END OF TRADE FORM BUTTONS//////////