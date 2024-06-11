# authenticate.hasenhuettl.at
This is the private repository for the implementation part of the master thesis "Unlocking the Future: A Comparative Study of Authentication Methods" by David Hasenhüttl

## Pre-Requisites:
```
sudo apt-get install nginx
pip install deepface tf-keras TensorRT
```

### Get SSL certificates, e.g. implement certbot
```
apt install certbot
sudo certbot certonly --standalone -d authenticate.hasenhuettl.cc
```

### If current node.js version is not installed:
```
curl -sL https://deb.nodesource.com/setup_22.x | sudo -E bash -\nsudo apt-get install -y nodejs
```


## Installation

clone repo content to /var/www/ (Example file path: `/var/www/install.sh`)

Run `install.sh`

Install certbot and replace keyfile paths as well as domainname references in `/var/www/node` projects

Make sure default config is disabled:
```
rm /etc/nginx/sites-enabled/default
```

Replace API key in `/var/www/html/gps-verification/gps-verification.conf`
Replace API key in `/var/www/html/device-fingerprint/device-fingerprint.conf`
Replace API key in `/var/www/html/sms-verification/credentials.env`
Replace RootCA password in `/var/www/credentials.env`


