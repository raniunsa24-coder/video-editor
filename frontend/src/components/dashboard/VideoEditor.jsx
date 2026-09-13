import React, {
  useEffect,
  useRef,
  useState,
} from "react";
import { useLocation } from "react-router-dom";

import {
  ArrowLeft,
  Upload,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Undo2,
  Redo2,
  Download,
  Scissors,
  SlidersHorizontal,
  Crop,
  Sun,
  Contrast,
  Palette,
  Gauge,
  Volume2,
  Type,
  Rotate3d,
  X,
  Check,
} from "lucide-react";

const DEFAULT_FILTERS = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  speed: 1,
  volume: 100,
  rotation: 0,
  filter: "none",
};

const FILTER_OPTIONS = [
  {
    id: "none",
    name: "Original",
    filter: "none",
  },
  {
    id: "cinematic",
    name: "Cinematic",
    filter:
      "contrast(1.15) saturate(0.85) brightness(0.95)",
  },
  {
    id: "vivid",
    name: "Vivid",
    filter:
      "contrast(1.1) saturate(1.35) brightness(1.04)",
  },
  {
    id: "mono",
    name: "Mono",
    filter: "grayscale(1) contrast(1.08)",
  },
  {
    id: "warm",
    name: "Warm",
    filter:
      "sepia(0.18) saturate(1.15) brightness(1.03)",
  },
];

const VideoEditor = ({ onBack }) => {
  const location = useLocation();
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  const [file, setFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [project, setProject] = useState(() => location.state?.project || null);
  const [backendVideo, setBackendVideo] = useState(() => location.state?.videoUrl || "");
  const [isPlaying, setIsPlaying] = useState(false);

  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);

  const [activeTool, setActiveTool] = useState("adjust");

  const [brightness, setBrightness] = useState(
    DEFAULT_FILTERS.brightness
  );

  const [contrast, setContrast] = useState(
    DEFAULT_FILTERS.contrast
  );

  const [saturation, setSaturation] = useState(
    DEFAULT_FILTERS.saturation
  );

  const [speed, setSpeed] = useState(
    DEFAULT_FILTERS.speed
  );

  const [volume, setVolume] = useState(
    DEFAULT_FILTERS.volume
  );

  const [rotation, setRotation] = useState(
    DEFAULT_FILTERS.rotation
  );

  const [filter, setFilter] = useState(
    DEFAULT_FILTERS.filter
  );

  const [crop, setCrop] = useState("original");

  const [overlayText, setOverlayText] = useState("");
  const [textPosition, setTextPosition] = useState("center");

  const [history, setHistory] = useState([]);
  const [future, setFuture] = useState([]);

  const [exporting, setExporting] = useState(false);
  const [message, setMessage] = useState("");

  const createSnapshot = () => ({
    brightness,
    contrast,
    saturation,
    speed,
    volume,
    rotation,
    filter,
    crop,
    overlayText,
    textPosition,
    trimStart,
    trimEnd,
  });

  const applySnapshot = (snapshot) => {
    if (!snapshot) return;

    setBrightness(snapshot.brightness);
    setContrast(snapshot.contrast);
    setSaturation(snapshot.saturation);
    setSpeed(snapshot.speed);
    setVolume(snapshot.volume);
    setRotation(snapshot.rotation);
    setFilter(snapshot.filter);
    setCrop(snapshot.crop);
    setOverlayText(snapshot.overlayText);
    setTextPosition(snapshot.textPosition);
    setTrimStart(snapshot.trimStart);
    setTrimEnd(snapshot.trimEnd);
  };

  const saveHistory = () => {
    setHistory((previous) => [
      ...previous.slice(-19),
      createSnapshot(),
    ]);

    setFuture([]);
  };

  const undo = () => {
    if (history.length === 0) return;

    const previousState = history[history.length - 1];

    setFuture((items) => [
      createSnapshot(),
      ...items.slice(0, 19),
    ]);

    setHistory((items) => items.slice(0, -1));

    applySnapshot(previousState);
  };

  const redo = () => {
    if (future.length === 0) return;

    const nextState = future[0];

    setHistory((items) => [
      ...items.slice(-19),
      createSnapshot(),
    ]);

    setFuture((items) => items.slice(1));

    applySnapshot(nextState);
  };

  const resetEditor = () => {
    saveHistory();

    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setSpeed(1);
    setVolume(100);
    setRotation(0);
    setFilter("none");
    setCrop("original");
    setOverlayText("");
    setTextPosition("center");

    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
  };

  useEffect(() => {
    const incomingVideoUrl = location.state?.videoUrl || "";
    const incomingProject = location.state?.project || null;
    const incomingFileName =
      location.state?.fileName ||
      incomingProject?.title ||
      "Uploaded video.mp4";

    setProject(incomingProject);
    setBackendVideo(incomingVideoUrl);

    if (incomingVideoUrl) {
      setFile({
        name: incomingFileName,
        type: "video/mp4",
      });
      setVideoUrl(incomingVideoUrl);

      const savedEdits = incomingProject?.edits;

      if (savedEdits) {
        setBrightness(savedEdits.brightness ?? DEFAULT_FILTERS.brightness);
        setContrast(savedEdits.contrast ?? DEFAULT_FILTERS.contrast);
        setSaturation(savedEdits.saturation ?? DEFAULT_FILTERS.saturation);
        setSpeed(savedEdits.speed ?? DEFAULT_FILTERS.speed);
        setVolume(savedEdits.volume ?? DEFAULT_FILTERS.volume);
        setRotation(savedEdits.rotation ?? DEFAULT_FILTERS.rotation);
        setFilter(savedEdits.filter ?? DEFAULT_FILTERS.filter);
        setCrop(savedEdits.crop ?? "original");
        setOverlayText(savedEdits.textOverlay?.text ?? "");
        setTextPosition(savedEdits.textOverlay?.position ?? "center");
        setTrimStart(savedEdits.trim?.start ?? 0);
        setTrimEnd(savedEdits.trim?.end ?? 0);
      }
    }
  }, [location.state]);

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("video/")) {
      setMessage("Please select a valid video file.");
      return;
    }

    setMessage("");
    setBackendVideo("");
    setFile(selectedFile);
    setCurrentTime(0);
    setDuration(0);
    setTrimStart(0);
    setTrimEnd(0);
    setHistory([]);
    setFuture([]);
  };

  useEffect(() => {
    // Backend video takes priority when the editor was opened from the dashboard.
    if (backendVideo) {
      setVideoUrl(backendVideo);
      return undefined;
    }

    if (!file) {
      setVideoUrl("");
      return undefined;
    }

    const url = URL.createObjectURL(file);

    setVideoUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file, backendVideo]);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) return undefined;

    const handleLoaded = () => {
      const videoDuration = Number.isFinite(video.duration)
        ? video.duration
        : 0;

      setDuration(videoDuration);
      setTrimEnd(videoDuration);
      video.playbackRate = speed;
      video.volume = volume / 100;
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);

      if (
        trimEnd > 0 &&
        video.currentTime >= trimEnd
      ) {
        video.pause();
        video.currentTime = trimStart;
        setIsPlaying(false);
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener("loadedmetadata", handleLoaded);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);

    return () => {
      video.removeEventListener(
        "loadedmetadata",
        handleLoaded
      );
      video.removeEventListener(
        "timeupdate",
        handleTimeUpdate
      );
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
    };
  }, [trimStart, trimEnd, speed, volume]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  }, [speed]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume / 100;
    }
  }, [volume]);

  const togglePlay = async () => {
    const video = videoRef.current;

    if (!video || !file) return;

    try {
      if (video.paused) {
        if (
          trimEnd > 0 &&
          video.currentTime >= trimEnd
        ) {
          video.currentTime = trimStart;
        }

        await video.play();
      } else {
        video.pause();
      }
    } catch {
      setMessage("The video could not be played.");
    }
  };

  const seekVideo = (value) => {
    const time = Number(value);

    setCurrentTime(time);

    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const formatTime = (seconds) => {
    if (!Number.isFinite(seconds)) {
      return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  };

  const handleTrimStart = (value) => {
    const next = Math.min(
      Number(value),
      Math.max(0, trimEnd - 0.1)
    );

    setTrimStart(next);

    if (
      videoRef.current &&
      videoRef.current.currentTime < next
    ) {
      videoRef.current.currentTime = next;
    }
  };

  const handleTrimEnd = (value) => {
    const next = Math.max(
      Number(value),
      Math.min(duration, trimStart + 0.1)
    );

    setTrimEnd(next);

    if (
      videoRef.current &&
      videoRef.current.currentTime > next
    ) {
      videoRef.current.currentTime = next;
    }
  };

  const buildVideoFilter = () => {
    const selected = FILTER_OPTIONS.find(
      (item) => item.id === filter
    );

    const customFilter = `
      brightness(${brightness}%)
      contrast(${contrast}%)
      saturate(${saturation}%)
    `;

    return `${customFilter} ${
      selected?.filter || "none"
    }`;
  };

  const previewStyle = {
    filter: buildVideoFilter(),
    transform: `rotate(${rotation}deg)`,
  };

  const changeRotation = (amount) => {
    saveHistory();

    setRotation((current) => {
      let next = current + amount;

      if (next >= 360) next = 0;
      if (next < 0) next = 270;

      return next;
    });
  };

  const saveProject = async () => {
    try {
      const token = localStorage.getItem("vidora_token");

      if (!token) {
        setMessage("Please login again.");
        return;
      }

      if (!videoUrl) {
        setMessage("Please upload a video first.");
        return;
      }

      const cleanVideoUrl = videoUrl.startsWith("http")
        ? videoUrl.replace("http://localhost:5000", "")
        : videoUrl;

      const edits = {
        trim: {
          start: trimStart,
          end: trimEnd,
        },
        crop,
        brightness,
        contrast,
        saturation,
        speed,
        volume,
        rotation,
        filter,
        textOverlay: {
          text: overlayText,
          position: textPosition,
        },
      };

      const payload = {
        title: file?.name?.replace(/\.[^/.]+$/, "") || "Untitled Project",
        videoUrl: cleanVideoUrl,
        duration,
        edits,
        status: "draft",
      };

      let response;

      if (project?._id) {
        response = await fetch(
          `http://localhost:5000/api/projects/${project._id}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );
      } else {
        response = await fetch(
          "http://localhost:5000/api/projects",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Project could not be saved");
      }

      if (data.project) {
        setProject(data.project);
      }

      setMessage("Project saved successfully.");
    } catch (error) {
      console.error("Save project error:", error);
      setMessage(error.message || "Unable to save project.");
    }
  };

  const exportVideo = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || !file) {
      setMessage("Please upload a video first.");
      return;
    }

    if (
      typeof canvas.captureStream !== "function" ||
      typeof MediaRecorder === "undefined"
    ) {
      setMessage(
        "Video export is not supported by this browser. Please try Chrome or Edge."
      );
      return;
    }

    setExporting(true);
    setMessage("");

    try {
      const width =
        crop === "square" ? 720 : 1280;

      const height =
        crop === "portrait" ? 1280 : 720;

      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("Canvas is unavailable.");
      }

      const stream = canvas.captureStream(30);

      const mimeTypes = [
        "video/webm;codecs=vp9",
        "video/webm;codecs=vp8",
        "video/webm",
      ];

      const supportedType = mimeTypes.find((type) =>
        MediaRecorder.isTypeSupported(type)
      );

      const recorder = supportedType
        ? new MediaRecorder(stream, {
            mimeType: supportedType,
          })
        : new MediaRecorder(stream);

      const chunks = [];

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      const exportPromise = new Promise(
        (resolve, reject) => {
          recorder.onstop = resolve;
          recorder.onerror = reject;
        }
      );

      const originalTime = video.currentTime;
      const originalRate = video.playbackRate;
      const originalMuted = video.muted;

      video.pause();
      video.muted = false;
      video.playbackRate = 1;

      video.currentTime = trimStart;

      await new Promise((resolve) => {
        const handler = () => {
          video.removeEventListener(
            "seeked",
            handler
          );
          resolve();
        };

        video.addEventListener("seeked", handler);
      });

      recorder.start();

      const startTime = performance.now();
      const endTime =
        trimEnd > trimStart
          ? trimEnd
          : duration;

      const drawFrame = () => {
        if (!recorder || recorder.state !== "recording") {
          return;
        }

        const elapsed =
          (performance.now() - startTime) / 1000;

        const targetTime =
          trimStart + elapsed * speed;

        if (targetTime >= endTime) {
          recorder.stop();
          return;
        }

        video.currentTime = Math.min(
          targetTime,
          endTime
        );

        const videoWidth =
          video.videoWidth || 1280;

        const videoHeight =
          video.videoHeight || 720;

        context.save();

        context.clearRect(
          0,
          0,
          canvas.width,
          canvas.height
        );

        context.translate(
          canvas.width / 2,
          canvas.height / 2
        );

        context.rotate(
          (rotation * Math.PI) / 180
        );

        const scale = Math.max(
          canvas.width / videoWidth,
          canvas.height / videoHeight
        );

        const drawWidth =
          videoWidth * scale;

        const drawHeight =
          videoHeight * scale;

        context.filter = buildVideoFilter();

        context.drawImage(
          video,
          -drawWidth / 2,
          -drawHeight / 2,
          drawWidth,
          drawHeight
        );

        context.filter = "none";

        if (overlayText.trim()) {
          context.fillStyle = "white";
          context.font =
            "600 42px Arial";
          context.textAlign = "center";
          context.textBaseline = "middle";

          let y = 0;

          if (textPosition === "top") {
            y =
              -canvas.height / 2 +
              80;
          } else if (textPosition === "bottom") {
            y =
              canvas.height / 2 -
              80;
          }

          context.shadowColor =
            "rgba(0,0,0,0.75)";
          context.shadowBlur = 8;

          context.fillText(
            overlayText,
            0,
            y
          );
        }

        context.restore();

        requestAnimationFrame(drawFrame);
      };

      drawFrame();

      await exportPromise;

      const blob = new Blob(chunks, {
        type:
          supportedType ||
          "video/webm",
      });

      const downloadUrl =
        URL.createObjectURL(blob);

      const anchor =
        document.createElement("a");

      anchor.href = downloadUrl;
      anchor.download = `${
        file.name.replace(/\.[^/.]+$/, "")
      }-vidora-edit.webm`;

      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      setTimeout(() => {
        URL.revokeObjectURL(downloadUrl);
      }, 1000);

      video.currentTime = originalTime;
      video.playbackRate = originalRate;
      video.muted = originalMuted;

      // Mark the current project as completed in MongoDB
      const token = localStorage.getItem("vidora_token");

      if (token && project?._id) {
        try {
          const projectResponse = await fetch(
            `http://localhost:5000/api/projects/${project._id}`,
            {
              method: "PUT",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                status: "completed",
              }),
            }
          );

          const projectData = await projectResponse.json();

          if (projectResponse.ok && projectData.success) {
            setProject(projectData.project);
          } else {
            console.error(
              "Project completion update failed:",
              projectData.message
            );
          }
        } catch (updateError) {
          console.error(
            "Project completion update error:",
            updateError
          );
        }
      }

      setMessage(
        "Your edited video has been exported."
      );
    } catch (error) {
      console.error(error);
      setMessage(
        "Export failed. Please try again with a shorter video."
      );
    } finally {
      setExporting(false);
    }
  };

  return (
    <main className="editor-page">
      <div className="editor-topbar">
        <div className="editor-top-left">
          <button
            className="icon-button"
            onClick={onBack}
            title="Back to dashboard"
          >
            <ArrowLeft size={19} />
          </button>

          <div>
            <span className="small-label">
              VIDORA EDITOR
            </span>
            <h1>
              {file ? file.name : "New project"}
            </h1>
          </div>
        </div>

        <div className="editor-actions">
          <button
            className="icon-button"
            onClick={undo}
            disabled={history.length === 0}
            title="Undo"
          >
            <Undo2 size={18} />
          </button>

          <button
            className="icon-button"
            onClick={redo}
            disabled={future.length === 0}
            title="Redo"
          >
            <Redo2 size={18} />
          </button>

          <button
            className="secondary-button small"
            onClick={resetEditor}
          >
            <RotateCcw size={16} />
            Reset
          </button>

          <button
            className="secondary-button small"
            onClick={saveProject}
            disabled={!videoUrl}
          >
            Save project
          </button>

          <button
            className="primary-button"
            onClick={exportVideo}
            disabled={!file || exporting}
          >
            <Download size={17} />
            {exporting
              ? "Exporting..."
              : "Export video"}
          </button>
        </div>
      </div>

      {!file ? (
        <section className="empty-editor">
          <div className="empty-editor-icon">
            <Upload size={30} />
          </div>

          <span className="small-label">
            START A PROJECT
          </span>

          <h2>Upload your video</h2>

          <p>
            Select a video file from your device to open
            the VIDORA editing workspace.
          </p>

          <button
            className="primary-button"
            onClick={() =>
              fileInputRef.current?.click()
            }
          >
            <Upload size={18} />
            Choose video
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            hidden
            onChange={(e) =>
              handleFile(e.target.files?.[0])
            }
          />
        </section>
      ) : (
        <section className="editor-layout">
          <div className="editor-main">
            <div className="video-stage">
              <video
                ref={videoRef}
                src={videoUrl}
                crossOrigin="anonymous"
                className="editor-video"
                style={previewStyle}
                playsInline
              />

              {overlayText && (
                <div
                  className={`video-text-overlay ${textPosition}`}
                >
                  {overlayText}
                </div>
              )}

              {!isPlaying && (
                <button
                  className="video-center-play"
                  onClick={togglePlay}
                >
                  <Play
                    size={27}
                    fill="currentColor"
                  />
                </button>
              )}
            </div>

            <div className="video-controls">
              <button
                className="play-button"
                onClick={togglePlay}
              >
                {isPlaying ? (
                  <Pause size={18} />
                ) : (
                  <Play
                    size={18}
                    fill="currentColor"
                  />
                )}
              </button>

              <span className="time-display">
                {formatTime(currentTime)}
              </span>

              <input
                className="seek-slider"
                type="range"
                min="0"
                max={duration || 0}
                step="0.01"
                value={currentTime}
                onChange={(e) =>
                  seekVideo(e.target.value)
                }
              />

              <span className="time-display">
                {formatTime(duration)}
              </span>
            </div>

            <div className="timeline-panel">
              <div className="timeline-header">
                <div>
                  <Scissors size={16} />
                  Trim timeline
                </div>

                <span>
                  {formatTime(trimStart)} -{" "}
                  {formatTime(trimEnd)}
                </span>
              </div>

              <div className="trim-controls">
                <label>
                  <span>Start</span>

                  <input
                    type="range"
                    min="0"
                    max={duration}
                    step="0.01"
                    value={trimStart}
                    onChange={(e) =>
                      handleTrimStart(
                        e.target.value
                      )
                    }
                  />
                </label>

                <label>
                  <span>End</span>

                  <input
                    type="range"
                    min="0"
                    max={duration}
                    step="0.01"
                    value={trimEnd}
                    onChange={(e) =>
                      handleTrimEnd(
                        e.target.value
                      )
                    }
                  />
                </label>
              </div>
            </div>

            <canvas
              ref={canvasRef}
              className="export-canvas"
            />
          </div>

          <aside className="editor-sidebar">
            <div className="tool-tabs">
              <button
                className={
                  activeTool === "adjust"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setActiveTool("adjust")
                }
              >
                <SlidersIcon />
                Adjust
              </button>

              <button
                className={
                  activeTool === "filter"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setActiveTool("filter")
                }
              >
                <Palette size={16} />
                Filters
              </button>

              <button
                className={
                  activeTool === "crop"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setActiveTool("crop")
                }
              >
                <Crop size={16} />
                Crop
              </button>

              <button
                className={
                  activeTool === "text"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setActiveTool("text")
                }
              >
                <Type size={16} />
                Text
              </button>
            </div>

            <div className="tool-content">
              {activeTool === "adjust" && (
                <>
                  <Control
                    icon={<Sun size={17} />}
                    label="Brightness"
                    value={brightness}
                    min={50}
                    max={150}
                    suffix="%"
                    onChange={(value) =>
                      setBrightness(Number(value))
                    }
                  />

                  <Control
                    icon={<Contrast size={17} />}
                    label="Contrast"
                    value={contrast}
                    min={50}
                    max={150}
                    suffix="%"
                    onChange={(value) =>
                      setContrast(Number(value))
                    }
                  />

                  <Control
                    icon={<Palette size={17} />}
                    label="Saturation"
                    value={saturation}
                    min={0}
                    max={180}
                    suffix="%"
                    onChange={(value) =>
                      setSaturation(Number(value))
                    }
                  />

                  <Control
                    icon={<Gauge size={17} />}
                    label="Speed"
                    value={speed}
                    min={0.25}
                    max={2}
                    step={0.25}
                    suffix="x"
                    onChange={(value) =>
                      setSpeed(Number(value))
                    }
                  />

                  <Control
                    icon={<Volume2 size={17} />}
                    label="Volume"
                    value={volume}
                    min={0}
                    max={100}
                    suffix="%"
                    onChange={(value) =>
                      setVolume(Number(value))
                    }
                  />

                  <div className="tool-group">
                    <div className="control-heading">
                      <Rotate3d size={17} />
                      <span>Rotation</span>
                    </div>

                    <div className="rotation-buttons">
                      <button
                        onClick={() => {
                          saveHistory();
                          changeRotation(-90);
                        }}
                      >
                        <RotateCcw size={16} />
                        Left
                      </button>

                      <button
                        onClick={() => {
                          saveHistory();
                          changeRotation(90);
                        }}
                      >
                        <RotateCw size={16} />
                        Right
                      </button>
                    </div>
                  </div>
                </>
              )}

              {activeTool === "filter" && (
                <div className="filter-grid">
                  {FILTER_OPTIONS.map(
                    (item) => (
                      <button
                        key={item.id}
                        className={
                          filter === item.id
                            ? "filter-option active"
                            : "filter-option"
                        }
                        onClick={() => {
                          saveHistory();
                          setFilter(item.id);
                        }}
                      >
                        <span
                          className="filter-preview"
                          style={{
                            filter:
                              item.filter,
                          }}
                        />
                        <span>
                          {item.name}
                        </span>
                      </button>
                    )
                  )}
                </div>
              )}

              {activeTool === "crop" && (
                <div className="crop-options">
                  {[
                    ["original", "Original"],
                    ["landscape", "16:9"],
                    ["square", "1:1"],
                    ["portrait", "9:16"],
                  ].map(
                    ([id, name]) => (
                      <button
                        key={id}
                        className={
                          crop === id
                            ? "crop-option active"
                            : "crop-option"
                        }
                        onClick={() => {
                          saveHistory();
                          setCrop(id);
                        }}
                      >
                        <Crop size={19} />
                        {name}

                        {crop === id && (
                          <Check size={15} />
                        )}
                      </button>
                    )
                  )}
                </div>
              )}

              {activeTool === "text" && (
                <div className="text-tool">
                  <div className="input-group">
                    <label>Text overlay</label>

                    <div className="text-input-wrapper">
                      <Type size={17} />

                      <input
                        type="text"
                        value={overlayText}
                        maxLength={80}
                        placeholder="Type something..."
                        onChange={(e) =>
                          setOverlayText(
                            e.target.value
                          )
                        }
                      />

                      {overlayText && (
                        <button
                          onClick={() =>
                            setOverlayText("")
                          }
                        >
                          <X size={15} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="text-position">
                    <span>Position</span>

                    <div>
                      {[
                        ["top", "Top"],
                        ["center", "Center"],
                        ["bottom", "Bottom"],
                      ].map(
                        ([id, name]) => (
                          <button
                            key={id}
                            className={
                              textPosition === id
                                ? "active"
                                : ""
                            }
                            onClick={() =>
                              setTextPosition(
                                id
                              )
                            }
                          >
                            {name}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="sidebar-upload">
              <button
                className="secondary-button full"
                onClick={() =>
                  fileInputRef.current?.click()
                }
              >
                <Upload size={16} />
                Replace video
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                hidden
                onChange={(e) => {
                  handleFile(
                    e.target.files?.[0]
                  );
                  e.target.value = "";
                }}
              />
            </div>
          </aside>
        </section>
      )}

      {message && (
        <div className="editor-message">
          <span>{message}</span>

          <button
            onClick={() => setMessage("")}
            aria-label="Close message"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </main>
  );
};

function SlidersIcon() {
  return <SlidersHorizontal size={16} />;
}

function Control({
  icon,
  label,
  value,
  min,
  max,
  step = 1,
  suffix,
  onChange,
}) {
  return (
    <div className="control">
      <div className="control-heading">
        {icon}
        <span>{label}</span>
        <strong>
          {value}
          {suffix}
        </strong>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
      />
    </div>
  );
}

export default VideoEditor;