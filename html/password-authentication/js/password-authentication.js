const apiUrl = '/password-authentication-api';
const authMethod = document.title;
let startTime;

async function login() {
    const username = $("#username").val();
    const password = $("#password").val();
    const action = 'login';
    const readyTime = new Date().getTime();
    const timeMs = readyTime - startTime;

    try {
        const response = await fetch(apiUrl + '/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const result = await response.json();
        if (response.ok) {
            const params = new URLSearchParams({ authMethod, action, timeMs }).toString();
            window.location.href = '/success?' + params;
        } else {
            showError(result.error);
            $("#password").val("");
        }
    } catch (error) {
        showError('Network error');
    }
}

async function signup() {
    const username = $("#username").val();
    const password = $("#password").val();
    const action = 'signup';
    const readyTime = new Date().getTime();
    const timeMs = readyTime - startTime;

    try {
        const response = await fetch(apiUrl + '/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const result = await response.json();
        if (response.ok) {
            const params = new URLSearchParams({ authMethod, action, timeMs }).toString();
            window.location.href = '/success?' + params;
        } else {
            showError(result.error);
            $("#password").val("");
        }
    } catch (error) {
        showError('Network error');
    }
}

function validatePassword() {
  const password = $("#password").val();
  const requirements = {
      characters: { element: $('#requirement-characters'), regex: /.{10,}/ },
      lowercase: { element: $('#requirement-lowercase'), regex: /[a-z]/ },
      uppercase: { element: $('#requirement-uppercase'), regex: /[A-Z]/ },
      number: { element: $('#requirement-number'), regex: /\d/ },
      special: { element: $('#requirement-special'), regex: /[^A-Za-z0-9]/ }
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

$(document).ready(function() {

  startTime = new Date().getTime();

  $("#login").on("click", function(){ login(); });
  $("#signup").on("click", function(){ signup(); });
  $("#password").on('change paste keyup input', function() { validatePassword() })

  $("#password").on('keypress', function(e) {
    if (e.which === 13) { // Enter key pressed
      document.activeElement.blur();
      if ($("#login").length) {
        $("#login").click();
      } else if ($("#signup").length) {
        $("#signup").click();
      }
    }
  });
});

