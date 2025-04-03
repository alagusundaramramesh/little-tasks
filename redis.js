    const express = require('express');
    const app = express();
    const redis = require('redis');

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

    app.get('/upload', async (req, res) => {
        let key = 'arya1';
        let data = await client.hGet(key, 'got', 'stark');
        console.log("da ta", data)
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
    app.get('/upload-del', async (req, res) => {
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

    app.listen(4500, () => {
        console.log("server is running on 4500 port");
    })
