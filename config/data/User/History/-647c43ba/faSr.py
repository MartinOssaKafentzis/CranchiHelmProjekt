import subprocess
import json

# Parameter für deine Synology DiskStation
DB_HOST = "192.168.1.XXX"  # IP deiner DiskStation
DB_PORT = "3307"
DB_USER = "Martin"
DB_PASS = "Piccolo_11"
DB_NAME = "boot_db"

# SQL-Befehl ausführen über das mitgelieferte mariadb/mysql CLI
sql_command = f"USE {DB_NAME}; INSERT INTO logbuch (routen_name, distanz_nm, dauer_min) VALUES ('Testfahrt Hafen', 5.2, 25);"

cmd = f"mysql -h {DB_HOST} -P {DB_PORT} -u {DB_USER} -p'{DB_PASS}' -e \"{sql_command}\""

try:
    result = subprocess.run(cmd, shell=True, check=True, capture_output=True, text=True)
    print("Erfolg: Test-Eintrag wurde in MariaDB auf der Synology gespeichert!")
except subprocess.CalledProcessError as e:
    print(f"Fehler bei der Ausführung: {e.stderr}")