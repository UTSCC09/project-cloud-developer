const express = require('express')
const { body, validationResult } = require('express-validator')
const router = express.Router()
const { FriendListModel, TimerModel } = require('../db')

router.get('/self', (req, res) => {
  if (!('email' in req.query)) return res.status(400).json('missing email in request query')
  TimerModel.findOne(
    { email: req.query.email },
    'duty email allocatedTime unallocatedTime',
    (err, user) => {
      if (err) return res.status(500).json({ message: err })
      if (!user) {
        return res
          .status(404)
          .json({ message: `user ${req.query.email} does not exist` })
      }
      return res.status(200).json({ message: 'success', data: user })
    }
  )
})

router.get(
  '/friends',
  [body('email').isEmail().trim().escape()],
  (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() })
    }
    FriendListModel.findOne(
      { email: req.body.email },
      'friendList',
      (err, user) => {
        if (err) return res.status(500).json({ message: err })
        if (!user) {
          return res
            .status(404)
            .json({ message: `user ${req.body.email} does not exist` })
        }

        TimerModel.find(
          {},
          'duty email allocatedTime unallocatedTime',
          (err, friendsTimer) => {
            if (err) return res.status(500).json({ message: err })
            if (!friendsTimer) {
              return res
                .status(404)
                .json({ message: 'user\'s timer does not exist' })
            }
            friendsTimer = friendsTimer.filter((el) =>
              user.friendList.includes(el.email)
            )
            return res
              .status(200)
              .json({ message: 'success', data: friendsTimer })
          }
        )
      }
    )
  }
)

router.post(
  '/allocateTimer',
  [
    body('email').isEmail().trim().escape(),
    body('dutyName').isString().trim().escape(),
    body('orgLength').isString().trim().escape()
  ],
  (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() })
    }

    if (req.body.dutyName === '') { return res.status(400).json({ message: 'Duty name is not defined' }) }
    const orgLength = parseInt(req.body.orgLength)

    TimerModel.findOne({ email: req.body.email }, (err, user) => {
      if (err) return res.status(500).json({ message: err })
      if (!user) {
        return res
          .status(404)
          .json({ message: `user ${req.body.email} does not exist` })
      }

      if (
        user.allocatedTime.find((el) => el.dutyName === req.body.dutyName) !==
        undefined
      ) { return res.status(400).json({ message: 'Duty already exists' }) }

      if (orgLength > user.unallocatedTime) {
        return res
          .status(400)
          .json({ message: "You don't have enough unallocated time left" })
      }
      user.allocatedTime.push({
        dutyName: req.body.dutyName,
        orgLength,
        timer: orgLength
      })

      TimerModel.updateOne(
        { email: req.body.email },
        {
          allocatedTime: user.allocatedTime,
          unallocatedTime: user.unallocatedTime - orgLength
        },
        { upsert: true },
        (err, data) => {
          if (err) return res.status(500).json({ message: err })
          return res.status(200).json({
            message: 'success',
            data
          })
        }
      )
    })
  }
)

router.post(
  '/deleteTimer',
  [
    body('email').isEmail().trim().escape(),
    body('dutyName').isString().trim().escape()
  ],
  (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() })
    }

    TimerModel.findOne({ email: req.body.email }, (err, user) => {
      if (err) return res.status(500).json({ message: err })
      if (!user) {
        return res
          .status(404)
          .json({ message: `user ${req.body.email} does not exist` })
      }

      const duty = user.allocatedTime.find(
        (el) => el.dutyName === req.body.dutyName
      )
      if (duty === undefined) { return res.status(404).json({ message: 'Duty not found' }) }

      TimerModel.updateOne(
        { email: req.body.email },
        {
          allocatedTime: user.allocatedTime.filter(
            (el) => el.dutyName !== req.body.dutyName
          ),
          unallocatedTime: user.unallocatedTime + duty.orgLength
        },
        { upsert: true },
        (err, data) => {
          if (err) return res.status(500).json({ message: err })
          return res.status(200).json({
            message: 'success',
            data
          })
        }
      )
    })
  }
)

router.post(
  '/modifyTimer',
  [
    body('email').isEmail().trim().escape(),
    body('dutyName').isString().trim().escape(),
    body('newTimeLength').isString().trim().escape()
  ],
  (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() })
    }

    const newTimeLength = parseInt(req.body.newTimeLength)

    TimerModel.findOne({ email: req.body.email }, (err, user) => {
      if (err) return res.status(500).json({ message: err })
      if (!user) {
        return res
          .status(404)
          .json({ message: `user ${req.body.email} does not exist` })
      }

      const duty = user.allocatedTime.find(
        (el) => el.dutyName === req.body.dutyName
      )
      if (duty === undefined) { return res.status(404).json({ message: 'Duty not found' }) }
      const newUnallocatedTime =
        user.unallocatedTime + duty.orgLength - newTimeLength
      if (newUnallocatedTime < 0) { return res.status(400).json("You don't have enough unallocated time") }

      user.allocatedTime = user.allocatedTime.filter(
        (el) => el.dutyName !== req.body.dutyName
      )
      duty.timer = duty.timer + newTimeLength - duty.orgLength
      if (duty.timer < 0) duty.timer = 0
      duty.orgLength = newTimeLength
      user.allocatedTime.push(duty)

      TimerModel.updateOne(
        { email: req.body.email },
        {
          allocatedTime: user.allocatedTime,
          unallocatedTime: newUnallocatedTime
        },
        { upsert: true },
        (err, data) => {
          if (err) return res.status(500).json({ message: err })
          return res.status(200).json({
            message: 'success',
            data
          })
        }
      )
    })
  }
)

router.post(
  '/startTimer',
  [
    body('email').isEmail().trim().escape(),
    body('dutyName').isString().trim().escape()
  ],
  (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() })
    }

    TimerModel.findOne({ email: req.body.email }, (err, user) => {
      if (err) return res.status(500).json({ message: err })
      if (!user) {
        return res
          .status(404)
          .json({ message: `user ${req.body.email} does not exist` })
      }
      if (user.duty.name !== '') {
        return res.status(400).json({
          message: `You are working on ${user.duty.name} right now`
        })
      }

      const duty = user.allocatedTime.find(
        (el) => el.dutyName === req.body.dutyName
      )
      if (duty === undefined) { return res.status(404).json({ message: 'Duty not found' }) }
      if (duty.timer <= 0) {
        return res.status(400).json({
          message: `You have already complete ${duty.dutyName} today`
        })
      }

      const startTime = Date.now()
      TimerModel.updateOne(
        { email: req.body.email },
        {
          duty: { name: duty.dutyName, startTime }
        },
        { upsert: true },
        (err, data) => {
          if (err) return res.status(500).json({ message: err })
          data.startTime = startTime
          data.timeLeft = duty.timer
          return res.status(200).json({
            message: 'success',
            data
          })
        }
      )
    })
  }
)

router.post(
  '/stopTimer',
  [
    body('email').isEmail().trim().escape(),
    body('dutyName').isString().trim().escape(),
    body('stopDate').isString().trim().escape()
  ],
  (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() })
    }

    // Back end timer validation. The difference should be less than 1 seconds
    const backEndDate = Date.now()
    const stopDate = parseInt(req.body.stopDate)
    if (Math.abs(stopDate - backEndDate) >= 1000) {
      return res
        .status(400)
        .json(
          `Stop time error! Expecting: ${backEndDate}, but received: ${stopDate}`
        )
    }

    TimerModel.findOne({ email: req.body.email }, (err, user) => {
      if (err) return res.status(500).json({ message: err })
      if (!user) {
        return res
          .status(404)
          .json({ message: `user ${req.body.email} does not exist` })
      }
      if (user.duty.name === '') {
        return res.status(400).json({
          message: 'You are working on nothing right now'
        })
      }

      const duty = user.allocatedTime.find(
        (el) => el.dutyName === req.body.dutyName
      )
      if (duty === undefined) { return res.status(404).json({ message: 'Duty not found' }) }

      const timePassed = backEndDate - user.duty.startTime
      duty.timer = duty.timer - timePassed

      // Validate the timer. If it is less than 1 second, consider it as 0
      if (Math.abs(duty.timer) < 1000) duty.timer = 0
      else if (duty.timer < -1000) {
      // exceed the timer. This should not happened
        return res.status(400).json('Timer error: already run out of time')
      }

      user.allocatedTime = user.allocatedTime.filter(
        (el) => el.dutyName !== duty.dutyName
      )
      user.allocatedTime.push(duty)

      TimerModel.updateOne(
        { email: req.body.email },
        {
          allocatedTime: user.allocatedTime,
          duty: { name: '', startTime: backEndDate }
        },
        { upsert: true },
        (err, data) => {
          if (err) return res.status(500).json({ message: err })
          data.stopTime = backEndDate
          data.timeLeft = duty.timer
          return res.status(200).json({
            message: 'success',
            data
          })
        }
      )
    })
  }
)

router.post(
  '/resetTimer',
  [
    body('email').isEmail().trim().escape(),
    body('dutyName').isString().trim().escape()
  ],
  (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() })
    }

    TimerModel.findOne({ email: req.body.email }, (err, user) => {
      if (err) return res.status(500).json({ message: err })
      if (!user) {
        return res
          .status(404)
          .json({ message: `user ${req.body.email} does not exist` })
      }

      const duty = user.allocatedTime.find(
        (el) => el.dutyName === req.body.dutyName
      )
      if (duty === undefined) { return res.status(404).json({ message: 'Duty not found' }) }

      duty.timer = duty.orgLength

      user.allocatedTime = user.allocatedTime.filter(
        (el) => el.dutyName !== duty.dutyName
      )
      user.allocatedTime.push(duty)

      TimerModel.updateOne(
        { email: req.body.email },
        {
          allocatedTime: user.allocatedTime
        },
        { upsert: true },
        (err, data) => {
          if (err) return res.status(500).json({ message: err })
          return res.status(200).json({
            message: 'success',
            data
          })
        }
      )
    })
  }
)

router.post(
  '/resetAllTimer',
  [body('email').isEmail().trim().escape()],
  (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() })
    }

    TimerModel.findOne({ email: req.body.email }, (err, user) => {
      if (err) return res.status(500).json({ message: err })
      if (!user) {
        return res
          .status(404)
          .json({ message: `user ${req.body.email} does not exist` })
      }

      const resetTime = []
      user.allocatedTime.forEach((duty) => {
        duty.timer = duty.orgLength
        resetTime.push(duty)
      })

      TimerModel.updateOne(
        { email: req.body.email },
        {
          allocatedTime: resetTime,
          duty: { name: '', startTime: Date.now() }
        },
        { upsert: true },
        (err, data) => {
          if (err) return res.status(500).json({ message: err })
          return res.status(200).json({
            message: 'success',
            data
          })
        }
      )
    })
  }
)

router.post('/resetAllUser', (req, res, next) => {
  TimerModel.find({}, (err, users) => {
    if (err) return res.status(500).json({ message: err })
    users.forEach((user) => {
      const resetTime = []
      user.allocatedTime.forEach((duty) => {
        duty.timer = duty.orgLength
        resetTime.push(duty)
      })

      TimerModel.updateOne(
        { email: req.body.email },
        {
          allocatedTime: resetTime,
          duty: { name: '', startTime: Date.now() }
        },
        { upsert: true },
        (err, data) => {
          if (err) return res.status(500).json({ message: err })
        }
      )
    })
    return res.status(200).json({
      message: 'success',
      data: { numUsers: users.length }
    })
  })
})

module.exports = router
