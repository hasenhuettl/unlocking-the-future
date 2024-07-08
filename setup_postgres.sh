#!/bin/bash

#set -e

database_name="auth_methods"

# Get password for postgresql user
__dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source ${__dir}/.credentials.env

sudo -u postgres psql -c "CREATE DATABASE $database_name;"
sudo -u postgres psql -c "ALTER USER postgres with encrypted password '$POSTGRES';"
#sudo -u postgres psql -c "CREATE USER authenticate with encrypted password '$POSTGRES';"
# sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $database_name TO authenticate;"
sudo -u postgres psql -d $database_name -f ${__dir}/schema.sql

