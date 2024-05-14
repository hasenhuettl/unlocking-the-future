#!/usr/bin/env bash

rm /var/www/node/passkeys/myDataBase.json

systemctl daemon-reload
systemctl restart nginx
systemctl restart passkeys
