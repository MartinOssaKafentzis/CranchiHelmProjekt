#!/bin/bash

BRIGHTNESS=$2
LOGFILE="$(dirname "$0")/ddc_debug.log"

if [ -z "$BRIGHTNESS" ]; then
    echo "$(date): Kein Helligkeitswert übergeben" >> "$LOGFILE"
    exit 1
fi

echo "$(date): Skript aufgerufen mit Helligkeit: $BRIGHTNESS%" >> "$LOGFILE"

# Voller Wechsel in den Host-Mount-Namespace über /proc/1/ns/mnt
nsenter --target 1 --mount=/proc/1/ns/mnt --uts --ipc --net /usr/bin/ddcutil setvcp 10 "$BRIGHTNESS" --bus=14 >> "$LOGFILE" 2>&1
