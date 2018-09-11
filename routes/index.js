var express = require("express"),
  router = express.Router(),
  passport    = require("passport"),
  User = require("../models/user"),
  Project = require("../models/project"),
  async       = require("async"),
  nodemailer  = require("nodemailer"),
  crypto      = require("crypto"),
  middleware = require("../middleware");

// Mailgun variables
var api_key = 'dbe59d6aa65e9099226f19868b2c770c-7bbbcb78-80c461e9';
var domain = 'mg.renchtech.com';
var mailgun = require('mailgun-js')({apiKey: api_key, domain: domain});
 

// Root Route
router.get("/", function(req, res){
    res.render("landing");
});
require('locus');
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
        email: req.body.email,
        avatar: req.body.avatar,
        bio: req.body.bio
      });
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render("register", {"error": err.message});
        }
        passport.authenticate("local")(req, res, function(){
            req.flash("success", "Successfully signed up! Nice to meet you " + user.username);
            res.redirect("/community");
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
        successRedirect: "/community",
        failureRedirect: "/login",
        failureFlash: true,
        successFlash: "Welcome to RenchTech"
    }), function(req, res) {
});


// FORGOT PASSWORD ROUTES
router.get('/forgot', function(req, res) {
  res.render('forgot');
});

router.post('/forgot', function(req, res, next) {
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({ email: req.body.email }, function(err, user) {
        if (!user) {
          req.flash('error', 'No account with that email address exists.');
          return res.redirect('/forgot');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      // var smtpTransport = nodemailer.createTransport({
      //   service: 'Gmail', 
      //   auth: {
          
      //     user: 'renchtechnology@gmail.com',
      //     pass: process.env.GMAILPW
      //   }
      // });
      // var mailOptions = {
      //   to: user.email,
      //   from: 'renchtechnology@gmail.com',
      //   subject: 'Node.js Password Reset',
      //   text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
      //     'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
      //     'http://' + req.headers.host + '/reset/' + token + '\n\n' +
      //     'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      // };
      // smtpTransport.sendMail(mailOptions, function(err) {
      //   console.log('mail sent');
      //   req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
      //   done(err, 'done');
      // });
      
      var data = {
        from: 'Excited User <me@samples.mailgun.org>',
        to: user.email,
        subject: 'RenchTech Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      mailgun.messages().send(data, function (error, body) {
        console.log(body);
        req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
        done(error, 'done');
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/forgot');
  });
});

// RESET PASSWORD ROUTES
router.get('/reset/:token', function(req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/forgot');
    }
    res.render('reset', {token: req.params.token});
  });
});

router.post('/reset/:token', function(req, res) {
  async.waterfall([
    function(done) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          req.flash('error', 'Password Reset is invalid, please try again.');
          return res.redirect('back');
        }
        if(req.body.password === req.body.confirm) {
          user.setPassword(req.body.password, function(err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            user.save(function(err) {
              req.logIn(user, function(err) {
                done(err, user);
              });
            });
          })
        } else {
            req.flash("error", "Passwords don't match.");
            return res.redirect('back');
        }
      });
    },
    function(user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
          user: 'renchtechnology@gmail.com',
          pass: process.env.GMAILPW
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'renchtechnology@mail.com',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your RenchTech account ' + user.email + ' has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('success', 'Success! Your password has been changed.');
        done(err);
      });
    }
  ], function(err) {
    res.redirect('/community');
  });
});


//  SHOW USER PROFILE ROUTES
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
      res.render("users/show", {user: foundUser, currentUser: req.user, projects: projects});
    });
  });
});

// EDIT PROFILE ROUTE
router.get("/users/:id/edit", middleware.checkProfileOwnership, function(req, res){
    User.findById(req.params.id, function(err, foundUser) {
    if(err) {
      req.flash("error", "Something went wrong.");
      res.redirect("/");
    } else {
      res.render("users/edit", {user: foundUser});
    }
  });
});

// UPDATE PROFILE ROUTE
router.put("/users/:id", middleware.checkProfileOwnership, function(req,res){
    // find and update the correct user profile
    // eval(locus);
    var username = req.sanitize(req.body.username);
    var firstName = req.sanitize(req.body.firstName);
    var lastName = req.sanitize(req.body.lastName);
    var email = req.sanitize(req.body.email);
    var avatar = req.sanitize(req.body.avatar);
    var bio = req.sanitize(req.body.bio);

    var newProfile = {name: username, firstName: firstName, lastName: lastName, email: email, avatar: avatar, bio: bio};  // save form inputs to new object
    // req.body.project.body = req.sanitize(req.body.project.body);
    User.findByIdAndUpdate(req.params.id, newProfile, function(err, updatedProfile){
        if(err){
          req.flash("error", "Something went wrong updating your profile")
            res.redirect("back");
        } else {
            res.redirect("/users/" + req.params.id);
        }
    });
});



// Resume
router.get("/resume", function(req, res){
  res.render("info/resume",{currentUser: req.user, page: 'resume'});
});


// Logout Route
router.get("/logout", function(req, res){
   req.logout();
   req.flash("success", "Logged You Out");
   res.redirect("/community");
});

module.exports = router;