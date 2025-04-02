const express = require('express');
const fileUpload = require('express-fileupload');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
var timestamp = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');

const app = express();
app.use(fileUpload());
app.use(cors());
app.post('/upload', (req, res) => {
    console.log("file uploading");
    const file = req.files.image;
    const filePath = path.join(__dirname + '/uploads/' + file.name);

    const logFilePath = path.join(__dirname, 'log.txt');

    file.mv(filePath, function (err) {
        if (err) {
            console.log(err);
        }
        const logEntry = `${timestamp} - ${file.name} uploaded successfully\n`;
        fs.appendFileSync(logFilePath, logEntry, 'utf8');

        console.log("File saved successfully");
        console.log(logEntry,"Log written successfully");
        res.json({ message: "File uploaded successfully", filePath });
    })

});
app.post('/', (req, res) => {
    console.log("file uploading");
    return res.json({ message: 'please upload a file' });
})
app.listen(3002, () => {
    console.log('Server is running on port 3002');
})
