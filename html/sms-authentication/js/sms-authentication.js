const apiUrl = 'https://authenticate.hasenhuettl.cc/sms-authentication-api';
const authMethod = document.title;
let startTime;

window.onload = function(){

    startTime = new Date().getTime();

    $("#signup").on("click", function(){ signup(); });
    $("#send").on("click", function(){ send_sms(); });
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

    const parts = url.split('/');
    const action = `/${parts.pop()}`; // Return /login or /signup from url
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
        showError('Network error');
    }
}

