const admin = require("firebase-admin");

// 1. Point this to your service account key file
// (Download from Firebase Console > Project Settings > Service Accounts)
const serviceAccount = require("../../serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://lohiafarm-default-rtdb.firebaseio.com",
});

const db = admin.database();
const weatherRef = db.ref("weather");

// Helper function to calculate Median
const calculateMedian = arr => {
  if (arr.length === 0) return "No Data";
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  return Math.round(median * 100) / 100;
};

console.log("-----------------------------------------");
console.log("📊 LOHIA FARM: HISTORICAL MEDIAN CALCULATOR");
console.log("-----------------------------------------");
console.log("⏳ Fetching all records from Firebase...");

weatherRef.once("value", snapshot => {
  if (!snapshot.exists()) {
    console.log("❌ No data found in the 'weather' folder.");
    process.exit();
  }

  const data = snapshot.val();
  const entries = Object.values(data);

  const buffers = {
    temperature: [],
    humidity: [],
    pm1: [],
    pm25: [],
    pm10: [],
    co2: [],
    lux: [],
    pressure: [],
  };

  // 1. Filter out 0s and NaNs and fill buffers
  entries.forEach(record => {
    Object.keys(buffers).forEach(key => {
      const val = Number(record[key]);
      if (val > 0 && !isNaN(val)) {
        buffers[key].push(val);
      }
    });
  });

  console.log(`✅ Successfully processed ${entries.length} records.`);
  console.log("-----------------------------------------");
  console.log("SENSOR         | HISTORICAL MEDIAN");
  console.log("-----------------------------------------");

  // 2. Calculate and Print results
  Object.keys(buffers).forEach(key => {
    const medianValue = calculateMedian(buffers[key]);
    const padding = " ".repeat(14 - key.length);
    console.log(`${key.toUpperCase()}${padding} | ${medianValue}`);
  });

  console.log("-----------------------------------------");
  console.log("💡 Tip: These are the 'True Middle' values of your farm.");
  process.exit();
});
