#!/bin/bash

# Usage: ./replace_domain.sh old_domain new_domain

# Check if exactly two arguments are provided
if [ "$#" -ne 2 ]; then
    echo "Command usage: $0 old_domain new_domain"
    exit 1
fi

# Assign arguments to variables
old_domain=$1
new_domain=$2

# Get the directory where the script is located
scriptroot=$(dirname "$0")

# Find and replace occurrences of old_domain with new_domain
find "$scriptroot" -type f -exec sed -i "s/$old_domain/$new_domain/g" {} +

echo "Replaced all occurrences of $old_domain with $new_domain in all files under $scriptroot."

