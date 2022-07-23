const auth = require("../auth");
const cookie = require("cookie");
const Nanoid = require("nanoid");
const formidable = require("formidable");
const fs = require("fs");
const imageinfo = require("imageinfo");
const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const { UserModel, FriendListModel, TimerModel } = require("../db");
const { query, body, validationResult } = require("express-validator");
const avatarFolder = "public/avatars";

router.get(
  "/",
  auth.isAuthenticated,
  [query("_id").isString().notEmpty().trim().escape()],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    UserModel.findOne({ _id: req.query._id }, "-password", (err, user) => {
      if (err) return res.status(500).json({ message: err });
      if (!user)
        return res.status(404).json({ message: "user does not exist" });
      return res.status(200).json({ message: "success", user });
    });
  }
);

app.get(
  "/avatar",
  auth.isAuthenticated,
  [query("_id").isString().notEmpty().trim().escape()],
  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    UserModel.findOne(
      { _id: req.query._id },
      "-password",
      function (err, user) {
        if (err) return res.status(500).end(err);
        if (!user) {
          return res.status(404).json({ message: "user does not exist" });
        }
        fs.readFileSync(user.avatar, (err, data) => {
          if (err) return res.status(500).json({ message: err });
          info = imageinfo(data);
          res.setHeader("Content-Type", info.mimeType);
          res.sendFile(`${__dirname}/${user.avatar}`);
        });
      }
    );
  }
);

router.post(
  "/name",
  auth.isAuthenticated,
  [
    body("_id").isString().notEmpty().trim().escape(),
    body("name").isString().notEmpty().trim().escape(),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    if (req.session.user._id !== req.body._id)
      return res.status(401).json({ message: "access denied" });

    UserModel.findOne({ _id: req.body._id }, "-password", (err, user) => {
      if (err) return res.status(500).json({ message: err });
      if (!user)
        return res.status(404).json({ message: "user does not exist" });
      UserModel.updateOne(
        { _id: req.body._id },
        { name: req.body.name },
        (err, data) => {
          if (err) return res.status(500).json({ message: err });
          return res.status(200).json({ message: "success", data });
        }
      );
    });
  }
);

router.post(
  "/email",
  auth.isAuthenticated,
  [
    body("_id").isString().notEmpty().trim().escape(),
    body("email").notEmpty().isEmail().trim().escape(),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    if (req.session.user._id !== req.body._id)
      return res.status(401).json({ message: "access denied" });

    UserModel.findOne({ _id: req.body._id }, "-password", (err, user) => {
      if (err) return res.status(500).json({ message: err });
      if (!user)
        return res.status(404).json({ message: "user does not exist" });
      if (user.authentication_type === "google")
        return res
          .status(400)
          .json({ message: "cannot change email of google auth account" });
      UserModel.updateOne(
        { _id: req.body._id },
        { email: req.body.email },
        (err, data) => {
          if (err) return res.status(500).json({ message: err });
          return res.status(200).json({ message: "success", data });
        }
      );
    });
  }
);

router.post(
  "/password",
  auth.isAuthenticated,
  [
    body("_id").isString().notEmpty().trim().escape(),
    body("old_password").isString().notEmpty().trim().escape(),
    body("new_password").isString().isLength({ min: 6 }).trim().escape(),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    if (req.session.user._id !== req.body._id) {
      return res.status(401).json({ message: "access denied" });
    }

    UserModel.findOne({ _id: req.body._id }, (err, user) => {
      if (err) return res.status(500).json({ message: err });
      if (!user)
        return res.status(404).json({ message: "user does not exist" });
      bcrypt.compare(
        req.body.old_password,
        user.password,
        function (err, valid) {
          if (err) return res.status(500).json({ message: err });
          if (!valid) {
            return res.status(401).json({ message: "incorrect password" });
          }
          bcrypt.genSalt(10, function (err, salt) {
            if (err) return res.status(500).json({ message: err });
            bcrypt.hash(req.body.new_password, salt, function (err, hash) {
              if (err) return res.status(500).json({ message: err });
              UserModel.updateOne(
                { _id: req.body._id },
                { password: hash },
                (err, data) => {
                  if (err) return res.status(500).json({ message: err });
                  return res.status(200).json({ message: "success", data });
                }
              );
            });
          });
        }
      );
    });
  }
);

router.post(
  "/avatar",
  auth.isAuthenticated,
  [body("_id").isString().notEmpty().trim().escape()],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    if (req.session.user._id !== req.body._id) {
      return res.status(401).json({ message: "access denied" });
    }

    if (!fs.existsSync(avatarFolder)) {
      fs.mkdirSync(avatarFolder);
    }
    let form = new formidable.IncomingForm();
    form.encoding = "utf-8";
    form.uploadDir = avatarFolder;
    form.keepExtensions = true;
    form.maxFieldsSize = 2 * 1024 * 1024;
    form.type = true;

    form.parse(req, (err, fields, files) => {
      if (err) return res.status(500).json({ message: err });
      let extName = "";
      switch (files.file.type) {
        case "image/pjpeg":
          extName = "jpg";
          break;
        case "image/jpeg":
          extName = "jpg";
          break;
        case "image/png":
          extName = "png";
          break;
        case "image/x-png":
          extName = "png";
          break;
      }
      if (extName.length === 0) {
        return res.status(400).json({
          message: "only support image type of jpg or png",
        });
      } else {
        UserModel.findOne({ _id: req.body._id }, (err, user) => {
          if (err) return res.status(500).json({ message: err });
          if (!user)
            return res.status(404).json({ message: "user does not exist" });
          let avatarName = "/" + Date.now() + "." + extName;
          let newPath = form.uploadDir + avatarName;
          fs.renameSync(files.file.path, newPath);
          UserModel.updateOne(
            { _id: req.body._id },
            { avatar: newPath },
            (err, data) => {
              if (err) return res.status(500).json({ message: err });
              return res.status(200).json({ message: "success", data });
            }
          );
        });
      }
    });
  }
);

router.post(
  "/signup",
  [
    body("name").isString().isLength({ min: 3, max: 20 }).trim().escape(),
    body("email").notEmpty().isEmail().trim().escape(),
    body("password").isString().isLength({ min: 6 }).trim().escape(),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const name = req.body.name;
    const password = req.body.password;
    const email = req.body.email;

    UserModel.findOne({ email: req.body.email }, "-password", (err, user) => {
      if (err) return res.status(500).json({ message: err });
      if (user) return res.status(404).json({ message: "email already exist" });
      bcrypt.genSalt(10, function (err, salt) {
        if (err) return res.status(500).json({ message: err });
        bcrypt.hash(password, salt, function (err, hash) {
          if (err) return res.status(500).json({ message: err });
          const _id = Nanoid.nanoid();

          const newUser = {
            _id: _id,
            email: email,
            name: name,
            password: hash,
            authentication_type: "standard",
            slackerScore: 0,
          };
          UserModel.updateOne(
            { _id: _id },
            newUser,
            { upsert: true },
            (err, data) => {
              if (err) return res.status(500).json({ message: err });

              // Create FriendListModel
              const newUserFriendList = {
                _id: _id,
                friendList: [],
                sendedRequests: [],
                receivedRequests: [],
              };
              FriendListModel.updateOne(
                { _id: _id },
                newUserFriendList,
                { upsert: true },
                (err, data) => {
                  if (err) return res.status(500).json({ message: err });
                }
              );

              // Create TimerModel
              const newUserTimer = {
                _id: _id,
                workTime: {
                  totalTimeSpent: 0,
                  intervals: [],
                },
                studyTime: {
                  totalTimeSpent: 0,
                  intervals: [],
                },
                entertainmentTime: {
                  totalTimeSpent: 0,
                  intervals: [],
                },
                offlineTime: {
                  totalTimeSpent: 0,
                  intervals: [],
                },
                unallocatedTime: {
                  totalTimeSpent: 0,
                  intervals: [],
                },
                duty: { name: "offline", startTime: Date.now() },
              };
              TimerModel.updateOne(
                { _id },
                newUserTimer,
                { upsert: true },
                (err, data) => {
                  if (err) return res.status(500).json({ message: err });
                }
              );
              return res.status(200).json({ message: "success", data });
            }
          );
        });
      });
    });
  }
);

router.post(
  "/signin",
  [
    body("email").notEmpty().isEmail().trim().escape(),
    body("password").isString().notEmpty().trim().escape(),
  ],
  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const email = req.body.email;
    const password = req.body.password;

    UserModel.findOne({ email }, (err, user) => {
      if (err) return res.status(500).json({ message: err });
      if (!user) {
        return res
          .status(401)
          .json({ message: "incorrect username or password" });
      }
      bcrypt.compare(password, user.password, function (err, valid) {
        if (err) return res.status(500).json({ message: err });
        if (!valid) {
          return res
            .status(401)
            .json({ message: "incorrect username or password" });
        }

        TimerModel.findOne({ _id: user._id }, (err, userTimer) => {
          if (err) return res.status(500).json({ message: err });
          if (!userTimer)
            return res
              .status(404)
              .json({ message: `user ${user._id} not found` });
          if (userTimer.duty.name !== "offline")
            return res.status(400).json({ message: "You have already login" });
          const loginTime = Date.now();
          const newOfflineTotal =
            userTimer.offlineTime.totalTimeSpent +
            loginTime -
            userTimer.duty.startTime;
          userTimer.offlineTime.intervals.push({
            startTime: userTimer.duty.startTime,
            endTime: loginTime,
          });
          TimerModel.updateOne(
            { _id: user._id },
            {
              offlineTime: {
                totalTimeSpent: newOfflineTotal,
                intervals: userTimer.offlineTime.intervals,
              },
              duty: { name: "unallocate", startTime: Date.now() },
            },
            { upsert: true },
            (err, data) => {
              if (err) return res.status(500).json({ message: err });
              // start a session
              req.session.user = user;
              req.session.save();
              // initialize cookie
              res.setHeader(
                "Set-Cookie",
                cookie.serialize("_id", user._id, {
                  path: "/",
                  maxAge: 60 * 60 * 24 * 7, // 1 week in number of seconds
                })
              );
              console.log(req.session.user);
              return res.status(200).json({ message: "success", data });
            }
          );
        });
      });
    });
  }
);

router.post(
  "/oauth2/google",
  [
    body("name").isString().isLength({ min: 3, max: 20 }).trim().escape(),
    body("email").notEmpty().isEmail().trim().escape(),
    body("googleId").notEmpty().trim().escape(),
  ],
  (req, res, next) => {
    const name = req.body.name;
    const email = req.body.email;
    const googleId = req.body.googleId;
    const _id = Nanoid.nanoid();

    const newUser = {
      _id,
      email,
      name,
      authentication_type: "google",
      googleId,
      avatar: req.body.avatar,
      access_token: req.body.access_token,
      slackerScore: 0,
    };

    UserModel.findOne(
      { email, authentication_type: "standard" },
      (err, user) => {
        if (err) return res.status(500).json({ message: err });
        if (user) {
          UserModel.updateOne(
            { email },
            {
              googleId,
              access_token: req.body.access_token,
              authentication_type: "google",
            },
            (err, data) => {
              if (err) return res.status(500).json({ message: err });
            }
          );

          TimerModel.findOne({ _id: user._id }, (err, userTimer) => {
            if (err) return res.status(500).json({ message: err });
            if (!userTimer)
              return res
                .status(404)
                .json({ message: `user ${user._id} not found` });
            if (userTimer.duty.name !== "offline")
              return res
                .status(400)
                .json({ message: "You have already login" });
            const loginTime = Date.now();
            const newOfflineTotal =
              userTimer.offlineTime.totalTimeSpent +
              loginTime -
              userTimer.duty.startTime;
            userTimer.offlineTime.intervals.push({
              startTime: userTimer.duty.startTime,
              endTime: loginTime,
            });
            TimerModel.updateOne(
              { _id: user._id },
              {
                offlineTime: {
                  totalTimeSpent: newOfflineTotal,
                  intervals: userTimer.offlineTime.intervals,
                },
                duty: { name: "unallocate", startTime: Date.now() },
              },
              { upsert: true },
              (err, data) => {
                if (err) return res.status(500).json({ message: err });
                // start a session
                req.session.user = user;
                req.session.save();
                // initialize cookie
                res.setHeader(
                  "Set-Cookie",
                  cookie.serialize("_id", user._id, {
                    path: "/",
                    maxAge: 60 * 60 * 24 * 7, // 1 week in number of seconds
                  })
                );
                console.log(req.session.user);
                return res.status(200).json({
                  message: "email already used in standard signup",
                  user,
                });
              }
            );
          });
        }
        UserModel.findOne({ email, googleId }, (err, existUser) => {
          if (err) return res.status(500).json({ message: err });
          if (existUser) {
            UserModel.updateOne(
              { googleId },
              { access_token: req.body.access_token, avatar: req.body.avatar },
              (err, data) => {
                if (err) return res.status(500).json({ message: err });
              }
            );

            TimerModel.findOne({ _id: existUser._id }, (err, userTimer) => {
              if (err) return res.status(500).json({ message: err });
              if (!userTimer)
                return res
                  .status(404)
                  .json({ message: `user ${existUser._id} not found` });
              if (userTimer.duty.name !== "offline")
                return res
                  .status(400)
                  .json({ message: "You have already login" });
              const loginTime = Date.now();
              const newOfflineTotal =
                userTimer.offlineTime.totalTimeSpent +
                loginTime -
                userTimer.duty.startTime;
              userTimer.offlineTime.intervals.push({
                startTime: userTimer.duty.startTime,
                endTime: loginTime,
              });
              TimerModel.updateOne(
                { _id: existUser._id },
                {
                  offlineTime: {
                    totalTimeSpent: newOfflineTotal,
                    intervals: userTimer.offlineTime.intervals,
                  },
                  duty: { name: "unallocate", startTime: Date.now() },
                },
                { upsert: true },
                (err, data) => {
                  if (err) return res.status(500).json({ message: err });
                  // start a session
                  req.session.user = existUser;
                  req.session.save();
                  // initialize cookie
                  res.setHeader(
                    "Set-Cookie",
                    cookie.serialize("_id", existUser._id, {
                      path: "/",
                      maxAge: 60 * 60 * 24 * 7, // 1 week in number of seconds
                    })
                  );
                  console.log(req.session.user);
                  return res.status(200).json({ message: "success", data });
                }
              );
            });
          }
          UserModel.updateOne(
            { googleId },
            newUser,
            { upsert: true },
            (err, data) => {
              if (err) return res.status(500).json({ message: err });
              // Create FriendListModel
              const newUserFriendList = {
                _id,
                friendList: [],
                sendedRequests: [],
                receivedRequests: [],
              };
              FriendListModel.updateOne(
                { _id },
                newUserFriendList,
                { upsert: true },
                (err, data) => {
                  if (err) return res.status(500).json({ message: err });
                }
              );

              // Create TimerModel
              const newUserTimer = {
                _id: _id,
                workTime: {
                  totalTimeSpent: 0,
                  intervals: [],
                },
                studyTime: {
                  totalTimeSpent: 0,
                  intervals: [],
                },
                entertainmentTime: {
                  totalTimeSpent: 0,
                  intervals: [],
                },
                offlineTime: {
                  totalTimeSpent: 0,
                  intervals: [],
                },
                unallocatedTime: {
                  totalTimeSpent: 0,
                  intervals: [],
                },
                duty: { name: "unallocate", startTime: Date.now() },
              };
              TimerModel.updateOne(
                { _id },
                newUserTimer,
                { upsert: true },
                (err, data) => {
                  if (err) return res.status(500).json({ message: err });
                }
              );
              // start a session
              req.session.user = newUser;
              req.session.save();
              // initialize cookie
              res.setHeader(
                "Set-Cookie",
                cookie.serialize("_id", newUser._id, {
                  path: "/",
                  maxAge: 60 * 60 * 24 * 7, // 1 week in number of seconds
                })
              );
              console.log(req.session.user);
              return res
                .status(200)
                .json({ message: "first time google user", user: newUser });
            }
          );
        });
      }
    );
  }
);

router.get("/signout", function (req, res, next) {
  TimerModel.findOne({ _id: req.session.user._id }, (err, userTimer) => {
    if (err) return res.status(500).json({ message: err });
    if (!userTimer)
      return res
        .status(404)
        .json({ message: `user ${req.session.user._id} not found` });
    if (userTimer.duty.name === "offline")
      return res.status(400).json({ message: "You have already logout" });
    const logoutTime = Date.now();

    let newData = { duty: { name: "offline", startTime: Date.now() } };
    switch (userTimer.duty.name) {
      case "work":
        newData.workTime = {};
        newData.workTime.totalTimeSpent =
          userTimer.workTime.totalTimeSpent +
          logoutTime -
          userTimer.duty.startTime;
        userTimer.workTime.intervals.push({
          startTime: userTimer.duty.startTime,
          endTime: logoutTime,
        });
        newData.workTime.intervals = userTimer.workTime.intervals;
        break;
      case "entertainment":
        newData.entertainmentTime = {};
        newData.entertainmentTime.totalTimeSpent =
          userTimer.entertainmentTime.totalTimeSpent +
          logoutTime -
          userTimer.duty.startTime;
        userTimer.entertainmentTime.intervals.push({
          startTime: userTimer.duty.startTime,
          endTime: logoutTime,
        });
        newData.entertainmentTime.intervals =
          userTimer.entertainmentTime.intervals;
        break;
      case "study":
        newData.studyTime = {};
        newData.studyTime.totalTimeSpent =
          userTimer.studyTime.totalTimeSpent +
          logoutTime -
          userTimer.duty.startTime;
        userTimer.studyTime.intervals.push({
          startTime: userTimer.duty.startTime,
          endTime: logoutTime,
        });
        newData.studyTime.intervals = userTimer.studyTime.intervals;
        break;
      case "unallocate":
        newData.unallocatedTime = {};
        newData.unallocatedTime.totalTimeSpent =
          userTimer.unallocatedTime.totalTimeSpent +
          logoutTime -
          userTimer.duty.startTime;
        userTimer.unallocatedTime.intervals.push({
          startTime: userTimer.duty.startTime,
          endTime: logoutTime,
        });
        newData.unallocatedTime.intervals = userTimer.unallocatedTime.intervals;
        break;
    }
    TimerModel.updateOne(
      { _id: existUser._id },
      newData,
      { upsert: true },
      (err, data) => {
        if (err) return res.status(500).json({ message: err });
        // start a session
        req.session.user = existUser;
        req.session.save();
        // initialize cookie
        res.setHeader(
          "Set-Cookie",
          cookie.serialize("_id", existUser._id, {
            path: "/",
            maxAge: 60 * 60 * 24 * 7, // 1 week in number of seconds
          })
        );
        console.log(req.session.user);
        return res.status(200).json({ message: "success", data });
      }
    );
  });
  // console.log('before signout', req.session)
  req.session.destroy();
  res.setHeader(
    "Set-Cookie",
    cookie.serialize("_id", "", {
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 1 week in number of seconds
    })
  );
  console.log("signout", req.session);
  return res.status(200).json({ message: "success" });
});

module.exports = router;
