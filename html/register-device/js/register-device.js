const apiUrl = 'https://authenticate.hasenhuettl.cc/scripts';
const authMethod = document.title;

window.onload = function(){
    startTime = new Date().getTime();
    $("#register").on("click", function(){ get_fingerprint( register ); });
}

function get_fingerprint(callback) {
    showLoad();

    import('/device-fingerprint/api')
        .then(FingerprintJS => FingerprintJS.load())
        .then(fp => fp.get({
          extendedResult: true
        }))
        .then(result => {
            callback(result);
        })
        .catch(error => {
            console.error(error);
            showError(error);
            showMain();
        });
}


function register(fingerprint) {
    const url = apiUrl + '/saveDevice';
    const username = $('#username').val();
    const redirect = true;

    const os = fingerprint.os;
    const browser = fingerprint.browserName;
    const visitorId = fingerprint.visitorId;

    // Set new cookie with infinite expiration date (year 9999), browsers usually reduce this to 400 days or lower
    document.cookie = `visitorId=${visitorId}; expires=Sun, 1 Jan 9999 00:00:00 UTC; path=/`

    const body = JSON.stringify({ username, visitorId, os, browser });

    post_request(url, body, redirect);
}

async function post_request(url, body, redirect) {
    const parts = url.split('/');
    const action = '/' + parts[parts.length - 1]; // returns /login or /signup
    const readyTime = new Date().getTime();
    const timeMs = readyTime - startTime;
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: body
        });
        const result = await response.json();
        if (response.ok) {
            if (redirect) {
                const params = new URLSearchParams({ authMethod, action, timeMs }).toString();
                window.location.href = '/success?' + params;
            } else {
                showSuccess('Request successful');
            }
        } else {
            showMain();
            showError(result.message);
        }
    } catch (error) {
        showMain();
        showError('Network error');
    }
}

