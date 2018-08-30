console.log("Sanity Check: JS is working!");

$(document).ready(function(){




///////LANDING BUTTONS////////
// shows the signup form when either buttons are clicked
$('#signup-button').on('click', function(event) {
    event.preventDefault();
    $('#form-wrapper').removeClass('hidden');
});

// shows the login form when either buttons are clicked
$('#login-button').on('click', function(event) {
    event.preventDefault();
    $('#form-wrapper').removeClass('hidden');
});
///////END OF LANDING BUTTONS//////////////////////


/////////TRADE FORM BUTTONS//////////
// listen to 'tradeForm' 'addToLog' button that submit form data,
// (as placeholder) select 'divLog' and append form data to array
var logArr = [];
var newLog;
$('#tradeForm').on('click', '#addToLog', function(e){
    e.preventDefault();
    // serializeArray return array of object instead of string
    var formDataArr = $(this).parent().serializeArray();
    // console.log('clicked add to log button, form data array: ', formDataArr);
    var symbolData = formDataArr.filter(formData => formData.name == 'symbol')[0].value;
    var shareData = formDataArr.filter(formData => formData.name == 'share')[0].value;
    var dateData = formDataArr.filter(formData => formData.name == 'date')[0].value;
    var boughtOrSoldData = formDataArr.filter(formData => formData.name == 'boughtOrSold')[0].value;
    newLog = `${symbolData}&nbsp;&nbsp;&nbsp;&nbsp;${boughtOrSoldData}&nbsp;&nbsp;&nbsp;&nbsp;${shareData}&nbsp;&nbsp;&nbsp;&nbsp;${dateData}&nbsp;&nbsp;&nbsp;&nbsp;(# of share * price at that date)`;
    // console.log(newLog);
    logArr.push(newLog);
    console.log(logArr);
    $('#divLog').append(`
        <p>${newLog}</p>
    `);
});
/////////END OF TRADE FORM BUTTONS//////////



// end of document.ready
});
