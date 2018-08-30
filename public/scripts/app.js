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






// end of document.ready
});
