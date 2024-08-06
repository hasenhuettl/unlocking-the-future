#!/usr/bin/env bash

# Exit on error
set -e

# Reset IP addresses
curl -X POST -H 'Content-Type: application/json' https://authenticate.hasenhuettl.cc/ip-address-filtering-api/reset

rm -f /var/www/node/passkeys/.data/db.json
rm -f /var/www/node/usb-keys/.data/db.json
rm -f /var/www/node/smart-cards/.data/db.json
rm -f /var/www/node/password-authentication-api/myDatabase.json
rm -f /var/www/node/pin-authentication-api/myDatabase.json
rm -f /var/www/node/security-question-authentication-api/myDatabase.json
rm -f /var/www/node/sms-authentication-api/myDatabase.json
rm -f /var/www/node/device-fingerprint-api/myDatabase.json
rm -f /var/www/node/gps-verification-api/myDatabase.json
rm -f /var/www/node/authenticator-apps-api/myDatabase.json
rm -f /var/www/node/sso-api/myDatabase.json
rm -f /var/www/node/behavioral-biometrics-api/myDatabase.json
rm -f /var/www/node/game-based-authentication-api/myDatabase.json

rm -f /var/www/node/facial-recognition-api/uploads/*
rm -f /var/www/node/voice-authentication-api/uploads/*
rm -f /var/www/node/voice-authentication-api/models/*

touch /var/www/node/facial-recognition-api/uploads/.gitkeep
touch /var/www/node/voice-authentication-api/uploads/.gitkeep
touch /var/www/node/voice-authentication-api/models/.gitkeep

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



