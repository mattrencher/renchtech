var express = require("express");
var router = express.Router();
// var Project = require("../models/project");
var middleware = require("../middleware");

// // INDEX - show all projects
router.get("/", function(req, res){
    res.render("myprojects/index",{currentUser: req.user, page: 'myprojects'});
});


module.exports = router;