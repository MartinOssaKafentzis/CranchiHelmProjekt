#!/bin/bash

BRIGHTNESS_FILE="$(dirname "$0")/brightness.txt"
LAST_BRIGHTNESS=""

echo "Helligkeits-Daemon gestartet..."

while true; do
    if [ -f "$BRIGHTNESS_FILE" ] && [ -s "$BRIGHTNESS_FILE" ]; then
        CURRENT_BRIGHTNESS=$(cat "$BRIGHTNESS_FILE" | tr -d ' \t\n\r')

        # ddcutil NUR ausführen, wenn sich der Wert geändert hat und nicht leer ist
        if [ -n "$CURRENT_BRIGHTNESS" ] && [ "$CURRENT_BRIGHTNESS" != "$LAST_BRIGHTNESS" ]; then
            echo "Ändere Helligkeit von '$LAST_BRIGHTNESS' auf '$CURRENT_BRIGHTNESS'..."
            
            # ddcutil mit Schnelligkeits-Flags (--async / --no-fetches)
            /usr/bin/ddcutil setvcp 10 "$CURRENT_BRIGHTNESS" --bus=14 --async >/dev/null 2>&1
            
            LAST_BRIGHTNESS="$CURRENT_BRIGHTNESS"
        fi
    fi
    
    # Prülle alle 2 Sekunde die Datei (sehr ressourcenschonend)
    sleep 2
done