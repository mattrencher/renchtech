import express from "express";
import bodyParser from "body-parser";
import flash from "connect-flash";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import methodOverride from "method-override";
import User from "./models/user.js";
import expressSanitizer from "express-sanitizer";
import moment from "moment";
import session from "express-session";
import SequelizeStore from "connect-session-sequelize";
import bcrypt from "bcryptjs";
import sequelize from "./models/db.js";
import Project from "./models/project.js";
import Comment from "./models/comment.js";
import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Ensure data directory exists for SQLite file
const dataDir = path.join(__dirname, "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

// Importing routes
import commentRoutes from "./routes/comments.js";
import communityRoutes from "./routes/community.js";
import projectRoutes from "./routes/projects.js";
import indexRoutes from "./routes/index.js";

const app = express();

// Sync all Sequelize models (create tables if they don't exist)
await sequelize.sync();

// Define associations after sync
Project.hasMany(Comment, { foreignKey: "projectId", as: "comments" });
Comment.belongsTo(Project, { foreignKey: "projectId" });
User.hasMany(Project, { foreignKey: "authorId" });
User.hasMany(Comment, { foreignKey: "authorId" });

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("./public"));
app.use(methodOverride("_method"));
app.use(flash());
app.locals.moment = moment;
app.use(expressSanitizer());

// SESSION CONFIGURATION with SQLite store
const SessionStore = SequelizeStore(session.Store);
const sessionStore = new SessionStore({ db: sequelize });
await sessionStore.sync();

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {},
  }),
);

app.use(passport.initialize());
app.use(passport.session());

// PASSPORT LOCAL STRATEGY (manual bcrypt — replaces passport-local-mongoose)
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await User.findOne({ where: { username } });
      if (!user) return done(null, false, { message: "Incorrect username." });
      const match = await bcrypt.compare(password, user.password);
      if (!match) return done(null, false, { message: "Incorrect password." });
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }),
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});

app.use("/", indexRoutes);
app.use("/projects", projectRoutes);
app.use("/community", communityRoutes);
app.use("/community/:id/comments", commentRoutes);

if (process.env.NODE_ENV === "development") {
  app.listen(process.env.PORT, process.env.IP, () => {
    console.log(
      `RenchTech ༼ つ ◕_◕ ༽つ http://${process.env.IP}:${process.env.PORT}`,
    );
  });
} else {
  app.listen(process.env.PORT || 3000, () => {
    console.log(`RenchTech running...`);
  });
}
