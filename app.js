import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import flash from 'connect-flash';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import methodOverride from 'method-override';
import Project from './models/project.js';
import Comment from './models/comment.js';
import User from './models/user.js';
import expressSanitizer from 'express-sanitizer';
import ejs from 'ejs';
import moment from 'moment';
import session from 'express-session';
import 'dotenv/config';

// Importing routes
import commentRoutes from './routes/comments.js';
import communityRoutes from './routes/community.js';
import projectRoutes from './routes/projects.js';
import indexRoutes from './routes/index.js';

const app = express();
const db_url = process.env.DATABASE_URL;
mongoose.connect(db_url);

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static('./public'));
app.use(methodOverride("_method"));
app.use(flash());
app.locals.moment = moment;
app.use(expressSanitizer());

// PASSPORT CONFIGURATION
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

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

if(process.env.NODE_ENV === 'development'){ 
    app.listen(process.env.PORT, process.env.IP, () => {
        console.log(`RenchTech ༼ つ ◕_◕ ༽つ http://${process.env.IP}:${process.env.PORT}`)
    });
} else{
    app.listen(process.env.PORT || 3000, () => {
        console.log(`RenchTech running...`)
    });
}