const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const protect = require("../middleware/authMiddleware");

const router = express.Router();


const uploadDir = path.join(__dirname, "..", "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, {
    recursive: true,
  });
}



const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const extension = path
      .extname(file.originalname)
      .toLowerCase();

    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${extension}`;

    cb(null, uniqueName);
  },
});



const fileFilter = (req, file, cb) => {
  const allowedExtensions = [
    ".mp4",
    ".mov",
    ".avi",
    ".mkv",
    ".webm",
    ".m4v",
  ];

  const extension = path
    .extname(file.originalname)
    .toLowerCase();

  const isVideo =
    file.mimetype.startsWith("video/") ||
    allowedExtensions.includes(extension);

  if (isVideo) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only video files are allowed"
      ),
      false
    );
  }
};



const upload = multer({
  storage,
  fileFilter,

  limits: {
    fileSize: 100 * 1024 * 1024, // 100 MB
  },
});



const deleteOldVideo = (oldVideoUrl) => {
  try {
    if (!oldVideoUrl) {
      return;
    }


    const filename = path.basename(
      oldVideoUrl
    );

  
    if (!filename || filename === ".") {
      return;
    }

    const oldVideoPath = path.join(
      uploadDir,
      filename
    );

    if (fs.existsSync(oldVideoPath)) {
      fs.unlinkSync(oldVideoPath);

      console.log(
        "Old video deleted:",
        filename
      );
    }
  } catch (error) {
    console.error(
      "Old video deletion error:",
      error.message
    );
  }
};



router.post(
  "/upload",
  protect,
  upload.single("video"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Please upload a video file",
        });
      }

     
      const oldVideoUrl =
        req.body?.oldVideoUrl || "";

      
      if (oldVideoUrl) {
        deleteOldVideo(oldVideoUrl);
      }

      const videoUrl = `/uploads/${req.file.filename}`;

      return res.status(201).json({
        success: true,
        message: "Video uploaded successfully",

        video: {
          filename: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype,
          url: videoUrl,
        },
      });
    } catch (error) {
      console.error(
        "Video upload error:",
        error.message
      );

      // If something goes wrong after file upload,
      // remove the newly uploaded file.
      if (req.file?.path) {
        try {
          if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
          }
        } catch (cleanupError) {
          console.error(
            "Uploaded file cleanup error:",
            cleanupError.message
          );
        }
      }

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Video upload failed",
      });
    }
  }
);


router.delete(
  "/:filename",
  protect,
  (req, res) => {
    try {
      const filename = path.basename(
        req.params.filename
      );

      if (!filename) {
        return res.status(400).json({
          success: false,
          message: "Invalid filename",
        });
      }

      const videoPath = path.join(
        uploadDir,
        filename
      );

      if (!fs.existsSync(videoPath)) {
        return res.status(404).json({
          success: false,
          message: "Video file not found",
        });
      }

      fs.unlinkSync(videoPath);

      return res.status(200).json({
        success: true,
        message: "Video deleted successfully",
      });
    } catch (error) {
      console.error(
        "Delete video error:",
        error.message
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Video deletion failed",
      });
    }
  }
);



router.use(
  (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    next();
  }
);

module.exports = router;