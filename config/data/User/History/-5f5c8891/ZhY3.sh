#!/bin/bash

# Datei lesen, in die Home Assistant schreibt
BRIGHTNESS_FILE="$(dirname "$0")/brightness.txt"
LOGFILE="$(dirname "$0")/ddc_debug.log"

if [ -f "$BRIGHTNESS_FILE" ]; then
    BRIGHTNESS=$(cat "$BRIGHTNESS_FILE")
    if [ -n "$BRIGHTNESS" ]; then
        echo "$(date): Host-Skript setzt Helligkeit auf $BRIGHTNESS%" >> "$LOGFILE"
        /usr/bin/ddcutil setvcp 10 "$BRIGHTNESS" --bus=14 >> "$LOGFILE" 2>&1
    fi
fi