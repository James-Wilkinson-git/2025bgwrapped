import React, { useState } from "react";
import html2canvas from "html2canvas";
import "./WrappedCards.css";
import StatsCard from "./cards/StatsCard";
import MostPlayedCard from "./cards/MostPlayedCard";
import MechanicsCard from "./cards/MechanicsCard";
import CategoriesCard from "./cards/CategoriesCard";
import PublishersCard from "./cards/PublishersCard";

function WrappedCards({ username, data, onReset }) {
  const [currentCard, setCurrentCard] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);

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

  const captureCardCanvas = async () => {
    const sourceCard = document.getElementById(`card-${currentCard}`);
    if (!sourceCard) {
      throw new Error("Unable to locate the card to export");
    }

    const clone = sourceCard.cloneNode(true);
    const cloneId = `card-export-${Date.now()}`;
    clone.id = cloneId;
    clone.classList.add("card-export-clone");

    const rect = sourceCard.getBoundingClientRect();
    const offsetWidth = sourceCard.offsetWidth;
    const offsetHeight = sourceCard.offsetHeight;
    const sourceWidth =
      (offsetWidth && offsetWidth > 0 ? offsetWidth : rect.width) || 1;
    const sourceHeight =
      (offsetHeight && offsetHeight > 0 ? offsetHeight : rect.height) || 1;

    const exportHost = document.createElement("div");
    exportHost.style.position = "fixed";
    exportHost.style.top = "0";
    exportHost.style.left = "-99999px";
    exportHost.style.width = `${sourceWidth}px`;
    exportHost.style.height = `${sourceHeight}px`;
    exportHost.style.pointerEvents = "none";
    exportHost.style.opacity = "0";
    exportHost.style.zIndex = "-1";
    exportHost.appendChild(clone);

    const childElements = clone.querySelectorAll("*");
    childElements.forEach((el) => {
      el.style.animation = "none";
      el.style.transition = "none";
    });

    const wrappedCard = clone.querySelector(".wrapped-card");
    if (wrappedCard) {
      wrappedCard.style.width = "100%";
      wrappedCard.style.height = "100%";
    }

    const images = Array.from(clone.querySelectorAll("img"));
    images.forEach((img) => {
      const currentSrc = img.getAttribute("src") || "";
      if (!currentSrc || currentSrc.startsWith("data:")) {
        return;
      }

      const needsReload = img.crossOrigin !== "anonymous";
      if (needsReload) {
        img.crossOrigin = "anonymous";
        img.src = "";
        img.src = currentSrc;
      }
    });

    document.body.appendChild(exportHost);

    await Promise.all(
      images.map((img) => {
        if (img.complete && img.naturalWidth !== 0) {
          return Promise.resolve();
        }
        return new Promise((resolve) => {
          img.onload = () => resolve();
          img.onerror = () => resolve();
        });
      })
    );

    if (document.fonts && document.fonts.ready) {
      try {
        await document.fonts.ready;
      } catch (err) {
        console.warn("Font loading warning during export", err);
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 80));

    try {
      const targetWidth = 1080;
      const targetHeight = 1920;
      const scale = Math.max(1, targetWidth / sourceWidth);

      let canvas = await html2canvas(clone, {
        width: sourceWidth,
        height: sourceHeight,
        scale,
        useCORS: true,
        backgroundColor: null,
        logging: false,
      });
      if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
        const scaledCanvas = document.createElement("canvas");
        scaledCanvas.width = targetWidth;
        scaledCanvas.height = targetHeight;
        const ctx = scaledCanvas.getContext("2d");
        ctx.clearRect(0, 0, targetWidth, targetHeight);
        const widthScale = targetWidth / canvas.width;
        const heightScale = targetHeight / canvas.height;
        const drawScale =
          Math.abs(widthScale - heightScale) <= 0.01
            ? widthScale
            : Math.min(widthScale, heightScale);
        const drawWidth = canvas.width * drawScale;
        const drawHeight = canvas.height * drawScale;
        const offsetX = (targetWidth - drawWidth) / 2;
        const offsetY = (targetHeight - drawHeight) / 2;
        ctx.drawImage(canvas, offsetX, offsetY, drawWidth, drawHeight);
        canvas = scaledCanvas;
      }
      return canvas;
    } finally {
      if (exportHost.parentNode) {
        exportHost.parentNode.removeChild(exportHost);
      }
    }
  };

  const canvasToBlob = (canvas) =>
    new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to convert canvas to blob"));
          }
        },
        "image/png",
        1
      );
    });

  const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSaveImage = async () => {
    setDownloading(true);
    try {
      const canvas = await captureCardCanvas();
      const blob = await canvasToBlob(canvas);
      downloadBlob(blob, `${username}-2025-wrapped-${currentCard + 1}.png`);
    } catch (err) {
      console.error("Failed to save image:", err);
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    setSharing(true);
    const filename = `${username}-2025-wrapped-${currentCard + 1}.png`;
    let blob = null;
    try {
      const canvas = await captureCardCanvas();
      blob = await canvasToBlob(canvas);
      const file = new File([blob], filename, { type: "image/png" });

      if (navigator.share) {
        if (!navigator.canShare || navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: `${username}'s 2025 Board Game Wrapped`,
            text: "Check out my 2025 board game stats!",
          });
          return;
        }
      } else {
        downloadBlob(blob, filename);
        alert(
          "Share is not supported on this device. Image downloaded instead."
        );
        return;
      }

      downloadBlob(blob, filename);
      alert(
        "Share is not supported with files on this device. Image downloaded instead."
      );
    } catch (err) {
      if (err.name === "AbortError") {
        console.info("Share cancelled by user");
      } else {
        if (blob) {
          downloadBlob(blob, filename);
        }
        console.error("Failed to share image:", err);
        alert("Sharing failed, but the image has been downloaded instead.");
      }
    } finally {
      setSharing(false);
    }
  };

  const handleNext = () => {
    setCurrentCard((prev) => (prev < cards.length - 1 ? prev + 1 : prev));
  };

  const handlePrev = () => {
    setCurrentCard((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const CurrentCardComponent = cards[currentCard].component;
  const totalCards = cards.length;
  const showControls = totalCards > 1;

  return (
    <div className="wrapped-container">
      <div className="card-viewer">
        <div className="card-wrapper" id={`card-${currentCard}`}>
          <CurrentCardComponent
            username={username}
            {...cards[currentCard].props}
          />
        </div>
      </div>

      {showControls && (
        <div className="card-controls">
          <button
            type="button"
            className="nav-button"
            onClick={handlePrev}
            disabled={currentCard === 0}
          >
            Previous
          </button>
          <span className="card-index">
            {currentCard + 1} / {totalCards}
          </span>
          <button
            type="button"
            className="nav-button"
            onClick={handleNext}
            disabled={currentCard === totalCards - 1}
          >
            Next
          </button>
        </div>
      )}

      <div className="card-actions">
        <button
          type="button"
          className="action-button"
          onClick={onReset}
          title="Search for another user"
        >
          New User
        </button>
        <button
          type="button"
          className="action-button"
          onClick={handleShare}
          disabled={sharing}
          title="Share card"
        >
          Share
        </button>
        <button
          type="button"
          className="action-button"
          onClick={handleSaveImage}
          disabled={downloading}
          title="Download card"
        >
          Save Image
        </button>
      </div>
    </div>
  );
}

export default WrappedCards;
