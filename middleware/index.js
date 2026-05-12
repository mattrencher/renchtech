// all the middleware goes here
import Project from "../models/project.js";
import Blog from "../models/blog.js";
import Comment from "../models/comment.js";
import User from "../models/user.js";
var middlewareObj = {};

middlewareObj.checkProjectOwnership = async function (req, res, next) {
  if (req.isAuthenticated()) {
    try {
      const foundProject = await Project.findByPk(req.params.id);
      if (!foundProject) {
        req.flash("error", "Project not found");
        return res.redirect("back");
      }
      if (foundProject.authorId === req.user.id || req.user.isAdmin) {
        next();
      } else {
        req.flash("error", "You don't have permission to do that");
        res.redirect("back");
      }
    } catch (err) {
      req.flash("error", "Project not found");
      res.redirect("back");
    }
  } else {
    req.flash("error", "You need to be logged in to do that");
    res.redirect("back");
  }
};

middlewareObj.checkProfileOwnership = async function (req, res, next) {
  if (req.isAuthenticated()) {
    try {
      const foundUser = await User.findByPk(req.params.id);
      if (!foundUser) {
        req.flash("error", "Profile not found");
        return res.redirect("back");
      }
      if (foundUser.id === req.user.id || req.user.isAdmin) {
        next();
      } else {
        req.flash("error", "You don't have permission to do that");
        res.redirect("back");
      }
    } catch (err) {
      req.flash("error", "Profile not found");
      res.redirect("back");
    }
  } else {
    req.flash("error", "You need to log in to edit your profile");
    res.redirect("/community");
  }
};

middlewareObj.checkCommentOwnership = async function (req, res, next) {
  if (req.isAuthenticated()) {
    try {
      const foundComment = await Comment.findByPk(req.params.comment_id);
      if (!foundComment) {
        req.flash("error", "Comment not found");
        return res.redirect("back");
      }
      if (foundComment.authorId === req.user.id || req.user.isAdmin) {
        next();
      } else {
        res.redirect("back");
      }
    } catch (err) {
      res.redirect("back");
    }
  } else {
    res.redirect("back");
  }
};

middlewareObj.isLoggedIn = function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash("error", "You need to be logged in to do that");
  res.redirect("/login");
};

middlewareObj.isAdmin = function isAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.isAdmin) {
    return next();
  } else {
    req.flash("error", "You don't have permission to do that");
    res.redirect("/projects");
  }
};

export default middlewareObj;
