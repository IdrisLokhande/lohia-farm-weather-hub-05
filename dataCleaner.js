/**
 * Cleans an array of raw weather data by replacing invalid values (0, NaN, null, undefined)
 * with a moving average of the last 10 valid readings.
 */
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

  // Keep track of the last up to 10 valid values for each sensor to calculate the moving average
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
    const cleanedRecord = { ...record };

    fieldsToClean.forEach(field => {
      let val = cleanedRecord[field];

      // If the value is invalid (0, NaN, null, undefined)
      if (val === 0 || val === null || val === undefined || isNaN(val)) {
        const pastValues = history[field];
        if (pastValues.length > 0) {
          // Calculate the mean of the recent history
          const sum = pastValues.reduce((a, b) => a + b, 0);
          const mean = sum / pastValues.length;
          cleanedRecord[field] = Math.round(mean * 100) / 100; // Round to 2 decimal places
        } else {
          // Failsafe: if there is no history yet, default to 0
          cleanedRecord[field] = 0;
        }
      }

      // Add the cleaned (or originally valid) value to the history buffer
      history[field].push(cleanedRecord[field]);
      if (history[field].length > 10) {
        history[field].shift(); // Keep only the last 10 records
      }
    });

    return cleanedRecord;
  });
};
