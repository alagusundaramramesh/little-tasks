const { createServer } = require('node:http');
const express = require('express');
const app = express();
const { join } = require('node:path');
const {Server} = require('socket.io');
const e = require('express');
const { log } = require('node:console');
const { Socket } = require('node:dgram');

const server = createServer(app);
const io = new Server(server);

app.get('/',(req,res)=>{
res.sendFile(join(__dirname,'index.html'));
});

// io.on('connection',(Socket)=>{
//     console.log("socket io connected successfully");

//     Socket.on('message',(msg)=>{
//         console.log("INPUT :",msg);
//         io.emit('message',msg);
//     });

//     Socket.on('disconnect',()=>{
//         console.log("user disconnected");
//     });
// });
// let arr_data = [];
let arr_data = {};
let socket_id = [];

io.on('connection',(socket)=>{
    console.log("socket io connected successfully");
    // console.log(socket);
    // socket.disconnect();
    // const count = io.engine.clientsCount;
    // console.log("Connected clients: " + count);
    // socket.on('join_group',(group_id)=>{
    //     socket.join(group_id);
    // });

    // socket.on('room_choosing_message',(data)=>{
    //     console.log("before length of array :",arr_data);
    //     // console.log("Data",data);
    //     socket.join(data.room_number);
    //     console.log("arrray of data v1 ",arr_data);
    //     // io.to(data.room_number.toString()).emit('client_message',data.user_name,"Joined",data.color_selection);
    //     // socket.to('client_message',data.user_name,"Joined",data.color_selection);
            
    //         arr_data.forEach((element,i) => {
    //             console.log("looping",i, data.room_number);
    //             if(data.room_number === element.room_number){
    //                 // send specifically to me also send my roomates too separte pannamuj.
    //                 socket.emit('client_message',element.user_name,"Already in room",data.color_selection);
    //             }
    //         });
    //         socket.to(data.room_number.toString()).emit('client_message',data.user_name,"Joined",data.color_selection);
    //         arr_data.push(data);

    //       console.log("After length of array :",arr_data.length);
    // });

     socket.on('room_choosing_message',(data)=>{
        // console.log("before length of array :",arr_data);
        // console.log("Data",data);
        // console.log("room_socket_id",socket.id);
        socket_id.push(socket.id);
        data.socket_id = socket.id;
        socket.join(data.room_number);
        socket.currentRoom = data.room_number;
        // console.log("arrray of data v1 ",arr_data);
        // io.to(data.room_number.toString()).emit('client_message',data.user_name,"Joined",data.color_selection);
        // socket.to('client_message',data.user_name,"Joined",data.color_selection);
            
            // arr_data.forEach((element,i) => {
            //     console.log("looping",i, data.room_number);
            //     if(data.room_number === element.room_number){
            //         // send specifically to me also send my roomates too separte pannamuj.
            //         socket.emit('client_message',element.user_name,"Already in room",data.color_selection);
            //     }
            // });
            // socket.to(data.room_number.toString()).emit('client_message',data.user_name,"Joined",data.color_selection);
            // arr_data.push(data);



            //  arr_data.forEach((element,i) => {
            //     console.log("looping",i, data.room_number);
            //     if(data.room_number === element.room_number){
            //         // send specifically to me also send my roomates too separte pannamuj.
            //         socket.emit('client_message',element.user_name,"Already in room",data.color_selection);
            //     }
            // });


            // check the room already exists in arr 
            
            
            
         socket.to(data.room_number.toString()).emit('client_message', data.user_name, "Joined", data.color_selection);
         if (!arr_data[data.room_number]) {
             arr_data[data.room_number] = [];
         }
         for (let index = 0; index < arr_data[data.room_number].length > 0; index++) {
             const element = arr_data[data.room_number][index];
             console.log("element", element);
             socket.emit('client_message', element.user_name, "Already in room", data.color_selection);
         }
         arr_data[data.room_number].push(data);
        //  console.log("After length of array :", arr_data);
        //  console.log("socket_id's:",socket.id);
         
     });
    

    
    
    // socket.on('room',(room_number)=>{
    //     // console.log("room_numb",typeof(room_number));
    //     const count = countInRoom(room_number);
    //     console.log("count", count);
    //     if (room_number != "") {
    //         socket.join(room_number);
    //         console.log("Join room successfully..!", room_number);
    //     }
    //     else{
    //         console.log("Client doesn't give the proper Room NUM");
    //         socket.disconnect();
    //     }
    // });

    socket.on('server_message',({room_number,message,user_name,color})=>{
        console.log("Room Name",room_number);
        console.log("message",message);
        console.log("user_name",user_name);
        // socket.broadcast.emit('message',msg);
        io.to(room_number.toString()).emit('client_message',user_name,message,color);
    });
    
    socket.on('disconnecting',()=>{
        console.log("beefore",arr_data);
        let room_number = socket.currentRoom;
        if(room_number && arr_data[room_number]){
        // arr_data[room_number]=arr_data[room_number].filter(user=>user.socket_id!==socket.id);
        arr_data[room_number]=arr_data[room_number].filter(function (user) {
            console.log("user",user);
            console.log("user",user.socket_id);
            console.log("socket_id",socket.id)
            //assign who's are not equall to socket_id;
            if(user.socket_id!==socket.id){
            arr_data[room_number]=user;
            }else{
            socket.to(room_number.toString()).emit('client_message', user.user_name, "Left the room", "grey");
            }
        })
        }
        console.log("After",arr_data);
    });
    socket.on('disconnect',(reason)=>{
        console.log("user disconnect",reason);
    });
    
});

function countInRoom(room) {
  return io.of("/").adapter.rooms.get(room)?.size || 0;
}




// io.to('chat').emit('message',);


server .listen(3000,()=>{
    console.log("server will be running @ http://localhost:3000");
});