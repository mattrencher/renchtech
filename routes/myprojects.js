var express = require("express");
var router = express.Router();
var Blog = require("../models/blog");
var middleware = require("../middleware");

// // INDEX - show all projects
router.get("/", function(req, res){
    // Get all projects from DB
    Blog.find({}, function(err, allProjects){
        if(err){
            console.log(err);
        } else {
            res.render("myprojects/index",{projects:allProjects, currentUser: req.user, page: 'myprojects'});
        }
    });
});

// The Automated Patriot
router.get("/5b87762aa0333f00142fe4bf", function(req, res){
    res.render("myprojects/patriot");
});

// Recycling Ethernet Cables
router.get("/5b8882fbdf46d40014db3efe", function(req, res) {
  res.render("myprojects/ethernet"); 
});

// Keypad
router.get("/5b8882fbdf46d40014db3efe", function(req, res) {
  res.render("myprojects/keypad"); 
});

// CREATE - add new project to DB
router.post("/", middleware.isAdmin, function(req, res){
    // res.send("You hit the post route")
    // get data from form and add to projects array
    var title = req.body.title;
    var image = req.body.image;
    var body = req.body.body;
    var vid = req.body.video;
    var author ={
        id: req.user._id,
        username: req.user.username
    }
    var newProject = {title: title, image: image, body: body, video: vid, author: author};  // save form inputs to new object
    // Create a new project and save to DB
    Blog.create(newProject, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            console.log(newlyCreated);
            // redirect back to projects page
            res.redirect("/myprojects");
        }
    });
});

// NEW- show form to create new project
router.get("/new", middleware.isAdmin, function(req, res){
    res.render("myprojects/new");
});

// SHOW - shows more info about one project
// router.get("/:id", function(req, res){
//     // find the project with provided ID
//     Blog.findById(req.params.id).populate("comments").exec(function(err, foundProject){
//         if(err || !foundProject){
//             console.log(err);
//             req.flash("error", "Project not found");
//             res.redirect("back");
//         } else {
//             //console.log(foundProject);
//             // render show template with that project
//             res.render("myprojects/show", {project: foundProject});
//         }
//     });
//     // render show template with that project
//     // res.send("This will be the show page one day...")
//     // res.render("show");
// });

// EDIT PROJECT ROUTE
router.get("/:id/edit", middleware.isAdmin, function(req, res){
    //find the project with provided ID
    Blog.findById(req.params.id, function(err, foundProject){
        if(err){
            console.log(err);
        } else {
            //render show template with that project
            res.render("myprojects/edit", {project: foundProject});
        }
    });
});

// UPDATE PROJECT ROUTE
router.put("/:id", middleware.isAdmin, function(req,res){
    // find and update the correct project
    Blog.findByIdAndUpdate(req.params.id, req.body.project, function(err, updatedProject){
        if(err){
            res.redirect("/myprojects");
        } else {
            res.redirect("/myprojects/" + req.params.id);
        }
    });
    // redirect somewhere (show page)
});

// DESTORY PROJECT ROUTE
router.delete("/:id", middleware.isAdmin, function(req, res){
    Blog.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/myprojects");
        } else {
            res.redirect("/myprojects");
        }
    });
});

module.exports = router;