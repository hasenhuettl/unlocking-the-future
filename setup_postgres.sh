#!/bin/bash

set -e

database_name="auth_methods"

# Get credentials
__dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source ${__dir}/.credentials.env

# Create db and change postgres password
sudo -u postgres psql -c "CREATE DATABASE $database_name;"
sudo -u postgres psql -c "ALTER USER postgres with encrypted password '$POSTGRES';"

# Create user accounts
sudo -u postgres psql -c "DO \$\$
BEGIN
   IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticate') THEN
      CREATE USER authenticate WITH ENCRYPTED PASSWORD '$AUTHENTICATE';
   END IF;
   IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'grafana') THEN
      CREATE USER grafana WITH ENCRYPTED PASSWORD '$GRAFANA';
   END IF;
END
\$\$;"

# Set default privileges
sudo -u postgres psql -d $database_name -c "ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON TABLES TO authenticate;"
sudo -u postgres psql -d $database_name -c "ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON SEQUENCES TO authenticate;"

sudo -u postgres psql -d $database_name -c "ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT SELECT ON TABLES TO grafana;"
sudo -u postgres psql -d $database_name -c "ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT SELECT, USAGE ON SEQUENCES TO grafana;"

# Setup db schema
sudo -u postgres psql -d $database_name -f ${__dir}/schema.sql

