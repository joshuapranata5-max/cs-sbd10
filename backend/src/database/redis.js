const Redis = require("ioredis");

const redis = new Redis();

new Redis({
  port: 6379, // Redis port
  host: "127.0.0.1", // Redis host
});

redis.on("connect", () =>{
    console.log("Connected to redis's server");
});

module.exports = redis;