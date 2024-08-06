# authenticate.hasenhuettl.at
This is the private repository for the implementation part of the master thesis "Unlocking the Future: A Comparative Study of Authentication Methods" by David Hasenhüttl

## Pre-Requisites:
 * Linux environment with working internet connection (project build and tested on ubuntu server 22.04)
 * Required ports: 80, 443, 3000-3020, 5000, 5432
   * Port 80 and 443 have to be reachable for the clients

### This project requires node.js version 22 or above:
```
curl -sL https://deb.nodesource.com/setup_22.x | sudo -E bash -\nsudo apt-get install -y nodejs
```

## Installation

Clone repo content to /var/www/
```
cd /var/www
git clone https://github.com/hasenhuettl/authenticate.hasenhuettl.cc .
```
___Attention: Because of the punctuation at the end (clone into current dir), directory has to be empty or command will fail!___

### Change domain address
Change domain name to your personally owned domain, for example: contoso.com

**Warning! This command will replace all occurences of string 1 (hasenhuettl.cc) with string 2 (contoso.com) in ALL FILES IN THE SAME FOLDER OR ANY SUBFOLDER OF THE SCRIPT (/var/www/..)!**
**Do NOT move this command to any location with files other than this project!**
```
bash /var/www/replace_domain.sh hasenhuettl.cc contoso.com
```

### Get SSL certificates
Choose one of the following options to install SSL certificates:

 * Option A: Install certificates via certbot
```
bash /var/www/certificates_install.sh contoso.com
```

 * Option B: Copy certificate to the server and replace file path in the following files:
```
/auth.conf
/html/device-certificates/device-certificates.conf
/var/www/html/device-fingerprint/device-fingerprint.conf
```

Get API keys from <https://fingerprint.com/>, <https://console.cloud.google.com/> and <https://twilio.com/>

 * Replace API key in `/var/www/html/device-fingerprint/device-fingerprint.conf`
 * Replace API key in `/var/www/node/sms-verification-api/.env`
 * Replace API key in `/var/www/node/sso-api/.env`
 * Replace environment vars in `/var/www/.credentials.env` (can be any string)

### Download dependencies and start services
Run the installation script
```
bash /var/www/install.sh
```


