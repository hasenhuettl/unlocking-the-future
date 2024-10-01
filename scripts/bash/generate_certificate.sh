#!/bin/bash

set -e

dns="device-certificates.hasenhuettl.cc"
ip=`dig +short $dns`

if [ $1 ]
then
  CLIENT=$1
else
  echo ERROR: Please pass your username as an argument: ./script mmustermann
  exit 1
fi

# ../.. of ScriptRoot
PROJECT_ROOT=$(dirname $(dirname $(dirname $(readlink -f "${BASH_SOURCE[0]}"))))

if [[ ! -f $PROJECT_ROOT/.path_verify ]] ; then
    echo ´Could find file ".path_verify" in $PROJECT_ROOT!´
    exit
fi

ROOTCA=$PROJECT_ROOT/RootCA/RootCA

# Get $PASSWORD
source $PROJECT_ROOT/setup/.credentials.env

cd $PROJECT_ROOT/html/device-certificates/certs

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
  -in $CLIENT.crt \
  -inkey $CLIENT.key \
  -out $CLIENT.p12 \
  -passin pass:$PASSWORD \
  -passout pass:$PASSWORD

# TODO: To be able to install on MacOS, add the -legacy flag to the command above.
# However, current openssl versions have legacy mode disabled, so to enable legacy follow this: https://help.heroku.com/88GYDTB2/how-do-i-configure-openssl-to-allow-the-use-of-legacy-cryptographic-algorithms

# Convert Client Key to (combined) PEM
openssl pkcs12 \
  -nodes \
  -in $CLIENT.p12 \
  -passin pass:$PASSWORD \
  -out $CLIENT.pem \
  -clcerts

chmod +r $CLIENT.p12

