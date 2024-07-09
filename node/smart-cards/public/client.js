/*
 * @license
 * Copyright 2023 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License
 */
export const $ = document.querySelector.bind(document);

// Use platform authenticator and discoverable credential.
const authenticatorSelectionOptions = {
  authenticatorAttachment: ['cross-platform'],
  requireResidentKey: false,
  userVerification: 'discouraged',
};

export async function _fetch(path, payload = '') {
  const headers = {
    'X-Requested-With': 'XMLHttpRequest',
  };
  if (payload && !(payload instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(payload);
  }
  const res = await fetch(path, {
    method: 'POST',
    credentials: 'same-origin',
    headers: headers,
    body: payload,
  });
  if (res.status === 200) {
    // Server authentication succeeded
    return res.json();
  } else {
    // Server authentication failed
    const result = await res.json();
    throw new Error(result.error);
  }
};

export const base64url = {
  encode: function(buffer) {
    const base64 = window.btoa(String.fromCharCode(...new Uint8Array(buffer)));
    return base64.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  },
  decode: function(base64url) {
    const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
    const binStr = window.atob(base64);
    const bin = new Uint8Array(binStr.length);
    for (let i = 0; i < binStr.length; i++) {
      bin[i] = binStr.charCodeAt(i);
    }
    return bin.buffer;
  }
}

class Loading {
  constructor() {
    this.progress = $('#progress');
  }
  start() {
    this.progress.indeterminate = true;
    const inputs = document.querySelectorAll('input');
    if (inputs) {
      inputs.forEach(input => input.disabled = true);
    }
  }
  stop() {
    this.progress.indeterminate = false;
    const inputs = document.querySelectorAll('input');
    if (inputs) {
      inputs.forEach(input => input.disabled = false);
    }
  }
}

export const loading = new Loading();

// Create the registerCredential() function.
export async function registerCredential() {

  // Obtain the challenge and other options from server endpoint.
  const options = await _fetch('/auth/registerRequest');
  
  // Create a credential.
  options.user.id = base64url.decode(options.user.id);
  options.challenge = base64url.decode(options.challenge);

  if (options.excludeCredentials) {
    for (let cred of options.excludeCredentials) {
      cred.id = base64url.decode(cred.id);
    }
  }

  options.authenticatorSelection = authenticatorSelectionOptions;

    console.log("Options: " + JSON.stringify(options));
  // Invoke the WebAuthn create() method.
  const cred = await navigator.credentials.create({
    publicKey: options,
  });

  // Register the credential to the server endpoint.
  const credential = {};
  credential.id = cred.id;
  credential.rawId = cred.id; // Pass a Base64URL encoded ID string.
  credential.type = cred.type;

  // The authenticatorAttachment string in the PublicKeyCredential object is a new addition in WebAuthn L3.
  if (cred.authenticatorAttachment) {
    credential.authenticatorAttachment = cred.authenticatorAttachment;
  }

  // Base64URL encode some values.
  const clientDataJSON = base64url.encode(cred.response.clientDataJSON);
  const attestationObject =  
  base64url.encode(cred.response.attestationObject);

  // Obtain transports.
  const transports = cred.response.getTransports ? 
  cred.response.getTransports() : [];

  credential.response = {
    clientDataJSON,
    attestationObject,
    transports
  };

  return await _fetch('/auth/registerResponse', credential);
};

// Create the authenticate() function.
export async function authenticate() {
    const username = $("#username").value;
    const payload = {
      username: username
    };

    const options = await _fetch(`/auth/signinRequest`, { username })
      .catch(function(error) {
        throw new Error(error);
      });

    // Base64URL decode the challenge
    options.challenge = base64url.decode(options.challenge);

    // If allowCredentials is not empty, decode the id for each credential
    if (options.allowCredentials && options.allowCredentials.length > 0) {
      options.allowCredentials = options.allowCredentials.map(cred => ({
        ...cred,
        id: base64url.decode(cred.id)
      }));
    }

    console.log("Options: " + JSON.stringify(options));

    // Invoke the WebAuthn get() function.
    const cred = await navigator.credentials.get({
      publicKey: options,
    });

    // Verify the credential.
    const credential = {};
    credential.id = cred.id;
    credential.rawId = cred.id; // Pass a Base64URL encoded ID string.
    credential.type = cred.type;

    // Base64URL encode some values.
    const clientDataJSON = base64url.encode(cred.response.clientDataJSON);
    const authenticatorData = 
    base64url.encode(cred.response.authenticatorData);
    const signature = base64url.encode(cred.response.signature);
    const userHandle = base64url.encode(cred.response.userHandle);

    credential.response = {
      clientDataJSON,
      authenticatorData,
      signature,
      userHandle,
    };

    return await _fetch(`/auth/signinResponse`, credential);

};

export async function updateCredential(credId, newName) {
  return _fetch(`/auth/renameKey`, { credId, newName });
}

export async function unregisterCredential(credId) {
  return _fetch(`/auth/removeKey?credId=${encodeURIComponent(credId)}`);
};

export async function registerPasskey() {
  try {
    // Start creating a passkey.
    await registerCredential();

    // Render the updated passkey list.
    renderCredentials();

  } catch (e) {
    // An InvalidStateError indicates that a passkey already exists on the device.
    if (e.name === "InvalidStateError") {
      showError("A passkey already exists for this device.");

      // A NotAllowedError indicates that the user canceled the operation.
    } else if (e.name === "NotAllowedError") {
      Return;

      // Display other errors.
    } else {
      showError(e.message);
      console.error(e);
    }
  }
}

export async function loginPasskey() {

  const authMethod = document.title;
  let startTime = new Date().getTime();

  try {
    const user = await authenticate();
    if (user) {
      // Proceed only when authentication succeeds.
      $("#username").value = user.username;
      const action = 'login';
      const readyTime = new Date().getTime();
      const timeMs = readyTime - startTime;
      const params = new URLSearchParams({ authMethod, action, timeMs }).toString();
      location.href = "https://authenticate.hasenhuettl.cc/success?" + params;
    } else {
      throw new Error("User not found.");
    }
  } catch (e) {
    // A NotAllowedError indicates that the user canceled the operation.
    if (e.name !== "NotAllowedError") {
      console.error(e);
      showError(e.message);
    } else {
      showError("An unknown error occured");
    }
  }
} 

