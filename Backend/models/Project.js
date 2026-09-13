const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    videoUrl: {
      type: String,
      default: "",
    },

    thumbnailUrl: {
      type: String,
      default: "",
    },

    duration: {
      type: Number,
      default: 0,
    },

    edits: {
      trim: {
        start: {
          type: Number,
          default: 0,
        },
        end: {
          type: Number,
          default: 0,
        },
      },

      crop: {
        type: String,
        enum: ["original", "landscape", "square", "portrait"],
        default: "original",
      },

      brightness: {
        type: Number,
        default: 100,
      },

      contrast: {
        type: Number,
        default: 100,
      },

      saturation: {
        type: Number,
        default: 100,
      },

      speed: {
        type: Number,
        default: 1,
      },

      volume: {
        type: Number,
        default: 100,
      },

      rotation: {
        type: Number,
        default: 0,
      },

      filter: {
        type: String,
        enum: ["none", "cinematic", "vivid", "mono", "warm"],
        default: "none",
      },

      textOverlay: {
        text: {
          type: String,
          default: "",
          maxlength: 80,
        },

        position: {
          type: String,
          enum: ["top", "center", "bottom"],
          default: "center",
        },
      },
    },

    status: {
      type: String,
      enum: ["draft", "completed"],
      default: "draft",
    },
  },
  {
    timestamps: true,
  }
);

const Project = mongoose.model("Project", projectSchema);

module.exports = Project;