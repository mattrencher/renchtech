var express = require("express");
var router = express.Router();
var Project = require("../models/project");
var middleware = require("../middleware");

// // INDEX - show all projects
router.get("/", function(req, res){
    // Get all projects from DB
    
    Project.find({})
    .then(documents => {
        // Do something with the found documents
        res.render("projects/index",{projects:documents, currentUser: req.user, page: 'projects'});
        console.log(documents);
    })
    .catch(err => {
        // Handle errors
        console.error(err);
    });

});

// PERSONAL PROJECT ROUTES
// The Automated Patriot
router.get("/5b87762aa0333f00142fe4bf", function(req, res){
    // Get all projects from DB
    Project.find({}, function(err, foundProject){
        if(err){
            console.log(err);
        } else {
            res.render("projects/patriot",{project:foundProject, currentUser: req.user, page: 'patriot'});
        }
    });
});

// Recycling Ethernet Cables
router.get("/5b8882fbdf46d40014db3efe", function(req, res) {
    // Get all projects from DB
    Project.find({}, function(err, foundProject){
        if(err){
            console.log(err);
        } else {
            res.render("projects/ethernet",{project:foundProject, currentUser: req.user, page: 'ethernet'});
        }
    });
});

// Keypad
router.get("/5b8b6e269fc5bb17fe4bf200", function(req, res) {
    // Get all projects from DB
    Project.find({}, function(err, allProjects){
        if(err){
            console.log(err);
        } else {
            res.render("projects/keypad",{projects:allProjects, currentUser: req.user, page: 'keypad'});
        }
    });
});

// USB Controller
router.get("/5c40f7f8f3e1bc0c5d62e713", function(req, res) {
    // Get all projects from DB
    Project.find({}, function(err, allProjects){
        if(err){
            console.log(err);
        } else {
            res.render("projects/usbcontroller",{projects:allProjects, currentUser: req.user, page: 'usbcontroller'});
        }
    });
});

// CREATE - add new project to DB
router.post("/", middleware.isAdmin, function(req, res){
    var name = req.body.name;
    var image = req.body.image;
    var body = req.body.body;
    var vid = req.body.video;
    var author ={
        id: req.user._id,
        username: req.user.username
    }
    var newProject = {name: name, image: image, body: body, video: vid, author: author};  // save form inputs to new object
    // Create a new project and save to DB
    var cleanProject = req.sanitize(newProject);
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
router.get("/new", middleware.isAdmin, function(req, res){
    res.render("projects/new");
});

// SHOW - shows more info about one project
// router.get("/:id", function(req, res){
//     // find the project with provided ID
//     Project.findById(req.params.id).populate("comments").exec(function(err, foundProject){
//         if(err || !foundProject){
//             console.log(err);
//             req.flash("error", "Project not found");
//             res.redirect("back");
//         } else {
//             //console.log(foundProject);
//             // render show template with that project
//             res.render("projects/show", {project: foundProject});
//         }
//     });
//     // render show template with that project
//     // res.send("This will be the show page one day...")
//     // res.render("show");
// });

// EDIT PROJECT ROUTE
router.get("/:id/edit", middleware.isAdmin, function(req, res){
    //find the project with provided ID
    Project.findById(req.params.id, function(err, foundProject){
        if(err){
            console.log(err);
        } else {
            //render show template with that project
            res.render("projects/edit", {project: foundProject});
        }
    });
});

// UPDATE PROJECT ROUTE
router.put("/:id", middleware.isAdmin, function(req,res){
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
router.delete("/:id", middleware.isAdmin, function(req, res){
    Project.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/projects");
        } else {
            res.redirect("/projects");
        }
    });
});

module.exports = router;