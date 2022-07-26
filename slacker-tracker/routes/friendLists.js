const auth = require("../auth");

const express = require("express");
const { query, body, validationResult } = require("express-validator");
const router = express.Router();
const { FriendListModel, UserModel, TimerModel } = require("../db");

const newFriendListData = function (
  operation,
  sender,
  receiver,
  senderId,
  receiverId
) {
  let newSenderData;
  let newReceiverData;

  const senderFriendList = sender.friendList;
  const senderSendedRequests = sender.sendedRequests;
  const senderReceivedRequests = sender.receivedRequests;
  const receiverFriendList = receiver.friendList;
  const receiverSendedRequests = receiver.sendedRequests;
  const receiverReceivedRequests = receiver.receivedRequests;

  switch (operation) {
    case "send":
      if (
        senderSendedRequests.find((el) => el === receiverId) === undefined &&
        receiverReceivedRequests.find((el) => el === senderId) === undefined
      ) {
        senderSendedRequests.push(receiverId);
        receiverReceivedRequests.push(senderId);
      }

      newSenderData = {
        sendedRequests: senderSendedRequests,
      };
      newReceiverData = {
        receivedRequests: receiverReceivedRequests,
      };
      break;
    case "accept":
      if (
        senderFriendList.find((el) => el === receiverId) === undefined &&
        receiverFriendList.find((el) => el === senderId) === undefined
      ) {
        senderFriendList.push(receiverId);
        receiverFriendList.push(senderId);
      }

      newSenderData = {
        friendList: senderFriendList,
        sendedRequests: senderSendedRequests.filter((id) => id !== receiverId),
        receivedRequests: senderReceivedRequests.filter(
          (id) => id !== receiverId
        ),
      };
      newReceiverData = {
        friendList: receiverFriendList,
        sendedRequests: receiverSendedRequests.filter((id) => id !== senderId),
        receivedRequests: receiverReceivedRequests.filter(
          (id) => id !== senderId
        ),
      };
      break;
    case "cancel":
      newSenderData = {
        sendedRequests: senderSendedRequests.filter((id) => id !== receiverId),
      };
      newReceiverData = {
        receivedRequests: receiverReceivedRequests.filter(
          (id) => id !== senderId
        ),
      };
      break;
    case "delete":
      newSenderData = {
        friendList: senderFriendList.filter((id) => id !== receiverId),
      };
      newReceiverData = {
        friendList: receiverFriendList.filter((id) => id !== senderId),
      };
      break;
  }

  return [newSenderData, newReceiverData];
};

const handleRequest = function (operation, senderEmail, receiverEmail, res) {
  let newSenderData;
  let newReceiverData;

  FriendListModel.findOne({ email: senderEmail }, "", (err, sender) => {
    if (err) return res.status(500).json({ message: err });
    if (!sender) {
      return res
        .status(404)
        .json({ message: `user ${senderEmail} does not exist` });
    }
    FriendListModel.findOne({ email: receiverEmail }, "", (err, receiver) => {
      if (err) return res.status(500).json({ message: err });
      if (!receiver) {
        return res
          .status(404)
          .json({ message: `user ${receiverEmail} does not exist` });
      }
      const senderId = sender._id;
      const receiverId = receiver._id;

      switch (operation) {
        case "send":
          if (
            sender.friendList.find((el) => el === receiverId) !== undefined ||
            receiver.friendList.find((el) => el === senderId) !== undefined
          ) {
            return res
              .status(400)
              .json({ message: "You are already friends!" });
          }
          break;

        case "accept":
          if (
            sender.friendList.find((el) => el === receiverId) !== undefined ||
            receiver.friendList.find((el) => el === senderId) !== undefined
          ) {
            return res
              .status(400)
              .json({ message: "You are already friends!" });
          }
          if (
            sender.friendList.find((el) => el === receiverId) !== undefined ||
            receiver.friendList.find((el) => el === senderId) !== undefined
          ) {
            return res
              .status(400)
              .json({ message: "You are already friends!" });
          }
          if (
            sender.sendedRequests.find((el) => el === receiverId) ===
              undefined ||
            receiver.receivedRequests.find((el) => el === senderId) ===
              undefined
          ) {
            return res
              .status(404)
              .json({ message: "Friend request not found" });
          }
          break;

        case "cancel":
          if (
            sender.sendedRequests.find((el) => el === receiverId) ===
              undefined ||
            receiver.receivedRequests.find((el) => el === senderId) ===
              undefined
          ) {
            return res
              .status(404)
              .json({ message: "Friend request not found" });
          }
          break;

        case "delete":
          if (
            sender.friendList.find((el) => el === receiverId) === undefined ||
            receiver.friendList.find((el) => el === senderId) === undefined
          ) {
            return res.status(400).json({ message: "Friend not found" });
          }
          break;
      }

      [newSenderData, newReceiverData] = newFriendListData(
        operation,
        sender,
        receiver,
        senderId,
        receiverId
      );

      FriendListModel.updateOne(
        { _id: senderId },
        newSenderData,
        { upsert: true },
        (err, data1) => {
          if (err) return res.status(500).json({ message: err });
          FriendListModel.updateOne(
            { _id: receiverId },
            newReceiverData,
            { upsert: true },
            (err, data2) => {
              if (err) return res.status(500).json({ message: err });
              return res.status(200).json({
                message: "success",
                data: [data1, data2],
              });
            }
          );
        }
      );
    });
  });
};

router.get(
  "/",
  auth.isAuthenticated,
  [query("_id").isString().notEmpty().trim().escape()],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    FriendListModel.findOne({ _id: req.query._id }, (err, user) => {
      if (err) return res.status(500).json({ message: err });
      if (!user) {
        return res
          .status(404)
          .json({ message: `user ${req.query._id} does not exist` });
      }
      if (req.session.user._id != req.body._id)
        return res.status(401).json({ message: "access denied" });
      return res
        .status(200)
        .json({ message: "success", data: user.friendList });
    });
  }
);

router.get(
  "/getRequest",
  auth.isAuthenticated,
  [query("_id").isString().notEmpty().trim().escape()],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    FriendListModel.findOne(
      { _id: req.query._id },
      "receivedRequests",
      (err, requests) => {
        if (err) return res.status(500).json({ message: err });
        if (!requests) {
          return res
            .status(404)
            .json({ message: `user ${req.query._id} does not exist` });
        }
        res.status(200).json({ message: "success", requests });
      }
    );
  }
);

router.post(
  "/sendRequest",
  auth.isAuthenticated,
  [
    body("senderEmail").isEmail().trim().escape(),
    body("receiverEmail").isEmail().trim().escape(),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    if (req.session.user._id != req.body.senderId)
      return res.status(401).json({ message: "access denied" });
    handleRequest("send", req.body.senderEmail, req.body.receiverEmail, res);
  }
);

router.post(
  "/acceptRequest",
  auth.isAuthenticated,
  [
    body("senderEmail").isEmail().trim().escape(),
    body("receiverEmail").isEmail().trim().escape(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    if (req.session.user._id != req.body.receiverId)
      return res.status(401).json({ message: "access denied" });
    handleRequest("accept", req.body.senderEmail, req.body.receiverEmail, res);
  }
);

router.post(
  "/cancelRequest",
  auth.isAuthenticated,
  [
    body("senderEmail").isEmail().trim().escape(),
    body("receiverEmail").isEmail().trim().escape(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    if (
      req.session.user._id != req.body.senderId &&
      req.session.user._id != req.body.receiverId
    )
      return res.status(401).json({ message: "access denied" });
    handleRequest("cancel", req.body.senderEmail, req.body.receiverEmail, res);
  }
);

router.delete(
  "/deleteFriend",
  auth.isAuthenticated,
  [
    body("email1").isEmail().trim().escape(),
    body("email2").isEmail().trim().escape(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    if (
      req.session.email != req.body.email1 &&
      req.session.email != req.body.email2
    )
      return res.status(401).json({ message: "access denied" });
    handleRequest("delete", req.body.email1, req.body.email2, res);
  }
);

module.exports = router;
