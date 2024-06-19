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

  // Use platform authenticator and discoverable credential.
  options.authenticatorSelection = {
    //authenticatorAttachment: 'platform',
    authenticatorAttachment: ['cross-platform'],
    requireResidentKey: true,
    userVerification: 'required'
  }

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

  // Obtain the challenge and other options from the server endpoint.
  const options = await _fetch('/auth/signinRequest');

  // Locally verify the user and get a credential.
  // Base64URL decode the challenge.
  options.challenge = base64url.decode(options.challenge);

  // The empty allowCredentials array invokes an account selector by discoverable credentials.
  options.allowCredentials = [];

  // Use platform authenticator and discoverable credential.
  options.authenticatorSelection = {
    //authenticatorAttachment: 'platform',
    authenticatorAttachment: ['cross-platform'],
    requireResidentKey: true,
    userVerification: 'required'
  }

  // Invoke the WebAuthn get() function.
  const cred = await navigator.credentials.get({
    publicKey: options
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

async function registerUserWithPasskey(username, displayName, password) {
  // Step 1: Call the new endpoint to register the user and get WebAuthn options
  const options = await _fetch('/auth/registerUserWithPasskey', {
    method: 'POST',
    body: JSON.stringify({ username, displayName, password }),
    headers: {
      'Content-Type': 'application/json'
    }
  });

  // Step 2: Base64URL decode necessary fields
  options.user.id = base64url.decode(options.user.id);
  options.challenge = base64url.decode(options.challenge);

  if (options.excludeCredentials) {
    for (let cred of options.excludeCredentials) {
      cred.id = base64url.decode(cred.id);
    }
  }

  // Step 3: Create the credential
  const cred = await navigator.credentials.create({
    publicKey: options,
  });

  // Step 4: Prepare credential for registration
  const credential = {
    id: cred.id,
    rawId: base64url.encode(cred.rawId),
    type: cred.type,
    response: {
      clientDataJSON: base64url.encode(cred.response.clientDataJSON),
      attestationObject: base64url.encode(cred.response.attestationObject),
    },
    transports: cred.response.getTransports ? cred.response.getTransports() : []
  };

  if (cred.authenticatorAttachment) {
    credential.authenticatorAttachment = cred.authenticatorAttachment;
  }

  // Step 5: Register the credential with the server
  return await _fetch('/auth/registerResponse', {
    method: 'POST',
    body: JSON.stringify(credential),
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

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
  try {
    // Is a conditional UI available in this browser?
    const cma =  await PublicKeyCredential.isConditionalMediationAvailable();
    if (true) {
//    if (cma) {
      // If a conditional UI is available, invoke the authenticate() function.
      const user = await authenticate();
      if (user) {
        // Proceed only when authentication succeeds.
        $("#username").value = user.username;
        location.href = "https://authenticate.hasenhuettl.cc/success";
      } else {
        throw new Error("User not found.");
      }
    } else {
      throw new Error("Device does not support passkeys!");
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


