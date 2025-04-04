const express = require('express');
const app = express();
const redis = require('redis');
const { MongoClient } = require('mongodb');


let uri = "mongodb://localhost:27017/";
let Mongoclient = new MongoClient(uri);

let data_connection = true;


async function dbconnection() {
    try{
        await Mongoclient.connect();
        console.log("mongodb connected successfully");
    }
    catch (err) {
        console.log(err);
    } 
}
dbconnection();


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
redis_connection();


 
if(data === true){

}


// normal get and set redis 
// given key is not there then set the key & if key is there then get the key.
app.get('/normalkey', async (req, res) => {
    let key = 'asdf';
    let data = await client.get(key);
    console.log("data", data)
    if (data) {
        console.log("key has ", data)
        res.json({
            message: "successfully get",
            data: data
        })
    }
    else {
        console.log("data is not there");

        let hello = client.set(key, "Hello World");
        res.json(
            {
                message: "sucessfully set",
                data: key
            }
        )
    }
});
// delete the key from redis
// if key is not there return err.
app.get('/keydel', async (req, res) => {
    let key = 'wer';
    let data = await client.del(key);
    console.log(data);
    // return false
    if (data === 1) {
        // await client.del(data);
        console.log("key delete successsfully");
        res.json({
            message: "given key deleted from redis"
        })
    }
    else {
        console.log("given key is not valid")
        res.json({
            message: "not valid key"
        })
    }
});

//hsetkey and hget key 
app.get('/hashkey', async (req, res) => {
    let key = 'sansa';
    let field = 'got';
    let value = 'throne';
    let data = await client.hGet(key, field, value);
    if (data) {
        console.log("key is already there");
        res.json({
            message: "key is already there",
            data: data
        })
    }
    else {
        console.log("key is not there");
        await client.hSet(key, field, value);
        console.log("key is set");
        res.json({
            message: "key is set",
            data: key
        })
    }
}
);
// get all the keys from redis
app.get('/allkeys', async (req, res) => {
    let data = await client.keys('*');
    console.log(data);
    res.json({
        message: "all keys",
        data: data
    })
});

// delete hash key
app.get ('/hashdel', async (req, res) => {
    let key = 'sansa';
    let field = 'got';
    let data = await client.hDel(key, field);
    if (data) {
        console.log("key is deleted");
        res.json({
            message: "key is deleted",
            data: data
        })
    }
    else {
        console.log("key is not there");
        res.json({
            message: "key is not there"
        })
    }
});

app.listen(4500, () => {
    console.log("server is running on 4500 port");
})