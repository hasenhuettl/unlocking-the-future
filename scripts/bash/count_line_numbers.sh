#!/usr/bin/env bash

# ../.. of ScriptRoot
PROJECT_ROOT=$(dirname $(dirname $(dirname $(readlink -f "${BASH_SOURCE[0]}"))))

if [[ ! -f $PROJECT_ROOT/.path_verify ]] ; then
    echo "Could find file '.path_verify' in $PROJECT_ROOT!"
    exit
fi

# Define directories
HTML_DIR="$PROJECT_ROOT/html"
NODE_DIR="$PROJECT_ROOT/node"
SCRIPTS_DIR="$PROJECT_ROOT/scripts"
SYSTEMD_DIR="$PROJECT_ROOT/systemd"
SETUP_DIR="$PROJECT_ROOT/setup"

# Function to count lines of specific file extensions in a directory
count_lines() {
    local dir=$1
    local ext=$2
    local total_lines=0

    if [ -d "$dir" ]; then
        for file in $(git ls-files "$dir" | grep -E "$ext$"); do
            if [ -f "$file" ]; then
                lines=$(wc -l < "$file")
                total_lines=$((total_lines + lines))
            fi
        done
    fi

    echo "$total_lines"
}

# Count lines for different file types in the respective directories

echo "Displaying line numbers in project"

echo ""
echo 'Folder "html":'
echo "  html:   $(count_lines "$HTML_DIR" "\.html")"
echo "  js:     $(count_lines "$HTML_DIR" "\.js")"
echo "  css:    $(count_lines "$HTML_DIR" "\.css")"

echo ""
echo 'Folder "node":'
echo "  html:   $(count_lines "$NODE_DIR" "\.html")"
echo "  js:     $(count_lines "$NODE_DIR" "\.js")"
echo "  css:    $(count_lines "$NODE_DIR" "\.css")"

echo ""
echo 'Folder "scripts":'
echo "  sh:     $(count_lines "$SCRIPTS_DIR" "\.sh")"

echo ""
echo 'Folder "setup":'
echo "  sh:     $(count_lines "$SETUP_DIR" "\.sh")"

echo ""
echo 'Folder "systemd":'
echo "  service: $(count_lines "$SYSTEMD_DIR" "\.service")"

