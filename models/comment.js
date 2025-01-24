import { Schema, model } from "mongoose";

var commentSchema = new Schema({
    text: String,
    createdAt: { type: Date, default: Date.now },
    author: {
        id: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    }
});
 
export default model("Comment", commentSchema);