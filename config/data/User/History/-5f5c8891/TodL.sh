#!/bin/bash

BRIGHTNESS=$2
LOGFILE="$(dirname "$0")/ddc_debug.log"

if [ -z "$BRIGHTNESS" ]; then
    echo "$(date): Kein Helligkeitswert übergeben" >> "$LOGFILE"
    exit 1
fi

echo "$(date): Skript aufgerufen mit Helligkeit: $BRIGHTNESS%" >> "$LOGFILE"

# nsenter wechselt explizit das Root-Verzeichnis auf den Pi-Host
nsenter -t 1 -m -u -i -n --root=/proc/1/root /usr/bin/ddcutil setvcp 10 "$BRIGHTNESS" --bus=14 >> "$LOGFILE" 2>&1