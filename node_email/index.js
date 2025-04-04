const nodemailer = require('nodemailer');
const transport = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: false, // use SSL
    secureConnection: true,
    service: 'gmail',
    auth:{
        user:'alagusundaram6117@gmail.com',
        pass:"rndh avqq kzvr suoa"
    }
});
const body_mailer={
    to : 'sundhar.coderays@gmail.com,aravindhan.coderays@gmail.com',  
    subject :"Happy Coding",
    text : "Hello World",
    html : "<h1>Hello World</h1>"
}
transport.sendMail(body_mailer,(err,info)=>{
    if(err){
        console.log(err);
    }
    else{
        console.log(info);
    }
})