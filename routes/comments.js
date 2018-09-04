var express = require("express");
var router = express.Router({mergeParams: true});
var Project = require("../models/project");
var Blog = require("../models/blog");
var Comment = require("../models/comment");
var middleware = require("../middleware");

// ============================================
// COMMENTS ROUTES
// ============================================

// Comments New
router.get("/new", middleware.isLoggedIn, function(req, res){
    // find project by id
    console.log(req.params.id);
    Project.findById(req.params.id, function(err, project){
        if(err){
            console.log(err);
        } else {
            res.render("comments/new", {project: project});
        }
    })
});

// Comments Create
router.post("/", middleware.isLoggedIn, function(req, res){
   //lookup project using ID
   Project.findById(req.params.id, function(err, project){
       if(err){
           console.log(err);
           res.redirect("/community");
       } else {
        Comment.create(req.body.comment, function(err, comment){
           if(err){
              req.flash("error", "Something went wrong");
               console.log(err);
           } else {
              // add username and id to comment
              comment.author.id = req.user._id;
              comment.author.username = req.user.username;
              
              // save comment
              comment.save();
              project.comments.push(comment);
              project.save();
              console.log(comment);
              req.flash("success", "Successfully added comment");
              res.redirect('/community/' + project._id);
           }
        });
       }
   });
});

// COMMENT EDIT ROUTE
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
  Project.findById(req.params.id, function(err, foundProject){
    if(err || !foundProject) {
      req.flash("error", "No project found");
      return res.redirect("back");
    }
    Comment.findById(req.params.comment_id, function(err, foundComment){
      if(err){
        res.redirect("back");
      } else {
        res.render("comments/edit", {project_id: req.params.id, comment: foundComment});
      }
    });
  });

});

// COMMENT UPDATE
router.put("/:comment_id", middleware.checkCommentOwnership, function(req,res){
  Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
    if(err){
      res.redirect("back");
    } else {
      res.redirect("/community/" + req.params.id);
    }
  });
});

// COMMENT DESTROY
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req,res){
  Comment.findByIdAndRemove(req.params.comment_id, function(err){
    if(err){
      res.redirect("back");
    } else {
      req.flash("success", "Comment deleted");
      res.redirect("/community/" + req.params.id);
    }
  });
  
});

// middleware moved to index.js


module.exports = router;