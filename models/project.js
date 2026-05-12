import { DataTypes } from "sequelize";
import sequelize from "./db.js";

const Project = sequelize.define("Project", {
  name: { type: DataTypes.STRING },
  image: { type: DataTypes.STRING },
  description: { type: DataTypes.TEXT },
  video: { type: DataTypes.STRING },
  authorId: { type: DataTypes.INTEGER },
  authorName: { type: DataTypes.STRING },
});

export default Project;
