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

count_files() {
    local dir=$1
    local lang=$2
    local file_count=0

    if [ -d "$dir" ]; then
        for file in $(git ls-files "$dir" | grep -E "$lang$"); do
            if [ -f "$file" ]; then
                file_count=$((file_count + 1))
            fi
        done
    fi

    echo "$file_count"
}

# Function to count lines of specific file extensions in a directory
count_lines() {
    local dir=$1
    local lang=$2
    local total_lines=0

    if [ -d "$dir" ]; then
        for file in $(git ls-files "$dir" | grep -E "$lang$"); do
            if [ -f "$file" ]; then
                lines=$(wc -l < "$file")
                total_lines=$((total_lines + lines))
            fi
        done
    fi

    echo "$total_lines"
}

# Count lines for different file types in the respective directories

echo "Displaying current line numbers in project"

echo ""
echo 'Folder "html":'
echo "  html:   $(count_lines "$HTML_DIR" "html")"
echo "  js:     $(count_lines "$HTML_DIR" "js")"
echo "  css:    $(count_lines "$HTML_DIR" "css")"

echo ""
echo 'Folder "node":'
echo "  html:   $(count_lines "$NODE_DIR" "html")"
echo "  js:     $(count_lines "$NODE_DIR" "js")"
echo "  css:    $(count_lines "$NODE_DIR" "css")"

echo ""
echo 'Folder "scripts":'
echo "  sh:     $(count_lines "$SCRIPTS_DIR" "sh")"

echo ""
echo 'Folder "setup":'
echo "  sh:     $(count_lines "$SETUP_DIR" "sh")"

echo ""
echo 'Folder "systemd":'
echo "  service: $(count_lines "$SYSTEMD_DIR" "service")"

echo ""
echo "----------------------------------"
echo ""
echo 'All Folders:'
echo "  html:    $(count_lines "$PROJECT_ROOT" "html")	($(count_files "$PROJECT_ROOT" "html") Files)"
echo "  js:      $(count_lines "$PROJECT_ROOT" "js")	($(count_files "$PROJECT_ROOT" "js") Files)"
echo "  css:     $(count_lines "$PROJECT_ROOT" "css")	($(count_files "$PROJECT_ROOT" "css") Files)"
echo "  sh:      $(count_lines "$PROJECT_ROOT" "sh")	($(count_files "$PROJECT_ROOT" "sh") Files)"
echo "  service: $(count_lines "$PROJECT_ROOT" "service")	($(count_files "$PROJECT_ROOT" "service") Files)"

echo ""
echo "  ALL:    $(count_lines "$PROJECT_ROOT" "(html|js|css|sh|service)") ($(count_files "$PROJECT_ROOT" "(html|js|css|sh|service)") Files)"

