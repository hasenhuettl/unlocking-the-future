#!/bin/bash

set -e

###### Refer to https://arminreiter.com/2022/01/create-your-own-certificate-authority-ca-using-openssl/ ######
ROOTCA=RootCA
CLIENT=client
dns="device-certificates.hasenhuettl.cc"

# Get $PASSWORD
__dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source ${__dir}/.credentials.env

ip=`dig +short $dns`

cd /var/www
mkdir -p $ROOTCA
cd $ROOTCA

sudo apt install -y ca-certificates

# Generate RSA encrypted root private key
openssl genrsa \
  -aes256 \
  -out $ROOTCA.key \
  -passout pass:$PASSWORD \
  4096

# Create root certificate
openssl req \
  -x509 \
  -new \
  -nodes \
  -key $ROOTCA.key \
  -sha256 \
  -days 3650 \
  -out $ROOTCA.crt \
  -passin pass:$PASSWORD \
  -subj "/CN=$dns/C=AT/ST=Styria/L=Graz/O=hasenhuettl"

sudo cp $ROOTCA.crt /usr/local/share/ca-certificates
sudo update-ca-certificates

# Fedora/CentOS
# sudo cp $ROOTCA.crt /etc/pki/ca-trust/source/anchors/$ROOTCA.crt
# sudo update-ca-trust

#---- Intermediate CA Setup ----#
# Generate RSA encrypted private key
openssl genrsa \
  -aes256 \
  -out $CLIENT.key \
  -passout pass:$PASSWORD \
  4096

# Generate the CSR
openssl req \
  -new \
  -key $CLIENT.key \
  -out $CLIENT.csr \
  -passin pass:$PASSWORD \
  -subj "/CN=$dns/C=AT/ST=Styria/L=Graz/O=$CLIENT"

# create a v3 ext file for SAN properties (SAN = subject alternative name)
cat > $CLIENT.v3.ext << EOF
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
subjectAltName = @alt_names

[alt_names]
DNS.1 = $dns
IP.1 = $ip
EOF

# Create signed .crt file
openssl x509 \
  -req \
  -in $CLIENT.csr \
  -CA $ROOTCA.crt \
  -CAkey $ROOTCA.key \
  -CAcreateserial \
  -out $CLIENT.crt \
  -extfile $CLIENT.v3.ext \
  -passin pass:$PASSWORD \
  -days 730 \
  -sha256

###### Refer to https://gist.github.com/alexishida/607cca2e51ec356b1fe1909047ec70fd ######

# Convert Client Key to PKCS so that it may be installed in most browsers
openssl pkcs12 \
  -export \
  -legacy \
  -in client.crt \
  -inkey client.key \
  -out client.p12 \
  -passin pass:$PASSWORD \
  -passout pass:$PASSWORD

# TODO: To be able to install on MacOS, add the -legacy flag to the command above.
# However, current openssl have legacy disabled, so to enable legacy follow this: https://help.heroku.com/88GYDTB2/how-do-i-configure-openssl-to-allow-the-use-of-legacy-cryptographic-algorithms

# Convert Client Key to (combined) PEM
openssl pkcs12 \
  -nodes \
  -in $CLIENT.p12 \
  -passin pass:$PASSWORD \
  -out $CLIENT.pem \
  -clcerts

sudo cp $CLIENT.p12 /var/www/html/device-certificates/signup/$CLIENT.p12
sudo chmod +r /var/www/html/device-certificates/signup/$CLIENT.p12

