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
let arr_data = {};
let socket_id = [];

io.on('connection',(socket)=>{
    console.log("socket io connected successfully");
    // selecting room listerner.
     socket.on('room_choosing_message',(data)=>{
        socket_id.push(socket.id);
        data.socket_id = socket.id;
        socket.join(data.room_number);
        socket.currentRoom = data.room_number;
                          
         socket.to(data.room_number.toString()).emit('client_message', data.user_name, "Joined", data.color_selection);
         if (!arr_data[data.room_number]) {
             arr_data[data.room_number] = [];
         }
         for (let index = 0; index < arr_data[data.room_number].length > 0; index++) {
             const element = arr_data[data.room_number][index];
            //  console.log("element", element);
             socket.emit('client_message', element.user_name, "Already in room", data.color_selection);
         }
         arr_data[data.room_number].push(data);
         
     }); 
     //  message listener
    socket.on('server_message',({room_number,message,user_name,color})=>{
        console.log("Room Name",room_number);
        console.log("message",message);
        console.log("user_name",user_name);
        // socket.broadcast.emit('message',msg);
        io.to(room_number.toString()).emit('client_message',user_name,message,color);
    });
    // disconnecting before remove the data in arry avoid memory leaks
    socket.on('disconnecting',()=>{
        console.log("Before Remove the data",arr_data);
        let room_number = socket.currentRoom;
        if(room_number && arr_data[room_number]){
        // arr_data[room_number]=arr_data[room_number].filter(user=>user.socket_id!==socket.id);
        // filter method callback return true or false ,true- keep the data in array , false - data will be remove in the array.
        arr_data[room_number]=arr_data[room_number].filter(function (user) {
            if(user.socket_id===socket.id){
            socket.to(room_number.toString()).emit('client_message', user.user_name, "Left the room", "grey");
            return false;
            }
            return true;
        })
        }
        console.log("After remove the data",arr_data);
    });
    // fully disconnect from the room
    socket.on('disconnect',(reason)=>{
        console.log("user disconnect",reason);
    });
    
});

function countInRoom(room) {
  return io.of("/").adapter.rooms.get(room)?.size || 0;
}



server .listen(3000,()=>{
    console.log("server will be running @ http://localhost:3000");
});