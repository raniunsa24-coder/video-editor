import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Play,
  Pause,
  Upload,
  Scissors,
  Crop,
  SlidersHorizontal,
  RotateCw,
  Volume2,
  VolumeX,
  RotateCcw,
  Download,
  Type,
  SunMedium,
  Contrast,
  Palette,
  Gauge
} from "lucide-react";

const VideoEditor = ({ file, onBack }) => {
  const videoRef = useRef(null);

  const [videoUrl, setVideoUrl] = useState("");
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const [tool, setTool] = useState("trim");

  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(100);

  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);

  const [rotation, setRotation] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [volume, setVolume] = useState(100);
  const [muted, setMuted] = useState(false);

  const [filter, setFilter] = useState("none");
  const [text, setText] = useState("");

  useEffect(() => {
    if (!file) return;

    const url = URL.createObjectURL(file);
    setVideoUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  const togglePlay = () => {
    if (!videoRef.current) return;

    if (playing) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }

    setPlaying(!playing);
  };

  const handleLoaded = () => {
    if (!videoRef.current) return;

    const d = videoRef.current.duration;

    setDuration(d);
    setEnd(100);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;

    setCurrentTime(videoRef.current.currentTime);
  };

  const handleSeek = (e) => {
    const value = Number(e.target.value);

    if (!videoRef.current) return;

    videoRef.current.currentTime = value;
    setCurrentTime(value);
  };

  const resetEditor = () => {
    setStart(0);
    setEnd(100);
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setRotation(0);
    setSpeed(1);
    setVolume(100);
    setMuted(false);
    setFilter("none");
    setText("");

    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
  };

  const downloadVideo = () => {
    if (!videoUrl) return;

    const link = document.createElement("a");

    link.href = videoUrl;
    link.download = file?.name || "vidora-video.mp4";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const tools = [
    {
      id: "trim",
      label: "Trim",
      icon: Scissors
    },
    {
      id: "crop",
      label: "Crop",
      icon: Crop
    },
    {
      id: "adjust",
      label: "Adjust",
      icon: SlidersHorizontal
    },
    {
      id: "filter",
      label: "Filters",
      icon: Palette
    },
    {
      id: "speed",
      label: "Speed",
      icon: Gauge
    },
    {
      id: "text",
      label: "Text",
      icon: Type
    }
  ];

  const videoStyle = {
    filter: `
      brightness(${brightness}%)
      contrast(${contrast}%)
      saturate(${saturation}%)
    `,
    transform: `rotate(${rotation}deg)`
  };

  return (
    <motion.section
      className="editor-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >

      <div className="editor-header">

        <button
          className="back-button"
          onClick={onBack}
        >
          <ArrowLeft size={17} />
          Dashboard
        </button>

        <div className="editor-title">
          <span>VIDEO PROJECT</span>
          <h1>{file?.name || "Untitled project"}</h1>
        </div>

        <div className="editor-actions">

          <button
            className="icon-button"
            onClick={resetEditor}
            title="Reset"
          >
            <RotateCcw size={18} />
          </button>

          <button
            className="primary-button"
            onClick={downloadVideo}
          >
            <Download size={17} />
            Export
          </button>

        </div>

      </div>

      <div className="editor-layout">

        <aside className="editor-sidebar">

          <div className="tool-heading">
            EDIT
          </div>

          {tools.map((item) => {
            const Icon = item.icon;

            return (
              <motion.button
                key={item.id}
                className={`editor-tool ${
                  tool === item.id ? "active" : ""
                }`}
                onClick={() => setTool(item.id)}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.97 }}
              >
                <Icon size={19} />
                <span>{item.label}</span>
              </motion.button>
            );
          })}

        </aside>

        <div className="editor-main">

          <div className="video-stage">

            {videoUrl ? (
              <>
                <video
                  ref={videoRef}
                  src={videoUrl}
                  style={videoStyle}
                  onLoadedMetadata={handleLoaded}
                  onTimeUpdate={handleTimeUpdate}
                  onPlay={() => setPlaying(true)}
                  onPause={() => setPlaying(false)}
                  muted={muted}
                  volume={volume / 100}
                />

                {text && (
                  <div className="video-text-overlay">
                    {text}
                  </div>
                )}

                <button
                  className="stage-play"
                  onClick={togglePlay}
                >
                  {playing ? (
                    <Pause size={25} />
                  ) : (
                    <Play
                      size={25}
                      fill="currentColor"
                    />
                  )}
                </button>
              </>
            ) : (
              <div className="empty-editor">
                <Upload size={30} />
                <h2>No video selected</h2>
                <p>Upload a video to start editing.</p>
              </div>
            )}

          </div>

          <div className="timeline-panel">

            <div className="timeline-controls">

              <button
                className="play-control"
                onClick={togglePlay}
              >
                {playing ? (
                  <Pause size={18} />
                ) : (
                  <Play size={18} />
                )}
              </button>

              <span>
                {formatTime(currentTime)}
              </span>

              <input
                className="timeline-range"
                type="range"
                min="0"
                max={duration || 0}
                step="0.01"
                value={currentTime}
                onChange={handleSeek}
              />

              <span>
                {formatTime(duration)}
              </span>

            </div>

            <div className="timeline-track">
              <div className="timeline-video">
                <div className="timeline-thumbnail">
                  <div />
                  <div />
                  <div />
                  <div />
                  <div />
                  <div />
                </div>

                <div
                  className="timeline-progress"
                  style={{
                    width: duration
                      ? `${(currentTime / duration) * 100}%`
                      : "0%"
                  }}
                />
              </div>
            </div>

          </div>

        </div>

        <aside className="properties-panel">

          <div className="properties-heading">
            <span>PROPERTIES</span>
            <h2>
              {tools.find((item) => item.id === tool)?.label}
            </h2>
          </div>

          {tool === "trim" && (
            <div className="property-content">

              <ControlSlider
                label="Start"
                value={start}
                min={0}
                max={100}
                onChange={setStart}
                suffix="%"
              />

              <ControlSlider
                label="End"
                value={end}
                min={0}
                max={100}
                onChange={setEnd}
                suffix="%"
              />

              <div className="info-box">
                Drag the timeline controls to choose the
                section you want to keep.
              </div>

            </div>
          )}

          {tool === "adjust" && (
            <div className="property-content">

              <ControlSlider
                label="Brightness"
                icon={<SunMedium size={15} />}
                value={brightness}
                min={0}
                max={200}
                onChange={setBrightness}
                suffix="%"
              />

              <ControlSlider
                label="Contrast"
                icon={<Contrast size={15} />}
                value={contrast}
                min={0}
                max={200}
                onChange={setContrast}
                suffix="%"
              />

              <ControlSlider
                label="Saturation"
                icon={<Palette size={15} />}
                value={saturation}
                min={0}
                max={200}
                onChange={setSaturation}
                suffix="%"
              />

              <button
                className="reset-small"
                onClick={() => {
                  setBrightness(100);
                  setContrast(100);
                  setSaturation(100);
                }}
              >
                Reset adjustments
              </button>

            </div>
          )}

          {tool === "crop" && (
            <div className="property-content">

              <button
                className="property-action"
                onClick={() =>
                  setRotation((prev) => prev + 90)
                }
              >
                <RotateCw size={17} />
                Rotate 90°
              </button>

              <div className="info-box">
                Crop controls can be connected to the
                rendering engine in the export stage.
              </div>

            </div>
          )}

          {tool === "filter" && (
            <div className="property-content">

              <div className="filter-grid">

                {[
                  "none",
                  "grayscale",
                  "sepia",
                  "contrast",
                  "saturate"
                ].map((item) => (
                  <button
                    key={item}
                    className={
                      filter === item
                        ? "filter-button active"
                        : "filter-button"
                    }
                    onClick={() => {
                      setFilter(item);

                      if (item === "grayscale") {
                        setSaturation(0);
                      }

                      if (item === "sepia") {
                        setSaturation(70);
                      }

                      if (item === "contrast") {
                        setContrast(140);
                      }

                      if (item === "saturate") {
                        setSaturation(180);
                      }

                      if (item === "none") {
                        setBrightness(100);
                        setContrast(100);
                        setSaturation(100);
                      }
                    }}
                  >
                    {item}
                  </button>
                ))}

              </div>

            </div>
          )}

          {tool === "speed" && (
            <div className="property-content">

              <div className="speed-grid">
                {[0.5, 1, 1.5, 2].map((value) => (
                  <button
                    key={value}
                    className={
                      speed === value
                        ? "speed-button active"
                        : "speed-button"
                    }
                    onClick={() => {
                      setSpeed(value);

                      if (videoRef.current) {
                        videoRef.current.playbackRate = value;
                      }
                    }}
                  >
                    {value}x
                  </button>
                ))}
              </div>

            </div>
          )}

          {tool === "text" && (
            <div className="property-content">

              <label className="editor-label">
                Text overlay
              </label>

              <textarea
                className="text-input"
                placeholder="Type your text..."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />

              <div className="info-box">
                Your text appears directly on the video preview.
              </div>

            </div>
          )}

          <div className="volume-control">

            <button
              onClick={() => setMuted(!muted)}
              className="volume-button"
            >
              {muted ? (
                <VolumeX size={18} />
              ) : (
                <Volume2 size={18} />
              )}
            </button>

            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) =>
                setVolume(Number(e.target.value))
              }
            />

          </div>

        </aside>

      </div>

    </motion.section>
  );
};

const ControlSlider = ({
  label,
  icon,
  value,
  min,
  max,
  onChange,
  suffix
}) => {
  return (
    <div className="control-slider">

      <div className="slider-heading">

        <span>
          {icon}
          {label}
        </span>

        <strong>
          {Math.round(value)}
          {suffix}
        </strong>

      </div>

      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) =>
          onChange(Number(e.target.value))
        }
      />

    </div>
  );
};

const formatTime = (seconds) => {
  if (!seconds || Number.isNaN(seconds)) {
    return "00:00";
  }

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  return `${String(mins).padStart(2, "0")}:${String(
    secs
  ).padStart(2, "0")}`;
};

export default VideoEditor;