const { parentPort } = require("worker_threads");
const { UserModel, TimerModel } = require("./db");
const mongoose = require("mongoose");

const mongodbUrl =
  process.env.MONGODB_URL || "mongodb://localhost:27017/slacker-tracker";

mongoose.connect(mongodbUrl);

const now = new Date();
const weekStart = now.getDate() - 7;
const weekEnd = now.getDate() - 1;

const SetSlackerScore = function (thisWeekTimer) {
  UserModel.findOne({ _id: thisWeekTimer._id }, "slackerScore", (err, user) => {
    if (err || !user) throw new Error("Update error");
    let evaluation = 0;

    // 30 < work < 60 hours
    if (
      thisWeekTimer.workTimeWeeklyTotal >= 1000 * 60 * 60 * 30 &&
      thisWeekTimer.workTimeWeeklyTotal <= 1000 * 60 * 60 * 60
    )
      evaluation += 5;
    else evaluation -= 5;

    // 3 < play < 20 hours
    if (
      thisWeekTimer.playTimeWeeklyTotal >= 1000 * 60 * 60 * 3 &&
      thisWeekTimer.playTimeWeeklyTotal <= 1000 * 60 * 60 * 20
    )
      evaluation += 5;
    else evaluation -= 5;

    // 90 < offline < 120 hours
    if (
      thisWeekTimer.offlineTimeWeeklyTotal >= 1000 * 60 * 60 * 90 &&
      thisWeekTimer.offlineTimeWeeklyTotal <= 1000 * 60 * 60 * 120
    )
      evaluation += 5;
    else evaluation -= 5;

    // unallocate < 2 hours
    if (
      thisWeekTimer.unallocatedTimeWeeklyTotal >= 1000 * 60 * 60 * 30 &&
      thisWeekTimer.unallocatedTimeWeeklyTotal <= 1000 * 60 * 60 * 60
    )
      evaluation += 5;
    else evaluation -= 5;

    let newSlackerScore = user.slackerScore + Math.round(evaluation / 4);

    UserModel.updateOne(
      { _id: thisWeekTimer._id },
      { slackerScore: newSlackerScore },
      { upsert: true },
      (err, data) => {
        if (err) throw new Error("Update error");
      }
    );
  });
};

const getWeeklyTotal = function (userTimerIntervals) {
  const weeklyIntervals = userTimerIntervals.filter(
    (interval) =>
      interval.startTime.getDate() >= weekStart &&
      interval.startTime.getDate() <= weekEnd
  );

  let total = 0;
  weeklyIntervals.forEach((interval) => {
    total += interval.endTime - interval.startTime;
  });
  return total;
};

TimerModel.find({}, (err, allUserTimers) => {
  if (err) throw new Error("Database error");
  allUserTimers.forEach((userTimer) => {
    // Numbers
    const workTimeWeeklyTotal = getWeeklyTotal(userTimer.workTime.intervals);
    const playTimeWeeklyTotal = getWeeklyTotal(userTimer.playTime.intervals);
    const offlineTimeWeeklyTotal = getWeeklyTotal(
      userTimer.offlineTime.intervals
    );
    const unallocatedTimeWeeklyTotal = getWeeklyTotal(
      userTimer.unallocatedTime.intervals
    );

    const thisWeekTimer = {
      _id: userTimer._id,
      workTimeWeeklyTotal,
      playTimeWeeklyTotal,
      offlineTimeWeeklyTotal,
      unallocatedTimeWeeklyTotal,
    };
    try {
      SetSlackerScore(thisWeekTimer);
    } catch (err) {
      throw err;
    }
  });
});

parentPort.postMessage({ message: "success" });
