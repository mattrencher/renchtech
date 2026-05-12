import { Router } from "express";
var router = Router();
import Project from "../models/project.js";
import Comment from "../models/comment.js";
import middleware from "../middleware/index.js";

// INDEX - show all projects
router.get("/", async function (req, res) {
  const projects = await Project.findAll();
  res.render("community/index", {
    projects,
    currentUser: req.user,
    page: "community",
  });
});

// CREATE - add new project to DB
router.post("/", middleware.isLoggedIn, async function (req, res) {
  try {
    const name = req.sanitize(req.body.project.name);
    const image = req.sanitize(req.body.project.image);
    const desc = req.sanitize(req.body.project.description);
    const video = req.sanitize(req.body.project.video);
    const vid = video ? video.replace("watch?v=", "embed/") : video;
    const newProject = await Project.create({
      name,
      image,
      description: desc,
      video: vid,
      authorId: req.user.id,
      authorName: req.user.username,
    });
    console.log(`Name: ${newProject.name}`);
    res.redirect("/community");
  } catch (err) {
    console.log(err);
    res.redirect("/community");
  }
});

// NEW - show form to create new project
router.get("/new", middleware.isLoggedIn, function (req, res) {
  res.render("community/new");
});

// SHOW - shows more info about one project
router.get("/:id", async function (req, res) {
  try {
    const foundProject = await Project.findByPk(req.params.id, {
      include: [{ model: Comment, as: "comments" }],
    });
    if (!foundProject) {
      req.flash("error", "Project not found");
      return res.redirect("back");
    }
    res.render("community/show", { project: foundProject });
  } catch (err) {
    console.log(err);
    req.flash("error", "Project not found");
    res.redirect("back");
  }
});

// EDIT PROJECT ROUTE
router.get(
  "/:id/edit",
  middleware.checkProjectOwnership,
  async function (req, res) {
    try {
      const foundProject = await Project.findByPk(req.params.id);
      res.render("community/edit", { project: foundProject });
    } catch (err) {
      console.log(err);
      res.redirect("/community");
    }
  },
);

// UPDATE PROJECT ROUTE
router.put("/:id", middleware.checkProjectOwnership, async function (req, res) {
  try {
    const name = req.sanitize(req.body.project.name);
    const image = req.sanitize(req.body.project.image);
    const desc = req.sanitize(req.body.project.description);
    const video = req.sanitize(req.body.project.video);
    const vid = video ? video.replace("watch?v=", "embed/") : video;
    await Project.update(
      { name, image, description: desc, video: vid },
      { where: { id: req.params.id } },
    );
    res.redirect("/community/" + req.params.id);
  } catch (err) {
    console.log(err);
    res.redirect("/community");
  }
});

// DELETE PROJECT ROUTE
router.delete(
  "/:id",
  middleware.checkProjectOwnership,
  async function (req, res) {
    try {
      await Project.destroy({ where: { id: req.params.id } });
      req.flash("success", "Project deleted");
      res.redirect("/community");
    } catch (err) {
      console.log(err);
      res.redirect("/community");
    }
  },
);

export default router;
