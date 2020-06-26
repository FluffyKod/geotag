const fs = require('fs');
const key = fs.readFileSync('./key.pem');
const cert = fs.readFileSync('./cert.pem');

const express = require('express');
const https = require('https');
const app = express();
app.use(express.static(__dirname + '/public'));

const server = https.createServer({ key: key, cert: cert }, app);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/map.html');
});
server.listen(3001, () => {
    console.log('listening on 3001');
});
