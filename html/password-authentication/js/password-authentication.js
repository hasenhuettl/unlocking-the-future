const apiUrl = 'https://authenticate.hasenhuettl.cc/password-authentication-api';

async function login() {
    const username = $("#username").val();
    const password = $("#password").val();
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
    const username = $("#username").val();
    const password = $("#password").val();
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
    console.log(requirement.element.text());
    if (requirement.regex.test(password)) {
      requirement.element.attr('status', 'success');
    } else {
      requirement.element.attr('status', 'fail');
    }
  }
}


window.onload = function(){
  $("#login").on("click", function(){ login(); });
  $("#signup").on("click", function(){ signup(); });
  $("#password").on('change paste keyup input', function() { validatePassword() })
}

