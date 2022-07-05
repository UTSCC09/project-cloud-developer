const mongoose = require("mongoose");

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
const UserModel = mongoose.model("Users", userSchema);

exports.UserModel = UserModel;