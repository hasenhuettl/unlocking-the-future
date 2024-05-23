#!/usr/bin/env bash

set -e

rm -f /var/www/node/passkeys/myDataBase.json
rm -f /var/www/node/usb-keys/myDataBase.json
rm -f /var/www/node/facial-recognition-api/uploads/img1.jpg
rm -f /var/www/node/facial-recognition-api/uploads/img2.jpg


systemctl daemon-reload
systemctl restart passkeys
systemctl restart usb-keys
systemctl restart password-authentication
systemctl restart pin-authentication
systemctl restart security-question-authentication
systemctl restart facial-recognition-api
#systemctl restart scripts
#systemctl restart nginx



