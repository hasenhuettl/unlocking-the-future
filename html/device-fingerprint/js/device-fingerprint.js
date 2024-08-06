const apiUrl = '/device-fingerprint-api';
const authMethod = document.title;
let startTime;

window.onload = function(){
    startTime = new Date().getTime();
    $("#signup").on("click", function(){ get_fingerprint( signup ); });
    $("#login").on("click", function(){ get_fingerprint( login ); });
}

function get_fingerprint(callback) {
    showLoad();

    import('/device-fingerprint/api')
        .then(FingerprintJS => FingerprintJS.load())
        .then(fp => fp.get())
        .then(result => {
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
    const parts = url.split('/');
    const action = parts.pop(); // Return /login or /signup from url
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
            showError(result.error);
        }
    } catch (error) {
        showMain();
        showError('Network error');
    }
}

