const apiUrl = '/pin-authentication-api';
const authMethod = document.title;
let startTime;

async function login() {
    const action = 'login';
    const readyTime = new Date().getTime();
    const timeMs = readyTime - startTime;

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
            const params = new URLSearchParams({ authMethod, action, timeMs }).toString();
            window.location.href = '/success?' + params;
        } else {
            showError(result.error);
        }
    } catch (error) {
        showError('Network error');
    }
}

async function signup() {
    const action = 'signup';
    const readyTime = new Date().getTime();
    const timeMs = readyTime - startTime;

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
            const params = new URLSearchParams({ authMethod, action, timeMs }).toString();
            window.location.href = '/success?' + params;
        } else {
            showError(result.error);
        }
    } catch (error) {
        showError('Network error');
    }
}

$(document).ready(function(){

  startTime = new Date().getTime();

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

