/**
 * DATA CLEANER UTILITY - LOHIA FARM
 * * This script cleans an array of weather data.
 * It uses a "Two-Pass" system to calculate the true global median of the
 * downloaded dataset before applying fixes, ensuring consistency with the live dashboard.
 */

const calculateMedian = arr => {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
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

  // 1. FIRST PASS: Collect all valid data points across the entire downloaded dataset
  const globalHistory = {
    temperature: [],
    humidity: [],
    pm1: [],
    pm25: [],
    pm10: [],
    lux: [],
    co2: [],
    pressure: [],
  };

  rawArray.forEach(record => {
    fieldsToClean.forEach(field => {
      const val = Number(record[field]);
      // Only count valid, non-zero numbers for the baseline
      if (val > 0 && !isNaN(val)) {
        globalHistory[field].push(val);
      }
    });
  });

  // 2. Calculate the "True Median" for each field based on this specific dataset
  const globalMedians = {};
  fieldsToClean.forEach(field => {
    globalMedians[field] = calculateMedian(globalHistory[field]);
  });

  // 3. SECOND PASS: Clean the array using the True Medians
  return rawArray.map(record => {
    const cleanedRecord = { ...record };

    fieldsToClean.forEach(field => {
      const val = Number(cleanedRecord[field]);

      // If the value is "Dirty" (0, negative, NaN, null)
      if (val <= 0 || val === null || val === undefined || isNaN(val)) {
        // Replace with the global median calculated in Pass 1
        cleanedRecord[field] = Math.round(globalMedians[field] * 100) / 100;
      }
    });

    return cleanedRecord;
  });
};
