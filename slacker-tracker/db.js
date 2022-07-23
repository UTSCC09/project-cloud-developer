const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = mongoose.Schema(
  {
    _id: String, // generated by mongoDB
    name: {
      type: String,
      required: true,
    },
    email: String, //unique
    password: {
      type: String,
      required: () => {
        return !this.googleId;
      },
    },
    googleId: {
      type: String,
      required: false,
    },
    access_token: {
      type: String,
      required: false,
    },
    authentication_type: String,
    avatar: {
      type: String, // an url
      required: false, // update by user or a default picture
    },
    bio: String,
    slackerScore: {
      type: Number,
      required: true, // initialized to be 5
    },
  },
  { timestamps: true }
);

const FriendListSchema = new Schema({
  _id: String, // primary
  friendList: [String],
  sendedRequests: [String],
  receivedRequests: [String],
});

const TimerSchema = new Schema({
  _id: String, // primary
  workTime: {
    totalTimeSpent: Number,
    intervals: [{ startTime: Date, endTime: Date }],
  },
  studyTime: {
    totalTimeSpent: Number,
    intervals: [{ startTime: Date, endTime: Date }],
  },
  entertainmentTime: {
    totalTimeSpent: Number,
    intervals: [{ startTime: Date, endTime: Date }],
  },
  offlineTime: {
    totalTimeSpent: Number,
    intervals: [{ startTime: Date, endTime: Date }],
  },
  unallocatedTime: {
    totalTimeSpent: Number,
    intervals: [{ startTime: Date, endTime: Date }],
  },
  duty: { name: String, startTime: Date }, // ['work', 'study', 'entertainment', 'offline', 'unallocated'].includes(name) === true
});

const UserModel = mongoose.model("Users", userSchema);
const FriendListModel = mongoose.model("FriendLists", FriendListSchema);
const TimerModel = mongoose.model("Timers", TimerSchema);

exports.UserModel = UserModel;
exports.FriendListModel = FriendListModel;
exports.TimerModel = TimerModel;
