const express = require('express');
const node_mail = require('nodemailer');
const body_parser = require('body-parser');
const Bull =  require('bull');

let app = express();
app.use(body_parser.json());


const EmailQueue_Redis =  new Bull('email',{
    redis:{
        host:'localhost',
        port:6379
    },
});

async function email_queue_stat ( email){
    EmailQueue_Redis.add(email,(err)=>{
        console.log("err",err);
    });
};
EmailQueue_Redis.process(async (job) =>{
    console.log("enter in to the function",job.data);
    
    let data = job.data;
    let ethereal_fake_email = await node_mail.createTestAccount(); // Free every time we call it will create fake user_name & pass.
    let sender =  node_mail.createTransport({
        host: 'smtp.ethereal.email',
        port:587,
        secure:false,
        auth:{
            user:ethereal_fake_email.user,
            pass: ethereal_fake_email.pass
        },
    });
    // console.log("next step move",sender);
    
    let email_data = {
        from:data.from || "",
        to:data.to || "",
        subject:data.subject || "",
        text:data.text || "", // either we will use template also. 
        html: `<strong>${text}</strong>`,
    }
    // console.log("email_data",email_data);
    
    let email_send = await sender.sendMail({
        from: data.from || "",
        to: data.to || "",
        subject: data.subject || "",
        text: data.text || "", // either we will use template also. 
        html: `<strong>${text}</strong>`,
    });
   console.log("info.messageId",email_send.messageId);
})

// await EmailQueue_Redis.process(email_queue_process); // this will not work until we use EMCA Script.


app.post('/email',async (req,res)=>{
    let bodydata = req.body;
    console.log("body_data",bodydata);
    let func = await email_queue_stat(bodydata);
    console.log("func",func);
    res.json({
        message:"success"
    })
})


//server starting
app.listen(3030,()=>{
console.log("server will start 3030");
})
