const express = require("express");
const mongoose = require("mongoose");
const app = express();

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

require('dotenv').config();

const mongodb_url = process.env.MONGODB_URL || "mongodb://localhost:27017/slacker-tracker";
const port = process.env.PORT || 3001;

mongoose.connect(mongodb_url);

app.use(function (req, res, next) {
    console.log("HTTP request", req.method, req.url, req.body);
    next();
});

const users = require("./routes/users");
app.use("/api/user", users);

const http = require("http");

http.createServer(app).listen(port, function (err) {
  if (err) console.log(err);
  else console.log("HTTP server on http://localhost:%s", port);
});