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
startup_success = apobj.notify(
    title="Lohia Farm - System Online",
    body="Your alert system script has started successfully and is listening for data. ✅"
)
if not startup_success:
    print("❌ CRITICAL ERROR: Startup email failed! Your remote server is likely blocking outbound SMTP ports, or Google rejected the login from this IP.")

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
TEMP_THRESHOLD = 40   # Send email ONLY if temp goes above 40°C
CO2_THRESHOLD = 1200  # Send email ONLY if CO2 goes above 1200 ppm
HUMIDITY_THRESHOLD = 80 # Send email ONLY if humidity goes above 80%
AQI_THRESHOLD = 150   # Send email ONLY if AQI crosses into "Poor" territory (150+)

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
    
    try:
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
                    <span style="font-size: 10px; opacity: 0.7; display: block; margin-top: 8px;">To unsubscribe, visit the dashboard and select 'Unsubscribe' in the alerts menu.</span>
                </div>
            </div>
            """

            print("📡 Fetching active subscribers from Firebase...")
            sub_ref = db.reference('/subscribers').get()
            subscriber_emails = []
            if sub_ref:
                for key, val in sub_ref.items():
                    if isinstance(val, dict) and val.get('email'):
                        subscriber_emails.append(val['email'])

            # Generate dynamic Apprise URL with all unique subscriber emails attached
            alert_apobj = apprise.Apprise()
            
            # Use a set for automatic deduplication of recipients
            all_recipients = {'danish24co41@gmail.com'}
            if subscriber_emails:
                for email in subscriber_emails:
                    all_recipients.add(email)
            
            recipients_string = '/'.join(list(all_recipients))
            alert_apobj.add(f'mailto://geosense552:mthoctfajzlaqfua@gmail.com/{recipients_string}?name=Geosense')

            alert_success = alert_apobj.notify(
                title="⚠️ Lohia Farm | Alert Notification",
                body=formatted_body,
                body_format=NotifyFormat.HTML
            )
            if not alert_success:
                print("❌ FAILED to send threshold email. Check remote SMTP blocking.")

            last_alert_time = current_time
        else:
            time_left = int(COOLDOWN_SECONDS - (current_time - last_alert_time))
            print(f"⏳ Alert suppressed by COOLDOWN. Next email allowed in {time_left} seconds.")
            
    except Exception as e:
        print(f"❌ Unhandled Exception in handle_new_data thread: {e}")

# --- NEW SUBSCRIBER MONITORING ---
def process_subscriber_record(key, val):
    """Processes a single subscriber record from the database."""
    email = val.get('email')
    if not email:
        return

    # Priority 1: Handle unsubscribe requests
    if val.get('unsubscribe_request'):
        print(f"Processing unsubscribe for {email}...")
        send_unsubscribe_email(email)
        # After sending, delete the record.
        db.reference(f'/subscribers/{key}').delete()
        return # Stop further processing

    # Priority 2: Handle welcome emails for new users
    if not val.get('welcome_sent'):
        print(f"Processing new subscription for {email}...")
        send_welcome_email(email)
        # After sending, update the record with a flag.
        db.reference(f'/subscribers/{key}').update({'welcome_sent': True})

def handle_new_subscriber(event):
    try:
        if not event.data:
            return

        if event.path == '/':
            subscribers = event.data
            for key, val in subscribers.items():
                if isinstance(val, dict):
                    process_subscriber_record(key, val)
        elif event.path != '/':
            key = event.path.lstrip('/')
            val = event.data
            if isinstance(val, dict):
                process_subscriber_record(key, val)

    except Exception as e:
        print(f"❌ Unhandled Exception in handle_new_subscriber thread: {e}")

def send_unsubscribe_email(recipient_email):
    """Sends a well-formatted HTML email confirming the user has been unsubscribed."""
    print(f"🚫 User unsubscribed: {recipient_email}. Sending confirmation email...")
    unsubscribe_apobj = apprise.Apprise()
    
    # Create a dynamic URL to send only to the unsubscribed user
    base_url = f'mailto://geosense552:mthoctfajzlaqfua@gmail.com/{recipient_email}?name=Geosense'
    unsubscribe_apobj.add(base_url)
    
    formatted_body = """
    <div style="font-family: 'Segoe UI', Arial, sans-serif; color: #333; max-width: 600px; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
        <div style="background-color: #757575; color: white; padding: 15px 20px; text-align: left;">
            <h2 style="margin: 0; font-size: 20px; font-weight: 600;">Lohia Farm Alerts</h2>
            <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9;">UNSUBSCRIBE CONFIRMED</p>
        </div>
        <div style="padding: 24px;">
            <h3 style="color: #424242; border-bottom: 2px solid #f5f5f5; padding-bottom: 8px; font-size: 16px; margin-top: 0;">🚫 You have been unsubscribed.</h3>
            <p style="font-size: 15px; line-height: 1.5; margin-bottom: 24px;">
                This email confirms that you have been successfully removed from the <b>Lohia Farm Precision Agriculture Dashboard</b> alert system. You will no longer receive any notifications.
            </p>
            <p style="font-size: 14px; color: #555;">
                If you wish to subscribe again in the future, you can do so at any time from the dashboard. If you believe this was a mistake, please contact the administrator.
            </p>
        </div>
        <div style="background-color: #f5f5f5; color: #757575; text-align: center; padding: 12px; font-size: 12px; border-top: 1px solid #e0e0e0;">
            📍 <b>Lohia Farm Monitoring System</b>
        </div>
    </div>
    """
    
    unsubscribe_success = unsubscribe_apobj.notify(
        title="Lohia Farm | Unsubscribe Confirmed",
        body=formatted_body,
        body_format=NotifyFormat.HTML
    )
    if not unsubscribe_success:
        print(f"❌ FAILED to send unsubscribe email to {recipient_email}")

def send_welcome_email(recipient_email):
    """Sends a well-formatted HTML email welcoming a new subscriber."""
    print(f"👋 New subscriber detected: {recipient_email}. Sending welcome email...")
    welcome_apobj = apprise.Apprise()
    
    # Create a dynamic URL to send only to the new subscriber
    base_url = f'mailto://geosense552:mthoctfajzlaqfua@gmail.com/{recipient_email}?name=Geosense'
    welcome_apobj.add(base_url)
    
    formatted_body = """
    <div style="font-family: 'Segoe UI', Arial, sans-serif; color: #333; max-width: 600px; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
        <div style="background-color: #10b981; color: white; padding: 15px 20px; text-align: left;">
            <h2 style="margin: 0; font-size: 20px; font-weight: 600;">🌿 Welcome to Lohia Farm Alerts</h2>
            <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9;">SUBSCRIPTION CONFIRMED</p>
        </div>
        <div style="padding: 24px;">
            <h3 style="color: #10b981; border-bottom: 2px solid #ecfdf5; padding-bottom: 8px; font-size: 16px; margin-top: 0;">✅ You are now subscribed!</h3>
            <p style="font-size: 15px; line-height: 1.5; margin-bottom: 24px;">
                Thank you for subscribing to the <b>Lohia Farm Precision Agriculture Dashboard</b> alert system. You will now receive real-time notifications if any environmental parameters (Temperature, CO₂, Humidity, AQI) breach critical thresholds, or if the sensors go offline.
            </p>
            <p style="font-size: 14px; color: #555;">
                <i>If you did not request this, please contact the administrator.</i>
            </p>
        </div>
        <div style="background-color: #f5f5f5; color: #757575; text-align: center; padding: 12px; font-size: 12px; border-top: 1px solid #e0e0e0;">
            📍 <b>Lohia Farm Monitoring System</b><br>
            Automated Precision Agriculture Alerts
            <span style="font-size: 10px; opacity: 0.7; display: block; margin-top: 8px;">To unsubscribe, visit the dashboard and select 'Unsubscribe' in the alerts menu.</span>
        </div>
    </div>
    """
    
    welcome_success = welcome_apobj.notify(
        title="🌿 Lohia Farm | Subscription Confirmed",
        body=formatted_body,
        body_format=NotifyFormat.HTML
    )
    if not welcome_success:
        print(f"❌ FAILED to send welcome email to {recipient_email}")

print("🎧 Listening for Firebase updates to trigger alerts...")
db.reference('/weather').listen(handle_new_data)

print("📨 Listening for new subscribers...")
db.reference('/subscribers').listen(handle_new_subscriber)

# --- OFFLINE MONITORING WATCHDOG ---
last_offline_alert_time = 0
OFFLINE_TIMEOUT_SECONDS = 300  # 5 minutes without data = offline
OFFLINE_COOLDOWN_SECONDS = 3600 # 1 hour cooldown for offline alerts

print("🛡️ Offline watchdog started. Monitoring sensor heartbeat...")

while True:
    try:
        time.sleep(60)  # Check the timestamp every 60 seconds
        
        # Get the latest entry to check its timestamp
        latest_data = db.reference('/weather').order_by_key().limit_to_last(1).get()
        if not latest_data:
            continue
            
        # Extract timestamp
        last_update_ms = 0
        for key, val in latest_data.items():
            if isinstance(val, dict) and 'timestamp' in val:
                last_update_ms = int(val['timestamp'])
                
        if last_update_ms == 0:
            continue
            
        current_time_ms = time.time() * 1000
        time_since_last_update_ms = current_time_ms - last_update_ms
        
        # If the last update was more than 5 minutes ago, consider it offline
        if time_since_last_update_ms > (OFFLINE_TIMEOUT_SECONDS * 1000):
            current_time = time.time()
            
            if current_time - last_offline_alert_time > OFFLINE_COOLDOWN_SECONDS:
                print("🔌 SENSORS OFFLINE DETECTED! Sending email alert...")
                
                formatted_body = """
                <div style="font-family: 'Segoe UI', Arial, sans-serif; color: #333; max-width: 600px; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
                    <div style="background-color: #f57c00; color: white; padding: 15px 20px; text-align: left;">
                        <h2 style="margin: 0; font-size: 20px; font-weight: 600;">🔌 Lohia Farm System Alert</h2>
                        <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9;">SENSORS OFFLINE DETECTED</p>
                    </div>
                    <div style="padding: 24px;">
                        <h3 style="color: #f57c00; border-bottom: 2px solid #fff3e0; padding-bottom: 8px; font-size: 16px; margin-top: 0;">⚠️ Connectivity Lost</h3>
                        <p style="font-size: 15px; line-height: 1.5; margin-bottom: 24px;">
                            The monitoring system has not received any new data from the sensors for over <b>5 minutes</b>. The hardware may be disconnected, powered off, or experiencing network issues.
                        </p>

                        <h3 style="color: #0277bd; border-bottom: 2px solid #e1f5fe; padding-bottom: 8px; font-size: 16px;">🛠️ Recommended Operations</h3>
                        <ul style="font-size: 14px; line-height: 1.6; padding-left: 20px; color: #424242;">
                            <li style="margin-bottom: 8px;"><b>Power Supply:</b> Check if the weather station is receiving power.</li>
                            <li style="margin-bottom: 8px;"><b>Network:</b> Verify that the local Wi-Fi network at Lohia Farm is active and accessible.</li>
                            <li><b>Hardware:</b> Inspect the device for any physical damage or exposed wiring.</li>
                        </ul>
                    </div>
                    <div style="background-color: #f5f5f5; color: #757575; text-align: center; padding: 12px; font-size: 12px; border-top: 1px solid #e0e0e0;">
                        📍 <b>Lohia Farm Monitoring System</b><br>
                        Automated Precision Agriculture Alerts
                        <span style="font-size: 10px; opacity: 0.7; display: block; margin-top: 8px;">To unsubscribe, visit the dashboard and select 'Unsubscribe' in the alerts menu.</span>
                    </div>
                </div>
                """
                
                # Send to all subscribers exactly as we do for threshold breaches
                alert_apobj = apprise.Apprise()
                
                # Attach all unique subscribers
                all_recipients = {'danish24co41@gmail.com'}
                sub_ref = db.reference('/subscribers').get()
                if sub_ref:
                    subscriber_emails = [v['email'] for k, v in sub_ref.items() if isinstance(v, dict) and v.get('email')]
                    if subscriber_emails:
                        for email in subscriber_emails:
                            all_recipients.add(email)
                        
                recipients_string = '/'.join(list(all_recipients))
                alert_apobj.add(f'mailto://geosense552:mthoctfajzlaqfua@gmail.com/{recipients_string}?name=Geosense')

                offline_success = alert_apobj.notify(
                    title="🔌 Lohia Farm | Sensors Offline Alert",
                    body=formatted_body,
                    body_format=NotifyFormat.HTML
                )
                if not offline_success:
                    print("❌ FAILED to send offline email. Check remote SMTP blocking.")
                
                last_offline_alert_time = current_time
    except Exception as e:
        print(f"⚠️ Error in offline watchdog: {e}")
