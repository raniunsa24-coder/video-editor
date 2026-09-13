import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Link,
  useNavigate,
} from "react-router-dom";

import {
  Film,
  Home as HomeIcon,
  LayoutDashboard,
  LogIn,
  LogOut,
  UserPlus,
  ArrowRight,
  Play,
  Sparkles,
  Scissors,
  SlidersHorizontal,
  Download,
} from "lucide-react";

import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import Dashboard from "./components/dashboard/Dashboard";
import VideoEditor from "./components/dashboard/VideoEditor";

import "./App.css";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "http://localhost:5000/api";

const SERVER_URL = API_URL.replace(/\/api$/, "");


function ProtectedRoute({ children }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="navbar">
      <Link to="/" className="navbar-brand">
        <div className="brand-mark">
          <Film size={20} />
        </div>

        <span>VIDORA</span>
      </Link>

      <nav className="navbar-links">
        <Link to="/">
          <HomeIcon size={16} />
          Home
        </Link>

        {user ? (
          <>
            <Link to="/dashboard">
              <LayoutDashboard size={16} />
              Dashboard
            </Link>

            <button
              onClick={handleLogout}
              className="nav-logout"
            >
              <LogOut size={16} />
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">
              <LogIn size={16} />
              Login
            </Link>

            <Link
              to="/register"
              className="nav-register"
            >
              <UserPlus size={16} />
              Create account
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}



function Home() {
  const { user } = useAuth();

  return (
    <main className="home-page">
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles size={15} />
            Professional browser video editor
          </div>

          <h1>
            Turn your footage into
            <span> something remarkable.</span>
          </h1>

          <p>
            VIDORA gives creators a clean and powerful
            workspace to edit, enhance and export videos
            directly from the browser.
          </p>

          <div className="hero-actions">
            <Link
              to={user ? "/dashboard" : "/register"}
              className="primary-button"
            >
              {user ? "Open workspace" : "Start creating"}
              <ArrowRight size={18} />
            </Link>

            <a
              href="#features"
              className="secondary-button"
            >
              Explore features
            </a>
          </div>
        </div>

        <div className="hero-preview">
          <div className="preview-window">
            <div className="preview-topbar">
              <div className="window-dots">
                <span />
                <span />
                <span />
              </div>

              <span>VIDORA EDITOR</span>
            </div>

            <div className="preview-screen">
              <div className="preview-play">
                <Play
                  size={28}
                  fill="currentColor"
                />
              </div>
            </div>

            <div className="preview-timeline">
              <div className="timeline-line" />
              <div className="timeline-line short" />
              <div className="timeline-line tiny" />
            </div>
          </div>
        </div>
      </section>

      <section
        id="features"
        className="features-section"
      >
        <div className="section-heading centered">
          <span className="small-label">
            POWERFUL WORKSPACE
          </span>

          <h2>Everything you need to edit</h2>

          <p>
            Simple controls, professional results and a
            workflow designed for creators.
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <Scissors size={22} />
            </div>

            <h3>Precise editing</h3>

            <p>
              Trim your footage and control the important
              moments of your video.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <SlidersHorizontal size={22} />
            </div>

            <h3>Visual controls</h3>

            <p>
              Adjust brightness, contrast, saturation,
              filters and playback speed.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <Download size={22} />
            </div>

            <h3>Easy export</h3>

            <p>
              Export your edited project and save the
              resulting video to your device.
            </p>
          </div>
        </div>
      </section>

      <section className="home-cta">
        <div>
          <span className="small-label">
            YOUR NEXT PROJECT
          </span>

          <h2>Ready to create?</h2>

          <p>
            Start with a video and build your story inside
            VIDORA.
          </p>
        </div>

        <Link
          to={user ? "/dashboard" : "/register"}
          className="primary-button"
        >
          Get started
          <ArrowRight size={18} />
        </Link>
      </section>
    </main>
  );
}



function LoginPage() {
  const navigate = useNavigate();

  return (
    <Login
      onSuccess={() => navigate("/dashboard")}
      onRegister={() => navigate("/register")}
    />
  );
}


function RegisterPage() {
  const navigate = useNavigate();

  return (
    <Register
      onSuccess={() => navigate("/dashboard")}
      onLogin={() => navigate("/login")}
    />
  );
}



function DashboardPage() {
  const navigate = useNavigate();

 

  const handleUpload = async (file) => {
    try {
      const token =
        localStorage.getItem("vidora_token");

      if (!token) {
        navigate("/login");
        return;
      }

      // Create multipart form data
      const formData = new FormData();

      formData.append("video", file);

      // Upload video to backend
      const uploadResponse = await fetch(
        `${API_URL}/videos/upload`,
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${token}`,
          },

          body: formData,
        }
      );

      const uploadData =
        await uploadResponse.json();

      if (
        !uploadResponse.ok ||
        !uploadData.success
      ) {
        throw new Error(
          uploadData.message ||
            "Video upload failed"
        );
      }

      const uploadedVideoUrl =
        uploadData.video?.url;

      if (!uploadedVideoUrl) {
        throw new Error(
          "Video URL was not returned by server"
        );
      }

    

      const projectTitle =
        file.name.replace(/\.[^/.]+$/, "");

      const projectResponse = await fetch(
        `${API_URL}/projects`,
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            title: projectTitle,
            videoUrl: uploadedVideoUrl,
            duration: 0,
            edits: {
              trim: {
                start: 0,
                end: 0,
              },

              crop: "original",

              brightness: 100,
              contrast: 100,
              saturation: 100,

              speed: 1,
              volume: 100,
              rotation: 0,

              filter: "none",

              textOverlay: {
                text: "",
                position: "center",
              },
            },

            status: "draft",
          }),
        }
      );

      const projectData =
        await projectResponse.json();

      if (
        !projectResponse.ok ||
        !projectData.success
      ) {
        throw new Error(
          projectData.message ||
            "Project creation failed"
        );
      }

      

      navigate("/editor", {
        state: {
          videoUrl:
            uploadedVideoUrl.startsWith("http")
              ? uploadedVideoUrl
              : `${SERVER_URL}${uploadedVideoUrl}`,

          project: projectData.project,

          fileName: file.name,
        },
      });
    } catch (error) {
      console.error(
        "Video upload error:",
        error
      );

      alert(
        error.message ||
          "Unable to upload video"
      );
    }
  };

 
  const handleCreate = () => {
    navigate("/editor", {
      state: {
        videoUrl: "",
        project: null,
        fileName: "",
      },
    });
  };

  
  const handleOpenProject = (
    project
  ) => {
    if (!project) {
      return;
    }

    if (!project.videoUrl) {
      alert(
        "This project does not have a video."
      );

      return;
    }

    const videoUrl =
      project.videoUrl.startsWith("http")
        ? project.videoUrl
        : `${SERVER_URL}${project.videoUrl}`;

    navigate("/editor", {
      state: {
        videoUrl,

        project,

        fileName:
          project.title ||
          "Saved project.mp4",
      },
    });
  };

  return (
    <Dashboard
      onUpload={handleUpload}
      onCreate={handleCreate}
      onOpenProject={handleOpenProject}
    />
  );
}



function EditorPage() {
  const navigate = useNavigate();

  return (
    <VideoEditor
      onBack={() =>
        navigate("/dashboard")
      }
    />
  );
}



function AppRoutes() {
  return (
    <>
      <Navbar />

      <Routes>
        {/* Home */}
        <Route
          path="/"
          element={<Home />}
        />

        {/* Login */}
        <Route
          path="/login"
          element={<LoginPage />}
        />

        {/* Register */}
        <Route
          path="/register"
          element={<RegisterPage />}
        />

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Editor */}
        <Route
          path="/editor"
          element={
            <ProtectedRoute>
              <EditorPage />
            </ProtectedRoute>
          }
        />

        {/* Unknown routes */}
        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;