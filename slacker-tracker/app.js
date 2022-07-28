const express = require("express");
const mongoose = require("mongoose");
const app = express();
const { Worker } = require("worker_threads");
const { UserModel, TimerModel } = require("./db");
const cron = require("node-cron");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const cors = require("cors");
app.use(cors({ credentials: true, origin: "http://localhost:3000" }));

const session = require("express-session");
app.use(
  session({
    secret: process.env.SESSION_SECRET || "my secret",
    resave: false,
    saveUninitialized: true,
  })
);

require("dotenv").config();

const mongodbUrl =
  process.env.MONGODB_URL || "mongodb://localhost:27017/slacker-tracker";
const port = process.env.PORT || 3001;

mongoose.connect(mongodbUrl);

app.use(function (req, res, next) {
  // let username = (req.session.user)? req.session.user._id : '';
  // const email = (req.session.user) ? req.session.user.email : ''
  // res.setHeader('Set-Cookie', cookie.serialize('email', email, {
  //   path: '/',
  //   maxAge: 60 * 60 * 24 * 7 // 1 week in number of seconds
  // }))
  // req.email = req.session.email ? req.session.email : null
  // console.log('app use: ', req.session)
  console.log("HTTP request", req.method, req.url, req.body);
  next();
});

app.get("/api/generateSummaryEmail", (req, res, next) => {
  if (!req.query._id)
    return res.status(400).json({ message: "missing _id in request query" });
  if (!req.query.sendEmail)
    return res
      .status(400)
      .json({ message: "missing sendEmail in request query" });

  TimerModel.findOne({ _id: req.query._id }, (err, userTimer) => {
    if (err) return res.status(500).json({ message: err });
    if (!userTimer) {
      return res
        .status(404)
        .json({ message: `user ${req.query._id} does not exist` });
    }
    let workerData = {
      workTimeSpent: userTimer.workTime.totalTimeSpent,
      playTimeSpent: userTimer.playTime.totalTimeSpent,
      offlineTimeSpent: userTimer.offlineTime.totalTimeSpent,
      unallocatedTime: userTimer.unallocatedTime.totalTimeSpent,
    };
    UserModel.findOne(
      { _id: req.query._id },
      "name slackerScore",
      (err, user) => {
        if (err) return res.status(500).json({ message: err });
        workerData._id = req.query._id;
        workerData.name = user.name;
        workerData.slackerScore = user.slackerScore;
        workerData.sendEmail = req.query.sendEmail;
        const worker = new Worker("./mailer.js", { workerData });
        worker.on("message", () =>
          res.status(200).json({ message: "success" })
        );
        worker.on("error", () => res.status(500).json({ message: "fail" }));
      }
    );
  });
});

const users = require("./routes/users");
app.use("/api/user", users);

const friendLists = require("./routes/friendLists");
app.use("/api/friendList", friendLists);

const timers = require("./routes/timers");
app.use("/api/timer", timers);

app.use(express.static("static"));

// at every Monday 1:00
const calculationFrequency = "0 1 * * * monday";

// at the fifth second in every minutes
const testFrequency = "5 * * * * *";

// * means every
// at second minutes hours date month day-of-week
//     "*      *      *     *     *       *""
cron.schedule(testFrequency, () => {
  const workerReset = new Worker("./weeklyReport.js");
  workerReset.on("message", () => {
    console.log("Weekly report generation complete!");
  });
  workerReset.on("error", () => console.log("Weekly report generation fail!!"));
});

const http = require("http");
const { getByTestId } = require("@testing-library/react");

const server = http.createServer(app).listen(port, function (err) {
  if (err) console.log(err);
  else console.log("HTTP server on http://localhost:%s", port);
});

const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});
let onlineUsersId = [];

io.on("connection", function (socket) {
  socket.on("login", function (data) {
    console.log("a user " + data._id + " connected");
    if (onlineUsersId.indexOf(data._id) === -1) {
      onlineUsersId.push(data._id);
    }
    socket.broadcast.emit("updateOnlineUsers", { onlineUsersId });
    socket.emit("updateOnlineUsers", { onlineUsersId });
  });

  socket.on("logout", function (data) {
    console.log("a user " + data._id + " disconnected");
    onlineUsersId = onlineUsersId.filter((userId) => userId !== data._id);
    socket.broadcast.emit("updateOnlineUsers", { onlineUsersId });
  });

  socket.on("disconnect", function () {
    console.log("user " + socket.id + " disconnected");
  });

  // setInterval(() => {
  //   onlineUsersId.forEach((id, index) => {
  //     socket.emit('updateOnlineUsers', "world")
  //   })
  // }, 1000)
});
