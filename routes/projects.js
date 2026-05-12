import { Router } from "express";
var router = Router();
import Project from "../models/project.js";
import Comment from "../models/comment.js";
import middleware from "../middleware/index.js";

// INDEX - show all projects
router.get("/", async function (req, res) {
  const projects = await Project.findAll();
  res.render("projects/index", {
    projects,
    currentUser: req.user,
    page: "projects",
  });
});

// PERSONAL PROJECT ROUTES (static pages — just render, no DB lookup needed)
router.get("/5b87762aa0333f00142fe4bf", async function (req, res) {
  const projects = await Project.findAll();
  res.render("projects/patriot", {
    project: projects,
    currentUser: req.user,
    page: "patriot",
  });
});

router.get("/5b8882fbdf46d40014db3efe", async function (req, res) {
  const projects = await Project.findAll();
  res.render("projects/ethernet", {
    project: projects,
    currentUser: req.user,
    page: "ethernet",
  });
});

router.get("/5b8b6e269fc5bb17fe4bf200", async function (req, res) {
  const projects = await Project.findAll();
  res.render("projects/keypad", {
    projects,
    currentUser: req.user,
    page: "keypad",
  });
});

router.get("/5c40f7f8f3e1bc0c5d62e713", async function (req, res) {
  const projects = await Project.findAll();
  res.render("projects/usbcontroller", {
    projects,
    currentUser: req.user,
    page: "usbcontroller",
  });
});

// CREATE - add new project to DB
router.post("/", middleware.isAdmin, async function (req, res) {
  try {
    const name = req.sanitize(req.body.name);
    const image = req.sanitize(req.body.image);
    const body = req.sanitize(req.body.body);
    const vid = req.sanitize(req.body.video);
    await Project.create({
      name,
      image,
      description: body,
      video: vid,
      authorId: req.user.id,
      authorName: req.user.username,
    });
    console.log("added a project");
    res.redirect("/projects");
  } catch (err) {
    console.log(err);
    res.redirect("/projects");
  }
});

// NEW - show form to create new project
router.get("/new", middleware.isAdmin, function (req, res) {
  res.render("projects/new");
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
    res.render("projects/show", { project: foundProject });
  } catch (err) {
    console.log(err);
    req.flash("error", "Project not found");
    res.redirect("back");
  }
});

// EDIT PROJECT ROUTE
router.get("/:id/edit", middleware.isAdmin, async function (req, res) {
  try {
    const foundProject = await Project.findByPk(req.params.id);
    res.render("projects/edit", { project: foundProject });
  } catch (err) {
    console.log(err);
    res.redirect("/projects");
  }
});

// UPDATE PROJECT ROUTE
router.put("/:id", middleware.isAdmin, async function (req, res) {
  try {
    const { name, image, description, video } = req.body.project;
    await Project.update(
      { name, image, description, video },
      { where: { id: req.params.id } },
    );
    res.redirect("/projects/" + req.params.id);
  } catch (err) {
    res.redirect("/projects");
  }
});

// DELETE PROJECT ROUTE
router.delete("/:id", middleware.isAdmin, async function (req, res) {
  try {
    await Project.destroy({ where: { id: req.params.id } });
    res.redirect("/projects");
  } catch (err) {
    res.redirect("/projects");
  }
});

export default router;
