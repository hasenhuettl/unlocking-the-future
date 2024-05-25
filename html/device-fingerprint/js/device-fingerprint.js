const apiUrl = 'https://authenticate.hasenhuettl.cc/device-fingerprint-api';

window.onload = function(){
    $("#signup").on("click", function(){ signup(); });
    $("#login").on("click", function(){ login(); });
}

function signup() {
    const url = apiUrl + '/signup';
    const username = $('#username').val();
    const number = $('#number').val();
    const redirect = true;

    const body = JSON.stringify({ username, number });

    post_request(url, body, redirect);
}

function send_sms() {
    const url = apiUrl + '/sms';
    const username = $('#username').val();
    const redirect = false;

    const body = JSON.stringify({ username });

    post_request(url, body, redirect);
}

function login() {
    const url = apiUrl + '/login';
    const username = $('#username').val();
    const code = $('#code').val();
    const redirect = true;

    const body = JSON.stringify({ username, code });

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
        showError('Network error');
    }
}

