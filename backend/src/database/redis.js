const Redis = require("ioredis");

const redis = process.env.REDIS_URL 
  ? new Redis(process.env.REDIS_URL) 
  : new Redis({
      port: 6379,
      host: "127.0.0.1",
    });

redis.on("connect", () =>{
    console.log("Connected to redis's server");
});

module.exports = redis;