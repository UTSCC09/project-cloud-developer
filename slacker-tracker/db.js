const mongoose = require("mongoose");

var Schema = mongoose.Schema;

const userSchema = mongoose.Schema(
    {
        username: String,
        email: String,
        password: {
            type: String,
            required: () => {
                return this.googleId? false : true
            }
        },
        googleId: {
            type: String,
            required: false
        },
        authorization_type: String,
    },
    { timestamps: true }
)

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

const UserModel = mongoose.model("Users", userSchema);
const FriendListModel = mongoose.model("FriendLists", FriendListSchema);
const TimerModel = mongoose.model("Timers", TimerSchema);

exports.UserModel = UserModel;
exports.FriendListModel = FriendListModel;
exports.TimerModel = TimerModel;
