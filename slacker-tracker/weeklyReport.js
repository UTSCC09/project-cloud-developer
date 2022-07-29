const { parentPort } = require('worker_threads')
const mongoose = require('mongoose')

const mongodbUrl =
  process.env.MONGODB_URL || 'mongodb://localhost:27017/slacker-tracker'

mongoose.connect(mongodbUrl)
const { UserModel, TimerModel } = require('./db')
const { concatAST } = require('graphql')

const now = new Date()

const calculateSlackerScore = function (
  base,
  correction,
  good,
  limit,
  weeklyTotal
) {
  const actualTotal = weeklyTotal / (1000 * 60 * 60)

  if (good.at(0) <= actualTotal && actualTotal <= good.at(1)) {
    // inside good
    return base * correction
  } else if (actualTotal < limit.at(0) || limit.at(1) < actualTotal) {
    // out of limit
    return 0
  }

  let preRatio = 0
  if (limit.at(0) <= actualTotal && actualTotal < good.at(0)) {
    preRatio = (actualTotal - limit.at(0)) / (good.at(0) - limit.at(0))
  } else if (good.at(1) < actualTotal && actualTotal <= limit.at(1)) {
    preRatio = (limit.at(1) - actualTotal) / (limit.at(1) - good.at(1))
  }
  const ratio =
    preRatio > 0.5
      ? 1 - Math.sqrt(0.25 - Math.pow(preRatio - 0.5, 2))
      : Math.sqrt(0.25 - Math.pow(preRatio - 0.5, 2))

  return base * correction * ratio
}

const setSlackerScore = function (lastWeekTimer, newTimerData) {
  UserModel.findOne({ _id: lastWeekTimer._id }, 'slackerScore', (err, user) => {
    if (err || !user) {
      console.log('setSlackerScore error')
      throw new Error('setSlackerScore error')
    }
    const workTimeTotal = lastWeekTimer.workTimeWeeklyTotal
    const playTimeTotal = lastWeekTimer.playTimeWeeklyTotal
    const offlineTimeTotal = lastWeekTimer.offlineTimeWeeklyTotal
    const unallocatedTimeTotal = lastWeekTimer.unallocatedTimeWeeklyTotal
    let evaluation = 0

    // good: 30 <= work <= 40 hours
    // limit: 20 <= work <= 50 hours
    // Base = 30
    // Correction = 1.35
    evaluation += calculateSlackerScore(
      30,
      1.35,
      [30, 40],
      [20, 50],
      workTimeTotal
    )

    // good: 5 <= play <= 20 hours
    // limit: 0 <= play <= 30 hours
    // Base = 25
    // Correction = 1.1
    evaluation += calculateSlackerScore(
      25,
      1.1,
      [5, 20],
      [0, 30],
      playTimeTotal
    )

    // good: 84 <= offline <= 100 hours
    // limit: 56 <= offline <= 112 hours
    // Base = 30
    // Correction = 0.9
    evaluation += calculateSlackerScore(
      30,
      0.9,
      [84, 100],
      [56, 112],
      offlineTimeTotal
    )

    // good: unallocate <= 2 hours
    // limit: unallocate <= 8
    // Base = 5
    // Correction = 1
    evaluation += calculateSlackerScore(
      5,
      1,
      [0, 2],
      [2, 8],
      unallocatedTimeTotal
    )

    const newSlackerScore = Math.round(evaluation)

    UserModel.updateOne(
      { _id: lastWeekTimer._id },
      {
        slackerScore: newSlackerScore,
        lastWeekReport: {
          workTimeTotal,
          playTimeTotal,
          offlineTimeTotal,
          unallocatedTimeTotal
        }
      },
      { upsert: true },
      (err, data) => {
        if (err) {
          console.log('UserModel update error')
          throw new Error('UserModel update error')
        }
        TimerModel.updateOne(
          { _id: lastWeekTimer._id },
          newTimerData,
          { upsert: true },
          (err, data) => {
            if (err) {
              console.log('Timer update error')
              throw new Error('Timer update error')
            }
          }
        )
      }
    )
  })
}

console.log('Generating weekly report')
TimerModel.find({}, (err, allUserTimers) => {
  if (err) {
    console.log('Timer find error')
    throw new Error('Database error')
  }
  allUserTimers.forEach((userTimer) => {
    // Numbers
    let workTimeWeeklyTotal = userTimer.workTime.totalTimeSpent
    let playTimeWeeklyTotal = userTimer.playTime.totalTimeSpent
    let offlineTimeWeeklyTotal = userTimer.offlineTime.totalTimeSpent
    let unallocatedTimeWeeklyTotal = userTimer.unallocatedTime.totalTimeSpent

    const newTimerData = {
      workTime: {
        totalTimeSpent: 0,
        intervals: []
      },
      studyTime: {
        totalTimeSpent: 0,
        intervals: []
      },
      playTime: {
        totalTimeSpent: 0,
        intervals: []
      },
      offlineTime: {
        totalTimeSpent: 0,
        intervals: []
      },
      unallocatedTime: {
        totalTimeSpent: 0,
        intervals: []
      },
      duty: { name: userTimer.duty.name, startTime: now }
    }
    const dutyTimeSpent =
      now.getTime() - new Date(userTimer.duty.startTime).getTime()

    switch (userTimer.duty.name) {
      case 'work':
        workTimeWeeklyTotal += dutyTimeSpent
        break

      case 'play':
        playTimeWeeklyTotal += dutyTimeSpent
        break

      case 'offline':
        offlineTimeWeeklyTotal += dutyTimeSpent
        break

      case 'unallocate':
        unallocatedTimeWeeklyTotal += dutyTimeSpent
        break
    }

    const lastWeekTimer = {
      _id: userTimer._id,
      workTimeWeeklyTotal,
      playTimeWeeklyTotal,
      offlineTimeWeeklyTotal,
      unallocatedTimeWeeklyTotal
    }
    try {
      setSlackerScore(lastWeekTimer, newTimerData)
    } catch (error) {
      throw error
    }
  })
})

parentPort.postMessage({ message: 'success' })
