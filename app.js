import express from "express";
import cors from "cors";
import redis from "redis";
import mongoose from "mongoose";
import UserModel from "./user-model.js";

// MONGODB SETUP
mongoose.connect(
  "mongodb+srv://pangpuncake:qwerty123@cluster0.0bzzzyh.mongodb.net/E?retryWrites=true&w=majority",
  { useNewUrlParser: true, useUnifiedTopology: true }
);
let db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

// EXPRESS SETUP
const app = express();
app.use(cors());
app.options("*", cors());

// REDIS SETUP
const createClient = redis.createClient;
const redisClient = createClient({
  url: "redis://default:dIRzZTGg8VyicnpgyUGsQyUzYjKrBzSr@redis-16742.c252.ap-southeast-1-1.ec2.cloud.redislabs.com:16742",
});

async function setupRedis() {
  try {
    redisClient.on("error", (err) => console.log("Redis Client Error", err));
    await redisClient.connect();
    console.log("Redis client is set up");
  } catch (e) {
    console.error(e);
  }
}

const checkCache = async (req, res, next) => {
  console.log("Checking cache...");
  try {
    let data = await redisClient.get("data");
    if (!data) {
      console.log("No data in cache found");
      return next();
    }
    console.log("Hit cache");
    data = JSON.parse(data);
    console.log("Number of rows in cache:", data.length);
    return res.json({ rows: data.length, data: data });
  } catch (err) {
    console.log(err);
    throw err;
  }
};

async function getUserData() {
  return UserModel.find();
}

const getData = async (req, res) => {
  console.log("Getting data...");
  try {
    let data = await getUserData();
    console.log("Number of rows:", data.length);
    await redisClient.set("data", JSON.stringify(data));
    console.log("Data set in redis");
    return res.json({ rows: data.length, data: data });
  } catch (err) {
    console.log(err);
  }
};

const deleteData = async (req, res) => {
  try {
    console.log("Deleting cache");
    await redisClient.del("data");
    console.log("Deleted cache");
    res.send("Deleted cache data");
  } catch (err) {
    console.log(err);
  }
};

app.get("/", (req, res) => res.send("Hello from task E"));
app.get("/data", checkCache, getData);
app.delete("/data", deleteData);

app.listen(8000, () => {
  console.log("Server listening on port 8000");
  setupRedis();
});
