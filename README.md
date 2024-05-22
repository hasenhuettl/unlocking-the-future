This is the private repository for the MA thesis "Unlocking the Future: A Comparative Study of Authentication Methods" of David Hasenhüttl

Pre-Requisites:
sudo apt-get install nginx

If current node.js version is not installed:
curl -sL https://deb.nodesource.com/setup_22.x | sudo -E bash -\nsudo apt-get install -y nodejs

For certificates:
apt install certbot

pip install deepface tf-keras TensorRT 
npm install multer express koa-router koa-mount

Installation:

clone repo content to /var/www/ (Example: /var/www/install.sh)

Run install.sh

Install certbot and replace keyfile paths as well as domainname references in /var/www/node projects

Make sure default config is disabled:
rm /etc/nginx/sites-enabled/default

Replace API key in /var/www/html/gps-verification/gps-verification.conf


