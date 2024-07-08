let keyPressTimes = [];
let lastKeyPressTime = null;

const apiUrl = 'https://authenticate.hasenhuettl.cc/behavioral-biometrics-api';

window.onload = function(){
    $("#login").on("click", function(){ login(); });
    $("#signup").on("click", function(){ signup(); });

    $("#password").on('keypress', function(e) {
      if (e.which === 13) { // Enter key pressed
        if ($("#login").length) {
          $("#login").click();
        } else if ($("#signup").length) {
          $("#signup").click();
        }
      }
    });

    $('#password').on('keydown', function(event) {
        const validKeys = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]$/;
        const currentTime = Date.now();

        if (event.key.match(validKeys)) {
            if (lastKeyPressTime) {
                keyPressTimes.push(currentTime - lastKeyPressTime);
            }

            lastKeyPressTime = currentTime;

        } else if (event.key === 'Backspace' || event.key === 'Delete') {
            resetInput();
        }

        validatePassword();

    });
}

function resetInput() {
    $('#password').val('');
    keyPressTimes = [];
    lastKeyPressTime = null;
}

function validatePassword() {
  const password = $("#password").val();
  const requirements = {
      characters: { element: $('#requirement-characters'), regex: /.{6,}/ },
  };
  for (const key in requirements) {
    const requirement = requirements[key];
    if (requirement.regex.test(password)) {
      requirement.element.attr('status', 'success');
    } else {
      requirement.element.attr('status', 'fail');
    }
  }
}

async function login() {
    const username = $("#username").val();
    const password = $("#password").val();
    try {
        const response = await fetch(apiUrl + '/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, keyPressTimes })
        });
        const result = await response.json();
        if (response.ok) {
            window.location.href = '/success';
        } else {
            showError(result.error);
            resetInput();
        }
    } catch (error) {
        showError('Network error');
        resetInput();
    }
}

async function signup() {
    const username = $("#username").val();
    const password = $("#password").val();
    try {
        const response = await fetch(apiUrl + '/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, keyPressTimes })
        });
        const result = await response.json();
        if (response.ok) {
            window.location.href = '/success';
        } else {
            showError(result.error);
            resetInput();
        }
    } catch (error) {
        showError('Network error');
        resetInput();
    }
}

