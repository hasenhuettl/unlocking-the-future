#!/bin/bash

set -e

if [ "$#" -ne 1 ]; then
    echo "Command usage: $0 new_domain"
    exit 1
fi

# Assign arguments to variables
new_domain=$1

apt install certbot
sudo certbot certonly --standalone -d authenticate.$new_domain
sudo certbot certonly --standalone -d device-certificates.$new_domain
sudo certbot certonly --standalone -d usb-keys.$new_domain
sudo certbot certonly --standalone -d smart-cards.$new_domain
sudo certbot certonly --standalone -d sso.$new_domain

