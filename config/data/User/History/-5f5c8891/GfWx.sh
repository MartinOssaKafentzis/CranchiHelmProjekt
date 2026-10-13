#!/bin/bash

# Helligkeitswert aus dem zweiten Parameter lesen (z. B. "set 50")
BRIGHTNESS=$2

# Falls kein Wert übergeben wurde, abbrechen
if [ -z "$BRIGHTNESS" ]; then
    echo "$(date): Kein Helligkeitswert übergeben" >> /config/ddc_debug.log
    exit 1
fi

# Log-Eintrag schreiben
echo "$(date): Skript aufgerufen mit Helligkeit: $BRIGHTNESS%" >> /config/ddc_debug.log

# ddcutil auf dem Host ausführen
nsenter -t 1 -m -u -i -n /proc/1/root/usr/bin/ddcutil setvcp 10 "$BRIGHTNESS" --bus=14 >> /config/ddc_debug.log 2>&1