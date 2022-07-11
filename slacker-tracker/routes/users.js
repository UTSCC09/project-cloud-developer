const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const { UserModel, FriendListModel } = require("../db");

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
  UserModel.findOne({ email: req.body.email }, "-password", (err, user) => {
    if (err) return res.status(500).json({ message: err });
    if (!user) return res.status(404).json({ message: "user does not exist" });
    UserModel.updateOne(
      { email: req.body.email },
      { username: req.body.username },
      { upsert: true },
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

  UserModel.findOne({ email: req.body.email }, (err, user) => {
    if (err) return res.status(500).json({ message: err });
    if (!user) return res.status(404).json({ message: "user does not exist" });
    bcrypt.compare(req.body.old_password, user.password, function (err, valid) {
      if (err) return res.status(500).json({ message: err });
      if (!valid)
        return res
          .status(401)
          .json({ message: "incorrect username or password" });
      bcrypt.genSalt(10, function (err, salt) {
        if (err) return res.status(500).json({ message: err });
        bcrypt.hash(req.body.new_password, salt, function (err, hash) {
          if (err) return res.status(500).json({ message: err });
          UserModel.updateOne(
            { email: req.body.email },
            { password: hash },
            { upsert: true },
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
          authorization_type: "standard",
        };
        UserModel.updateOne(
          { email: email },
          newUser,
          { upsert: true },
          (err, data) => {
            if (err) return res.status(500).json({ message: err });
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
      let signinUser = {
        username: user.username,
        email: user.email,
        authorization_type: user.authorization_type,
      };
      return res.status(200).json({ message: "success", user: signinUser });
    });
  });
});

router.post("/oauth2/google", (req, res, next) => {
  if (!("username" in req.body))
    return res.status(400).json({ message: "username is missing" });
  if (!("email" in req.body))
    return res.status(400).json({ message: "email is missing" });

  let username = req.body.username;
  let email = req.body.email;

  if (username.length > 20 || username.length < 3)
    return res
      .status(400)
      .json({ message: "the length of the username must be between 3 and 20" });

  let newUser = {
    email: email,
    username: username,
    authorization_type: "google",
  };
  UserModel.updateOne(
    { email: email },
    newUser,
    { upsert: true },
    (err, data) => {
      if (err) return res.status(500).json({ message: err });
      return res.status(200).json({ message: "success", data: data });
    }
  );
});

module.exports = router;
