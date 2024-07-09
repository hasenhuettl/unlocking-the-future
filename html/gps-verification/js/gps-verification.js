const authMethod = document.title;
let startTime;

window.onload = function(){
  startTime = new Date().getTime();
  $("#signup").on("click", function(){ signup() });
  $("#login").on("click", function(){ login() });
}

async function getCoords() {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        const coords = {
          lat: position.coords.latitude,
          lon: position.coords.longitude
        };
        resolve(coords);
      }, reject);
    } else {
      reject(new Error("Geolocation is not supported by this browser."));
    }
  });
}

async function signup() {
  const action = 'signup';
  const readyTime = new Date().getTime();
  const timeMs = readyTime - startTime;
  try {
    const coords = await getCoords();
    const response = await fetch('/gps-verification-api/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(coords)
    });
    if ( response.ok ) {
      const params = new URLSearchParams({ authMethod, action, timeMs }).toString();
      window.location.href = '/success?' + params;
    } else {
      const result = await response.json();
      if ( result ) {
        showError( result.message );
      } else {
        showError( response.status + ": " + response.statusText );
      }
    }
  } catch (error) {
    showError(error.message);
  }
}

async function login() {
  const action = 'login';
  const readyTime = new Date().getTime();
  const timeMs = readyTime - startTime;
  try {
    const coords = await getCoords();
    const response = await fetch('/gps-verification-api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(coords)
    });
    if ( response.ok ) {
      const params = new URLSearchParams({ authMethod, action, timeMs }).toString();
      window.location.href = '/success?' + params;
    } else {
      const result = await response.json();
      if ( result ) {
        showError( result.message );
      } else {
        showError( response.status + ": " + response.statusText );
      }
    }
  } catch (error) {
    showError(error.message);
  }
}

