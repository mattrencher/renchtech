var mongoose = require("mongoose");
var Project = require("./models/project");
var Comment   = require("./models/comment");

var data = [
  {
    name: "CLouds Rest",
    image: "https://farm5.staticflickr.com/4063/4349546568_d506b3b872.jpg",
    description: "asdfklajhsdflajkshdflkhj"
  },
  {
    name: "Hallow's End",
    image: "https://farm9.staticflickr.com/8471/8137270056_21d5be6f52.jpg",
    description: "asdfklajhsdflajkshdflkhj"
  },
  {
    name: "Death's Travels",
    image: "https://farm5.staticflickr.com/4150/5051605295_2e053f3a1c.jpg",
    description: "asdfklajhsdflajkshdflkhj"
  }
]

function seedDB(){
  // Remove all projects
  Project.remove({}, function(err){
    if(err){
      console.log(err);
    }
    console.log("removed projects");
    // Add a few projects
    data.forEach(function(seed){
      Project.create(seed, function(err, project){
        if(err){
          console.log(err)
        } else {
          console.log("added a project");
          // create a comment
          Comment.create({
            text: "This place is great",
            author: "Homer"
          }, function(err, comment){
            if(err){
              console.log(err);
            } else {
              project.comments.push(comment);
              project.save();
              console.log("Created new comment");
            }
            
          });
        }
      });
    });
  });
  
  // Add a few comments

}

module.exports = seedDB;