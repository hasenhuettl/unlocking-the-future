$( document ).ready(function() {

    $( "#login" ).on( "click", function() {
        
        const username = $('#username').val();
        let token = $('#token').val();

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
                window.location.href = "/success";
            },
            error: function(xhr, ajaxOptions, error) {
                showError(xhr.responseJSON.message );
            }
        });
    });

});

