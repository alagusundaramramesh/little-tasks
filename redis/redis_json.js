const express = require('express');
const app = express();
const redis = require('redis');
const crypto = require('crypto');
const { MongoClient } = require('mongodb'); // Not used yet, but fine to leave

// Create Redis client
const client = redis.createClient({
    url: 'redis://127.0.0.1:6379'
});

// Connect to Redis
const redis_connection = async () => {
    try {
        await client.connect();
        console.log("Redis connected successfully");
    } catch (error) {
        console.error("Redis connection failed:", error);
    }
};
redis_connection();

// API route
app.get('/jsonredis', async (req, res) => {
    const key = 'asdf';

    try {
        // Try to get the data from Redis
        const data = await client.json.get(key);
        console.log("Data:", data);

        if (data) {
            console.log("Key found with data:", data);
            res.json({
                message: "Successfully fetched from Redis",
                data: data
            });
        } else {
            console.log("Key not found. Creating it...");

            const value = {
                userId: 1,
                id: 1,
                title: "delectus aut autem",
                completed: false
            };

            await client.json.set(key, '$', value);

            res.json({
                message: "Data was not found, new value set",
                data: value
            });
        }
    } catch (error) {
        console.error("Error accessing Redis:", error);
        res.status(500).json({ message: "Redis error", error: error.message });
    }
});

// Start server
app.listen(4500, () => {
    console.log("Server is running on port 4500");
});
