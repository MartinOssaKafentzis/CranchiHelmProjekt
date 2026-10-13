import pymysql
import json
from datetime import datetime

# 1. Verbindung zur Synology MariaDB aufbauen
# Ersetze 192.168.1.XXX durch die IP deiner DiskStation!
db = pymysql.connect(
    host="192.168.10.3",
    user="Martin",
    password="Piccolo_11",
    database="boot_db"
)

cursor = db.cursor()

# 2. Beispiel-Eintrag fürs Logbuch in die Datenbank schreiben
sql = "INSERT INTO logbuch (routen_name, distanz_nm, dauer_min) VALUES (%s, %s, %s)"
val = ("Ausfahrt Ambrakischer Golf", 12.4, 45)

cursor.execute(sql, val)
db.commit()

print("Logbuch-Eintrag erfolgreich auf Synology gespeichert!")
db.close()