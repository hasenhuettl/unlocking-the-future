#!/usr/bin/env bash

# Exit on error
set -e

# ../.. of ScriptRoot
PROJECT_ROOT=$(dirname $(dirname $(dirname $(readlink -f "${BASH_SOURCE[0]}"))))

if [[ ! -f $PROJECT_ROOT/.path_verify ]] ; then
    echo ´Could find file ".path_verify" in $PROJECT_ROOT!´
    exit
fi

rm -f $PROJECT_ROOT/node/passkeys/.data/db.json
rm -f $PROJECT_ROOT/node/usb-keys/.data/db.json
rm -f $PROJECT_ROOT/node/smart-cards/.data/db.json
rm -f $PROJECT_ROOT/node/password-authentication-api/myDatabase.json
rm -f $PROJECT_ROOT/node/pin-authentication-api/myDatabase.json
rm -f $PROJECT_ROOT/node/security-question-authentication-api/myDatabase.json
rm -f $PROJECT_ROOT/node/sms-authentication-api/myDatabase.json
rm -f $PROJECT_ROOT/node/device-fingerprint-api/myDatabase.json
rm -f $PROJECT_ROOT/node/gps-verification-api/myDatabase.json
rm -f $PROJECT_ROOT/node/authenticator-apps-api/myDatabase.json
rm -f $PROJECT_ROOT/node/sso-api/myDatabase.json
rm -f $PROJECT_ROOT/node/behavioral-biometrics-api/myDatabase.json
rm -f $PROJECT_ROOT/node/game-based-authentication-api/myDatabase.json

rm -f $PROJECT_ROOT/node/facial-recognition-api/uploads/*
rm -f $PROJECT_ROOT/node/voice-authentication-api/uploads/*
rm -f $PROJECT_ROOT/node/voice-authentication-api/models/*

touch $PROJECT_ROOT/node/facial-recognition-api/uploads/.gitkeep
touch $PROJECT_ROOT/node/voice-authentication-api/uploads/.gitkeep
touch $PROJECT_ROOT/node/voice-authentication-api/models/.gitkeep

# Reset IP addresses
curl -X POST -H 'Content-Type: application/json' https://authenticate.hasenhuettl.cc/ip-address-filtering-api/reset

systemctl daemon-reload
systemctl restart passkeys
systemctl restart usb-keys
systemctl restart smart-cards
systemctl restart password-authentication
systemctl restart pin-authentication
systemctl restart security-question-authentication
systemctl restart facial-recognition
systemctl restart sms-authentication
systemctl restart device-fingerprint
systemctl restart ip-address-filtering
systemctl restart gps-verification
systemctl restart authenticator-apps
systemctl restart voice-authentication
systemctl restart voice-authentication-python
systemctl restart sso
systemctl restart behavioral-biometrics
systemctl restart game-based-authentication

# Restarting the following services would result in
# no possible way to return 200 success to client,
# therefore timeout of the client post request:

# systemctl restart scripts
# systemctl restart nginx



