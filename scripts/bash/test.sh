#!/usr/bin/env bash

# ../.. of ScriptRoot
PROJECT_ROOT=$(dirname $(dirname $(dirname $(readlink -f "${BASH_SOURCE[0]}"))))

if [[ ! -f $PROJECT_ROOT/.path_verify ]] ; then
    echo "Could find file '.path_verify' in $PROJECT_ROOT!"
    exit
fi

# Define directories
HTML_DIR="$PROJECT_ROOT/html/"
NODE_DIR="$PROJECT_ROOT/node"
SCRIPTS_DIR="$PROJECT_ROOT/scripts"
SYSTEMD_DIR="$PROJECT_ROOT/systemd"
SETUP_DIR="$PROJECT_ROOT/setup"

count_changes() {
    local dir=$1
    local lang=$2

    if [ -d "$dir" ]; then
        git log --stat --pretty=tformat: --numstat -- "${dir}/*${lang}" ":(exclude)${PROJECT_ROOT}/html/jquery-ui-1.14.0.custom/*" | awk '{add+=$1; del+=$2} END {print "Additions:", add, "Deletions:", del}'
    fi
}

# Count lines for different file types in the respective directories
echo "Displaying Additions and Deletions of Code (data from git history)"

echo ""
echo "All Folders:"
echo "  html:    $(count_changes "$HTML_DIR" "html")"
echo "  js:      $(count_changes "$HTML_DIR" "js")"
echo "  py:      $(count_changes "$HTML_DIR" "py")"
echo "  css:     $(count_changes "$HTML_DIR" "css")"
echo "  sh:      $(count_changes "$HTML_DIR" "sh")"
echo "  service: $(count_changes "$HTML_DIR" "service")"

