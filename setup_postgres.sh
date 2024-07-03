#!/bin/bash

set -e

database_name="auth_methods"

# Get $POSTGRES
__dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source ${__dir}/.credentials.env

sudo -u postgres psql -c "CREATE DATABASE $database_name;"
sudo -u postgres psql -c "ALTER USER postgres with encrypted password '$POSTGRES';"
sudo -u postgres psql -d $database_name -f ${__dir}/schema.sql

