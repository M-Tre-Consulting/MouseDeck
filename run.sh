#!/usr/bin/env bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
export PATH="$HOME/.cargo/bin:$PATH"

if [ "$1" = "--dev" ]; then
    cd "$DIR"
    exec npm run tauri dev
elif [ -f "$DIR/src-tauri/target/debug/tauri-app" ]; then
    exec "$DIR/src-tauri/target/debug/tauri-app" "$@"
else
    cd "$DIR"
    exec npm run tauri dev
fi
