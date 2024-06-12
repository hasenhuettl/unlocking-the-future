$( document ).ready(function() {

    $( "#getQR" ).on( "click", function() {

        const username = $('#username').val();

        $.ajax({
            url: '/authenticator-apps-api/signup',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ username: username }),
            success: function(response) {

                const qrCodeUrl = response.data.qrCodeUrl;
                const secret = response.data.secret;

                $('#qr-code').html(`<img src="${qrCodeUrl}" alt="QR Code">`);
                $('#manual-code').html(`<p>Manual Code: ${secret}</p>`);

            },
            error: function(xhr, ajaxOptions, error) {
                showError(error);
                showError(xhr.status + " - " + error);
            }
        });
    });

    $( "#signup" ).on( "click", function() {
        
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

