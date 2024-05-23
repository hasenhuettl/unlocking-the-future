#!/usr/bin/env bash

set -e

DIR="$(dirname "$(realpath "$0")")"

cd /var/www/node
for d in */ ; do
    [ -L "${d%/}" ] && continue
    cd /var/www/node
    cd "$d"
    npm install
done

ln -s /var/www/html/ip-address-filtering/ip-address-filtering.conf /etc/nginx/sites-available/ip-address-filtering.conf
ln -s /var/www/html/gps-verification/gps-verification.conf /etc/nginx/sites-available/gps-verification.conf
ln -s /var/www/auth.conf /etc/nginx/sites-available/auth.conf
ln -s /etc/nginx/sites-available/auth.conf /etc/nginx/sites-enabled/auth.conf

source ${DIR}/start_services.sh

