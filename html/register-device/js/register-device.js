const apiUrl = '/scripts';
const authMethod = document.title;
let latency;

window.onload = function(){
    startTime = new Date().getTime();

    let start = new Date().getTime();
    $('#junk').on('error', function (e) {
        const now = new Date().getTime();
        latency = now - start;
        console.log("Latency: " + latency);
    }).attr('src', '/invalid.jpg?d=' + new Date().getTime());

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
    const os = fingerprint.os;
    const browser = fingerprint.browserName;
    const visitorId = fingerprint.visitorId;

    const body = JSON.stringify({ username, visitorId, os, browser, latency });

    post_request(url, body);
}

async function post_request(url, body) {
    const parts = url.split('/');
    const action = parts[parts.length - 1]; // returns /register-device
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
            // Set new cookie with infinite expiration date (year 9999), browsers usually reduce this to 400 days or lower
            document.cookie = `deviceId=${result.deviceId}; expires=Sun, 1 Jan 9999 00:00:00 UTC; path=/`
            const params = new URLSearchParams({ authMethod, action, timeMs }).toString();
            window.location.href = '/success?' + params;
        } else {
            showMain();
            showError(result.message);
        }
    } catch (error) {
        showMain();
        showError('Network error');
    }
}

