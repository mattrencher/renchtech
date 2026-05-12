import { DataTypes } from "sequelize";
import sequelize from "./db.js";

const Blog = sequelize.define("Blog", {
  name: { type: DataTypes.STRING },
  image: { type: DataTypes.STRING },
  body: { type: DataTypes.TEXT },
  video: { type: DataTypes.STRING },
  authorId: { type: DataTypes.INTEGER },
  authorName: { type: DataTypes.STRING },
});

export default Blog;
