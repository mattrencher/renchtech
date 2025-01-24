import { Schema, model } from "mongoose";

var projectSchema = new Schema({
   name: String,
   image: String,
   description: String,
   video: String,
   createdAt: { type: Date, default: Date.now },
   author: {
      id: {
         type: Schema.Types.ObjectId,
         ref: "User"
      },
      username: String
   },
   comments: [
      {
         type: Schema.Types.ObjectId,
         ref: "Comment"
      }
   ]
});

export default model("Project", projectSchema);