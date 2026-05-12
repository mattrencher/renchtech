import { Router } from "express";
var router = Router({ mergeParams: true });
import Project from "../models/project.js";
import User from "../models/user.js";
import middleware from "../middleware/index.js";
import passport from "passport";
import nodemailer from "nodemailer";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { Op } from "sequelize";

// Root Route
router.get("/", function (req, res) {
  res.render("landing");
});

// ===============
// AUTH ROUTES
// ===============

// show register form
router.get("/register", function (req, res) {
  res.render("register", { page: "register" });
});

// Handle sign up logic
router.post("/register", async function (req, res) {
  try {
    const existing = await User.findOne({
      where: { username: req.body.username },
    });
    if (existing) {
      return res.render("register", {
        error: "A user with the given username is already registered",
      });
    }
    const hash = await bcrypt.hash(req.body.password, 12);
    const user = await User.create({
      username: req.body.username,
      password: hash,
      email: req.body.email,
      avatar: req.body.avatar,
      bio: req.body.bio,
    });
    req.logIn(user, function (err) {
      if (err) {
        console.log(err);
        return res.render("register", {
          error: "Login failed after registration",
        });
      }
      req.flash(
        "success",
        "Successfully signed up! Nice to meet you " + user.username,
      );
      res.redirect("/community");
    });
  } catch (err) {
    console.log(err);
    return res.render("register", { error: err.message });
  }
});

// Show login form
router.get("/login", function (req, res) {
  res.render("login", { page: "login" });
});

// Handling login logic
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/community",
    failureRedirect: "/login",
    failureFlash: true,
    successFlash: "Welcome to RenchTech",
  }),
  function (req, res) {},
);

// FORGOT PASSWORD ROUTES
router.get("/forgot", function (req, res) {
  res.render("forgot");
});

router.post("/forgot", async function (req, res, next) {
  try {
    const token = crypto.randomBytes(20).toString("hex");
    const user = await User.findOne({ where: { email: req.body.email } });
    if (!user) {
      req.flash("error", "No account with that email address exists.");
      return res.redirect("/forgot");
    }
    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    var smtpTransport = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAILPW,
      },
    });
    var mailOptions = {
      to: user.email,
      from: process.env.GMAIL_USER,
      subject: "RenchTech Password Reset",
      text:
        "You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n" +
        "Please click on the following link, or paste this into your browser to complete the process:\n\n" +
        "http://" +
        req.headers.host +
        "/reset/" +
        token +
        "\n\n" +
        "If you did not request this, please ignore this email and your password will remain unchanged.\n",
    };
    await smtpTransport.sendMail(mailOptions);
    req.flash(
      "success",
      "An e-mail has been sent to " +
        user.email +
        " with further instructions.",
    );
    res.redirect("/forgot");
  } catch (err) {
    return next(err);
  }
});

// RESET PASSWORD ROUTES
router.get("/reset/:token", async function (req, res) {
  const user = await User.findOne({
    where: {
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { [Op.gt]: new Date() },
    },
  });
  if (!user) {
    req.flash("error", "Password reset token is invalid or has expired.");
    return res.redirect("/forgot");
  }
  res.render("reset", { token: req.params.token });
});

router.post("/reset/:token", async function (req, res) {
  try {
    const user = await User.findOne({
      where: {
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { [Op.gt]: new Date() },
      },
    });
    if (!user) {
      req.flash("error", "Password Reset is invalid, please try again.");
      return res.redirect("back");
    }
    if (req.body.password !== req.body.confirm) {
      req.flash("error", "Passwords don't match.");
      return res.redirect("back");
    }
    user.password = await bcrypt.hash(req.body.password, 12);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    req.logIn(user, async function (err) {
      if (err) return res.redirect("back");
      var smtpTransport = nodemailer.createTransport({
        service: "Gmail",
        auth: { user: process.env.GMAIL_USER, pass: process.env.GMAILPW },
      });
      var mailOptions = {
        to: user.email,
        from: process.env.GMAIL_USER,
        subject: "Your password has been changed",
        text:
          "Hello,\n\n" +
          "This is a confirmation that the password for your RenchTech account " +
          user.email +
          " has just been changed.\n",
      };
      await smtpTransport.sendMail(mailOptions);
      req.flash("success", "Success! Your password has been changed.");
      res.redirect("/community");
    });
  } catch (err) {
    console.log(err);
    res.redirect("/community");
  }
});

// SHOW USER PROFILE ROUTES
router.get("/users/:id", async function (req, res) {
  try {
    const foundUser = await User.findByPk(req.params.id);
    if (!foundUser) {
      req.flash("error", "Something went wrong.");
      return res.redirect("/");
    }
    const projects = await Project.findAll({
      where: { authorId: foundUser.id },
    });
    res.render("users/show", {
      user: foundUser,
      currentUser: req.user,
      projects,
    });
  } catch (err) {
    req.flash("error", "Something went wrong.");
    res.redirect("/");
  }
});

// EDIT PROFILE ROUTE
router.get(
  "/users/:id/edit",
  middleware.checkProfileOwnership,
  async function (req, res) {
    try {
      const foundUser = await User.findByPk(req.params.id);
      res.render("users/edit", { user: foundUser });
    } catch (err) {
      req.flash("error", "Something went wrong.");
      res.redirect("/");
    }
  },
);

// UPDATE PROFILE ROUTE
router.put(
  "/users/:id",
  middleware.checkProfileOwnership,
  async function (req, res) {
    try {
      const username = req.sanitize(req.body.username);
      const firstName = req.sanitize(req.body.firstName);
      const lastName = req.sanitize(req.body.lastName);
      const email = req.sanitize(req.body.email);
      const avatar = req.sanitize(req.body.avatar);
      const bio = req.sanitize(req.body.bio);
      await User.update(
        { username, firstName, lastName, email, avatar, bio },
        { where: { id: req.params.id } },
      );
      res.redirect("/users/" + req.params.id);
    } catch (err) {
      req.flash("error", "Something went wrong updating your profile");
      res.redirect("back");
    }
  },
);

// Resume
router.get("/resume", function (req, res) {
  res.render("info/resume", { currentUser: req.user, page: "resume" });
});

// Logout Route
router.get("/logout", function (req, res) {
  req.logout(function () {});
  req.flash("success", "Logged You Out");
  res.redirect("/community");
});

export default router;
