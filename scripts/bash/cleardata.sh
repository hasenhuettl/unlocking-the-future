#!/usr/bin/env bash

set -e

rm -f /var/www/node/passkeys/myDataBase.json

systemctl daemon-reload
systemctl restart passkeys
systemctl restart facial-recognition-api
#systemctl restart scripts
#systemctl restart nginx

