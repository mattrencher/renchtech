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

async function deleteAndSeed(){
  const result = await Project.deleteMany({});
  console.log(result);

  data.forEach(function(seed){
    const proj = Project.create(seed)
    .then(function(project){
      console.log("added a project");
      // create a comment
      Comment.create({
        text: "This place is great",
      });
    });
  });
}


module.exports = deleteAndSeed;