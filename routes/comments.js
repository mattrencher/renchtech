import { Router } from "express";
var router = Router({mergeParams: true});
import Project from "../models/project.js";
import Blog from "../models/blog.js";
import Comment from "../models/comment.js";
import middleware from "../middleware/index.js";

// ============================================
// COMMENTS ROUTES
// ============================================

// Comments New
router.get("/new", middleware.isLoggedIn, function(req, res){
    // find project by id
    console.log(req.params.id);
    Project.findById(req.params.id)
    .then((foundProject) => {
        res.render("comments/new", {project: foundProject});
    })
    .catch((err) => {
        console.log(err);
    });
});

// Comments Create
router.post("/", middleware.isLoggedIn, function(req, res){
    //lookup project using ID
    Project.findById(req.params.id)
    .then((foundProject) => {
        Comment.create(req.body.comment)
        .then((newComment) => {
            // add username and id to comment
            newComment.author.id = req.user._id;
            newComment.author.username = req.user.username;
            
            // save comment
            newComment.save();
            foundProject.comments.push(newComment);
            foundProject.save();
            // console.log(newComment);
            req.flash("success", "Successfully added comment");
            res.redirect('/community/' + foundProject._id);
        })
        .catch((err) => {
            req.flash("error", "Something went wrong");
            console.log(err);
        });
    })
    .catch((err) => {
        console.log(err);
        res.redirect("/community");
    });
});

// COMMENT EDIT ROUTE
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
    Project.findById(req.params.id)
    .then((foundProject) => {
        Comment.findById(req.params.comment_id)
        .then((foundComment) => {
            res.render("comments/edit", {project_id: req.params.id, comment: foundComment});
        })
        .catch((err) => {
            req.flash("error", "No project found");
            return res.redirect("back");
        });
    });
});

// COMMENT UPDATE
router.put("/:comment_id", middleware.checkCommentOwnership, function(req,res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment)
    .then((updatedComment) => {
        res.redirect("/community/" + req.params.id);
    })
    .catch((err) => {
        res.redirect("back");
    });
});

// COMMENT DESTROY
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req,res){
    Comment.findByIdAndRemove(req.params.comment_id)
    .then(() => {
        req.flash("success", "Comment deleted");
        res.redirect("/community/" + req.params.id);
    })
    .catch((err) => {
        res.redirect("back");
    });  
});

export default router;