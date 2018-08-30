var express = require("express");
var router = express.Router();
var passport    = require("passport");
var User = require("../models/user");
var Project = require("../models/project")

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
    var newUser = new User(
      {
        username: req.body.username,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        avatar: req.body.avatar
      });
    // eval(require('locus'));
    //  if(req.body.adminCode === 'secretcode123') {
    //   newUser.isAdmin = true;
    // }
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render("register", {"error": err.message});
        }
        passport.authenticate("local")(req, res, function(){
            req.flash("success", "Successfully signed up! Nice to meet you " + user.username);
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

// User Profile
router.get("/users/:id", function(req, res){
  User.findById(req.params.id, function(err, foundUser) {
    if(err) {
      req.flash("error", "Something went wrong.");
      res.redirect("/");
    }
    Project.find().where('author.id').equals(foundUser._id).exec(function(err, projects){
      if(err) {
        req.flash("error", "Something went wrong.");
        res.redirect("/");
      } 
      res.render("users/show", {user: foundUser, projects: projects});
    });
  });
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