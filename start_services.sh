#!/usr/bin/env bash

systemctl daemon-reload

# Create Systemd services out of node apps (Refer to https://stackoverflow.com/a/29042953)
ln -s /var/www/systemd/* /etc/systemd/system/
for filename in /var/www/systemd/*.service; do
    systemctl start "$(basename "$filename" .service)"
    systemctl enable "$(basename "$filename" .service)"
done

