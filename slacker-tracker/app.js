const express = require('express')
const mongoose = require('mongoose')
const app = express()

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

const cookie = require('cookie')

require('dotenv').config()

const mongodbUrl =
  process.env.MONGODB_URL || 'mongodb://localhost:27017/slacker-tracker'
const port = process.env.PORT || 3001

mongoose.connect(mongodbUrl)

// const { isAuthenticated } = require("./auth");
// app.use(isAuthenticated);

app.use(function (req, res, next) {
  // let username = (req.session.user)? req.session.user._id : '';
  const email = (req.session.user) ? req.session.user.email : ''
  res.setHeader('Set-Cookie', cookie.serialize('email', email, {
    path: '/',
    maxAge: 60 * 60 * 24 * 7 // 1 week in number of seconds
  }))
  // req.email = req.session.email ? req.session.email : null
  console.log('app use: ', req.session.user)
  console.log('HTTP request', req.method, req.url, req.body)
  next()
})

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
