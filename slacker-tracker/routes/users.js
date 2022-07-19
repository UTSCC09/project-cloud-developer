const auth = require('../auth')
const cookie = require('cookie')

const express = require('express')
const bcrypt = require('bcrypt')
const router = express.Router()
const { UserModel, FriendListModel, TimerModel } = require('../db')

router.get('/', auth.isAuthenticated, (req, res, next) => {
  if (!('email' in req.query)) { return res.status(400).json({ message: 'email is missing' }) }

  UserModel.findOne({ email: req.query.email }, '-password', (err, user) => {
    if (err) return res.status(500).json({ message: err })
    if (!user) return res.status(404).json({ message: 'user does not exist' })
    return res.status(200).json({ message: 'success', user })
  })
})

router.post('/username', auth.isAuthenticated, (req, res, next) => {
  if (!('email' in req.body)) { return res.status(400).json({ message: 'email is missing' }) }
  if (!('username' in req.body)) { return res.status(400).json({ message: 'username is missing' }) }
  if (req.session.email !== req.body.email) { return res.status(401).json({ message: 'access denied' }) }
  UserModel.findOne({ email: req.body.email }, '-password', (err, user) => {
    if (err) return res.status(500).json({ message: err })
    if (!user) return res.status(404).json({ message: 'user does not exist' })
    UserModel.updateOne(
      { email: req.body.email },
      { username: req.body.username },
      (err, data) => {
        if (err) return res.status(500).json({ message: err })
        return res.status(200).json({ message: 'success', data })
      }
    )
  })
})

router.post('/password', auth.isAuthenticated, (req, res, next) => {
  if (!('email' in req.body)) { return res.status(400).json({ message: 'email is missing' }) }
  if (!('old_password' in req.body)) { return res.status(400).json({ message: 'old_password is missing' }) }
  if (!('new_password' in req.body)) { return res.status(400).json({ message: 'new_password is missing' }) }

  if (req.body.new_password.length < 6) {
    return res.status(400).json({
      message: 'the length of the new password must be greater than 5'
    })
  }

  if (req.session.email !== req.body.email) { return res.status(401).json({ message: 'access denied' }) }

  UserModel.findOne({ email: req.body.email }, (err, user) => {
    if (err) return res.status(500).json({ message: err })
    if (!user) return res.status(404).json({ message: 'user does not exist' })
    bcrypt.compare(req.body.old_password, user.password, function (err, valid) {
      if (err) return res.status(500).json({ message: err })
      if (!valid) {
        return res
          .status(401)
          .json({ message: 'incorrect password' })
      }
      bcrypt.genSalt(10, function (err, salt) {
        if (err) return res.status(500).json({ message: err })
        bcrypt.hash(req.body.new_password, salt, function (err, hash) {
          if (err) return res.status(500).json({ message: err })
          UserModel.updateOne(
            { email: req.body.email },
            { password: hash },
            (err, data) => {
              if (err) return res.status(500).json({ message: err })
              return res.status(200).json({ message: 'success', data })
            }
          )
        })
      })
    })
  })
})

router.post('/signup', (req, res, next) => {
  if (!('username' in req.body)) { return res.status(400).json({ message: 'username is missing' }) }
  if (!('password' in req.body)) { return res.status(400).json({ message: 'password is missing' }) }
  if (!('email' in req.body)) { return res.status(400).json({ message: 'email is missing' }) }

  const username = req.body.username
  const password = req.body.password
  const email = req.body.email

  if (username.length > 20 || username.length < 3) {
    return res
      .status(400)
      .json({ message: 'the length of the username must be between 3 and 20' })
  }
  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: 'the length of the password must be greater than 5' })
  }

  UserModel.findOne({ email: req.body.email }, '-password', (err, user) => {
    if (err) return res.status(500).json({ message: err })
    if (user) return res.status(404).json({ message: 'email already exist' })
    bcrypt.genSalt(10, function (err, salt) {
      if (err) return res.status(500).json({ message: err })
      bcrypt.hash(password, salt, function (err, hash) {
        if (err) return res.status(500).json({ message: err })
        const newUser = {
          email,
          username,
          password: hash,
          authentication_type: 'standard'
        }
        UserModel.updateOne(
          { email },
          newUser,
          { upsert: true },
          (err, data) => {
            if (err) return res.status(500).json({ message: err })

            // Create FriendListModel
            const newUserFriendList = {
              email,
              friendList: [],
              sendedRequests: [],
              receivedRequests: []
            }
            FriendListModel.updateOne(
              { email },
              newUserFriendList,
              { upsert: true },
              (err, data) => {
                if (err) return res.status(500).json({ message: err })
              }
            )

            // Create TimerModel
            const newUserTimer = {
              email,
              unallocatedTime: 1000 * 60 * 60 * 24,
              allocatedTime: [],
              duty: { name: '', startTime: Date.now() }
            }
            TimerModel.updateOne(
              { email },
              newUserTimer,
              { upsert: true },
              (err, data) => {
                if (err) return res.status(500).json({ message: err })
              }
            )
            return res.status(200).json({ message: 'success', data })
          }
        )
      })
    })
  })
})

router.post('/signin', function (req, res, next) {
  if (!('email' in req.body)) { return res.status(400).json({ message: 'username is missing' }) }
  if (!('password' in req.body)) { return res.status(400).json({ message: 'password is missing' }) }

  const email = req.body.email
  const password = req.body.password

  UserModel.findOne({ email }, (err, user) => {
    if (err) return res.status(500).json({ message: err })
    if (!user) {
      return res
        .status(401)
        .json({ message: 'incorrect username or password' })
    }
    bcrypt.compare(password, user.password, function (err, valid) {
      if (err) return res.status(500).json({ message: err })
      if (!valid) {
        return res
          .status(401)
          .json({ message: 'incorrect username or password' })
      }
      // start a session
      req.session.user = user
      req.session.save()
      // // initialize cookie
      // res.setHeader('Set-Cookie', cookie.serialize('email', user.email, {
      //   path: '/',
      //   maxAge: 60 * 60 * 24 * 7 // 1 week in number of seconds
      // }))
      // console.log(req.session.user)
      return res.status(200).json({ message: 'success', user })
    })
  })
})

router.post('/oauth2/google', (req, res, next) => {
  if (!('username' in req.body)) return res.status(400).json({ message: 'username is missing' })
  if (!('email' in req.body)) return res.status(400).json({ message: 'email is missing' })
  if (!('googleId' in req.body)) return res.status(400).json({ message: 'googleId is missing' })

  const username = req.body.username
  const email = req.body.email
  const googleId = req.body.googleId

  const newUser = {
    email,
    username,
    authentication_type: 'google',
    googleId,
    avatar: req.body.avatar,
    access_token: req.body.access_token
  }

  UserModel.findOne({ email, authentication_type: 'standard' }, (err, user) => {
    if (err) return res.status(500).json({ message: err })
    if (user) {
      UserModel.updateOne({ email }, { googleId, access_token: req.body.access_token, authentication_type: 'google' }, (err, data) => {
        if (err) return res.status(500).json({ message: err })
      })
      // start a session
      req.session.user = user
      req.session.save()
      // // initialize cookie
      // res.setHeader('Set-Cookie', cookie.serialize('email', user.email, {
      //   path: '/',
      //   maxAge: 60 * 60 * 24 * 7 // 1 week in number of seconds
      // }))
      // console.log(req.session.user)
      return res.status(200).json({ message: 'email already used in standard signup', user })
    }
    UserModel.findOne({ email, googleId }, (err, existUser) => {
      if (err) return res.status(500).json({ message: err })
      if (existUser) {
        UserModel.updateOne({ googleId }, { access_token: req.body.access_token, avatar: req.body.avatar }, (err, data) => {
          if (err) return res.status(500).json({ message: err })
        })
        // start a session
        req.session.user = existUser
        req.session.save()
        // // initialize cookie
        // res.setHeader('Set-Cookie', cookie.serialize('email', newUser.email, {
        //   path: '/',
        //   maxAge: 60 * 60 * 24 * 7 // 1 week in number of seconds
        // }))
        // console.log('this one', req.session)
        return res.status(200).json({ message: 'success', user: existUser })
      }
      UserModel.updateOne({ googleId }, newUser, { upsert: true }, (err, data) => {
        if (err) return res.status(500).json({ message: err })
        // Create FriendListModel
        const newUserFriendList = {
          email,
          friendList: [],
          sendedRequests: [],
          receivedRequests: []
        }
        FriendListModel.updateOne(
          { email },
          newUserFriendList,
          { upsert: true },
          (err, data) => {
            if (err) return res.status(500).json({ message: err })
          }
        )

        // Create TimerModel
        const newUserTimer = {
          email,
          unallocatedTime: 1000 * 60 * 60 * 24,
          allocatedTime: [],
          duty: { name: '', startTime: Date.now() }
        }
        TimerModel.updateOne(
          { email },
          newUserTimer,
          { upsert: true },
          (err, data) => {
            if (err) return res.status(500).json({ message: err })
          }
        )
        // start a session
        req.session.user = newUser
        req.session.save()
        // // initialize cookie
        // res.setHeader('Set-Cookie', cookie.serialize('email', newUser.email, {
        //   path: '/',
        //   maxAge: 60 * 60 * 24 * 7 // 1 week in number of seconds
        // }))
        // console.log(req.session.user)
        return res.status(200).json({ message: 'first time google user', user: newUser })
      })
    })
  })
})

router.get('/signout', function (req, res, next) {
  console.log('before signout', req.session)
  req.session.destroy()
  // res.setHeader('Set-Cookie', cookie.serialize('email', '', {
  //   path: '/',
  //   maxAge: 60 * 60 * 24 * 7 // 1 week in number of seconds
  // }))
  console.log('signout', req.session)
  return res.status(200).json({ message: 'success' })
})

module.exports = router
