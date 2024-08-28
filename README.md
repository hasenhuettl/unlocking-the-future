This public repository is part of the master thesis "Unlocking the Future: A Comparative Study of Authentication Methods" by David Hasenhüttl

# Pre-Requisites:
 * Linux environment with working internet connection (build and tested on ubuntu server 22.04).
 * This project expects a fresh os installation and will install a root CA, PostgreSQL, and Grafana.
   * If any of these software packages are already installed, please refer to the corresponding setup scripts and adapt them to your environment.
 * Required ports: 80, 443, 3000-3020, 3333, 5000, 5432
   * Port 80 (redirect) and 443 (webpage) have to be reachable for the clients

## This project requires node.js version 22 or above:
* For ubuntu/debian:
```
curl -sL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
```

* Alternative distributions: Check <https://nodejs.org/en/download/package-manager> for download instructions

# Installation

* Clone repo content to /var/www/

___Attention: Because of the punctuation at the end (clone into current dir), directory has to be empty or command will fail!___
```
cd /var/www
git clone https://github.com/hasenhuettl/unlocking-the-future .
```

## Change domain address
 * Change domain name to your personally owned domain, for example: contoso.com

___**Attention: This command will replace all occurences of string 1 (hasenhuettl.cc) with string 2 (contoso.com) IN ALL FILES IN THE SAME FOLDER OR ANY SUBFOLDER OF THE SCRIPT (In this example: /var/www/..)!**___

___**Do NOT move this command to any location with files other than this project!**___
```
bash /var/www/replace_domain.sh hasenhuettl.cc contoso.com
```

## Get SSL certificates
Choose one of the following options to install SSL certificates:

### Option A: Install certificates via certbot
 * Add either a wildcard record in your domain for `*.your.domain`, or multiple records for each subdomain defined in `/var/www/certificates_install.sh`
```
bash /var/www/certificates_install.sh contoso.com
```

### Option B: Copy wildcard cert or individual subdomain certs to the server and replace the file path in the following files to refer to your files:
```
/var/www/auth.conf
/var/www/html/device-certificates/device-certificates.conf
/var/www/html/device-fingerprint/device-fingerprint.conf
```

## Get API keys
 * Create an account and get your API key from
   * <https://fingerprint.com/>
   * <https://twilio.com/>
   * <https://console.cloud.google.com/>

 * Replace API key in `/var/www/html/device-fingerprint/device-fingerprint.conf` (from fingerprint.com)
 * Replace API key in `/var/www/node/sms-verification-api/.env` (from twilio.com)
 * Replace API key in `/var/www/node/sso-api/.env` (from console.cloud.google.com)

## Replace vars in .credentials.env
 * Replace environment vars in `/var/www/.credentials.env` (can be any string, for example generate passwords via <https://www.random.org/strings/>)

## Download dependencies and start services
Run the installation script
```
bash /var/www/install.sh
```

