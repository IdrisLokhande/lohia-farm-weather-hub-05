import apprise
from apprise import NotifyFormat
import firebase_admin
from firebase_admin import credentials, db
import time



# 1. Initialize Apprise (Open Source Notification Library)
apobj = apprise.Apprise()

# Add Email (Using standard SMTP - replace with your details)
# To send to multiple receivers, append them at the end separated by slashes:
# mailto://userid:app_password@gmail.com/receiver1@example.com/receiver2@example.com
apobj.add('mailto://geosense552:mthoctfajzlaqfua@gmail.com/danish24co41@gmail.com?name=Geosense')

# Send a startup test email AFTER adding the service
print("🔄 Sending startup test email...")
apobj.notify(
    title="Lohia Farm - System Online",
    body="Your alert system script has started successfully and is listening for data. ✅"
)

# 2. Initialize Firebase
cred = credentials.Certificate('firebase_credentials.json')
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred, {
        'databaseURL': 'https://lohiafarm-default-rtdb.firebaseio.com/' 
    })

# Cooldown system to prevent spamming your phone/email
last_alert_time = 0
COOLDOWN_SECONDS = 3600 # Wait 1 hour (3600 seconds) between alerts

# --- ALERT THRESHOLDS ---
TEMP_THRESHOLD = 40# Send email ONLY if temp goes above 40
CO2_THRESHOLD = 1200  # Send email ONLY if CO2 goes above 1000
HUMIDITY_THRESHOLD = 80 # Send email if humidity goes above 85%
AQI_THRESHOLD = 150# Send email if AQI crosses into "Poor" territory

def calculate_india_aqi(pm25, pm10):
    """Calculates the Indian AQI dynamically based on PM2.5 and PM10"""
    def get_sub_index(cp, breakpoints):
        for bl, bh, il, ih in breakpoints:
            if bl <= cp <= bh:
                return ((ih - il) / (bh - bl)) * (cp - bl) + il
        return 500 if cp > breakpoints[-1][1] else 0

    pm25_bp = [(0,30,0,50), (31,60,51,100), (61,90,101,200), (91,120,201,300), (121,250,301,400), (251,500,401,500)]
    pm10_bp = [(0,50,0,50), (51,100,51,100), (101,250,101,200), (251,350,201,300), (351,430,301,400), (431,500,401,500)]

    try:
        return round(max(get_sub_index(pm25, pm25_bp), get_sub_index(pm10, pm10_bp)))
    except Exception:
        return 0

def handle_new_data(event):
    global last_alert_time

    data = event.data

    # Handle edge cases
    if data is None:
        return

    temp = 0
    co2 = 0
    humidity = 0
    pm25 = 0
    pm10 = 0

    # Handle partial updates (like editing a single field in Firebase console for testing)
    if not isinstance(data, dict):
        print(f"📝 Partial update detected at {event.path}: {data}")
        if 'temperature' in event.path:
            temp = float(data)
        elif 'co2' in event.path:
            co2 = float(data)
        elif 'humidity' in event.path:
            humidity = float(data)
        elif 'pm25' in event.path:
            pm25 = float(data)
        elif 'pm10' in event.path:
            pm10 = float(data)
        else:
            return
    else:
        # Handle full node updates (like when the hardware pushes a new reading)
        if event.path == '/' and len(data) > 1:
            try:
                latest_key = list(data.keys())[-1]
                data = data[latest_key]
            except Exception:
                pass
        
        temp = float(data.get('temperature', 0))
        co2 = float(data.get('co2', 0))
        humidity = float(data.get('humidity', 0))
        pm25 = float(data.get('pm25', 0))
        pm10 = float(data.get('pm10', 0))

    aqi = calculate_india_aqi(pm25, pm10)
    print(f"📡 [DATA] Temp: {temp}°C | Hum: {humidity}% | CO2: {co2}ppm | AQI: {aqi}")

    breaches = []
    actions = []

    # 1. Temperature Check
    if temp > TEMP_THRESHOLD:
        breaches.append(f"<li style='margin-bottom: 8px;'><b>🌡️ Temperature:</b> <span style='color:#d32f2f; font-weight:bold; font-size:16px;'>{temp}°C</span> <i style='color:#757575;'>(Limit: {TEMP_THRESHOLD}°C)</i></li>")
        actions.append("<li><b>Temperature Control:</b> Activate cooling fans immediately and verify greenhouse roof ventilation is fully open.</li>")

    # 2. Humidity Check
    if humidity > HUMIDITY_THRESHOLD:
        breaches.append(f"<li style='margin-bottom: 8px;'><b>💧 Humidity:</b> <span style='color:#d32f2f; font-weight:bold; font-size:16px;'>{humidity}%</span> <i style='color:#757575;'>(Limit: {HUMIDITY_THRESHOLD}%)</i></li>")
        actions.append("<li><b>Humidity Reduction:</b> Enable dehumidifiers or adjust heating to burn off excess airborne moisture.</li>")

    # 3. CO2 Check
    if co2 > CO2_THRESHOLD:
        breaches.append(f"<li style='margin-bottom: 8px;'><b>☁️ CO₂ Level:</b> <span style='color:#d32f2f; font-weight:bold; font-size:16px;'>{co2} ppm</span> <i style='color:#757575;'>(Limit: {CO2_THRESHOLD} ppm)</i></li>")
        actions.append("<li><b>CO₂ Management:</b> Increase fresh air intake. Check if organic matter composition in the area is decomposing too rapidly.</li>")

    # 4. Air Quality (AQI) Check
    if aqi > AQI_THRESHOLD:
        breaches.append(f"<li style='margin-bottom: 8px;'><b>🌫️ Air Quality (AQI):</b> <span style='color:#d32f2f; font-weight:bold; font-size:16px;'>{aqi}</span> <i style='color:#757575;'>(Limit: {AQI_THRESHOLD})</i></li>")
        actions.append("<li><b>Air Filtration:</b> Turn on local air filtration. High particulate matter can block stomata on plant leaves and restrict photosynthesis.</li>")

    if breaches:
        current_time = time.time()

        if current_time - last_alert_time > COOLDOWN_SECONDS:
            print("⚠️ THRESHOLD BREACHED! Sending email alert...")

            breach_html = "".join(breaches)
            action_html = "".join(actions)

            formatted_body = f"""
            <div style="font-family: 'Segoe UI', Arial, sans-serif; color: #333; max-width: 600px; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
                <div style="background-color: #d32f2f; color: white; padding: 15px 20px; text-align: left;">
                    <h2 style="margin: 0; font-size: 20px; font-weight: 600;">🚨 Lohia Farm Alert Engine</h2>
                    <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9;">CRITICAL THRESHOLD BREACH DETECTED</p>
                </div>
                <div style="padding: 24px;">
                    <h3 style="color: #d32f2f; border-bottom: 2px solid #ffebee; padding-bottom: 8px; font-size: 16px; margin-top: 0;">⚠️ Breached Parameters</h3>
                    <ul style="font-size: 15px; line-height: 1.5; padding-left: 20px; margin-bottom: 24px;">
                        {breach_html}
                    </ul>

                    <h3 style="color: #0277bd; border-bottom: 2px solid #e1f5fe; padding-bottom: 8px; font-size: 16px;">🛠️ Recommended Operations</h3>
                    <ul style="font-size: 14px; line-height: 1.6; padding-left: 20px; color: #424242;">
                        {action_html}
                    </ul>
                </div>
                <div style="background-color: #f5f5f5; color: #757575; text-align: center; padding: 12px; font-size: 12px; border-top: 1px solid #e0e0e0;">
                    📍 <b>Lohia Farm Monitoring System</b><br>
                    Automated Precision Agriculture Alerts
                </div>
            </div>
            """

            apobj.notify(
                title="⚠️ Lohia Farm | Alert Notification",
                body=formatted_body,
                body_format=NotifyFormat.HTML
            )

            last_alert_time = current_time
        else:
            time_left = int(COOLDOWN_SECONDS - (current_time - last_alert_time))
            print(f"⏳ Alert suppressed by COOLDOWN. Next email allowed in {time_left} seconds.")

print("🎧 Listening for Firebase updates to trigger alerts...")
db.reference('/weather').listen(handle_new_data)
