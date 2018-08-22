var express = require("express");
var router = express.Router();
var Project = require("../models/project");
var middleware = require("../middleware");

// // INDEX - show all projects
router.get("/", function(req, res){
    // Get all projects from DB
    Project.find({}, function(err, allProjects){
        if(err){
            console.log(err);
        } else {
            res.render("projects/index",{projects:allProjects, currentUser: req.user, page: 'projects'});
        }
    });
});

// CREATE - add new project to DB
router.post("/", middleware.isLoggedIn, function(req, res){
    // res.send("You hit the post route")
    // get data from form and add to projects array
    var name = req.body.name;
    var image = req.body.image;
    var desc = req.body.description;
    var vid = req.body.video;
    var author ={
        id: req.user._id,
        username: req.user.username
    }
    var newProject = {name: name, image: image, description: desc, video: vid, author: author};  // save form inputs to new object
    // Create a new project and save to DB
    Project.create(newProject, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            console.log(newlyCreated);
            // redirect back to projects page
            res.redirect("/projects");
        }
    });
});

// NEW- show form to create new project
router.get("/new", middleware.isLoggedIn, function(req, res){
    res.render("projects/new");
});

// SHOW - shows more info about one project
router.get("/:id", function(req, res){
    // find the project with provided ID
    Project.findById(req.params.id).populate("comments").exec(function(err, foundProject){
        if(err || !foundProject){
            console.log(err);
            req.flash("error", "Project not found");
            res.redirect("back");
        } else {
            console.log(foundProject);
            // render show template with that project
            res.render("projects/show", {project: foundProject});
        }
    });
    // render show template with that project
    // res.send("This will be the show page one day...")
    // res.render("show");
});

// EDIT PROJECT ROUTE
router.get("/:id/edit", middleware.checkProjectOwnership, function(req, res) {
    Project.findById(req.params.id, function(err, foundProject){
        res.render("projects/edit", {project: foundProject});
    });

});


// UPDATE PROJECT ROUTE
router.put("/:id", middleware.checkProjectOwnership, function(req,res){
    // find and update the correct project
    Project.findByIdAndUpdate(req.params.id, req.body.project, function(err, updatedProject){
        if(err){
            res.redirect("/projects");
        } else {
            res.redirect("/projects/" + req.params.id);
        }
    });
    // redirect somewhere (show page)
});

// DESTORY PROJECT ROUTE
router.delete("/:id", middleware.checkProjectOwnership, function(req, res){
    Project.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/projects");
        } else {
            res.redirect("/projects");
        }
    });
});

module.exports = router;