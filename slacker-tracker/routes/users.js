const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const { UserModel, FriendListModel, TimerModel } = require("../db");

router.get("/", (req, res, next) => {
  if (!("email" in req.query))
    return res.status(400).json({ message: "email is missing" });

  UserModel.findOne({ email: req.query.email }, "-password", (err, user) => {
    if (err) return res.status(500).json({ message: err });
    if (!user) return res.status(404).json({ message: "user does not exist" });
    return res.status(200).json({ message: "success", user: user });
  });
});

router.post("/username", (req, res, next) => {
  if (!("email" in req.body))
    return res.status(400).json({ message: "email is missing" });
  if (!("username" in req.body))
    return res.status(400).json({ message: "username is missing" });
  if (req.session.user.email != req.body.email)
    return res.status(401).json({ message: "access denied" })
  UserModel.findOne({ email: req.body.email }, "-password", (err, user) => {
    if (err) return res.status(500).json({ message: err });
    if (!user) return res.status(404).json({ message: "user does not exist" });
    UserModel.updateOne(
      { email: req.body.email },
      { username: req.body.username },
      (err, data) => {
        if (err) return res.status(500).json({ message: err });
        return res.status(200).json({ message: "success", data: data });
      }
    );
  });
});

router.post("/password", (req, res, next) => {
  if (!("email" in req.body))
    return res.status(400).json({ message: "email is missing" });
  if (!("old_password" in req.body))
    return res.status(400).json({ message: "old_password is missing" });
  if (!("new_password" in req.body))
    return res.status(400).json({ message: "new_password is missing" });

  if (req.body.new_password.length < 6)
    return res.status(400).json({
      message: "the length of the new password must be greater than 5",
    });

  if (req.session.user.email != req.body.email)
    return res.status(401).json({ message: "access denied" })

  UserModel.findOne({ email: req.body.email }, (err, user) => {
    if (err) return res.status(500).json({ message: err });
    if (!user) return res.status(404).json({ message: "user does not exist" });
    bcrypt.compare(req.body.old_password, user.password, function (err, valid) {
      if (err) return res.status(500).json({ message: err });
      if (!valid)
        return res
          .status(401)
          .json({ message: "incorrect password" });
      bcrypt.genSalt(10, function (err, salt) {
        if (err) return res.status(500).json({ message: err });
        bcrypt.hash(req.body.new_password, salt, function (err, hash) {
          if (err) return res.status(500).json({ message: err });
          UserModel.updateOne(
            { email: req.body.email },
            { password: hash },
            (err, data) => {
              if (err) return res.status(500).json({ message: err });
              return res.status(200).json({ message: "success", data: data });
            }
          );
        });
      });
    });
  });
});

router.post("/signup", (req, res, next) => {
  if (!("username" in req.body))
    return res.status(400).json({ message: "username is missing" });
  if (!("password" in req.body))
    return res.status(400).json({ message: "password is missing" });
  if (!("email" in req.body))
    return res.status(400).json({ message: "email is missing" });

  let username = req.body.username;
  let password = req.body.password;
  let email = req.body.email;

  if (username.length > 20 || username.length < 3)
    return res
      .status(400)
      .json({ message: "the length of the username must be between 3 and 20" });
  if (password.length < 6)
    return res
      .status(400)
      .json({ message: "the length of the password must be greater than 5" });

  UserModel.findOne({ email: req.body.email }, "-password", (err, user) => {
    if (err) return res.status(500).json({ message: err });
    if (user) return res.status(404).json({ message: "email already exist" });
    bcrypt.genSalt(10, function (err, salt) {
      if (err) return res.status(500).json({ message: err });
      bcrypt.hash(password, salt, function (err, hash) {
        if (err) return res.status(500).json({ message: err });
        let newUser = {
          email: email,
          username: username,
          password: hash,
          authentication_type: "standard",
        };
        UserModel.updateOne(
          { email: email },
          newUser,
          { upsert: true },
          (err, data) => {
            if (err) return res.status(500).json({ message: err });

            // Create FriendListModel
            let newUserFriendList = {
              email: email,
              friendList: [],
              sendedRequests: [],
              receivedRequests: [],
            };
            FriendListModel.updateOne(
              { email: email },
              newUserFriendList,
              { upsert: true },
              (err, data) => {
                if (err) return res.status(500).json({ message: err });
              }
            );

            //Create TimerModel
            let newUserTimer = {
              email: email,
              unallocatedTime: 1000 * 60 * 60 * 24,
              allocatedTime: [],
              duty: { name: "", startTime: Date.now() },
            };
            TimerModel.updateOne(
              { email: email },
              newUserTimer,
              { upsert: true },
              (err, data) => {
                if (err) return res.status(500).json({ message: err });
              }
            );
            return res.status(200).json({ message: "success", data: data });
          }
        );
      });
    });
  });
});

router.post("/signin", function (req, res, next) {
  if (!("email" in req.body))
    return res.status(400).json({ message: "username is missing" });
  if (!("password" in req.body))
    return res.status(400).json({ message: "password is missing" });

  let email = req.body.email;
  let password = req.body.password;

  UserModel.findOne({ email: email }, (err, user) => {
    if (err) return res.status(500).json({ message: err });
    if (!user)
      return res
        .status(401)
        .json({ message: "incorrect username or password" });
    bcrypt.compare(password, user.password, function (err, valid) {
      if (err) return res.status(500).json({ message: err });
      if (!valid)
        return res
          .status(401)
          .json({ message: "incorrect username or password" });
      req.session.user = user;
      return res.status(200).json({ message: "success", user: user });
    });
  });
});

router.post("/oauth2/google", (req, res, next) => {
    if (!("username" in req.body)) return res.status(400).json({ message: "username is missing" });
    if (!("email" in req.body)) return res.status(400).json({ message: "email is missing" });
    if (!("googleId" in req.body)) return res.status(400).json({ message: "googleId is missing" });

    let username = req.body.username;
    let email = req.body.email;
    let googleId = req.body.googleId;

    let newUser = { 
      email: email, 
      username: username, 
      authentication_type: "google", 
      googleId: googleId,
      avatar: req.body.avatar,
      access_token: req.body.access_token
    };
    UserModel.findOne({ email: email, authentication_type: "standard" }, (err, user) => {
      if(err) return res.status(500).json({message: err});
      if(user) {
          UserModel.updateOne({ email: email }, { googleId: googleId, access_token: req.body.access_token, authentication_type: "google" }, (err, data) => {
            if(err) return res.status(500).json({message: err});
          });
          req.session.user = user;
          return res.status(200).json({message: "email already used in standard signup", user: user});
      }
      UserModel.findOne({ email: email, googleId: googleId }, (err, user) => {
        if(err) return res.status(500).json({message: err});
        if(user) {
            UserModel.updateOne({ googleId: googleId }, { access_token: req.body.access_token, avatar: req.body.avatar }, (err, data) => {
              if(err) return res.status(500).json({message: err});
            });
            req.session.user = user;
            return res.status(200).json({message: "success", user: newUser});
        }
        UserModel.updateOne({ googleId: googleId }, newUser, { upsert: true }, (err, data) => {
            if(err) return res.status(500).json({message: err});
            // Create FriendListModel
            let newUserFriendList = {
              email: email,
              friendList: [],
              sendedRequests: [],
              receivedRequests: [],
            };
            FriendListModel.updateOne(
              { email: email },
              newUserFriendList,
              { upsert: true },
              (err, data) => {
                if (err) return res.status(500).json({ message: err });
              }
            );

            //Create TimerModel
            let newUserTimer = {
              email: email,
              unallocatedTime: 1000 * 60 * 60 * 24,
              allocatedTime: [],
              duty: { name: "", startTime: Date.now() },
            };
            TimerModel.updateOne(
              { email: email },
              newUserTimer,
              { upsert: true },
              (err, data) => {
                if (err) return res.status(500).json({ message: err });
              }
            );
            req.session.user = newUser;
            return res.status(200).json({message: "first time google user", user: newUser});
        });
    })
    });
});

router.get("/signout", function (req, res, next) {
    req.session.destroy();
    return res.status(200).json({ message: "success" });
});

module.exports = router;
