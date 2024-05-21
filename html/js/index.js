document.addEventListener("DOMContentLoaded", function() {
  document.getElementById('clearData').addEventListener('click', async () => {
      try {
          const response = await fetch('/scripts/clearData', {
              method: 'POST',
          });
          const responseData = await response.json();
          if (responseData.success) {
              showSuccess(responseData.message);
          } else {
              alert('Error: ' + responseData.message);
          }
      } catch (error) {
          console.error('Error:', error);
          showError('An error occurred while processing your request.');
      }
  });
});


// show success message
function showSuccess( message ) {
    $('#message').remove();
      $( "body" ).append($('<div>').attr('id', 'message').fadeIn(0).fadeOut(4000).append(
        $('<span>').attr('id', 'messagetext').css('background-color', 'green').text(message)));
}

// show error message
function showError( message ) {
    $('#message').remove();
      $( "body" ).append($('<div>').attr('id', 'message').fadeIn(0).delay(6000).fadeOut(4000).append(
        $('<span>').attr('id', 'messagetext').css('background-color', 'red').text(message)));
}


