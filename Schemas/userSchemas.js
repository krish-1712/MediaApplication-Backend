const mongoose = require('mongoose')
const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
    },
    subscribers: {
      type: Number,
      default: 0,
    },
    subscribedUsers: {
      type: [String],
    },

  },
  { timestamps: true }

)

let userModel = mongoose.model('users', UserSchema)
module.exports = { userModel }