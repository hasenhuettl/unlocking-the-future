// show success message
function showSuccess( message ) {
    $('#message').remove();
    $( "body" ).append($('<div>').attr('id', 'message').fadeIn(0).fadeOut(4000).append(
      $('<span>').attr('id', 'messagetext').css('background-color', 'green').text(message))
    );
}

// show error message
function showError( message ) {
    $('#message').remove();
    $( "body" ).append($('<div>').attr('id', 'message').fadeIn(0).delay(6000).fadeOut(4000).append(
      $('<span>').attr('id', 'messagetext').css('background-color', 'red').text(message))
    );
}

function showMain() {
    $(".loader").hide();
    $("main").show();
}

function showLoad() {
    $(".loader").show(); // show loading
    $("main").hide();
}
