const apiUrl = 'https://authenticate.hasenhuettl.cc/pin-authentication-api';

async function login() {
    const username = document.getElementById('username').value;
    const pin = document.getElementById('pin').value;
    try {
        const response = await fetch(apiUrl + '/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, pin })
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
    const pin = document.getElementById('pin').value;
    try {
        const response = await fetch(apiUrl + '/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, pin })
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

$(document).ready(function(){
  $("#login").on("click", function(){ login(); });
  $("#signup").on("click", function(){ signup(); });

  $('#pin').on('input', function(){
      if (this.value.length > this.maxLength) {
          this.value = this.value.slice(0, this.maxLength);
      }
  });

  $("#pin").on('keypress', function(e) {
    if (e.which === 13) { // Enter key pressed
      if ($("#login").length) {
        $("#login").click();
      } else if ($("#signup").length) {
        $("#signup").click();
      }
    }
  });
});

