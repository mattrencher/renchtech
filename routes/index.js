var express = require("express");
var router = express.Router();
var passport    = require("passport");
var User = require("../models/user");


// Root Route
router.get("/", function(req, res){
    res.render("landing");
});

// ===============
// AUTH ROUTES
// ===============

// show register form
router.get("/register", function(req, res){
   res.render("register", {page: 'register'}); 
});

// Handle sign up logic
router.post("/register", function(req, res){
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            return res.render("register", {"error": err.message});
        }
        passport.authenticate("local")(req, res, function(){
            req.flash("success", "Welcome to Yelp Camp " + user.username);
            res.redirect("/projects");
        });
    });
});

//show login form
router.get("/login", function(req, res){
   res.render("login", {page: 'login'}); 
});

// Handling login logic
router.post("/login", passport.authenticate("local",
    {
        successRedirect: "/projects",
        failureRedirect: "/login"
    }), function(req, res) {
});

// Logout Route
router.get("/logout", function(req, res){
   req.logout();
   req.flash("success", "Logged You Out");
   res.redirect("/projects");
});

// Middleware
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

module.exports = router;