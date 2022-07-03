const mongoose = require("mongoose");

const UserModel = mongoose.model("Users", {
    username: String,
    email: String,
    password: String,
    authorization_type: String,
});

exports.UserModel = UserModel;