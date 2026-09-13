const path = require("path");
const fs = require("fs");

const express = require("express");
const Project = require("../models/Project");
const protect = require("../middleware/authMiddleware");

const router = express.Router();


router.post("/", protect, async (req, res) => {
  try {
    const {
      title,
      videoUrl,
      thumbnailUrl,
      duration,
      edits,
      status,
    } = req.body || {};

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Project title is required",
      });
    }

    const project = await Project.create({
      user: req.user.id,
      title: title.trim(),
      videoUrl: videoUrl || "",
      thumbnailUrl: thumbnailUrl || "",
      duration: Number(duration) || 0,
      edits: edits || {},
      status: status || "draft",
    });

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      project,
    });
  } catch (error) {
    console.error("CREATE PROJECT ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
});


router.get("/", protect, async (req, res) => {
  try {
    const projects = await Project.find({
      user: req.user.id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      projects,
    });
  } catch (error) {
    console.error("GET PROJECTS ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
});


router.get("/:id", protect, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    res.status(200).json({
      success: true,
      project,
    });
  } catch (error) {
    console.error("GET SINGLE PROJECT ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
});


router.put("/:id", protect, async (req, res) => {
  try {
    const {
      title,
      videoUrl,
      thumbnailUrl,
      duration,
      edits,
      status,
    } = req.body || {};

    const project = await Project.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    if (title !== undefined) {
      project.title = String(title).trim();
    }

    if (videoUrl !== undefined) {
      project.videoUrl = String(videoUrl);
    }

    if (thumbnailUrl !== undefined) {
      project.thumbnailUrl = String(thumbnailUrl);
    }

    if (duration !== undefined) {
      project.duration = Number(duration) || 0;
    }

    if (edits !== undefined) {
      project.edits = edits;
    }

    if (status !== undefined) {
      project.status = status;
    }

    await project.save();

    res.status(200).json({
      success: true,
      message: "Project updated successfully",
      project,
    });
  } catch (error) {
    console.error("UPDATE PROJECT ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
});


router.delete("/:id", protect, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

  
    await Project.deleteOne({
      _id: project._id,
    });

    
    if (project.videoUrl) {
      const filename = path.basename(project.videoUrl);

      const videoPath = path.join(
        __dirname,
        "..",
        "uploads",
        filename
      );

      if (fs.existsSync(videoPath)) {
        fs.unlinkSync(videoPath);
        console.log("Video file deleted:", filename);
      }
    }

    res.status(200).json({
      success: true,
      message: "Project and video deleted successfully",
    });
  } catch (error) {
    console.error("DELETE PROJECT ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
});

module.exports = router;