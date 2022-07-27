const express = require('express')
const mongoose = require('mongoose')
const app = express()
const { Worker } = require('worker_threads')
const { UserModel, TimerModel } = require("./db");

const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const cors = require('cors')
app.use(cors({ credentials: true, origin: 'http://localhost:3000' }))

const session = require('express-session')
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'my secret',
    resave: false,
    saveUninitialized: true
  })
)

// const cookie = require('cookie')

require('dotenv').config()

const mongodbUrl =
  process.env.MONGODB_URL || 'mongodb://localhost:27017/slacker-tracker'
const port = process.env.PORT || 3001

mongoose.connect(mongodbUrl)

// const { isAuthenticated } = require("./auth");
// app.use(isAuthenticated);

app.use(function (req, res, next) {
  // let username = (req.session.user)? req.session.user._id : '';
  // const email = (req.session.user) ? req.session.user.email : ''
  // res.setHeader('Set-Cookie', cookie.serialize('email', email, {
  //   path: '/',
  //   maxAge: 60 * 60 * 24 * 7 // 1 week in number of seconds
  // }))
  // req.email = req.session.email ? req.session.email : null
  // console.log('app use: ', req.session)
  console.log('HTTP request', req.method, req.url, req.body)
  next()
})

app.get(
  "/api/generateSummaryEmail",
  (req, res, next) => {
    if (!req.query._id) return res.status(400).json({ message: "missing _id in request query" })
    if (!req.query.sendEmail) return res.status(400).json({ message: "missing sendEmail in request query" })

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
          workerData.sendEmail = req.query.sendEmail
          const worker = new Worker('./mailer.js', { workerData });
          worker.on('message', () => res.status(200).json({ message: "success" }));
          worker.on('error', () => res.status(500).json({ message: "fail" }));
        }
      );
    });
  }
);

const users = require('./routes/users')
app.use('/api/user', users)

const friendLists = require('./routes/friendLists')
app.use('/api/friendList', friendLists)

const timers = require('./routes/timers')
app.use('/api/timer', timers)

app.use(express.static('static'))

const http = require('http')

http.createServer(app).listen(port, function (err) {
  if (err) console.log(err)
  else console.log('HTTP server on http://localhost:%s', port)
})
