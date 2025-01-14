const express     = require("express"),
    app         = express(),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
    flash       = require("connect-flash"),
    passport    = require("passport"),
    // passport     = require("express-session"),
    LocalStrategy = require("passport-local"),
    methodOverride = require("method-override"),
    Project  = require("./models/project"),
    Comment     = require("./models/comment"),
    User        = require("./models/user"),
    // seedDB      = require("./seeds"),
    expressSanitizer = require('express-sanitizer');
    ejs = require('ejs');
    ejsLint = require('ejs-lint');

app.locals.moment = require('moment');

require('dotenv').config()

// requiring routes
var commentRoutes = require("./routes/comments"),
    communityRoutes = require("./routes/community"),
    projectRoutes = require("./routes/projects"),
    indexRoutes = require("./routes/index");

var db_url = process.env.DATABASE_URL;
mongoose.connect(db_url);
 
// var data = {
//   from: 'Excited User <me@samples.mailgun.org>',
//   to: 'mattrencher@gmail.com',
//   subject: 'Hello',
//   text: 'Testing some Mailgun awesomeness!'
// };
// mailgun.messages().send(data, function (error, body) {
//   console.log(body);
// });

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");   // allows ejs files to remove suffix
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
// seedDB(); // seed the database
app.locals.moment = require('moment');
app.use(expressSanitizer());

// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Ichiban number 1",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
})

app.use("/", indexRoutes);
app.use("/projects", projectRoutes);
app.use("/community", communityRoutes);
app.use("/community/:id/comments", commentRoutes);

app.listen(process.env.PORT, process.env.IP, function(){
    console.log(`RenchTech ༼ つ ◕_◕ ༽つ http://${process.env.IP}:${process.env.PORT}`)
});