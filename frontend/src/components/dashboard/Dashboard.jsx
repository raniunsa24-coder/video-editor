import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Upload,
  Film,
  Plus,
  ArrowRight,
  Clock3,
  FolderOpen,
  Sparkles,
  Video,
  Edit3,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

const API_URL = "http://localhost:5000/api";

const Dashboard = ({
  onUpload,
  onCreate,
  onOpenProject,
}) => {
  const { user } = useAuth();

  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem("vidora_token");

        if (!token) {
          setProjects([]);
          return;
        }

        const response = await fetch(`${API_URL}/projects`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setProjects(data.projects || []);
        } else {
          console.error(
            "Failed to load projects:",
            data.message
          );
        }
      } catch (error) {
        console.error("Get projects error:", error);
      } finally {
        setLoadingProjects(false);
      }
    };

    fetchProjects();
  }, []);

  const formatDate = (date) => {
    if (!date) {
      return "Recently created";
    }

    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <motion.main
      className="dashboard-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <section className="dashboard-header">
        <div>
          <span className="small-label">
            CREATIVE WORKSPACE
          </span>

          <h1>
            Welcome back,{" "}
            <span>
              {user?.name
                ? user.name.split(" ")[0]
                : "Creator"}
            </span>
          </h1>

          <p>
            Turn your ideas into polished videos with your
            VIDORA workspace.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={onCreate}
        >
          <Plus size={18} />
          New project
        </button>
      </section>

      <section className="dashboard-grid">
        <motion.div
          className="upload-card"
          whileHover={{ y: -5 }}
          transition={{ duration: 0.25 }}
        >
          <div className="upload-card-glow" />

          <div className="upload-icon">
            <Upload size={27} />
          </div>

          <span className="upload-label">
            START EDITING
          </span>

          <h2>Upload a video</h2>

          <p>
            Choose a video from your device and open it directly
            inside the VIDORA editor.
          </p>

          <label className="primary-button upload-button">
            <Upload size={17} />
            Upload video

            <input
              type="file"
              accept="video/*"
              hidden
              onChange={(e) => {
                const selectedFile = e.target.files?.[0];

                if (selectedFile) {
                  onUpload(selectedFile);
                }

                e.target.value = "";
              }}
            />
          </label>
        </motion.div>

        <motion.div
          className="stats-card"
          whileHover={{ y: -5 }}
          transition={{ duration: 0.25 }}
        >
          <div className="stat-icon">
            <Film size={21} />
          </div>

          <span className="stat-label">
            YOUR PROJECTS
          </span>

          <strong>
            {loadingProjects ? "..." : projects.length}
          </strong>

          <small>
            <Clock3 size={14} />
            Projects in your workspace
          </small>
        </motion.div>

        <motion.div
          className="mini-card"
          whileHover={{ y: -5 }}
        >
          <div className="mini-card-icon">
            <Video size={20} />
          </div>

          <div>
            <strong>Browser editing</strong>
            <p>
              Edit without leaving your workspace.
            </p>
          </div>
        </motion.div>

        <motion.div
          className="mini-card"
          whileHover={{ y: -5 }}
        >
          <div className="mini-card-icon">
            <Edit3 size={20} />
          </div>

          <div>
            <strong>Creative controls</strong>
            <p>
              Adjust your video with simple controls.
            </p>
          </div>
        </motion.div>
      </section>

      <section className="projects-section">
        <div className="section-heading">
          <div>
            <span className="small-label">
              RECENT WORK
            </span>

            <h2>Your projects</h2>
          </div>

          <button
            className="text-button"
            onClick={() => {
              window.scrollTo({
                top: document.body.scrollHeight,
                behavior: "smooth",
              });
            }}
          >
            View all
            <ArrowRight size={16} />
          </button>
        </div>

        <div className="projects-grid">
          {loadingProjects ? (
            <motion.div
              className="project-card"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="project-thumbnail">
                <div className="project-grid-lines" />

                <div className="project-play">
                  <Film size={21} />
                </div>
              </div>

              <div className="project-info">
                <div>
                  <h3>Loading projects...</h3>
                  <span>VIDORA workspace</span>
                </div>

                <FolderOpen size={18} />
              </div>

              <p>Please wait</p>
            </motion.div>
          ) : projects.length === 0 ? (
            <motion.div
              className="project-card"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="project-thumbnail">
                <div className="project-grid-lines" />

                <div className="project-play">
                  <Plus size={21} />
                </div>
              </div>

              <div className="project-info">
                <div>
                  <h3>No projects yet</h3>
                  <span>
                    Start your first project
                  </span>
                </div>

                <FolderOpen size={18} />
              </div>

              <p>
                Create a new video project to get started.
              </p>
            </motion.div>
          ) : (
            projects.map((project, index) => (
              <motion.div
                className="project-card"
                key={project._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: index * 0.1,
                }}
                whileHover={{
                  y: -5,
                }}
                onClick={() => onOpenProject(project)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    onOpenProject(project);
                  }
                }}
              >
                <div className="project-thumbnail">
                  <div className="project-grid-lines" />

                  <div className="project-play">
                    <Film size={21} />
                  </div>
                </div>

                <div className="project-info">
                  <div>
                    <h3>{project.title}</h3>

                    <span>
                      {project.status === "completed"
                        ? "Completed"
                        : "Video project"}
                    </span>
                  </div>

                  <FolderOpen size={18} />
                </div>

                <p>
                  {formatDate(project.updatedAt || project.createdAt)}
                </p>
              </motion.div>
            ))
          )}
        </div>
      </section>

      <section className="dashboard-tip">
        <Sparkles size={18} />

        <div>
          <strong>Creative tip</strong>

          <p>
            Keep your edits clean and use subtle adjustments
            for a polished final result.
          </p>
        </div>
      </section>
    </motion.main>
  );
};

export default Dashboard;