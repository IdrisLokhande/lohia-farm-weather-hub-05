export const WeatherPhysics = {
  /**
   * Calculates the Heat Index (Feels Like) using the NWS Rothfusz Regression.
   */
  getFeelsLike: (tempC: number, humidity: number): number => {
    const T = (tempC * 9/5) + 32;
    const R = humidity;

    if (T <= 80) {
      const hiF = 0.5 * (T + 61.0 + ((T - 68.0) * 1.2) + (R * 0.094));
      return (hiF - 32) * 5/9;
    }

    const hiF = -42.379 + 2.04901523 * T + 10.14333127 * R 
                - 0.22475541 * T * R - 0.00683783 * T * T 
                - 0.05481717 * R * R + 0.00122874 * T * T * R 
                + 0.00085282 * T * R * R - 0.00000199 * T * T * R * R;

    return (hiF - 32) * 5/9;
  },

  /**
   * Actual Vapor Pressure (ea) in kPa using Tetens Equation (valid in -40 to 50 degC)
   */
  getVaporPressure: (tempC: number, humidity: number): number => {
    const es = 6.112 * Math.exp((17.27 * tempC) / (tempC + 237.3));
    return es * (humidity / 100);
  },

  /**
   * Absolute Humidity (Water Density) in g/m³.
   */
  getAbsoluteHumidity: (tempC: number, humidity: number): number => {
    // 1. Calculate Saturation Vapor Pressure (in hPa)
    const es = 6.112 * Math.exp((17.67 * tempC) / (tempC + 243.5));
  
    // 2. Calculate Actual Vapor Pressure
    const ea = es * (humidity / 100);
  
    // 3. Convert to Absolute Humidity (g/m3)
    // 216.74 is the constant for the Ideal Gas Law for water vapor
    const absoluteHum = (ea * 216.74) / (tempC + 273.15);
  
    return absoluteHum;
  },

  /**
   * Calculates the Partial Pressure of CO2 (P_CO2) in hPa.
   * Uses the total atmospheric pressure to determine the 
   * specific pressure exerted by CO2 molecules.
   */
  getCO2PartialPressure: (ppm: number, totalPressureHpa: number): number => {
    // ppm is parts per million, so we divide by 1,000,000
    // P_partial = P_total * (Concentration / 1,000,000)
    
    return totalPressureHpa * (ppm / 1000000);
  },  

  calculateIndiaAQI: (pm25: number, pm10: number): number => {
    const getSubIndex = (cp: number, breakpoints: number[][]) => {
    const b = breakpoints.find(([bl, bh]) => cp >= bl && cp <= bh);
    if (!b) return cp > breakpoints[breakpoints.length - 1][1] ? 500 : 0;
    	const [bl, bh, il, ih] = b;
    	return ((ih - il) / (bh - bl)) * (cp - bl) + il;
    };

    const pm25BP = [[0,30,0,50],[31,60,51,100],[61,90,101,200],[91,120,201,300],[121,250,301,400],[251,500,401,500]];
    const pm10BP = [[0,50,0,50],[51,100,51,100],[101,250,101,200],[251,350,201,300],[351,430,301,400],[431,500,401,500]];

    return Math.round(Math.max(getSubIndex(pm25, pm25BP), getSubIndex(pm10, pm10BP)));
  }

};
