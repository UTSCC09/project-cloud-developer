const mongoose = require("mongoose");

const UserModel = mongoose.model("Users", {
  username: String,
  email: String,
  password: String,
  authorization_type: String,
});

const FriendListSchema = new Schema({
  email: String,
  friendList: [String],
  sendedRequests: [String],
  receivedRequests: [String],
});

const FriendListModel = mongoose.model("FriendLists", FriendListSchema);

exports.UserModel = UserModel;
exports.FriendListModel = FriendListModel;
