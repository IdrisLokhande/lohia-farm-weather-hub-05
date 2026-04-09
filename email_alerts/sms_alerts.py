import time
import sys
import apprise
from firebase_admin import db
from . import config

# 1. Verify SMS Credentials
required_sms_vars = {
    "TWILIO_ACCOUNT_SID": config.TWILIO_ACCOUNT_SID,
    "TWILIO_AUTH_TOKEN": config.TWILIO_AUTH_TOKEN,
    "TWILIO_FROM_NUMBER": config.TWILIO_FROM_NUMBER,
    "ADMIN_PHONE": config.ADMIN_PHONE,
}
missing_sms_vars = [k for k, v in required_sms_vars.items() if not v]

if missing_sms_vars:
    print("❌ CRITICAL ERROR: The following required SMS environment variables are missing:")
    for var in missing_sms_vars:
        print(f"   - {var}")
    print("\n   Please ensure they are set in your .env file for SMS alerts to work.")
    sys.exit(1)

# 2. Initialize Apprise for SMS
sms_apobj = apprise.Apprise()
twilio_url = f"twilio://{config.TWILIO_ACCOUNT_SID}:{config.TWILIO_AUTH_TOKEN}@{config.TWILIO_FROM_NUMBER}/{config.ADMIN_PHONE}"
sms_apobj.add(twilio_url)

print("📱 Sending startup test SMS...")
success = sms_apobj.notify(
    title="GeoSense",
    body="SMS Alert Engine is ONLINE and monitoring thresholds."
)
if not success:
    print("❌ FAILED to send startup SMS. Check your Twilio credentials, ensure ADMIN_PHONE has a country code (e.g., +91), and verify the number in Twilio if using a trial account.")

# 3. Initialize Firebase
config.initialize_firebase()

last_alert_time = 0

def send_dynamic_sms(title, body):
    """Fetches all latest phone numbers and sends SMS via Apprise."""
    apobj = apprise.Apprise()
    phones = config.get_all_sms_recipients()
    if not phones: return False
    phone_str = "/".join([p for p in phones if p]) # Join multiple numbers separated by slash
    twilio_url = f"twilio://{config.TWILIO_ACCOUNT_SID}:{config.TWILIO_AUTH_TOKEN}@{config.TWILIO_FROM_NUMBER}/{phone_str}"
    apobj.add(twilio_url)
    return apobj.notify(title=title, body=body)

def calculate_india_aqi(pm25, pm10):
    def get_sub_index(cp, breakpoints):
        for bl, bh, il, ih in breakpoints:
            if bl <= cp <= bh: return ((ih - il) / (bh - bl)) * (cp - bl) + il
        return 500 if cp > breakpoints[-1][1] else 0
    pm25_bp = [(0,30,0,50), (31,60,51,100), (61,90,101,200), (91,120,201,300), (121,250,301,400), (251,500,401,500)]
    pm10_bp = [(0,50,0,50), (51,100,51,100), (101,250,101,200), (251,350,201,300), (351,430,301,400), (431,500,401,500)]
    try: return round(max(get_sub_index(pm25, pm25_bp), get_sub_index(pm10, pm10_bp)))
    except Exception: return 0

def handle_new_data(event):
    global last_alert_time
    try:
        data = event.data
        if not data: return
        
        if event.path == '/' and isinstance(data, dict) and len(data) > 1:
            try: data = data[list(data.keys())[-1]]
            except Exception: pass
            
        if not isinstance(data, dict): return

        temp = float(data.get('temperature', 0))
        co2 = float(data.get('co2', 0))
        humidity = float(data.get('humidity', 0))
        aqi = calculate_india_aqi(float(data.get('pm25', 0)), float(data.get('pm10', 0)))

        breaches = []
        if temp > config.TEMP_THRESHOLD: breaches.append(f"🌡️ Temp: {temp}°C")
        if humidity > config.HUMIDITY_THRESHOLD: breaches.append(f"💧 Humidity: {humidity}%")
        if co2 > config.CO2_THRESHOLD: breaches.append(f"☁️ CO2: {co2} ppm")
        if aqi > config.AQI_THRESHOLD: breaches.append(f"🌫️ AQI: {aqi}")
    
        if breaches:
            current_time = time.time()
            if current_time - last_alert_time > config.THRESHOLD_ALERT_COOLDOWN:
                print("⚠️ THRESHOLD BREACHED! Sending SMS alert...")
                
                # Format SMS nicely with newlines and bullet points
                sms_body = "🚨 LOHIA FARM ALERT 🚨\n\nCritical thresholds breached:\n"
                for b in breaches:
                    sms_body += f"🔸 {b}\n"
                sms_body += "\nCheck dashboard immediately."
                
                notify_success = send_dynamic_sms(title="GeoSense Alert", body=sms_body)
                if notify_success:
                    print("✅ SMS sent successfully.")
                    last_alert_time = current_time
                else:
                    print("❌ FAILED to send threshold SMS alert.")
                
    except Exception as e:
        print(f"❌ Exception in handle_new_data (SMS): {e}")

print("🎧 SMS Engine: Listening for Firebase updates...")
db.reference('/weather').listen(handle_new_data)

# --- OFFLINE MONITORING WATCHDOG (SMS) ---
last_offline_alert_time = 0
print("🛡️ SMS Engine: Offline watchdog started...")
while True:
    try:
        time.sleep(60)
        latest_data = db.reference('/weather').order_by_key().limit_to_last(1).get()
        if not latest_data: continue
            
        last_update_ms = 0
        for val in latest_data.values():
            if isinstance(val, dict) and 'timestamp' in val: 
                last_update_ms = int(val['timestamp'])
                
        if last_update_ms == 0: continue
        time_since_update = (time.time() * 1000) - last_update_ms
        
        if time_since_update > (config.OFFLINE_TIMEOUT * 1000):
            current_time = time.time()
            if current_time - last_offline_alert_time > config.OFFLINE_ALERT_COOLDOWN:
                print("🔌 SENSORS OFFLINE DETECTED. Sending SMS alert...")
                
                send_dynamic_sms(
                    title="GeoSense Alert", 
                    body="🔌 LOHIA FARM OFFLINE 🔌\n\nMain weather station has not sent data for over 5 minutes.\n\nPlease check power and Wi-Fi."
                )
                last_offline_alert_time = current_time
                
    except Exception as e:
        print(f"⚠️ Error in SMS offline watchdog: {e}")