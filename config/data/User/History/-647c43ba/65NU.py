import pymysql

# Verbindung zu deiner Synology MariaDB 10 herstellen
try:
    db = pymysql.connect(
        host="192.168.10.3",  # IP-Adresse deiner Synology DiskStation
        user="Martin",           # Oder der neu angelegte DB-Benutzer
        password="Piccolo_11",
        database="boot_db"
    )
    
    cursor = db.cursor()
    
    # Test-Eintrag in die Datenbank schreiben
    sql = "INSERT INTO logbuch (routen_name, distanz_nm, dauer_min) VALUES (%s, %s, %s)"
    val = ("Testfahrt Hafen", 5.2, 25)
    
    cursor.execute(sql, val)
    db.commit()
    
    print("Erfolg: Test-Eintrag wurde in MariaDB auf der Synology gespeichert!")
    db.close()

except Exception as e:
    print(f"Fehler bei der Verbindung: {e}")