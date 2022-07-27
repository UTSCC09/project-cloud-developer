const { parentPort } = require("worker_threads");
const { TimerModel } = require("./db");

const now = new Date();

const updataTimer = function (newData, _id) {
  TimerModel.updateOne({ _id: _id }, newData, { upsert: true }, (err, data) => {
    if (err) throw new Error("UpdateTimer error");
  });
};

// Reset every user's timer
TimerModel.find({}, (err, allUserTimers) => {
  if (err) throw new Error("Database error");
  allUserTimers.foreach((userTimer) => {
    const dutyTimeSpent = now - userTimer.duty.startTime;

    let newData = { duty: { name: userTimer.duty.name, startTime: now } };

    switch (userTimer.duty.name) {
      case "work":
        userTimer.workTime.intervals.push({
          startTime: userTimer.duty.startTime,
          endTime: now,
        });
        newData.workTime = {
          totalTimeSpent: userTimer.workTime.totalTimeSpent + dutyTimeSpent,
          intervals: userTimer.workTime.intervals,
        };
        break;

      case "play":
        userTimer.playTime.intervals.push({
          startTime: userTimer.duty.startTime,
          endTime: now,
        });
        newData.playTime = {
          totalTimeSpent: userTimer.playTime.totalTimeSpent + dutyTimeSpent,
          intervals: userTimer.playTime.intervals,
        };
        break;

      case "offline":
        userTimer.offlineTime.intervals.push({
          startTime: userTimer.duty.startTime,
          endTime: now,
        });
        newData.offlineTime = {
          totalTimeSpent: userTimer.offlineTime.totalTimeSpent + dutyTimeSpent,
          intervals: userTimer.offlineTime.intervals,
        };
        break;

      case "unallocate":
        userTimer.unallocatedTime.intervals.push({
          startTime: userTimer.duty.startTime,
          endTime: now,
        });
        newData.unallocatedTime = {
          totalTimeSpent:
            userTimer.unallocatedTime.totalTimeSpent + dutyTimeSpent,
          intervals: userTimer.unallocatedTime.intervals,
        };
        break;
    }

    try {
      updataTimer(newData, userTimer._id);
    } catch (err) {
      throw err;
    }
  });
});

parentPort.postMessage({ message: "success" });
