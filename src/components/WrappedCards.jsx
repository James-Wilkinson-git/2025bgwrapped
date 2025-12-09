import { useState, useRef, useEffect } from "react";
import { toPng } from "html-to-image";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import "./WrappedCards.css";
import StatsCard from "./cards/StatsCard";
import MostPlayedCard from "./cards/MostPlayedCard";
import MechanicsCard from "./cards/MechanicsCard";
import CategoriesCard from "./cards/CategoriesCard";
import PublishersCard from "./cards/PublishersCard";

function WrappedCards({ username, data, onReset }) {
  const [currentCard, setCurrentCard] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [recordingVideo, setRecordingVideo] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [videoProgress, setVideoProgress] = useState("");
  const cardRef = useRef(null);
  const ffmpegRef = useRef(new FFmpeg());
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);

  useEffect(() => {
    const loadFFmpeg = async () => {
      const ffmpeg = ffmpegRef.current;
      ffmpeg.on("log", ({ message }) => {
        console.log(message);
      });

      try {
        const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
        await ffmpeg.load({
          coreURL: await toBlobURL(
            `${baseURL}/ffmpeg-core.js`,
            "text/javascript"
          ),
          wasmURL: await toBlobURL(
            `${baseURL}/ffmpeg-core.wasm`,
            "application/wasm"
          ),
        });
        setFfmpegLoaded(true);
      } catch (error) {
        console.error("Failed to load FFmpeg:", error);
      }
    };
    loadFFmpeg();
  }, []);

  const cards = [
    { id: "stats", component: StatsCard, props: { stats: data.stats } },
    {
      id: "most-played",
      component: MostPlayedCard,
      props: { games: data.mostPlayed.mostPlayed },
    },
    {
      id: "mechanics",
      component: MechanicsCard,
      props: { mechanics: data.mostPlayed.topMechanics },
    },
    {
      id: "categories",
      component: CategoriesCard,
      props: { categories: data.mostPlayed.topCategories },
    },
    {
      id: "publishers",
      component: PublishersCard,
      props: { publishers: data.mostPlayed.topPublishers },
    },
  ];

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const cardElement = document.getElementById(`card-${currentCard}`);
      if (cardElement) {
        // Get the actual card element (first child which is the wrapped-card)
        const actualCard = cardElement.querySelector(".wrapped-card");

        if (actualCard) {
          const dataUrl = await toPng(actualCard, {
            quality: 1,
            pixelRatio: 2,
            width: 1080,
            height: 1920,
            style: {
              borderRadius: "0px",
            },
          });

          const link = document.createElement("a");
          link.download = `${username}-2025-bgg-wrapped-${currentCard + 1}.png`;
          link.href = dataUrl;
          link.click();
        }
      }
    } catch (err) {
      console.error("Failed to download image:", err);
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadVideo = async () => {
    if (!ffmpegLoaded) {
      alert(
        "Video encoder is still loading. Please wait a moment and try again."
      );
      return;
    }

    setRecordingVideo(true);
    const originalCard = currentCard;
    setVideoProgress("Capturing cards...");

    try {
      const ffmpeg = ffmpegRef.current;
      const imageFiles = [];

      // Capture all cards as images
      for (let i = 0; i < cards.length; i++) {
        setCurrentCard(i);
        setVideoProgress(`Capturing card ${i + 1}/${cards.length}...`);
        await new Promise((resolve) => setTimeout(resolve, 800));

        const cardElement = document.getElementById(`card-${i}`);
        const actualCard = cardElement?.querySelector(".wrapped-card");

        if (actualCard) {
          const dataUrl = await toPng(actualCard, {
            quality: 1,
            pixelRatio: 2,
            width: 1080,
            height: 1920,
            style: {
              borderRadius: "0px",
            },
          });

          // Convert data URL to blob and write to FFmpeg
          const response = await fetch(dataUrl);
          const blob = await response.blob();
          const fileName = `frame${i.toString().padStart(3, "0")}.png`;
          await ffmpeg.writeFile(fileName, await fetchFile(blob));
          imageFiles.push(fileName);
        }
      }

      setVideoProgress("Creating video...");

      // Create video from images - each image shows for 3 seconds (Instagram story friendly)
      await ffmpeg.exec([
        "-framerate",
        "1/3", // 1 frame every 3 seconds
        "-pattern_type",
        "glob",
        "-i",
        "frame*.png",
        "-c:v",
        "libx264",
        "-pix_fmt",
        "yuv420p",
        "-movflags",
        "+faststart",
        "-r",
        "30", // Output at 30fps for smooth playback
        "output.mp4",
      ]);

      // Read the output video
      const data = await ffmpeg.readFile("output.mp4");
      const videoBlob = new Blob([data.buffer], { type: "video/mp4" });
      const videoUrl = URL.createObjectURL(videoBlob);

      // Download the video
      const link = document.createElement("a");
      link.href = videoUrl;
      link.download = `${username}-2025-bgg-wrapped.mp4`;
      link.click();

      // Cleanup
      URL.revokeObjectURL(videoUrl);
      for (const file of imageFiles) {
        await ffmpeg.deleteFile(file);
      }
      await ffmpeg.deleteFile("output.mp4");

      setCurrentCard(originalCard);
      setVideoProgress("");
      alert(
        "Video created successfully! Ready for Instagram Stories (1080x1920)!"
      );
    } catch (err) {
      console.error("Failed to create video:", err);
      alert(
        `Failed to create video: ${err.message}. Make sure you\'re using a modern browser like Chrome or Edge.`
      );
      setCurrentCard(originalCard);
      setVideoProgress("");
    } finally {
      setRecordingVideo(false);
    }
  };

  const handleNext = () => {
    if (currentCard < cards.length - 1) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentCard(currentCard + 1);
        setIsTransitioning(false);
      }, 300);
    }
  };

  const handlePrev = () => {
    if (currentCard > 0) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentCard(currentCard - 1);
        setIsTransitioning(false);
      }, 300);
    }
  };

  const CurrentCardComponent = cards[currentCard].component;

  return (
    <div className="wrapped-container">
      <div className="card-viewer">
        <div
          className={`card-wrapper ${isTransitioning ? "transitioning" : ""}`}
          id={`card-${currentCard}`}
          ref={cardRef}
        >
          <CurrentCardComponent
            username={username}
            {...cards[currentCard].props}
          />
        </div>
      </div>

      <div className="controls">
        <button
          className="control-btn prev-btn"
          onClick={handlePrev}
          disabled={currentCard === 0}
        >
          ← Previous
        </button>

        <div className="card-info">
          <span className="card-counter">
            {currentCard + 1} / {cards.length}
          </span>
        </div>

        <button
          className="control-btn next-btn"
          onClick={handleNext}
          disabled={currentCard === cards.length - 1}
        >
          Next →
        </button>
      </div>

      <div className="action-buttons">
        <button
          className="download-btn"
          onClick={handleDownload}
          disabled={downloading || recordingVideo}
        >
          {downloading ? "Downloading..." : "📥 Download Card"}
        </button>
        <button
          className="download-btn video-btn"
          onClick={handleDownloadVideo}
          disabled={downloading || recordingVideo || !ffmpegLoaded}
        >
          {recordingVideo
            ? videoProgress || "Creating video..."
            : !ffmpegLoaded
            ? "Loading..."
            : "🎥 Create Instagram Video"}
        </button>
        <button
          className="reset-btn"
          onClick={onReset}
          disabled={recordingVideo}
        >
          🔄 New User
        </button>
      </div>
    </div>
  );
}

export default WrappedCards;
