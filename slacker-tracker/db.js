const mongoose = require("mongoose");

var Schema = mongoose.Schema;

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

const TimerSchema = new Schema({
  email: String, //primary
  unallocatedTime: Number,
  allocatedTime: [
    { dutyName: String /*Unique*/, orgLength: Number, timer: Number },
  ],
  duty: { name: String, startTime: Date },
});

const FriendListModel = mongoose.model("FriendLists", FriendListSchema);
const TimerModel = mongoose.model("Timers", TimerSchema);

exports.UserModel = UserModel;
exports.FriendListModel = FriendListModel;
exports.TimerModel = TimerModel;
