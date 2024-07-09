$( document ).ready(function() {
    const authMethod = document.title;
    let startTime = new Date().getTime();

    $("#token").on('keypress', function(e) {
      if (e.which === 13) { // Enter key pressed
        if ($("#login").length) {
          $("#login").click();
        } else if ($("#signup").length) {
          $("#signup").click();
        }
      }
    });

    $( "#login" ).on( "click", function() {
        
        const username = $('#username').val();
        let token = $('#token').val();
        const action = 'login';
        const readyTime = new Date().getTime();
        const timeMs = readyTime - startTime;

        token = token.replace(/\s/g, '');

        $.ajax({
            url: '/authenticator-apps-api/login',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              username: username,
              token: token
            }),
            success: function(response) {
                const params = new URLSearchParams({ authMethod, action, timeMs }).toString();
                window.location.href = '/success?' + params;
            },
            error: function(xhr, ajaxOptions, error) {
                showError(xhr.responseJSON.message );
            }
        });
    });

});

