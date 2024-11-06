const apiUrl = '/scripts';

$(document).ready(function() {
    saveMeasurement();
});

function saveMeasurement() {
    const url = apiUrl + '/saveMeasurement';

    const deviceId = getCookie("deviceId");

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    const authMethod = urlParams.get('authMethod');
    const action = urlParams.get('action');
    const timeMs = urlParams.get('timeMs');

    if (!deviceId) {
        let message = "Please first register this device ";
        $('#message').remove();
        $( "body" ).append(
          $('<div>').attr('id', 'message').fadeIn(0).delay(6000).fadeOut(4000).append(
            $('<span>').attr('id', 'messagetext').css('background-color', 'red').text(message).append(
              $('<a>').attr('href', '/register-device/index.html').text("via this link")
            )
          )
        );
        $('#back').show();
        $('#home').hide();
    } else if (!authMethod) {
        showError("authMethod is empty");
    } else if (!action) {
        showError("action is empty");
    } else if (!timeMs) {
        showError("timeMs is empty");
    } else {
        const body = JSON.stringify({ deviceId, authMethod, action, timeMs });

        post_request(url, body);
    }
}

function getCookie(cname) {
    const name = cname + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');

    for(let i = 0; i < ca.length; i++) {
      let c = ca[i];

      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }

      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }

    return "";
}

async function post_request(url, body) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: body
        });
        const result = await response.json();
        if (response.ok) {
            $('#back').show();
            $('#home').hide();
        } else {
            showError(result.message);
        }
    } catch (error) {
        showError('Network error');
    }
}


