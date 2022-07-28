const auth = require("../auth");
const uuid = require("node-uuid");
const Path = require("path");
const cookie = require("cookie");
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

router.get(
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
        const avatarPath = Path.resolve(__dirname, "..") + "/" + user.avatar;
        const avatarImg = fs.readFileSync(avatarPath);
        info = imageinfo(avatarImg);
        res.setHeader("Content-Type", info.mimeType);
        return res.sendFile(avatarPath);
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
        (err, data2) => {
          if (err) return res.status(500).json({ message: err });
          FriendListModel.updateOne(
            { _id: req.body._id },
            { name: req.body.name },
            (err, data) => {
              if (err) return res.status(500).json({ message: err });
              return res.status(200).json({ message: "success", data });
            }
          );
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
        (err, data2) => {
          if (err) return res.status(500).json({ message: err });
          FriendListModel.updateOne(
            { _id: req.body._id },
            { email: req.body.email },
            (err, data) => {
              if (err) return res.status(500).json({ message: err });
              return res.status(200).json({ message: "success", data });
            }
          );
        }
      );
    });
  }
);

router.post(
  "/bio",
  auth.isAuthenticated,
  [
    body("_id").isString().notEmpty().trim().escape(),
    body("bio").isString().trim().escape(),
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
        { bio: req.body.bio },
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
  [query("_id").isString().notEmpty().trim().escape()],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    if (req.session.user._id !== req.query._id) {
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
      switch (files.file.mimetype) {
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
        UserModel.findOne({ _id: req.query._id }, (err, user) => {
          if (err) return res.status(500).json({ message: err });
          if (!user)
            return res.status(404).json({ message: "user does not exist" });
          let avatarName = "/" + Date.now() + "." + extName;
          let newPath = form.uploadDir + avatarName;
          fs.renameSync(files.file.filepath, newPath);
          UserModel.updateOne(
            { _id: req.query._id },
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
    body("name").isString().isLength({ min: 1, max: 20 }).trim().escape(),
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
          const _id = uuid.v1();

          const newUser = {
            _id: _id,
            email: email,
            name: name,
            password: hash,
            authentication_type: "standard",
            slackerScore: 0,
            bio: "",
            lastWeekReport: {
              workTimeTotal: 0,
              playTimeTotal: 0,
              offlineTimeTotal: 0,
              unallocatedTimeTotal: 0,
            },
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
                email: email,
                name: name,
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

              const now = new Date();
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
                playTime: {
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
                duty: { name: "offline", startTime: now },
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
          // if (
          //   userTimer.duty.name !== "offline" &&
          //   userTimer.duty.name !== "unallocate"
          // )
          //   return res.status(400).json({ message: "You have already login" });
          const loginTime = new Date();
          const newOfflineTotal =
            userTimer.offlineTime.totalTimeSpent +
            loginTime.getTime() -
            new Date(userTimer.duty.startTime).getTime();
          userTimer.offlineTime.intervals.push({
            startTime: userTimer.duty.startTime,
            endTime: loginTime,
          });

          let newLoginData = {};
          if (userTimer.duty.name === "offline") {
            newLoginData = {
              offlineTime: {
                totalTimeSpent: newOfflineTotal,
                intervals: userTimer.offlineTime.intervals,
              },
              duty: { name: "unallocate", startTime: loginTime },
            };
          }

          TimerModel.updateOne(
            { _id: user._id },
            newLoginData,
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
    body("name").isString().isLength({ max: 20 }).trim().escape(),
    body("email").notEmpty().isEmail().trim().escape(),
    body("googleId").notEmpty().trim().escape(),
  ],
  (req, res, next) => {
    const name = req.body.name;
    const email = req.body.email;
    const googleId = req.body.googleId;
    const _id = uuid.v1();

    const newUser = {
      _id,
      email,
      name,
      authentication_type: "google",
      googleId,
      avatar: req.body.avatar,
      access_token: req.body.access_token,
      slackerScore: 0,
      bio: "",
      lastWeekReport: {
        workTimeTotal: 0,
        playTimeTotal: 0,
        offlineTimeTotal: 0,
        unallocatedTimeTotal: 0,
      },
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
            if (
              userTimer.duty.name !== "offline" &&
              userTimer.duty.name !== "unallocate"
            )
              return res
                .status(400)
                .json({ message: "You have already login" });
            const loginTime = new Date();
            const newOfflineTotal =
              userTimer.offlineTime.totalTimeSpent +
              loginTime.getTime() -
              new Date(userTimer.duty.startTime).getTime();
            userTimer.offlineTime.intervals.push({
              startTime: userTimer.duty.startTime,
              endTime: loginTime,
            });

            let newLoginData = {};
            if (userTimer.duty.name === "offline") {
              newLoginData = {
                offlineTime: {
                  totalTimeSpent: newOfflineTotal,
                  intervals: userTimer.offlineTime.intervals,
                },
                duty: { name: "unallocate", startTime: loginTime },
              };
            }

            TimerModel.updateOne(
              { _id: user._id },
              newLoginData,
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
        } else {
          UserModel.findOne({ email, googleId }, (err, existUser) => {
            if (err) return res.status(500).json({ message: err });
            if (existUser) {
              UserModel.updateOne(
                { googleId },
                {
                  access_token: req.body.access_token,
                  avatar: req.body.avatar,
                },
                (err, data) => {
                  if (err) return res.status(500).json({ message: err });
                  TimerModel.findOne(
                    { _id: existUser._id },
                    (err, userTimer) => {
                      if (err) return res.status(500).json({ message: err });
                      if (!userTimer)
                        return res
                          .status(404)
                          .json({ message: `user ${existUser._id} not found` });
                      if (
                        userTimer.duty.name !== "offline" &&
                        userTimer.duty.name !== "unallocate"
                      )
                        return res
                          .status(400)
                          .json({ message: "You have already login" });
                      const loginTime = new Date();
                      const newOfflineTotal =
                        userTimer.offlineTime.totalTimeSpent +
                        loginTime.getTime() -
                        new Date(userTimer.duty.startTime).getTime();
                      userTimer.offlineTime.intervals.push({
                        startTime: userTimer.duty.startTime,
                        endTime: loginTime,
                      });

                      let newLoginData = {};
                      if (userTimer.duty.name === "offline") {
                        newLoginData = {
                          offlineTime: {
                            totalTimeSpent: newOfflineTotal,
                            intervals: userTimer.offlineTime.intervals,
                          },
                          duty: { name: "unallocate", startTime: loginTime },
                        };
                      }
                      TimerModel.updateOne(
                        { _id: existUser._id },
                        newLoginData,
                        { upsert: true },
                        (err, data) => {
                          if (err) {
                            return res.status(500).json({ message: err });
                          }
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
                          return res
                            .status(200)
                            .json({ message: "success", data });
                        }
                      );
                    }
                  );
                }
              );
            } else {
              UserModel.updateOne(
                { googleId },
                newUser,
                { upsert: true },
                (err, data) => {
                  if (err) return res.status(500).json({ message: err });
                  // Create FriendListModel
                  const newUserFriendList = {
                    _id,
                    email: email,
                    name: name,
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
                  const now = new Date();
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
                    playTime: {
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
                    duty: { name: "unallocate", startTime: now },
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
            }
          });
        }
      }
    );
  }
);

router.get("/signout", function (req, res, next) {
  if (
    req.session === null ||
    req.session === undefined ||
    req.session.user === undefined
  )
    return res.status(401).json({ message: "You are not loged in yet" });
  TimerModel.findOne({ _id: req.session.user._id }, (err, userTimer) => {
    if (err) return res.status(500).json({ message: err });
    if (!userTimer)
      return res
        .status(404)
        .json({ message: `user ${req.session.user._id} not found` });
    if (userTimer.duty.name === "offline")
      return res.status(400).json({ message: "You have already logout" });
    const logoutTime = new Date();

    let newData = { duty: { name: "offline", startTime: logoutTime } };
    switch (userTimer.duty.name) {
      case "work":
        newData.workTime = {};
        newData.workTime.totalTimeSpent =
          userTimer.workTime.totalTimeSpent +
          logoutTime.getTime() -
          new Date(userTimer.duty.startTime).getTime();
        userTimer.workTime.intervals.push({
          startTime: userTimer.duty.startTime,
          endTime: logoutTime,
        });
        newData.workTime.intervals = userTimer.workTime.intervals;
        break;
      case "play":
        newData.playTime = {};
        newData.playTime.totalTimeSpent =
          userTimer.playTime.totalTimeSpent +
          logoutTime.getTime() -
          new Date(userTimer.duty.startTime).getTime();
        userTimer.playTime.intervals.push({
          startTime: userTimer.duty.startTime,
          endTime: logoutTime,
        });
        newData.playTime.intervals = userTimer.playTime.intervals;
        break;
      case "study":
        newData.studyTime = {};
        newData.studyTime.totalTimeSpent =
          userTimer.studyTime.totalTimeSpent +
          logoutTime.getTime() -
          new Date(userTimer.duty.startTime).getTime();
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
          logoutTime.getTime() -
          new Date(userTimer.duty.startTime).getTime();
        userTimer.unallocatedTime.intervals.push({
          startTime: userTimer.duty.startTime,
          endTime: logoutTime,
        });
        newData.unallocatedTime.intervals = userTimer.unallocatedTime.intervals;
        break;
    }
    TimerModel.updateOne(
      { _id: req.session.user._id },
      newData,
      { upsert: true },
      (err, data) => {
        if (err) return res.status(500).json({ message: err });

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
      }
    );
  });
});

module.exports = router;
