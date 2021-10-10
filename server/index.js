const express = require("express");
const keys = require("./keys");

// express set up
const bodyParse = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParse.json());

// post gress client set up
const { Pool } = require("pg");

const pgClient = new Pool({
  user: keys.pgUser,
  host: keys.pgHost,
  database: keys.pgDatabase,
  port: keys.pgPort,
  password: keys.pgPassword,
});

// pgClient.on("error", () => {
//   console.log("Lost pg connection");
// });

pgClient.on("connect", (client) => {
  client
    .query("CREATE TABLE IF NOT EXISTS values (number INT)")
    .catch((err) => console.error(err));
});

// redis set up
const redis = require("redis");

const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000,
});

const redisPublisher = redisClient.duplicate();

// Expresss routes handlers
app.get("/", (req, res) => {
  res.send("Hi");
});

app.get("/values/all", async (req, res) => {
  const values = await pgClient.query("select * from values");
  res.send(values.rows);
});

app.get("/values/current", async (req, res) => {
  redisClient.hgetall("values", (err, values) => {
    res.send(values);
  });
});

app.post("/values", async (req, res) => {
  const index = req.body.index;

  if (parseInt(index) > 40) {
    return res.status(422).send("Too high");
  }

  redisClient.hset("values", index, "Nothing yet!!");

  redisClient.publish("insert", index);

  pgClient.query("insert into values(number) values($1)", [index]);

  res.send({ Working: true });
});

app.listen(5000, (err) => {
  console.log(err);
});
