var express     = require("express"),
    app         = express(),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
    flash       = require("connect-flash"),
    passport    = require("passport"),
    LocalStrategy = require("passport-local"),
    methodOverride = require("method-override"),
    Project  = require("./models/project"),
    Comment     = require("./models/comment"),
    User        = require("./models/user"),
    seedDB      = require("./seeds"),
    expressSanitizer = require('express-sanitizer');

app.locals.moment = require('moment');

// requiring routes
var commentRoutes = require("./routes/comments"),
    projectRoutes = require("./routes/projects"),
    myProjectRoutes = require("./routes/myprojects"),
    indexRoutes = require("./routes/index");

var url = process.env.DATABASEURL || "mongodb://matt:mlabpw123@ds229722.mlab.com:29722/renchtech";
mongoose.connect(url);

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
    secret: "Once again Rusty wins cutest dog!",
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
app.use("/projects/:id/comments", commentRoutes);
app.use("/myprojects", myProjectRoutes);
    
app.listen(process.env.PORT, process.env.IP, function(){
    console.log(("RenchTech has started!!"));
});