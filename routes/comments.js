import { Router } from "express";
var router = Router({ mergeParams: true });
import Project from "../models/project.js";
import Blog from "../models/blog.js";
import Comment from "../models/comment.js";
import middleware from "../middleware/index.js";

// ============================================
// COMMENTS ROUTES
// ============================================

// Comments New
router.get("/new", middleware.isLoggedIn, async function (req, res) {
  try {
    const foundProject = await Project.findByPk(req.params.id);
    res.render("comments/new", { project: foundProject });
  } catch (err) {
    console.log(err);
    res.redirect("back");
  }
});

// Comments Create
router.post("/", middleware.isLoggedIn, async function (req, res) {
  try {
    const foundProject = await Project.findByPk(req.params.id);
    if (!foundProject) {
      req.flash("error", "Project not found");
      return res.redirect("/community");
    }
    await Comment.create({
      text: req.body.comment.text,
      authorId: req.user.id,
      authorName: req.user.username,
      projectId: foundProject.id,
    });
    req.flash("success", "Successfully added comment");
    res.redirect("/community/" + foundProject.id);
  } catch (err) {
    req.flash("error", "Something went wrong");
    console.log(err);
    res.redirect("/community");
  }
});

// COMMENT EDIT ROUTE
router.get(
  "/:comment_id/edit",
  middleware.checkCommentOwnership,
  async function (req, res) {
    try {
      const foundComment = await Comment.findByPk(req.params.comment_id);
      res.render("comments/edit", {
        project_id: req.params.id,
        comment: foundComment,
      });
    } catch (err) {
      req.flash("error", "Comment not found");
      return res.redirect("back");
    }
  },
);

// COMMENT UPDATE
router.put(
  "/:comment_id",
  middleware.checkCommentOwnership,
  async function (req, res) {
    try {
      await Comment.update(
        { text: req.body.comment.text },
        { where: { id: req.params.comment_id } },
      );
      res.redirect("/community/" + req.params.id);
    } catch (err) {
      res.redirect("back");
    }
  },
);

// COMMENT DESTROY
router.delete(
  "/:comment_id",
  middleware.checkCommentOwnership,
  async function (req, res) {
    try {
      await Comment.destroy({ where: { id: req.params.comment_id } });
      req.flash("success", "Comment deleted");
      res.redirect("/community/" + req.params.id);
    } catch (err) {
      res.redirect("back");
    }
  },
);

export default router;
