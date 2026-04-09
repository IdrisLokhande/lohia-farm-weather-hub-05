import time
import apprise
from apprise import NotifyFormat
from firebase_admin import db
from . import config

# 1. Initialize Firebase
config.initialize_firebase()

def send_unsubscribe_email(recipient_email):
    """Sends a well-formatted HTML email confirming the user has been unsubscribed."""
    print(f"🚫 User unsubscribed: {recipient_email}. Sending confirmation email...")
    unsubscribe_apobj = apprise.Apprise()
    
    base_url = f'mailto://{config.EMAIL_SENDER.split("@")[0]}:{config.EMAIL_APP_PASSWORD}@gmail.com/{recipient_email}?name=Geosense'
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
    
    base_url = f'mailto://{config.EMAIL_SENDER.split("@")[0]}:{config.EMAIL_APP_PASSWORD}@gmail.com/{recipient_email}?name=Geosense'
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
        </div>
    </div>
    """
    
    welcome_apobj.notify(title="🌿 Lohia Farm | Subscription Confirmed", body=formatted_body, body_format=NotifyFormat.HTML)

def send_unsubscribe_sms(phone):
    """Sends an SMS confirming the user has been unsubscribed."""
    print(f"🚫 SMS User unsubscribed: {phone}. Sending confirmation...")
    sms_apobj = apprise.Apprise()
    twilio_url = f"twilio://{config.TWILIO_ACCOUNT_SID}:{config.TWILIO_AUTH_TOKEN}@{config.TWILIO_FROM_NUMBER}/{phone}"
    sms_apobj.add(twilio_url)
    sms_apobj.notify(
        title="Lohia Farm",
        body="🚫 You have been unsubscribed from Lohia Farm SMS alerts. You will no longer receive notifications."
    )

def send_welcome_sms(phone):
    """Sends an SMS welcoming a new subscriber."""
    print(f"📱 New SMS subscriber detected: {phone}. Sending welcome SMS...")
    sms_apobj = apprise.Apprise()
    twilio_url = f"twilio://{config.TWILIO_ACCOUNT_SID}:{config.TWILIO_AUTH_TOKEN}@{config.TWILIO_FROM_NUMBER}/{phone}"
    sms_apobj.add(twilio_url)
    success = sms_apobj.notify(
        title="Lohia Farm",
        body="🌿 Welcome to Lohia Farm Alerts! You are now subscribed to receive critical threshold and offline SMS notifications."
    )
    if not success:
        print(f"❌ FAILED to send welcome SMS to {phone}")

def process_subscriber_record(key, val):
    email = val.get('email')
    phone = val.get('phone')
    if not email and not phone: return
    
    if val.get('unsubscribe_request'):
        if email: send_unsubscribe_email(email)
        if phone: send_unsubscribe_sms(phone)
        db.reference(f'/subscribers/{key}').delete()
        return
        
    if not val.get('welcome_sent'):
        if email: send_welcome_email(email)
        if phone: send_welcome_sms(phone)
        db.reference(f'/subscribers/{key}').update({'welcome_sent': True})

def handle_new_subscriber(event):
    if event.data:
        data = event.data if event.path == '/' else {event.path.lstrip('/'): event.data}
        for k, v in data.items():
            if isinstance(v, dict): process_subscriber_record(k, v)

print("📨 Listening for new subscribers...")
db.reference('/subscribers').listen(handle_new_subscriber)

while True: time.sleep(60) # Keeps the script running