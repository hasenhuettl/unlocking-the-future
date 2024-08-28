#!/bin/bash

set -e

# Get script directory and credentials
__dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source ${__dir}/.credentials.env

# Install the prerequisite packages
sudo apt-get install -y apt-transport-https software-properties-common wget

# Import the GPG key
sudo mkdir -p /etc/apt/keyrings/
wget -q -O - https://apt.grafana.com/gpg.key | gpg --dearmor | sudo tee /etc/apt/keyrings/grafana.gpg > /dev/null

# Add repository for stable releases (if line not already exists)
myrepo="deb [signed-by=/etc/apt/keyrings/grafana.gpg] https://apt.grafana.com stable main"
grep -qxF "$myrepo" /etc/apt/sources.list.d/grafana.list || echo "$myrepo" | sudo tee -a /etc/apt/sources.list.d/grafana.list

# Updates the list of available packages
sudo apt-get update

# Installs the latest OSS release:
sudo apt-get install -y grafana

# Move old grafana config (if exists), then symlink to project config
sudo [ -f /etc/grafana/grafana.ini ] && sudo mv /etc/grafana/grafana.ini /etc/grafana/grafana.ini.old
sudo ln -s ${__dir}/grafana.ini /etc/grafana/grafana.ini
sudo chgrp grafana ${__dir}/grafana.ini

sudo systemctl daemon-reload
sudo systemctl enable grafana-server
sudo systemctl start grafana-server

