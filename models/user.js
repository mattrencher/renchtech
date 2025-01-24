import { Schema, model } from "mongoose";
import passportLocalMongoose from "passport-local-mongoose";

var UserSchema = new Schema({
  username: String,
  password: String,
  firstName: String,
  lastName: String,
  avatar: String,
  email: {type: String, unique: true, required: true},
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  bio: String,
  isAdmin: { type: Boolean, default: false}
});

UserSchema.plugin(passportLocalMongoose);

export default model("User", UserSchema);