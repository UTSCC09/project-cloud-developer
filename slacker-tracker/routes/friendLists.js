const express = require("express");
const { check, body, validationResult } = require("express-validator");
const router = express.Router();
const { FriendListModel } = require("../db");

const onError = function (req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
};

const checkUser = function (item, email) {
  if (!item)
    return res.status(404).json({ message: `user ${email} does not exist` });
};

const newFriendListData = function (
  operation,
  sender,
  receiver,
  senderEmail,
  receiverEmail
) {
  let newSenderData;
  let newReceiverData;

  const senderFriendList = sender.friendList;
  const receiverFriendList = receiver.friendList;
  const senderSendedRequests = sender.sendedRequests;
  const receiverReceivedRequests = receiver.receivedRequests;

  switch (operation) {
    case "send":
      newSenderData = {
        sendedRequests: senderSendedRequests.push(receiverEmail),
      };
      newReceiverData = {
        receivedRequests: receiverReceivedRequests.push(senderEmail),
      };
      break;
    case "accept":
      newSenderData = {
        friendList: senderFriendList.push(receiverEmail),
        sendedRequests: senderSendedRequests.filter(
          (email) => email !== receiverEmail
        ),
      };
      newReceiverData = {
        friendList: receiverFriendList.push(senderEmail),
        receivedRequests: receiverReceivedRequests.filter(
          (email) => email !== senderEmail
        ),
      };
      break;
    case "cancel":
      newSenderData = {
        sendedRequests: senderSendedRequests.filter(
          (email) => email !== receiverEmail
        ),
      };
      newReceiverData = {
        receivedRequests: receiverReceivedRequests.filter(
          (email) => email !== senderEmail
        ),
      };
      break;
    case "delete":
      newSenderData = {
        friendList: senderFriendList.filter((email) => email !== receiverEmail),
      };
      newReceiverData = {
        friendList: receiverFriendList.filter((email) => email !== senderEmail),
      };
      break;
  }

  return [newSenderData, newReceiverData];
};

const handleRequest = function (operation, senderEmail, receiverEmail) {
  let newSenderData;
  let newReceiverData;

  FriendListModel.findOne(
    { email: senderEmail },
    "-receivedRequests",
    (err, sender) => {
      if (err) return res.status(500).json({ message: err });
      checkUser(sender, senderEmail);
      FriendListModel.findOne(
        { email: receiverEmail },
        "-sendedRequests",
        (err, receiver) => {
          if (err) return res.status(500).json({ message: err });
          checkUser(receiver, receiverEmail);

          [newSenderData, newReceiverData] = newFriendListData(
            operation,
            sender,
            receiver,
            senderEmail,
            receiverEmail
          );

          FriendListModel.updateOne(
            { email: senderEmail },
            newSenderData,
            { overwrite: true },
            (err, data1) => {
              if (err) return res.status(500).json({ message: err });
              FriendListModel.updateOne(
                { email: receiverEmail },
                newReceiverData,
                { overwrite: true },
                (err, data2) => {
                  if (err) return res.status(500).json({ message: err });
                  return [data1, data2];
                }
              );
            }
          );
        }
      );
    }
  );
};

router.get(
  "/",
  [check("email").isEmpty().isEmail().trim().escape()],
  (req, res, next) => {
    onError(req, res);
    FriendListModel.findOne({ email: req.query.email }, (err, friendList) => {
      if (err) return res.status(500).json({ message: err });
      checkUser(friendList, req.query.email);
      return res
        .status(200)
        .json({ message: "success", friendList: friendList });
    });
  }
);

router.post(
  "/sendRequest",
  [
    body("senderEmail").isEmpty().isEmail().trim().escape(),
    body("receiverEmail").isEmpty().isEmail().trim().escape(),
  ],
  (req, res, next) => {
    onError(req, res);

    let data1;
    let data2;
    [data1, data2] = handleRequest(
      "send",
      req.body.senderEmail,
      req.body.receiverEmail
    );
    return res.status(200).json({
      message: "success",
      data: [data1, data2],
    });
  }
);

router.post(
  "/acceptRequest",
  [
    body("senderEmail").isEmpty().isEmail().trim().escape(),
    body("receiverEmail").isEmpty().isEmail().trim().escape(),
  ],
  (req, res) => {
    onError(req, res);
    let data1;
    let data2;
    [data1, data2] = handleRequest(
      "accept",
      req.body.senderEmail,
      req.body.receiverEmail
    );
    return res.status(200).json({
      message: "success",
      data: [data1, data2],
    });
  }
);

router.post(
  "/cancelRequest",
  [
    body("senderEmail").isEmpty().isEmail().trim().escape(),
    body("receiverEmail").isEmpty().isEmail().trim().escape(),
  ],
  (req, res) => {
    onError(req, res);
    let data1;
    let data2;
    [data1, data2] = handleRequest(
      "cancel",
      req.body.senderEmail,
      req.body.receiverEmail
    );
    return res.status(200).json({
      message: "success",
      data: [data1, data2],
    });
  }
);

router.post(
  "/deleteFriend",
  [
    body("email1").isEmpty().isEmail().trim().escape(),
    body("email2").isEmpty().isEmail().trim().escape(),
  ],
  (req, res) => {
    onError(req, res);
    let data1;
    let data2;
    [data1, data2] = handleRequest(
      "delete",
      req.body.senderEmail,
      req.body.receiverEmail
    );
    return res.status(200).json({
      message: "success",
      data: [data1, data2],
    });
  }
);
