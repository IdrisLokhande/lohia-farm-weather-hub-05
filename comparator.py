import firebase_admin
from firebase_admin import credentials
from firebase_admin import db

# 1. Initialize Firebase Connection
cred = credentials.Certificate('firebase_credentials.json')
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred, {
        'databaseURL': 'https://lohiafarm-default-rtdb.firebaseio.com/' 
    })

def compare_latest():
    print("Fetching the absolute latest data from Firebase...")
    
    raw_ref = db.reference('/weather')
    clean_ref = db.reference('/clean_sensor_data')
    
    # Query Firebase to ONLY send us the last 1 record from each folder
    raw_query = raw_ref.order_by_key().limit_to_last(1).get()
    clean_query = clean_ref.order_by_key().limit_to_last(1).get()

    if not raw_query or not clean_query:
        print("Not enough data to compare.")
        return

    # Extract the unique IDs and the data inside them
    raw_key = list(raw_query.keys())[0]
    raw_latest = raw_query[raw_key]
    
    clean_key = list(clean_query.keys())[0]
    clean_latest = clean_query[clean_key]

    print("\n============================================================")
    print(f"[🕒] LATEST RAW RECORD (ID: {raw_key})")
    print(f"  > Temperature: {raw_latest.get('temperature')} °C")
    print(f"  > CO2:         {raw_latest.get('co2')} ppm")
    print(f"  > Humidity:    {raw_latest.get('humidity')} %")
    print(f"  > PM2.5:       {raw_latest.get('pm25')} µg/m³")

    print(f"\n[✨] LATEST CLEAN RECORD (ID: {clean_key})")
    print(f"  > Temperature: {clean_latest.get('temperature')} °C")
    print(f"  > CO2:         {clean_latest.get('co2')} ppm")
    print(f"  > Humidity:    {clean_latest.get('humidity')} %")
    print(f"  > PM2.5:       {clean_latest.get('pm25')} µg/m³")
    print("============================================================\n")
    
    # Sanity check to make sure the processor isn't lagging behind
    if raw_key == clean_key:
        print("✅ Status: PERFECT SYNC. The cleaner script is completely up to date.")
    else:
        print("⏳ Status: WAITING. The raw data just updated, waiting for the cleaner script to catch up.")

if __name__ == "__main__":
    compare_latest()