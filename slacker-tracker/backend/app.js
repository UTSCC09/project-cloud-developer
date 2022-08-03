const express = require('express')
const mongoose = require('mongoose')
const app = express()
const { Worker } = require('worker_threads')
const { UserModel, FriendListModel, TimerModel } = require('./db')
const cron = require('node-cron')

const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const cors = require('cors')
app.use(cors({ credentials: true, origin: process.env.FRONTEND_URL || 'http://localhost:3000' }))

const session = require('express-session')
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'my secret',
    resave: false,
    saveUninitialized: true
  })
)

require('dotenv').config()

const mongodbUrl =
  process.env.MONGODB_URL || 'mongodb://localhost:27017/slacker-tracker'
const port = process.env.PORT || 3001

mongoose.connect(mongodbUrl)

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

app.get('/api/generateSummaryEmail', (req, res, next) => {
  if (!req.query._id) { return res.status(400).json({ message: 'missing _id in request query' }) }
  if (!req.query.sendEmail) {
    return res
      .status(400)
      .json({ message: 'missing sendEmail in request query' })
  }
  UserModel.findOne({ _id: req.query._id }, (err, user) => {
    if (err) return res.status(500).json({ message: err })
    const now = new Date()
    const createdAt = new Date(user.createdAt)
    const nowDay = now.getDay() === 0 ? 7 : now.getDay()
    const createdAtDay = createdAt.getDay() === 0 ? 7 : createdAt.getDay()
    if (
      now.getTime() - createdAt.getTime() < 1000 * 60 * 60 * 24 * 7 &&
      nowDay > createdAtDay
    ) {
      return res
        .status(400)
        .json({ message: 'This account is registerd in this week' })
    }
    const workerData = {}
    workerData.name = user.name
    workerData.workTimeTotal = user.lastWeekReport.workTimeTotal
    workerData.playTimeTotal = user.lastWeekReport.playTimeTotal
    workerData.unallocatedTimeTotal = user.lastWeekReport.unallocatedTimeTotal
    workerData.offlineTimeTotal = user.lastWeekReport.offlineTimeTotal
    workerData.slackerScore = user.slackerScore
    workerData.sendEmail = req.query.sendEmail

    FriendListModel.findOne(
      { _id: req.query._id },
      'friendList',
      (err, user) => {
        if (err) return res.status(500).json({ message: err })
        UserModel.find({}, '_id slackerScore', (err, users) => {
          if (err) return res.status(500).json({ message: err })
          const friendScores = users
            .filter((person) => user.friendList.includes(person._id))
            .map((person) => person.slackerScore)

          workerData.friendScores = friendScores
          console.log('data', workerData)
          const worker = new Worker('./mailer.js', { workerData })
          worker.on('message', () =>
            res.status(200).json({ message: 'success' })
          )
          worker.on('error', () => res.status(500).json({ message: 'fail' }))
        })
      }
    )
  })
})

const users = require('./routes/users')
app.use('/api/user', users)

const friendLists = require('./routes/friendLists')
app.use('/api/friendList', friendLists)

const timers = require('./routes/timers')
app.use('/api/timer', timers)

app.use(express.static('static'))

// at every Monday 1:00
const calculationFrequency = '0 1 * * * monday'

// at the fifth second in every minutes
const testFrequency = '5 * * * * *'

// * means every
// at second minutes hours date month day-of-week
//     "*      *      *     *     *       *""
cron.schedule(calculationFrequency, () => {
  const workerReset = new Worker('./weeklyReport.js')
  workerReset.on('message', () => {
    console.log('Weekly report generation complete!')
  })
  workerReset.on('error', () => console.log('Weekly report generation fail!!'))
})

const http = require('http')
const { getByTestId } = require('@testing-library/react')

const server = http.createServer(app).listen(port, function (err) {
  if (err) console.log(err)
  else console.log('HTTP server on http://localhost:%s', port)
})

const io = require('socket.io')(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
})
let onlineUsersId = []

io.on('connection', function (socket) {
  socket.on('login', function (data) {
    socket.userId = data._id
    console.log('a user ' + data._id + ' connected')
    if (onlineUsersId.indexOf(data._id) === -1) {
      onlineUsersId.push(data._id)
    }
    io.emit('updateOnlineUsers', { onlineUsersId })
    // console.log('LOGIN current online users' + onlineUsersId)
  })

  socket.on('logout', function (data) {
    console.log('a user ' + data._id + ' disconnected')
    onlineUsersId = onlineUsersId.filter((userId) => userId !== data._id)
    io.emit('updateOnlineUsers', { onlineUsersId })
    // console.log('LOGOUT current online users' + onlineUsersId)
    // TODO: run offline timer for this user
  })

  socket.on('refresh', function () {
    socket.broadcast.emit('refresh')
    // console.log('REFRESH current online users' + onlineUsersId)
  })

  socket.on('disconnect', function () {
    console.log('user ' + socket.id + ' disconnected')
    onlineUsersId = onlineUsersId.filter((userId) => userId !== socket.userId)
    io.emit('updateOnlineUsers', { onlineUsersId })
    // console.log('DISCONNECT current online users' + onlineUsersId)
    // TODO: run offline timer for this user
    // TODO: make disconnect stick (bounces back to green)
  })
})
