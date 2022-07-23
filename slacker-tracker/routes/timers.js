const auth = require("../auth");

const express = require("express");
const { body, validationResult } = require("express-validator");
const router = express.Router();
const { UserModel, FriendListModel, TimerModel } = require("../db");

router.get(
  "/self",
  auth.isAuthenticated,
  [query("_id").isString().notEmpty().trim().escape()],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    TimerModel.findOne({ _id: req.query._id }, (err, userTimer) => {
      if (err) return res.status(500).json({ message: err });
      if (!userTimer) {
        return res
          .status(404)
          .json({ message: `user ${req.query.email} does not exist` });
      }
      let data = {
        workTimeSpent: userTimer.workTime.totalTimeSpent,
        studyTimeSpent: userTimer.studyTime.totalTimeSpent,
        entertainmentTimeSpent: userTimer.entertainmentTime.totalTimeSpent,
        offlineTImeSpent: userTimer.offlineTime.totalTimeSpent,
        unallocatedTime: userTimer.unallocatedTime.totalTimeSpent,
        duty: userTimer.duty,
      };
      UserModel.findOne(
        { _id: req.query._id },
        "name slackerScore",
        (err, user) => {
          if (err) return res.status(500).json({ message: err });
          data._id = req.query._id;
          data.name = user.name;
          data.slackerScore = user.slackerScore;
          return res.status(200).json({ message: "success", data });
        }
      );
    });
  }
);

router.get(
  "/friends",
  auth.isAuthenticated,
  [query("_id").isString().notEmpty().trim().escape()],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    FriendListModel.findOne(
      { _id: req.query._id },
      "friendList",
      (err, user) => {
        if (err) return res.status(500).json({ message: err });
        if (!user) {
          return res
            .status(404)
            .json({ message: `user ${req.query._id} does not exist` });
        }
        let data = [];
        TimerModel.find({}, (err, friendsTimer) => {
          if (err) return res.status(500).json({ message: err });
          if (!friendsTimer) {
            return res
              .status(404)
              .json({ message: "user's timer does not exist" });
          }
          friendsTimer = friendsTimer.filter((el) =>
            user.friendList.includes(el._id)
          );
          UserModel.find({}, "_id name slackerScore", (err, friendsInfo) => {
            if (err) return res.status(500).json({ message: err });
            if (!friendsInfo) {
              return res.status(404).json({ message: "users does not exist" });
            }
            friendsInfo = friendsInfo.filter((el) =>
              user.friendList.includes(el._id)
            );
            friendsInfo.forEach((friendInfo) => {
              const friendTimer = friendsTimer.find(
                (el) => (el._id = friendInfo._id)
              );
              friendInfo.workTimeSpent = friendTimer.workTime.totalTimeSpent;
              friendInfo.studyTimeSpent = friendTimer.studyTime.totalTimeSpent;
              friendInfo.entertainmentTimeSpent =
                friendTimer.entertainmentTime.totalTimeSpent;
              friendInfo.offlineTimeSpent =
                friendTimer.offlineTime.totalTimeSpent;
              friendInfo.unallocatedTimeSpent =
                friendTimer.unallocatedTime.totalTimeSpent;
              friendInfo.duty = friendTimer.duty;
              data.push(friendInfo);
            });
            return res.status(200).json({ message: "success", data });
          });
        });
      }
    );
  }
);

router.post(
  "/startTimer",
  auth.isAuthenticated,
  [
    body("_id").isString().trim().escape(),
    body("dutyName").isString().trim().escape(),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    if (!["work", "entertainment", "study"].includes(dutyName))
      return res.status(400).json({ message: "wrong duty name" });

    TimerModel.findOne({ _id: req.body._id }, (err, user) => {
      if (err) return res.status(500).json({ message: err });
      if (!user) {
        return res
          .status(404)
          .json({ message: `user ${req.body._id} does not exist` });
      }
      if (user.duty.name === "offline")
        return res.status(400).json({
          message: `Access denined`,
        });
      if (user.duty.name !== "unallocate") {
        return res.status(400).json({
          message: `You are working on ${user.duty.name} right now`,
        });
      }

      const dutyStartTime = Date.now();
      const newUnallocateTimeSpent =
        user.unallocatedTime.totalTimeSpent -
        user.duty.startTime +
        dutyStartTime;
      user.unallocatedTime.intervals.push({
        startTime: user.duty.startTime,
        endTime: dutyStartTime,
      });

      TimerModel.updateOne(
        { _id: req.body._id },
        {
          unallocatedTime: {
            totalTimeSpent: newUnallocateTimeSpent,
            intervals: user.unallocatedTime.intervals,
          },
          duty: { name: req.body.dutyName, startTime: dutyStartTime },
        },
        { upsert: true },
        (err, data) => {
          if (err) return res.status(500).json({ message: err });
          data.startTime = dutyStartTime;
          data.name = req.body.dutyName;
          return res.status(200).json({
            message: "success",
            data,
          });
        }
      );
    });
  }
);

router.post(
  "/stopTimer",
  auth.isAuthenticated,
  [
    body("_id").isString().trim().escape(),
    body("dutyName").isString().trim().escape(),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    if (!["work", "entertainment", "study"].includes(dutyName))
      return res.status(400).json({ message: "wrong duty name" });

    TimerModel.findOne({ _id: req.body._id }, (err, user) => {
      if (err) return res.status(500).json({ message: err });
      if (!user) {
        return res
          .status(404)
          .json({ message: `user ${req.body._id} does not exist` });
      }
      if (user.duty.name === "offline")
        return res.status(400).json({
          message: `Access denined`,
        });
      if (user.duty.name === "unallocate") {
        return res.status(400).json({
          message: `Timer error. You are working on nothing`,
        });
      }

      const dutyStopTime = Date.now();
      let newData = { duty: { name: "unallocate", startTime: dutyStopTime } };
      switch (req.body.dutyName) {
        case "work":
          newData.workTime = {};
          newData.workTime.totalTimeSpent =
            user.workTime.totalTimeSpent + dutyStopTime - user.duty.startTime;
          user.workTime.intervals.push({
            startTime: user.duty.startTime,
            endTime: dutyStopTime,
          });
          newData.workTime.intervals = user.workTime.intervals;
          break;
        case "entertainment":
          newData.entertainmentTime = {};
          newData.entertainmentTime.totalTimeSpent =
            user.entertainmentTime.totalTimeSpent +
            dutyStopTime -
            user.duty.startTime;
          user.entertainmentTime.intervals.push({
            startTime: user.duty.startTime,
            endTime: dutyStopTime,
          });
          newData.entertainmentTime.intervals =
            user.entertainmentTime.intervals;
          break;
        case "study":
          newData.studyTime = {};
          newData.studyTime.totalTimeSpent =
            user.studyTime.totalTimeSpent + dutyStopTime - user.duty.startTime;
          user.studyTime.intervals.push({
            startTime: user.duty.startTime,
            endTime: dutyStopTime,
          });
          newData.studyTime.intervals = user.studyTime.intervals;
          break;
      }

      TimerModel.updateOne(
        { _id: req.body._id },
        newData,
        { upsert: true },
        (err, data) => {
          if (err) return res.status(500).json({ message: err });
          data.endTime = dutyStopTime;
          data.name = req.body.dutyName;
          return res.status(200).json({
            message: "success",
            data,
          });
        }
      );
    });
  }
);

module.exports = router;
