const apiUrl = '/email-authentication-api';
const authMethod = document.title;
let startTime;

window.onload = function(){

    startTime = new Date().getTime();

    $("#signup").on("click", function(){ signup(); });
    $("#send").on("click", function(){ send_e_mail(); });
    $("#login").on("click", function(){ login(); });

    $("#email").on('keypress', function(e) {
      if (e.which === 13) { // Enter key pressed
        $("#signup").click();
      }
    });

    $("#code").on('keypress', function(e) {
      if (e.which === 13) { // Enter key pressed
        $("#login").click();
      }
    });
}

function signup() {
    const url = apiUrl + '/signup';
    const username = $('#username').val();
    const email = $('#email').val();
    const redirect = true;

    const body = JSON.stringify({ username, email });

    console.log(body);
    post_request(url, body, redirect);
}

function send_e_mail() {
    const url = apiUrl + '/email';
    const username = $('#username').val();
    const redirect = false;

    const body = JSON.stringify({ username });

    $('#login').prop("disabled", false);

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
                showSuccess('Request successful: ' + result.message);
            }
        } else {
            showError(result.error);
        }
    } catch (error) {
        showError('Network error: ' + error);
    }
}

