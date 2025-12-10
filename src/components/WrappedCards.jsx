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
      const scale = Math.max(2, targetWidth / sourceWidth);

      let canvas = await html2canvas(clone, {
        width: sourceWidth,
        height: sourceHeight,
        scale,
        useCORS: true,
        allowTaint: false,
        backgroundColor: null,
        logging: false,
        imageTimeout: 0,
        removeContainer: false,
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

  const isMobileDevice = () => {
    if (typeof navigator === "undefined") {
      return false;
    }
    const ua = navigator.userAgent || "";
    return /Android|iPhone|iPad|iPod/i.test(ua);
  };

  const openImageForManualSave = (dataUrl, filename, blob, message) => {
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isIOS) {
      // For iOS, create a direct download link
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = filename;
      link.target = "_blank";

      // iOS requires the image to be in a new window for saving
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(
          `<!DOCTYPE html>
          <html>
            <head>
              <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
              <title>${filename}</title>
              <style>
                body { margin:0; background:#000; display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:100vh; padding:20px; box-sizing:border-box; }
                img { width:100%; max-width:1080px; height:auto; display:block; border-radius:8px; }
                .instructions { color:#fff; text-align:center; margin-top:20px; font-family:system-ui,-apple-system,sans-serif; font-size:16px; line-height:1.5; }
                .instructions strong { display:block; margin-bottom:8px; font-size:18px; }
              </style>
            </head>
            <body>
              <img src="${dataUrl}" alt="${filename}" />
              <div class="instructions">
                <strong>📲 To Save This Image:</strong>
                Tap and hold the image above, then select "Add to Photos" or "Save Image"
              </div>
            </body>
          </html>`
        );
        newWindow.document.close();
      } else {
        alert(
          "Please enable popups to save the image. Tap and hold the image to save it to your camera roll."
        );
      }
    } else {
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(
          `<!DOCTYPE html><html><head><title>${filename}</title></head><body style="margin:0;background:#000;display:flex;align-items:center;justify-content:center;"><img src="${dataUrl}" alt="${filename}" style="width:100%;height:auto;display:block;" /></body></html>`
        );
        newWindow.document.close();
        if (message) {
          alert(message);
        }
      } else if (blob) {
        downloadBlob(blob, filename);
        if (message) {
          alert(message);
        }
      }
    }
  };

  const exportCardAssets = async () => {
    const canvas = await captureCardCanvas();
    const blob = await canvasToBlob(canvas);
    const dataUrl = canvas.toDataURL("image/png", 1.0);
    return { blob, dataUrl };
  };

  const handleSaveImage = async () => {
    setDownloading(true);
    try {
      const filename = `${username}-2025-wrapped-${currentCard + 1}.png`;
      const { blob, dataUrl } = await exportCardAssets();

      const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

      if (isIOS) {
        // For iOS, open in new tab so user can long-press to save
        const newTab = window.open();
        if (newTab) {
          newTab.document.write(`
            <!DOCTYPE html>
            <html>
              <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${filename}</title>
                <style>
                  body { 
                    margin: 0; 
                    padding: 20px; 
                    background: #000; 
                    display: flex; 
                    flex-direction: column; 
                    align-items: center; 
                    justify-content: center; 
                    min-height: 100vh; 
                    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                  }
                  img { 
                    max-width: 100%; 
                    height: auto; 
                    display: block; 
                    border-radius: 8px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.5);
                  }
                  .instructions { 
                    color: #fff; 
                    text-align: center; 
                    margin-top: 24px; 
                    padding: 16px;
                    background: rgba(255,255,255,0.1);
                    border-radius: 12px;
                    font-size: 16px;
                    line-height: 1.6;
                  }
                  .instructions strong { 
                    display: block; 
                    margin-bottom: 8px; 
                    font-size: 18px;
                    color: #4facfe;
                  }
                </style>
              </head>
              <body>
                <img src="${dataUrl}" alt="${filename}" />
                <div class="instructions">
                  <strong>📲 How to Save:</strong>
                  Tap and hold the image above, then select<br>"Add to Photos" or "Save Image"
                </div>
              </body>
            </html>
          `);
          newTab.document.close();
        } else {
          alert(
            "Please enable popups to save images. Alternatively, take a screenshot of the card."
          );
        }
      } else {
        // Desktop/Android - direct download
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      console.error("Failed to save image:", err);
      alert("Failed to save image: " + (err.message || "Unknown error"));
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    setSharing(true);
    const filename = `${username}-2025-wrapped-${currentCard + 1}.png`;

    try {
      const { blob, dataUrl } = await exportCardAssets();
      const file = new File([blob], filename, { type: "image/png" });

      // Check if Web Share API is available and supports files
      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        try {
          await navigator.share({
            files: [file],
            title: `${username}'s 2025 Board Game Wrapped`,
            text: "Check out my 2025 board game stats!",
          });
          return;
        } catch (shareErr) {
          if (shareErr?.name === "AbortError") {
            return;
          }
          console.error("Share failed:", shareErr);
          alert(
            "Share failed. The image has been prepared - please use the Save Image button."
          );
        }
      } else {
        // Fallback: try direct download
        alert(
          "Share is not supported on this device. Use the Save Image button or take a screenshot."
        );
      }
    } catch (err) {
      console.error("Failed to prepare image:", err);
      alert("Failed to prepare image for sharing. Please try again.");
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

      <div className="controls-wrapper">
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
    </div>
  );
}

export default WrappedCards;
