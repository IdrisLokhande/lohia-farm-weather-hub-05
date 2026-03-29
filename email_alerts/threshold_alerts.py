import time
import apprise
from apprise import NotifyFormat
from firebase_admin import db
from . import config

# 1. Initialize Apprise
apobj = apprise.Apprise()
apobj.add(f'mailto://{config.EMAIL_SENDER.split("@")[0]}:{config.EMAIL_APP_PASSWORD}@gmail.com/{config.ADMIN_EMAIL}?name=Geosense')

print("🔄 Sending startup test email...")
startup_success = apobj.notify(
    title="Lohia Farm - System Online",
    body="Your threshold alert system has started successfully and is listening for data. ✅"
)
if not startup_success:
    print("❌ CRITICAL ERROR: Startup email failed! Check SMTP ports, .env variables, or login rejections.")

# 2. Initialize Firebase
config.initialize_firebase()

last_alert_time = 0

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
        if data is None: return
        temp, co2, humidity, pm25, pm10 = 0, 0, 0, 0, 0
    
        if not isinstance(data, dict):
            if 'temperature' in event.path: temp = float(data)
            elif 'co2' in event.path: co2 = float(data)
            elif 'humidity' in event.path: humidity = float(data)
            elif 'pm25' in event.path: pm25 = float(data)
            elif 'pm10' in event.path: pm10 = float(data)
            else: return
        else:
            if event.path == '/' and len(data) > 1:
                try: data = data[list(data.keys())[-1]]
                except Exception: pass
            temp = float(data.get('temperature', 0))
            co2 = float(data.get('co2', 0))
            humidity = float(data.get('humidity', 0))
            pm25 = float(data.get('pm25', 0))
            pm10 = float(data.get('pm10', 0))

        aqi = calculate_india_aqi(pm25, pm10)
        breaches, actions = [], []
    
        if temp > config.TEMP_THRESHOLD:
            breaches.append(f"<li><b>🌡️ Temperature:</b> {temp}°C (Limit: {config.TEMP_THRESHOLD}°C)</li>")
            actions.append("<li>Activate cooling fans immediately.</li>")
        if humidity > config.HUMIDITY_THRESHOLD:
            breaches.append(f"<li><b>💧 Humidity:</b> {humidity}% (Limit: {config.HUMIDITY_THRESHOLD}%)</li>")
            actions.append("<li>Enable dehumidifiers to burn off moisture.</li>")
        if co2 > config.CO2_THRESHOLD:
            breaches.append(f"<li><b>☁️ CO₂ Level:</b> {co2} ppm (Limit: {config.CO2_THRESHOLD} ppm)</li>")
            actions.append("<li>Increase fresh air intake.</li>")
        if aqi > config.AQI_THRESHOLD:
            breaches.append(f"<li><b>🌫️ AQI:</b> {aqi} (Limit: {config.AQI_THRESHOLD})</li>")
            actions.append("<li>Turn on local air filtration.</li>")
    
        if breaches:
            current_time = time.time()
            if current_time - last_alert_time > config.THRESHOLD_ALERT_COOLDOWN:
                print("⚠️ THRESHOLD BREACHED! Sending email alert...")
                breach_html, action_html = "".join(breaches), "".join(actions)
                
                formatted_body = f"""
                <div style="font-family: 'Segoe UI', Arial, sans-serif; color: #333; max-width: 600px; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
                    <div style="background-color: #d32f2f; color: white; padding: 15px 20px; text-align: left;">
                        <h2 style="margin: 0; font-size: 20px; font-weight: 600;">🚨 Lohia Farm Alert Engine</h2>
                        <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9;">CRITICAL THRESHOLD BREACH</p>
                    </div>
                    <div style="padding: 24px;">
                        <h3 style="color: #d32f2f; border-bottom: 2px solid #ffebee; padding-bottom: 8px; font-size: 16px; margin-top: 0;">⚠️ Breached Parameters</h3>
                        <ul style="font-size: 15px; line-height: 1.5; padding-left: 20px; margin-bottom: 24px;">{breach_html}</ul>

                        <h3 style="color: #0277bd; border-bottom: 2px solid #e1f5fe; padding-bottom: 8px; font-size: 16px;">🛠️ Recommended Operations</h3>
                        <ul style="font-size: 14px; line-height: 1.6; padding-left: 20px; color: #424242;">{action_html}</ul>
                    </div>
                    <div style="background-color: #f5f5f5; color: #757575; text-align: center; padding: 12px; font-size: 12px; border-top: 1px solid #e0e0e0;">
                        📍 <b>Lohia Farm Monitoring System</b>
                    </div>
                </div>
                """
                all_recipients = config.get_all_recipients()

                alert_apobj = apprise.Apprise()
                alert_apobj.add(f"mailto://{config.EMAIL_SENDER.split('@')[0]}:{config.EMAIL_APP_PASSWORD}@gmail.com/{'/'.join(all_recipients)}?name=Geosense")
                alert_apobj.notify(title="⚠️ Lohia Farm | Alert Notification", body=formatted_body, body_format=NotifyFormat.HTML)
                last_alert_time = current_time
                
    except Exception as e:
        print(f"❌ Exception in handle_new_data: {e}")

print("🎧 Listening for Firebase updates to trigger alerts...")
db.reference('/weather').listen(handle_new_data)

# --- OFFLINE MONITORING WATCHDOG ---
last_offline_alert_time = 0
print("🛡️ Offline watchdog started. Monitoring sensor heartbeat...")
while True:
    try:
        time.sleep(60)
        latest_data = db.reference('/weather').order_by_key().limit_to_last(1).get()
        if not latest_data: continue
            
        last_update_ms = 0
        latest_record = {}
        for val in latest_data.values():
            if isinstance(val, dict) and 'timestamp' in val: 
                last_update_ms = int(val['timestamp'])
                latest_record = val
                
        if last_update_ms == 0: continue
        time_since_update = (time.time() * 1000) - last_update_ms
        
        is_fully_offline = False
        offline_sensors = []

        # 1. Check if the entire station is offline
        if time_since_update > (config.OFFLINE_TIMEOUT * 1000):
            is_fully_offline = True
            offline_sensors = [
                "🌡️ Temperature Sensor",
                "💧 Humidity Sensor",
                "☁️ CO₂ Sensor",
                "🌫️ Air Quality (PM) Sensor",
                "☀️ Light / Pressure Sensors"
            ]
        else:
            # 2. Check if the station is online, but individual sensors are broken/reporting error codes
            temp = float(latest_record.get('temperature', 0))
            hum = float(latest_record.get('humidity', 0))
            co2 = float(latest_record.get('co2', 0))
            pm25 = float(latest_record.get('pm25', 0))
            
            if temp <= 0 or temp >= 125: offline_sensors.append("🌡️ Temperature Sensor")
            if hum <= 0 or hum >= 100: offline_sensors.append("💧 Humidity Sensor")
            if co2 <= 0 or co2 >= 3000: offline_sensors.append("☁️ CO₂ Sensor")
            if pm25 <= 0: offline_sensors.append("🌫️ Air Quality (PM) Sensor")

        # 3. Trigger alert if either the station or any specific sensor is offline
        if is_fully_offline or offline_sensors:
            current_time = time.time()
            if current_time - last_offline_alert_time > config.OFFLINE_ALERT_COOLDOWN:
                print(f"🔌 SENSORS OFFLINE DETECTED (Fully Offline: {is_fully_offline}). Sending alert...")
                
                header_text = "SENSORS OFFLINE" if is_fully_offline else "PARTIAL SENSOR FAULT"
                desc_text = "The monitoring system has not received any new data from the main station for over <b>5 minutes</b>." if is_fully_offline else "The main weather station is online, but the following specific sensors are reporting invalid data (0 or error codes) and appear to be damaged:"
                
                troubleshoot_html = "<li><b>Power / Network:</b> Check weather station power and verify Wi-Fi at Lohia Farm.</li>" if is_fully_offline else "<li><b>Wiring / Debris:</b> Check the I2C/UART cables connecting the failing sensor. Clean the sensor if clogged with dust.</li><li><b>Replacement:</b> The specific sensor module may be burnt out and require replacement.</li>"
                
                sensors_list_html = "".join([f"<li style='margin-bottom: 4px; font-weight: bold; color: #d32f2f;'>{s}</li>" for s in offline_sensors])

                formatted_body = f"""
                <div style="font-family: 'Segoe UI', Arial, sans-serif; color: #333; max-width: 600px; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
                    <div style="background-color: #f57c00; color: white; padding: 15px 20px; text-align: left;">
                        <h2 style="margin: 0; font-size: 20px; font-weight: 600;">🔌 Lohia Farm System Alert</h2>
                        <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9;">{header_text}</p>
                    </div>
                    <div style="padding: 24px;">
                        <h3 style="color: #f57c00; border-bottom: 2px solid #fff3e0; padding-bottom: 8px; font-size: 16px; margin-top: 0;">⚠️ Connectivity Lost</h3>
                        <p style="font-size: 15px; line-height: 1.5; margin-bottom: 16px;">{desc_text}</p>
                        <ul style="font-size: 15px; margin-bottom: 24px; padding-left: 20px;">
                            {sensors_list_html}
                        </ul>
                        <h3 style="color: #0277bd; border-bottom: 2px solid #e1f5fe; padding-bottom: 8px; font-size: 16px;">🛠️ Recommended Operations</h3>
                        <ul style="font-size: 14px; line-height: 1.6; padding-left: 20px; color: #424242;">
                            {troubleshoot_html}
                        </ul>
                    </div>
                    <div style="background-color: #f5f5f5; color: #757575; text-align: center; padding: 12px; font-size: 12px; border-top: 1px solid #e0e0e0;">
                        📍 <b>Lohia Farm Monitoring System</b>
                    </div>
                </div>
                """
                all_recipients = config.get_all_recipients()
                        
                alert_apobj = apprise.Apprise()
                alert_apobj.add(f"mailto://{config.EMAIL_SENDER.split('@')[0]}:{config.EMAIL_APP_PASSWORD}@gmail.com/{'/'.join(all_recipients)}?name=Geosense")
                alert_apobj.notify(title="🔌 Lohia Farm | Hardware/Sensor Fault", body=formatted_body, body_format=NotifyFormat.HTML)
                last_offline_alert_time = current_time
                
    except Exception as e:
        print(f"⚠️ Error in offline watchdog: {e}")