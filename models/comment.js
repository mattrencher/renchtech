import { DataTypes } from "sequelize";
import sequelize from "./db.js";

const Comment = sequelize.define("Comment", {
  text: { type: DataTypes.TEXT },
  authorId: { type: DataTypes.INTEGER },
  authorName: { type: DataTypes.STRING },
  projectId: { type: DataTypes.INTEGER },
});

export default Comment;
