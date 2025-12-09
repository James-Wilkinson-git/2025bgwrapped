import { useState, useRef } from "react";
import html2canvas from "html2canvas";
import "./WrappedCards.css";
import StatsCard from "./cards/StatsCard";
import MostPlayedCard from "./cards/MostPlayedCard";
import MechanicsCard from "./cards/MechanicsCard";
import CategoriesCard from "./cards/CategoriesCard";
import PublishersCard from "./cards/PublishersCard";

function WrappedCards({ username, data, onReset }) {
  const [currentCard, setCurrentCard] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const cardRef = useRef(null);

  const handleSaveImage = async () => {
    setDownloading(true);
    try {
      const cardElement = document.getElementById(`card-${currentCard}`);
      if (cardElement) {
        // Temporarily disable animations for capture
        const wrappedCard = cardElement.querySelector(".wrapped-card");
        const originalAnimation = wrappedCard.style.animation;
        wrappedCard.style.animation = "none";

        // Disable all child animations
        const allElements = wrappedCard.querySelectorAll("*");
        const originalAnimations = [];
        allElements.forEach((el, index) => {
          originalAnimations[index] = el.style.animation;
          el.style.animation = "none";
        });

        // Wait for images to fully load
        const images = wrappedCard.querySelectorAll("img");
        await Promise.all(
          Array.from(images).map((img) => {
            if (img.complete) return Promise.resolve();
            return new Promise((resolve) => {
              img.onload = resolve;
              img.onerror = resolve;
            });
          })
        );

        // Wait for render and ensure all proxy images are loaded
        await new Promise((resolve) => setTimeout(resolve, 500));

        const canvas = await html2canvas(cardElement, {
          scale: 2,
          allowTaint: false,
          useCORS: true,
          backgroundColor: "#000000",
          logging: true,
        });

        // Restore animations
        wrappedCard.style.animation = originalAnimation;
        allElements.forEach((el, index) => {
          el.style.animation = originalAnimations[index];
        });

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const fileName = `${username}-2025-wrapped-${
                currentCard + 1
              }.png`;
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.download = fileName;
              link.href = url;
              link.click();
              URL.revokeObjectURL(url);
            }
          },
          "image/png",
          1.0
        );
      }
    } catch (err) {
      console.error("Failed to save image:", err);
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    setSharing(true);
    try {
      const cardElement = document.getElementById(`card-${currentCard}`);
      if (cardElement) {
        // Temporarily disable animations for capture
        const wrappedCard = cardElement.querySelector(".wrapped-card");
        const originalAnimation = wrappedCard.style.animation;
        wrappedCard.style.animation = "none";

        // Disable all child animations
        const allElements = wrappedCard.querySelectorAll("*");
        const originalAnimations = [];
        allElements.forEach((el, index) => {
          originalAnimations[index] = el.style.animation;
          el.style.animation = "none";
        });

        // Wait for images to fully load
        const images = wrappedCard.querySelectorAll("img");
        await Promise.all(
          Array.from(images).map((img) => {
            if (img.complete) return Promise.resolve();
            return new Promise((resolve) => {
              img.onload = resolve;
              img.onerror = resolve;
            });
          })
        );

        // Wait for render and ensure all proxy images are loaded
        await new Promise((resolve) => setTimeout(resolve, 500));

        const canvas = await html2canvas(cardElement, {
          scale: 2,
          allowTaint: false,
          useCORS: true,
          backgroundColor: "#000000",
          logging: true,
        });

        // Restore animations
        wrappedCard.style.animation = originalAnimation;
        allElements.forEach((el, index) => {
          el.style.animation = originalAnimations[index];
        });

        canvas.toBlob(
          async (blob) => {
            if (blob) {
              const fileName = `${username}-2025-wrapped-${
                currentCard + 1
              }.png`;

              // Use Web Share API
              if (navigator.share && navigator.canShare) {
                try {
                  const file = new File([blob], fileName, {
                    type: "image/png",
                  });
                  const shareData = {
                    files: [file],
                    title: `${username}'s 2025 Board Game Wrapped`,
                    text: `Check out my 2025 board game stats!`,
                  };

                  if (navigator.canShare(shareData)) {
                    await navigator.share(shareData);
                  }
                } catch (err) {
                  console.log("Share failed or was cancelled:", err);
                }
              } else {
                alert("Sharing is not supported on this device");
              }
            }
          },
          "image/png",
          1.0
        );
      }
    } catch (err) {
      console.error("Failed to share image:", err);
    } finally {
      setSharing(false);
    }
  };

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
      {/* Instagram-style story progress */}
      <div className="story-progress">
        {cards.map((_, index) => (
          <div
            key={index}
            className={`progress-bar ${
              index < currentCard
                ? "completed"
                : index === currentCard
                ? "active"
                : ""
            }`}
          />
        ))}
      </div>

      {/* Instagram-style tap zones */}
      <div className="tap-zone tap-zone-left" onClick={handlePrev} />
      <div className="tap-zone tap-zone-right" onClick={handleNext} />

      {/* Action buttons */}
      <div className="action-buttons-floating">
        <button
          className="floating-button refresh-button"
          onClick={onReset}
          title="New user"
        >
          🔄
        </button>
        <button
          className="floating-button share-button"
          onClick={handleShare}
          disabled={sharing}
          title="Share"
        >
          🌐
        </button>
        <button
          className="floating-button save-button"
          onClick={handleSaveImage}
          disabled={downloading}
          title="Save as image"
        >
          💾
        </button>
      </div>

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
    </div>
  );
}

export default WrappedCards;
