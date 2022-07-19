const mongoose = require('mongoose')

const Schema = mongoose.Schema

const userSchema = mongoose.Schema(
  {
    username: String,
    email: String,
    password: {
      type: String,
      required: () => {
        return !this.googleId
      }
    },
    googleId: {
      type: String,
      required: false
    },
    access_token: {
      type: String,
      required: false
    },
    authentication_type: String,
    avatar: {
      type: String,
      required: false
    }
  },
  { timestamps: true }
)

const FriendListSchema = new Schema({
  email: String,
  friendList: [String],
  sendedRequests: [String],
  receivedRequests: [String]
})

const TimerSchema = new Schema({
  email: String, // primary
  unallocatedTime: Number,
  allocatedTime: [
    { dutyName: String /* Unique */, orgLength: Number, timer: Number }
  ],
  duty: { name: String, startTime: Date }
})

const UserModel = mongoose.model('Users', userSchema)
const FriendListModel = mongoose.model('FriendLists', FriendListSchema)
const TimerModel = mongoose.model('Timers', TimerSchema)

exports.UserModel = UserModel
exports.FriendListModel = FriendListModel
exports.TimerModel = TimerModel
