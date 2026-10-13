import pymysql
import json
import os
import math
from datetime import datetime

# Konfiguration
DB_HOST = "192.168.10.3"
DB_USER = "Martin"
DB_PASS = "Piccolo_11"  # Dein Passwort eintragen
DB_NAME = "boot_db"

TRACK_FILE = "/config/www/current_track.json"
GPX_OUTPUT_DIR = "/config/www/boot_logbuch/"

def haversine_nm(lat1, lon1, lat2, lon2):
    # Berechnet Distanz in Seemeilen (NM)
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
        gpx_path = os.path.join(GPX_OUTPUT_DIR, gpx_filename)

        # 1. GPX-Datei erzeugen
        with open(gpx_path, "w") as gpx:
            gpx.write('<?xml version="1.0" encoding="UTF-8"?>\n')
            gpx.write('<gpx version="1.1" creator="HomeAssistant Cranchi">\n')
            gpx.write('  <trk><name>' + route_name + '</name><trkseg>\n')
            for pt in points:
                gpx.write(f'    <trkpt lat="{pt["lat"]}" lon="{pt["lon"]}"><time>{pt["time"]}</time></trkpt>\n')
            gpx.write('  </trkseg></trk>\n</gpx>')

        # 2. In MariaDB speichern
        try:
            db = pymysql.connect(host=DB_HOST, user=DB_USER, password=DB_PASS, database=DB_NAME)
            cursor = db.cursor()
            sql = "INSERT INTO logbuch (routen_name, distanz_nm, dauer_min, gpx_dateipfad) VALUES (%s, %s, %s, %s)"
            cursor.execute(sql, (route_name, round(total_dist_nm, 2), dauer_min, gpx_filename))
            db.commit()
            db.close()
            print("GPX und Logbuch-Eintrag erfolgreich erstellt!")
        except Exception as e:
            print(f"DB-Fehler: {e}")

        # Temp-Datei leeren
        os.remove(TRACK_FILE)