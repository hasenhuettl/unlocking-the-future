const apiUrl = 'https://authenticate.hasenhuettl.cc/device-fingerprint-api';

window.onload = function(){
    $("#signup").on("click", function(){ get_fingerprint( signup ); });
    $("#login").on("click", function(){ get_fingerprint( login ); });
}

function get_fingerprint(callback) {
    showLoad();

    import('/device-fingerprint/api')
        .then(FingerprintJS => FingerprintJS.load())
        .then(fp => fp.get())
        .then(result => {
            console.log(result.visitorId);
            callback(result.visitorId);
        })
        .catch(error => {
            console.error(error);
            showError(error);
            showMain();
        });
}


function signup(visitorId) {
    const url = apiUrl + '/signup';
    const username = $('#username').val();
    const redirect = true;

    console.log(visitorId);

    const body = JSON.stringify({ username, visitorId });

    post_request(url, body, redirect);
}

function login(visitorId) {
    const url = apiUrl + '/login';
    const username = $('#username').val();
    const redirect = true;

    const body = JSON.stringify({ username, visitorId });

    post_request(url, body, redirect);
}

async function post_request(url, body, redirect) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: body
        });
        const result = await response.json();
        if (response.ok) {
            if (redirect) {
                window.location.href = '/success';
            } else {
                showSuccess('Request successful');
            }
        } else {
            showError(result.error);
        }
    } catch (error) {
        showMain();
        showError('Network error');
    }
}

