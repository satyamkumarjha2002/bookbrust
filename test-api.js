// Simple script to test API connectivity

const http = require('http');
const https = require('https');

// Configure the request
const apiUrl = 'http://localhost:9090/health-check';
console.log(`Testing API connectivity to: ${apiUrl}`);

// Parse the URL
const url = new URL(apiUrl);
const options = {
  hostname: url.hostname,
  port: url.port,
  path: url.pathname,
  method: 'GET',
  timeout: 5000, // 5 second timeout
};

// Choose http or https based on protocol
const requester = url.protocol === 'https:' ? https : http;

// Make the request
const req = requester.request(options, (res) => {
  console.log(`API Response Status: ${res.statusCode}`);
  console.log(`API Response Headers: ${JSON.stringify(res.headers)}`);
  
  let data = '';
  
  // A chunk of data has been received
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  // The whole response has been received
  res.on('end', () => {
    console.log('API Response Body:');
    try {
      const parsedData = JSON.parse(data);
      console.log(JSON.stringify(parsedData, null, 2));
    } catch (e) {
      console.log(data);
    }
  });
});

// Handle request errors
req.on('error', (e) => {
  console.error(`API Request Failed: ${e.message}`);
});

// End the request
req.end(); 