const http = require('http');
const crypto = require('crypto');
const cors = require('cors');
// Sample static content
const content = 'Hello, this is cacheable content!!';
const etag = crypto.createHash('md5').update(content).digest('hex');
console.log('ETag:', etag);
const server = http.createServer((req, res) => {
  // Check if the client sent If-None-Match header
  res.setHeader('Access-Control-Allow-Origin', '*'); // Or restrict to specific origin
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, If-None-Match');
  const ifNoneMatch = req.headers['if-none-match'];

  if (ifNoneMatch === etag) {
    // Content not changed
    res.writeHead(304);
    res.end();
  } else {
    // Content changed or first time
    res.setHeader('ETag', etag);
    res.setHeader('Content-Type', 'text/plain');
    res.writeHead(200);
    res.end(content);
  }
});


server.listen(8000, () => {
  console.log('Server running on http://localhost:8000');
});
