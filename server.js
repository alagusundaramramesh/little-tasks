const express = require('express');
const cors = require('cors');
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const rfs = require('rotating-file-stream')
let imagepath = path.join(__dirname,'uploads');
const app = express();
app.use(cors());
app.use("/upload",express.static(imagepath)); 
const upload = multer(
    {
        storage:multer.diskStorage({
            destination:(req,file,cb)=>{
                const dir = 'uploads';
                cb(null,dir);
            },
            filename:(req,file,cb)=>{
                const extension = path.extname(file.originalname);
                const new_filename = Date.now() +Math.round(Math.random())+ extension;
                cb(null,new_filename);  
            },   
        }),
        limits:{
            fileSize: 1 * 1024 * 1024, 
        },
        fileFilter :(req,file,cb)=>{
            let filetype = /jpeg|jpg|png/;
            let checkfile = filetype.test(file.mimetype);
            if(checkfile){
                cb(null,true);       
            }
            else{
                cb("file willbe not a correct extension",false)
            }
        }   
    }
);
// multer using for file upload, fs using log file writing, path using for directory
app.post('/upload',upload.single('image'),(req, res)=>{
    let file = req.file.image;
    let timestamp = new Date().toISOString();
    let logFilePath = path.join(__dirname,'log.txt');
    file.mv(imagepath, function (err) {
        if (err) {
            console.log(err);
        }
        const logEntry = `${timestamp} - ${file.name} uploaded successfully\n`;
        fs.appendFileSync(logFilePath, logEntry, 'utf8');

        console.log(logEntry,"Log written successfully");
        res.json({ message: "File uploaded successfully", filePath });
    })

    res.json({
        status: 'success single',
        data: req.file
    });
});
app.post('/uploadlg',upload.array('image',10),(req, res)=>{

    res.json({  
        status: 'success multiple', 
        data: req.files
    });
});

app.listen(7000,()=>{
    console.log('Server is running on port 7000');
});
