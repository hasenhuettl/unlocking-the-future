#!/usr/bin/env bash

set -e

sudo apt update
sudo apt install nginx postgresql
pip install deepface tf-keras TensorRT flask librosa numpy scipy scikit-learn

DIR="$(dirname "$(realpath "$0")")"

cd /var/www/node
for d in */ ; do
    [ -L "${d%/}" ] && continue
    cd /var/www/node
    cd "$d"
    npm install
done

cd /var/www/scripts
npm install

ln -s /var/www/html/gps-verification/gps-verification.conf /etc/nginx/sites-available/gps-verification.conf
ln -s /var/www/html/device-fingerprint/device-fingerprint.conf /etc/nginx/sites-available/device-fingerprint.conf
ln -s /var/www/html/device-certificates/device-certificates.conf /etc/nginx/sites-available/device-certificates.conf
ln -s /var/www/html/ip-address-filtering/ip-address-filtering.conf /etc/nginx/sites-available/ip-address-filtering.conf
ln -s /var/www/auth.conf /etc/nginx/sites-available/auth.conf
ln -s /etc/nginx/sites-available/auth.conf /etc/nginx/sites-enabled/auth.conf

source ${DIR}/setup_services.sh
source ${DIR}/setup_rootca.sh
source ${DIR}/setup_postgres.sh

