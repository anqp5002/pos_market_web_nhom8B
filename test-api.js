const https = require('https');

https.get('https://pos-market-web-nhom8b.onrender.com/api/health', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Status Code:', res.statusCode);
    console.log('Body:', data);
  });
}).on('error', err => console.error(err));
