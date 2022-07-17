const auth = require('../auth')

const express = require('express')
const { body, validationResult } = require('express-validator')
// const { check, body, validationResult } = require('express-validator')
const router = express.Router()
const { FriendListModel, UserModel, TimerModel } = require('../db')

const newFriendListData = function (
  operation,
  sender,
  receiver,
  senderEmail,
  receiverEmail
) {
  let newSenderData
  let newReceiverData

  const senderFriendList = sender.friendList
  const senderSendedRequests = sender.sendedRequests
  const senderReceivedRequests = sender.receivedRequests
  const receiverFriendList = receiver.friendList
  const receiverSendedRequests = receiver.sendedRequests
  const receiverReceivedRequests = receiver.receivedRequests

  switch (operation) {
    case 'send':
      if (
        senderSendedRequests.find((el) => el === receiverEmail) === undefined &&
        receiverReceivedRequests.find((el) => el === senderEmail) === undefined
      ) {
        senderSendedRequests.push(receiverEmail)
        receiverReceivedRequests.push(senderEmail)
      }

      newSenderData = {
        sendedRequests: senderSendedRequests
      }
      newReceiverData = {
        receivedRequests: receiverReceivedRequests
      }
      break
    case 'accept':
      if (
        senderFriendList.find((el) => el === receiverEmail) === undefined &&
        receiverFriendList.find((el) => el === senderEmail) === undefined
      ) {
        senderFriendList.push(receiverEmail)
        receiverFriendList.push(senderEmail)
      }

      newSenderData = {
        friendList: senderFriendList,
        sendedRequests: senderSendedRequests.filter(
          (email) => email !== receiverEmail
        ),
        receivedRequests: senderReceivedRequests.filter(
          (email) => email !== receiverEmail
        )
      }
      newReceiverData = {
        friendList: receiverFriendList,
        sendedRequests: receiverSendedRequests.filter(
          (email) => email !== senderEmail
        ),
        receivedRequests: receiverReceivedRequests.filter(
          (email) => email !== senderEmail
        )
      }
      break
    case 'cancel':
      newSenderData = {
        sendedRequests: senderSendedRequests.filter(
          (email) => email !== receiverEmail
        )
      }
      newReceiverData = {
        receivedRequests: receiverReceivedRequests.filter(
          (email) => email !== senderEmail
        )
      }
      break
    case 'delete':
      newSenderData = {
        friendList: senderFriendList.filter((email) => email !== receiverEmail)
      }
      newReceiverData = {
        friendList: receiverFriendList.filter((email) => email !== senderEmail)
      }
      break
  }

  return [newSenderData, newReceiverData]
}

const handleRequest = function (operation, senderEmail, receiverEmail, res) {
  let newSenderData
  let newReceiverData

  FriendListModel.findOne({ email: senderEmail }, '', (err, sender) => {
    if (err) return res.status(500).json({ message: err })
    if (!sender) {
      return res
        .status(404)
        .json({ message: `user ${senderEmail} does not exist` })
    }
    FriendListModel.findOne({ email: receiverEmail }, '', (err, receiver) => {
      if (err) return res.status(500).json({ message: err })
      if (!receiver) {
        return res
          .status(404)
          .json({ message: `user ${receiverEmail} does not exist` })
      }

      switch (operation) {
        case 'send':
          if (
            sender.friendList.find((el) => el === receiverEmail) !==
              undefined ||
            receiver.friendList.find((el) => el === senderEmail) !== undefined
          ) {
            return res
              .status(400)
              .json({ message: 'You are already friends!' })
          }
          break

        case 'accept':
          if (
            sender.friendList.find((el) => el === receiverEmail) !==
              undefined ||
            receiver.friendList.find((el) => el === senderEmail) !== undefined
          ) {
            return res
              .status(400)
              .json({ message: 'You are already friends!' })
          }
          if (
            sender.friendList.find((el) => el === receiverEmail) !==
              undefined ||
            receiver.friendList.find((el) => el === senderEmail) !== undefined
          ) {
            return res
              .status(400)
              .json({ message: 'You are already friends!' })
          }
          if (
            sender.sendedRequests.find((el) => el === receiverEmail) ===
              undefined ||
            receiver.receivedRequests.find((el) => el === senderEmail) ===
              undefined
          ) {
            return res
              .status(404)
              .json({ message: 'Friend request not found' })
          }
          break

        case 'cancel':
          if (
            sender.sendedRequests.find((el) => el === receiverEmail) ===
              undefined ||
            receiver.receivedRequests.find((el) => el === senderEmail) ===
              undefined
          ) {
            return res
              .status(404)
              .json({ message: 'Friend request not found' })
          }
          break

        case 'delete':
          if (
            sender.friendList.find((el) => el === receiverEmail) ===
              undefined ||
            receiver.friendList.find((el) => el === senderEmail) === undefined
          ) { return res.status(400).json({ message: 'Friend not found' }) }
          break
      }

      [newSenderData, newReceiverData] = newFriendListData(
        operation,
        sender,
        receiver,
        senderEmail,
        receiverEmail
      )

      FriendListModel.updateOne(
        { email: senderEmail },
        newSenderData,
        { upsert: true },
        (err, data1) => {
          if (err) return res.status(500).json({ message: err })
          FriendListModel.updateOne(
            { email: receiverEmail },
            newReceiverData,
            { upsert: true },
            (err, data2) => {
              if (err) return res.status(500).json({ message: err })
              return res.status(200).json({
                message: 'success',
                data: [data1, data2]
              })
            }
          )
        }
      )
    })
  })
}

router.get(
  '/',
  auth.isAuthenticated,
  (req, res, next) => {
    if (!('email' in req.query)) return res.status(400).json('missing email in request parameter')

    FriendListModel.findOne({ email: req.query.email }, (err, user) => {
      if (err) return res.status(500).json({ message: err })
      if (!user) {
        return res
          .status(404)
          .json({ message: `user ${req.query.email} does not exist` })
      }
      // if (req.session.email != req.body.email)
      //   return res.status(401).json({ message: "access denied" });
      return res
        .status(200)
        .json({ message: 'success', data: user.friendList })
    })
  }
)

router.post(
  '/sendRequest',
  auth.isAuthenticated,
  [
    body('senderEmail').isEmail().trim().escape(),
    body('receiverEmail').isEmail().trim().escape()
  ],
  (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() })
    }
    // if (req.session.email != req.body.senderEmail)
    //     return res.status(401).json({ message: "access denied" });
    handleRequest('send', req.body.senderEmail, req.body.receiverEmail, res)
  }
)

router.post(
  '/acceptRequest',
  auth.isAuthenticated,
  [
    body('senderEmail').isEmail().trim().escape(),
    body('receiverEmail').isEmail().trim().escape()
  ],
  (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() })
    }
    // if (req.session.email != req.body.receiverEmail)
    //     return res.status(401).json({ message: "access denied" });
    handleRequest('accept', req.body.senderEmail, req.body.receiverEmail, res)
  }
)

router.post(
  '/cancelRequest',
  auth.isAuthenticated,
  [
    body('senderEmail').isEmail().trim().escape(),
    body('receiverEmail').isEmail().trim().escape()
  ],
  (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() })
    }
    // if (req.session.email != req.body.senderEmail && req.session.email != req.body.receiverEmail)
    //     return res.status(401).json({ message: "access denied" });
    handleRequest('cancel', req.body.senderEmail, req.body.receiverEmail, res)
  }
)

router.delete(
  '/deleteFriend',
  auth.isAuthenticated,
  [
    body('email1').trim().escape(),
    body('email2').trim().escape()
  ],
  (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() })
    }
    // if (req.session.email != req.body.email1 && req.session.email != req.body.email2)
    //     return res.status(401).json({ message: "access denied" });
    handleRequest('delete', req.body.email1, req.body.email2, res)
  }
)

router.get(
  '/getRequest',
  auth.isAuthenticated,
  (req, res) => {
    if (!('email' in req.query)) return res.status(400).json('missing email in request query')
    FriendListModel.findOne({ email: req.query.email }, 'receivedRequests', (err, requests) => {
      if (err) return res.status(500).json({ message: err })
      if (!requests) {
        return res
          .status(404)
          .json({ message: `user ${req.query.email} does not exist` })
      }
      res.status(200).json({ message: 'success', requests })
    })
  }
)

router.get(
  '/getFriendsInfo',
  (req, res) => {
    if (!('email' in req.query)) return res.status(400).json('missing email in request query')
    FriendListModel.findOne({ email: req.query.email }, 'friendList', (err, friends) => {
      if (err) return res.status(500).json({ message: err })
      if (!friends) {
        return res
          .status(404)
          .json({ message: `user ${req.query.email} does not exist` })
      }
      UserModel.find({}, '-password', (err, users)=>{
        if (err) return res.status(500).json({ message: err });
        let friendsInfo = users.filter(user => friends.friendList.includes(user.email));
        
        TimerModel.find({}, (err, timers)=>{
          if (err) return res.status(500).json({ message: err });
          let timersInfo = timers.filter(userTimer => friends.friendList.includes(userTimer.email));
        
          return res.status(200).json({ message: 'success', data:{friendsInfo: friendsInfo, timersInfo: timersInfo} });
        })
      });
    });
  }
)

module.exports = router
