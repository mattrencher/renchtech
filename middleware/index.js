// all the middleware goes here
import Project from "../models/project.js";
import Blog from "../models/blog.js";
import Comment from "../models/comment.js";
import User from "../models/user.js";
var middlewareObj = {};

middlewareObj.checkProjectOwnership = function(req, res, next){
  // is user logged in
  if(req.isAuthenticated()){
      // does this user own the project?
      Project.findById(req.params.id, function(err, foundProject){
      if(err || !foundProject){
        req.flash("error", "Project not found");
        res.redirect("back");
      } else {
        if(foundProject.author.id.equals(req.user._id) || req.user.isAdmin){
          next();
        } else {
          req.flash("error", "You don't have permission to do that")
          res.redirect("back");
        }
      }
  });
  } else {
      // console.log("YOU NEED TO BE LOGGED IN");
      req.flash("error", "You need to be logged in to do that");
      res.redirect("back");
  }
}

middlewareObj.checkProfileOwnership = function(req, res, next){
  // is user logged in
  if(req.isAuthenticated()){
      // does this user own the project?
      User.findById(req.params.id, function(err, foundUser){
      if(err || !foundUser){
        req.flash("error", "Profile not found");
        res.redirect("back");
      } else {
        if(foundUser && foundUser._id.equals(req.user._id) || req.user.isAdmin){
          next();
        } else {
          req.flash("error", "You don't have permission to do that")
          res.redirect("back");
        }
      }
  });
  } else {
      // console.log("YOU NEED TO BE LOGGED IN");
      req.flash("error", "You need to log in to edit your profile");
      res.redirect("/community");
  }
}

middlewareObj.checkCommentOwnership = function(req, res, next){
   // is user logged in
  if(req.isAuthenticated()){
      Comment.findById(req.params.comment_id, function(err, foundComment){
      if(err || !foundComment){
        req.flash("error", "Comment not found");
        res.redirect("back")
      } else {
          // does user own the comment?
          if(foundComment.author.id.equals(req.user._id)){
              next();
          } else {
              res.redirect("back");
          }
      }
  });
  } else {
      // console.log("YOU NEED TO BE LOGGED IN");
      res.redirect("back");
  }
}

middlewareObj.isLoggedIn = function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "You need to be logged in to do that");
    res.redirect("/login");
}

middlewareObj.isAdmin = function isAdmin(req, res, next){
  if(req.isAuthenticated() && req.user.isAdmin){
    return next();
  } else {
    req.flash("error", "You don't have permission to do that")
    res.redirect("/projects");
  }
}

export default middlewareObj;