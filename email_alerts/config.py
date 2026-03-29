import os
import sys
import firebase_admin
from firebase_admin import credentials, db

# --- Python-Dotenv for Local Development ---
# We will try to import it, but if it's not installed, we'll rely on server environment variables.
try:
    from dotenv import load_dotenv
    # Load .env file from the project root (one directory up)
    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    load_dotenv(dotenv_path=os.path.join(project_root, '.env'))
except ImportError:
    print("Note: 'python-dotenv' not found. Relying on system environment variables for secrets.")
    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

# --- Email Credentials & Configuration ---
EMAIL_SENDER = os.environ.get("EMAIL_SENDER")
EMAIL_APP_PASSWORD = os.environ.get("EMAIL_APP_PASSWORD")
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL")

# Validate that environment variables are set
if not all([EMAIL_SENDER, EMAIL_APP_PASSWORD, ADMIN_EMAIL]):
    print("❌ CRITICAL ERROR: Missing one or more environment variables.")
    print("   Ensure EMAIL_SENDER, EMAIL_APP_PASSWORD, and ADMIN_EMAIL are set in your .env file or server environment.")
    sys.exit(1)

# --- Firebase Configuration ---
def initialize_firebase():
    """Initializes the Firebase app, ensuring it's only done once."""
    if not firebase_admin._apps:
        cred_path = os.path.join(project_root, 'firebase_credentials.json')
        if not os.path.exists(cred_path):
            print(f"❌ CRITICAL ERROR: 'firebase_credentials.json' not found in project root '{project_root}'.")
            sys.exit(1)
        
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred, {
            'databaseURL': 'https://lohiafarm-default-rtdb.firebaseio.com/'
        })
        print("🔥 Firebase initialized successfully.")

# --- Data Fetching Utility ---
def get_all_recipients():
    """Fetches all subscriber emails from Firebase and includes the admin email."""
    recipients = {ADMIN_EMAIL}
    try:
        sub_ref = db.reference('/subscribers').get()
        if sub_ref:
            for v in sub_ref.values():
                if isinstance(v, dict) and v.get('email'):
                    recipients.add(v['email'])
    except Exception as e:
        print(f"⚠️ Could not fetch subscribers from Firebase: {e}")
    return list(recipients)

# --- Centralized Thresholds & Settings ---
TEMP_THRESHOLD = 40
CO2_THRESHOLD = 1200
HUMIDITY_THRESHOLD = 80
AQI_THRESHOLD = 150

# Cooldowns in seconds
THRESHOLD_ALERT_COOLDOWN = 3600  # 1 hour
OFFLINE_ALERT_COOLDOWN = 3600    # 1 hour
OFFLINE_TIMEOUT = 300            # 5 minutes