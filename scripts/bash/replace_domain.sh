#!/usr/bin/env bash

# Exit on error
set -e

# Usage: ./replace_domain.sh old_domain new_domain

# Check if exactly two arguments are provided
if [ "$#" -ne 2 ]; then
    echo "Command usage: $0 old_domain new_domain"
    exit 1
fi

# Assign arguments to variables
old_domain=$1
new_domain=$2

# ../.. of ScriptRoot
PROJECT_ROOT=$(dirname $(dirname $(dirname $(readlink -f "${BASH_SOURCE[0]}"))))

if [[ ! -f $PROJECT_ROOT/.path_verify ]] ; then
    echo ´Could find file ".path_verify" in $PROJECT_ROOT!´
    exit
fi

# Find and replace occurrences of old_domain with new_domain
find "$PROJECT_ROOT" -type f -not -path "$PROJECT_ROOT/.git/*" -exec sed -i "s/$old_domain/$new_domain/g" {} +

echo "Replaced all occurrences of $old_domain with $new_domain in all files under $PROJECT_ROOT."

