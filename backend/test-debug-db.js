const https = require('https');
const options = {
  hostname: 'pos-market-web-nhom8b.onrender.com',
  path: '/api/employees/debug-db',
  method: 'GET',
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3ODE1MTg1NzQsImV4cCI6MTc4MTU0NzM3NH0.7H73ZASEc5feXfmctk6e25FyUfcddYhnrYRJKKSDYlw'
  }
};
const req = https.request(options, res => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => console.log('STATUS:', res.statusCode, 'DATA:', data));
});
req.on('error', console.error);
req.end();
