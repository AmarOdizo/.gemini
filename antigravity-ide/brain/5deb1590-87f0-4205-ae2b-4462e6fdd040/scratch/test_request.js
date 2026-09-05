const http = require('http');

const req = http.get('http://127.0.0.1:5000/api/health', (res) => {
  console.log('STATUS:', res.statusCode);
  console.log('HEADERS:', res.headers);
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('BODY:', data);
  });
});

req.on('error', (e) => {
  console.error('REQUEST ERROR:', e.message);
});
