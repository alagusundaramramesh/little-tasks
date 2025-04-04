const express = require('express');
const app = express();
const redis = require('redis');
const { MongoClient } = require('mongodb');
const  crypto  = require('crypto');
const { createHash } = require('crypto');


// mongodb connection
let uri = "mongodb://localhost:27017/";
let Mongoclient = new MongoClient(uri);

async function dbconnection() {
    try {
        await Mongoclient.connect();
        console.log("mongodb connected successfully");
    }
    catch (err) {
        console.log(err);
    }
}

//redis connection
const client = redis.createClient({
    url: 'redis://127.0.0.1:6379'
});

const redis_connection = async () => {
    try {
        await client.connect();
        console.log("redis will connected successfully")
    }
    catch {
        console.log(Error);
    }
}
function hashdata(username, password) {
    return crypto.createHash('sha256').update(username + password).digest('hex');
}
//using hash to create a unique key and verify username and password
app.get('/hash',async (req, res) => {
   await redis_connection();
    let username = "sundhar@coderays.com";
    let password = "12346";
    let key = "login";   
    let value = username;
    let fieldkey= hashdata(username,password);
    let db_index = await client.select(2);

    let data = await client.hGet(key,value,fieldkey);
    console.log(data);
    console.log(fieldkey);

    // return false
    if (data) {
        console.log("key has ", data)
        res.json({
            message: "successfully get",
            data: value
        })
    }
    else {

        console.log("data is not there");

        dbconnection();

        let db = Mongoclient.db('rediskey');
        let collection = db.collection('user');
        let user = {
            username: username,
            password: password
        }
        let finduser_info = await collection.findOne({ username: username });
        console.log("find user info", finduser_info);
        if (finduser_info) {
            console.log("user is already there");
            res.json({
                message: "user is already there"
            })
            return;
        }
        console.log("user is not there");
        let result = await collection.insertOne(user);
        console.log("user is inserted", result);


        let hello = await client.hSet(key, value,fieldkey);
        res.json(
            {
                message: "sucessfully set",
                data: key
            }
        )
    }
});
app.listen(4500, () => {
    console.log("server is running on 4500 port");
});