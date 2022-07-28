const auth = require("../auth");

const express = require("express");
const { query, body, validationResult } = require("express-validator");
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
        playTimeSpent: userTimer.playTime.totalTimeSpent,
        offlineTimeSpent: userTimer.offlineTime.totalTimeSpent,
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
              const singleData = {
                _id: friendInfo._id,
                name: friendInfo.name,
                slackerScore: friendInfo.slackerScore,
                workTimeSpent: friendTimer.workTime.totalTimeSpent,
                studyTimeSpent: friendTimer.studyTime.totalTimeSpent,
                playTimeSpent: friendTimer.playTime.totalTimeSpent,
                offlineTimeSpent: friendTimer.offlineTime.totalTimeSpent,
                unallocatedTimeSpent:
                  friendTimer.unallocatedTime.totalTimeSpent,
                duty: friendTimer.duty,
              };
              data.push(singleData);
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

    if (!["work", "play", "study"].includes(req.body.dutyName))
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

      const dutyStartTime = new Date();
      const newUnallocateTimeSpent =
        user.unallocatedTime.totalTimeSpent -
        new Date(user.duty.startTime).getTime() +
        dutyStartTime.getTime();
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

    if (!["work", "play", "study"].includes(req.body.dutyName))
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
      if (user.duty.name !== req.body.dutyName)
        return res.status(400).json({
          message: `You cannot stop ${req.body.dutyName} because you are on ${user.duty.name}`,
        });

      const dutyStopTime = new Date();
      let newData = { duty: { name: "unallocate", startTime: dutyStopTime } };
      switch (req.body.dutyName) {
        case "work":
          newData.workTime = {};
          newData.workTime.totalTimeSpent =
            user.workTime.totalTimeSpent +
            dutyStopTime.getTime() -
            new Date(user.duty.startTime).getTime();
          user.workTime.intervals.push({
            startTime: user.duty.startTime,
            endTime: dutyStopTime,
          });
          newData.workTime.intervals = user.workTime.intervals;
          break;
        case "play":
          newData.playTime = {};
          newData.playTime.totalTimeSpent =
            user.playTime.totalTimeSpent +
            dutyStopTime.getTime() -
            new Date(user.duty.startTime).getTime();
          user.playTime.intervals.push({
            startTime: user.duty.startTime,
            endTime: dutyStopTime,
          });
          newData.playTime.intervals = user.playTime.intervals;
          break;
        case "study":
          newData.studyTime = {};
          newData.studyTime.totalTimeSpent =
            user.studyTime.totalTimeSpent +
            dutyStopTime.getTime() -
            new Date(user.duty.startTime).getTime();
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
