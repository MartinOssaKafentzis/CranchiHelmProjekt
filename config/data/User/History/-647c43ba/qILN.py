import pymysql

# Parameter deiner Synology DiskStation
DB_HOST = "192.168.10.3"   # IP-Adresse deiner DiskStation eintragen!
DB_PORT = 3307             # Port aus deinem MariaDB 10 Screenshot
DB_USER = "Martin"         # Oder dein angelegter DB-Benutzer
DB_PASS = "Piccolo_11"     # Dein MariaDB Passsowrt eintragen!
DB_NAME = "boot_db"

try:
    db = pymysql.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASS,
        database=DB_NAME
    )
    
    cursor = db.cursor()
    
    # Test-Eintrag in die Tabelle "logbuch" schreiben
    sql = "INSERT INTO logbuch (routen_name, distanz_nm, dauer_min) VALUES (%s, %s, %s)"
    val = ("Testfahrt Hafen", 5.2, 25)
    
    cursor.execute(sql, val)
    db.commit()
    
    print("Erfolg: Test-Eintrag wurde in MariaDB auf der Synology gespeichert!")
    db.close()

except Exception as e:
    print(f"Fehler bei der Verbindung zur Synology DB: {e}")