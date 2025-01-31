import { Router } from "express";
var router = Router();
import Project from "../models/project.js";
import Comment from "../models/comment.js";
import middleware from "../middleware/index.js";

// // INDEX - show all projects
router.get("/", function(req, res){
    // Get all projects from DB
    Project.find({})
    .then(documents => {
        // Do something with the found documents
        res.render("community/index",{projects:documents, currentUser: req.user, page: 'community'});
        // console.log(documents);
    });

});

// CREATE - add new project to DB
router.post("/", middleware.isLoggedIn, function(req, res){
    var name = req.sanitize(req.body.project.name);
    var image = req.sanitize(req.body.project.image);
    var desc = req.sanitize(req.body.project.description);
    var video = req.sanitize(req.body.project.video);
    var vid = video;
    if (!vid == null){
        vid = vid.replace("watch?v=", "embed/");
    }
    var author ={
        id: req.user._id,
        username: req.user.username
    }
    var newProjectData = {name: name, image: image, description: desc, video: vid, author: author};  // save form inputs to new object
    // Create a new project and save to DB
    Project.create(newProjectData)
    .then((newProject) => {
        console.log(`Name: ${newProject.name}`);
        // create a comment
        Comment.create({
            text: "This place is great",
        });
        res.redirect("/projects");
    })
    .catch((err) => {
        console.log(err);
        res.redirect("/projects");
    });
});

// NEW- show form to create new project
router.get("/new", middleware.isLoggedIn, function(req, res){
    res.render("community/new");
});

// SHOW - shows more info about one project
router.get("/:id", function(req, res){
    // find the project with provided ID
    Project.findById(req.params.id).populate("comments")
    .then((foundProject) => {
        // console.log(foundProject);
        // render show template with that project
        res.render("community/show", {project: foundProject});
    })
    .catch((err) => {
        console.log(err);
        req.flash("error", "Project not found");
        res.redirect("back");
    });
});

// EDIT PROJECT ROUTE
router.get("/:id/edit", middleware.checkProjectOwnership, function(req, res){
    //find the project with provided ID
    Project.findById(req.params.id)
    .then((foundProject) => {
        res.render("community/edit", {project: foundProject});
    })
    .catch((err) => {
        console.log(err);
    });
});

// UPDATE PROJECT ROUTE
router.put("/:id", middleware.checkProjectOwnership, function(req,res){
    // find and update the correct project
    var name = req.sanitize(req.body.project.name);
    var image = req.sanitize(req.body.project.image);
    var desc = req.sanitize(req.body.project.description);
    var video = req.sanitize(req.body.project.video);
    var vid = video.replace("watch?v=", "embed/");
    var newProject = {name: name, image: image, description: desc, video: vid};  // save form inputs to new object
    // req.body.project.body = req.sanitize(req.body.project.body);
    Project.findByIdAndUpdate(req.params.id, newProject)
    .then((updatedProject) => {
        res.redirect("/community/" + req.params.id);
    })
    .catch((err) => {
        console.log(err);
        res.redirect("/community");
    });
});

// DESTORY PROJECT ROUTE
router.delete("/:id", middleware.checkProjectOwnership, function(req, res){
    Project.findByIdAndRemove(req.params.id)
    .then(() => {
        req.flash("success", "Project deleted");
        res.redirect("/community");
    })
    .catch((err) => {
        console.log(err);
        res.redirect("/community");
    });
});

export default router;