const http = require('https');

const payload = JSON.stringify({
  name: "SuperCat",
  type: "Cat",
  species: "Cat",
  healthStatus: "Sick",
  image: "https://example.com/supercat.png"
});

const options = {
  hostname: 'odizopetcare.onrender.com',
  port: 443,
  path: '/api/pets',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload)
    // omitting auth to see if it allows or what it returns
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log("Status Code:", res.statusCode);
    console.log("Response:", data);
  });
});

req.on('error', (e) => {
  console.error("Error:", e);
});

req.write(payload);
req.end();
