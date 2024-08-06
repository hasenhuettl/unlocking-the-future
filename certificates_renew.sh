#!/bin/bash

# Add the following line to cronjob to renew every 7 days (requires root)
# 0 0 */7 * * /var/www/certificates_renew.sh

#set -e

systemctl stop nginx

certbot renew

systemctl start nginx

