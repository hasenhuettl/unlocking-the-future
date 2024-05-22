const apiUrl = 'https://authenticate.hasenhuettl.cc/password-authentication-api';

async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    try {
        const response = await fetch(apiUrl + '/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const result = await response.json();
        if (response.ok) {
            window.location.href = '/success';
        } else {
            showError(result.error);
        }
    } catch (error) {
        showError('Network error');
    }
}

async function signup() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    try {
        const response = await fetch(apiUrl + '/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const result = await response.json();
        if (response.ok) {
            //showSuccess(result.message);
            window.location.href = '/success';
        } else {
            showError(result.error);
        }
    } catch (error) {
        showError('Network error');
    }
}

window.onload = function(){
  $("#login").on("click", function(){ login(); });
  $("#signup").on("click", function(){ signup(); });
}

