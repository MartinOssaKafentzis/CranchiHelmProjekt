import pymysql
import json
import os
import math
from datetime import datetime
from ftplib import FTP

# 1. Konfiguration für Synology DiskStation
DS_HOST = "192.168.10.3"
DS_USER = "Martin"
DS_PASS = "Piccolo_11"  # Dein DiskStation Passwort
DB_NAME = "boot_db"
FTP_TARGET_DIR = "/share/boot_logbuch/"  # Pfad auf der DiskStation

# Lokale Pfade auf dem Pi
TRACK_FILE = "/config/www/current_track.json"
LOCAL_TEMP_DIR = "/config/www/boot_logbuch/"

def haversine_nm(lat1, lon1, lat2, lon2):
    R = 3440.065
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dlambda/2)**2
    return 2 * R * math.atan2(math.sqrt(a), math.sqrt(1 - a))

if os.path.exists(TRACK_FILE):
    with open(TRACK_FILE, "r") as f:
        points = json.load(f)
    
    if len(points) > 1:
        # Distanz & Dauer berechnen
        total_dist_nm = 0.0
        for i in range(1, len(points)):
            total_dist_nm += haversine_nm(points[i-1]['lat'], points[i-1]['lon'], points[i]['lat'], points[i]['lon'])
        
        start_time = datetime.fromisoformat(points[0]['time'])
        end_time = datetime.fromisoformat(points[-1]['time'])
        dauer_min = int((end_time - start_time).total_seconds() / 60)
        route_name = f"Törn {start_time.strftime('%Y-%m-%d %H:%M')}"
        gpx_filename = f"track_{start_time.strftime('%Y%m%d_%H%M%S')}.gpx"
        local_gpx_path = os.path.join(LOCAL_TEMP_DIR, gpx_filename)

        # A. Lokale GPX-Datei erzeugen
        os.makedirs(LOCAL_TEMP_DIR, exist_ok=True)
        with open(local_gpx_path, "w") as gpx:
            gpx.write('<?xml version="1.0" encoding="UTF-8"?>\n')
            gpx.write('<gpx version="1.1" creator="HomeAssistant Cranchi">\n')
            gpx.write('  <trk><name>' + route_name + '</name><trkseg>\n')
            for pt in points:
                gpx.write(f'    <trkpt lat="{pt["lat"]}" lon="{pt["lon"]}"><time>{pt["time"]}</time></trkpt>\n')
            gpx.write('  </trkseg></trk>\n</gpx>')

        # B. Datei direkt auf die Synology DiskStation via FTP hochladen
        try:
            ftp = FTP(DS_HOST)
            ftp.login(user=DS_USER, passwd=DS_PASS)
            ftp.cwd(FTP_TARGET_DIR)
            with open(local_gpx_path, 'rb') as file_to_upload:
                ftp.storbinary(f'STOR {gpx_filename}', file_to_upload)
            ftp.quit()
            print("GPX-Datei erfolgreich auf die DiskStation hochgeladen!")
        except Exception as e:
            print(f"FTP Upload Fehler: {e}")

        # C. Metadaten & Dateipfad in der MariaDB speichern
        try:
            db = pymysql.connect(host=DS_HOST, user=DS_USER, password=DS_PASS, database=DB_NAME)
            cursor = db.cursor()
            sql = "INSERT INTO logbuch (routen_name, distanz_nm, dauer_min, gpx_dateipfad) VALUES (%s, %s, %s, %s)"
            cursor.execute(sql, (route_name, round(total_dist_nm, 2), dauer_min, gpx_filename))
            db.commit()
            db.close()
            print("Logbuch-Eintrag in MariaDB gespeichert!")
        except Exception as e:
            print(f"DB-Fehler: {e}")

        # Temp-JSON leeren
        os.remove(TRACK_FILE)