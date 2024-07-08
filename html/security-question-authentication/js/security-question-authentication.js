const apiUrl = 'https://authenticate.hasenhuettl.cc/security-question-authentication-api';

async function login() {
    const username = document.getElementById('username').value;
    const question = document.getElementById('security-questions').value;
    const answer   = document.getElementById('answer').value;
    try {
        const response = await fetch(apiUrl + '/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, question, answer })
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
    const question = document.getElementById('security-questions').value;
    const answer   = document.getElementById('answer').value;
    try {
        const response = await fetch(apiUrl + '/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, question, answer })
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

  $("#security-questions").on('keypress', function(e) {
    if (e.which === 13) { // Enter key pressed
      if ($("#login").length) {
        $("#login").click();
      } else if ($("#signup").length) {
        $("#signup").click();
      }
    }
  });
}

