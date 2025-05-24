let nodecron  = require('node-cron');
 let terminal = require('child_process');
 let os = require('os');
 let filesystem = require('fs');
function log (){
    console.log("Cron will be run every second");
}
// cron run every seconds.
// nodecron.schedule('* * * * * *',function(){
//     console.log("hello world");
//     log();
// }
// );

//make a system shutdown using cron
let os_platform = os.platform();
console.log("os_platform",os_platform);
if(os_platform === "linux"){
    console.log("welcome");
    nodecron.schedule('33 9 * * *',function (){
        console.log("operation start to system shutdown");
        terminal("sudo /sbin/shutdown now ",(error)=>{
            if (error) {
                console.log("error will happen ");
            }
        });
        log();
    });
}

// make a cron write a file or create a file.
// nodecron.schedule("* * * * * *",()=>{
//     console.log("operation will start");
//     filesystem.appendFile('cron.txt',"Hello world..!\n",(error)=>{
//         if(error){
//             console.log("erorr")
//         }else{
//             console.log("succsess")
//         }
//     })
// });




