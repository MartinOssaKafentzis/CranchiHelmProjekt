#!/bin/bash

BRIGHTNESS_FILE="$(dirname "$0")/brightness.txt"

if [ -f "$BRIGHTNESS_FILE" ]; then
    BRIGHTNESS=$(cat "$BRIGHTNESS_FILE")
    if [ -n "$BRIGHTNESS" ]; then
        /usr/bin/ddcutil setvcp 10 "$BRIGHTNESS" --bus=14 >/dev/null 2>&1

    fi
fi