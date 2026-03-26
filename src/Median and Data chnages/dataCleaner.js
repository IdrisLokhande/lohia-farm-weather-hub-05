/**
 * DATA CLEANER UTILITY - LOHIA FARM
 * * This script cleans an array of weather data.
 * If a value is 0, NaN, or missing, it replaces it with the MEDIAN
 * of the previous valid readings.
 */

/**
 * Helper function to calculate the Median.
 * Medians are superior to Means for sensor data because they
 * effectively ignore random spikes (outliers).
 */
const calculateMedian = arr => {
  if (arr.length === 0) return 0;

  // 1. Sort the numbers small to large
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  // 2. Return the middle value (or average of two middle values if even)
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

export const cleanDataArray = rawArray => {
  const fieldsToClean = [
    "temperature",
    "humidity",
    "pm1",
    "pm25",
    "pm10",
    "lux",
    "co2",
    "pressure",
  ];

  // Rolling memory buffer for valid data points
  const history = {
    temperature: [],
    humidity: [],
    pm1: [],
    pm25: [],
    pm10: [],
    lux: [],
    co2: [],
    pressure: [],
  };

  return rawArray.map(record => {
    // Create a copy so we don't mess with the original raw data
    const cleanedRecord = { ...record };

    fieldsToClean.forEach(field => {
      let val = Number(cleanedRecord[field]);

      // CHECK: Is the value "Dirty" (<= 0, NaN, null, or undefined)?
      if (val <= 0 || val === null || val === undefined || isNaN(val)) {
        const pastValues = history[field];

        if (pastValues.length > 0) {
          // ACTION: Replace the zero/bad data with the Median of historical good data
          const median = calculateMedian(pastValues);
          cleanedRecord[field] = Math.round(median * 100) / 100;
        } else {
          // FAILSAFE: If there is no history at all yet, stay at 0
          cleanedRecord[field] = 0;
        }
      } else {
        // ACTION: If data is VALID (greater than 0), add to our history buffer
        history[field].push(val);

        // We keep the last 100 valid points for a very stable median calculation
        if (history[field].length > 100) {
          history[field].shift();
        }
      }
    });

    return cleanedRecord;
  });
};
