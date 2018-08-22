// all the middlware goes here
var Project = require("../models/project");
var Comment = require("../models/comment");
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
        if(foundProject.author.id.equals(req.user._id)){
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
    // add flash ""
    req.flash("error", "You need to be logged in to do that");
    res.redirect("/login");
}

module.exports = middlewareObj;