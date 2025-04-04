const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Hello World!, this is the PM2 server.');
}); 

app.listen(3001, () => {    
  console.log('Server is running on port 3001');
}); 

 // pm2 start
 // when system will on automatically start the server
// pm2 start pm2/index.js