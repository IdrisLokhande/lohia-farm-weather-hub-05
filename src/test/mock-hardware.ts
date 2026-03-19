import http from 'http';

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  // Handle preflight OPTIONS requests from the browser
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // 1. STATUS ENDPOINT
  if (req.url === '/api/status') {
    const delay = Math.random() > 0.8 ? 4900 : 100; 
    setTimeout(() => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        sensorsOnline: Math.floor(Math.random() * 4),
        totalSensors: 3,
        uptime: "1d 04h",
        lastUpdate: new Date().toLocaleTimeString()
      }));
    }, delay);
  } 
  
  // 2. WEATHER ENDPOINT
  else if (req.url === '/api/weather') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      temp: (20 + Math.random() * 10).toFixed(1),      // Random 20-30°C
      humidity: Math.floor(40 + Math.random() * 20),   // Random 40-60%
      aqi2_5: Math.floor(Math.random() * 50),          // Random AQI
      aqi5_0: Math.floor(Math.random() * 50),          // Random AQI
      aqi10_0: Math.floor(Math.random() * 50),         // Random AQI
      pressure: Math.floor(1000 + Math.random() * 20), // Random hPa
      co2: Math.floor(350 + Math.random() * 150),       // Random ppm
      lintensity: Math.floor(350 + Math.random() * 150)       // Random ppm
    }));
  }

  // 3. 404 FOR ANYTHING ELSE
  else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(8080, () => console.log('Mock Hardware LIVE on port 8080'));
