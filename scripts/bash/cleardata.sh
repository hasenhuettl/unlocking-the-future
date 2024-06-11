#!/usr/bin/env bash

set -e

rm -f /var/www/node/passkeys/.data/db.json
rm -f /var/www/node/usb-keys/myDataBase.json
rm -f /var/www/node/password-authentication-api/myDatabase.json
rm -f /var/www/node/pin-authentication-api/myDatabase.json
rm -f /var/www/node/security-question-authentication-api/myDatabase.json
rm -f /var/www/node/sms-authentication-api/myDatabase.json
rm -f /var/www/node/device-fingerprint-api/myDatabase.json
rm -f /var/www/node/gps-verification-api/myDatabase.json

rm -f /var/www/node/facial-recognition-api/uploads/img1.jpg
rm -f /var/www/node/facial-recognition-api/uploads/img2.jpg


systemctl daemon-reload
systemctl restart passkeys
systemctl restart usb-keys
systemctl restart password-authentication
systemctl restart pin-authentication
systemctl restart security-question-authentication
systemctl restart facial-recognition
systemctl restart sms-authentication
systemctl restart device-fingerprint
systemctl restart ip-address-filtering
systemctl restart gps-verification
#systemctl restart scripts
#systemctl restart nginx



