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

        // Wait for render
        await new Promise((resolve) => setTimeout(resolve, 300));

        let canvas;
        try {
          canvas = await html2canvas(cardElement, {
            scale: 2,
            allowTaint: true,
            useCORS: false,
            backgroundColor: "#000000",
            logging: false,
            ignoreElements: (element) => {
              // Skip elements that might cause issues
              return false;
            },
          });
        } catch (canvasError) {
          console.error("html2canvas error:", canvasError);
          // Restore animations even if capture fails
          wrappedCard.style.animation = originalAnimation;
          allElements.forEach((el, index) => {
            el.style.animation = originalAnimations[index];
          });
          alert(
            "Failed to capture image. External images may be blocked by CORS."
          );
          return;
        }

        // Restore animations
        wrappedCard.style.animation = originalAnimation;
        allElements.forEach((el, index) => {
          el.style.animation = originalAnimations[index];
        });

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.download = `${username}-2025-wrapped-${currentCard + 1}.png`;
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
      alert("Failed to save image. Please try taking a screenshot instead.");
    } finally {
      setDownloading(false);
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

      {/* Save button */}
      <button
        className="save-button"
        onClick={handleSaveImage}
        disabled={downloading}
        title="Save as image"
      >
        {downloading ? "💾" : "📥"}
      </button>

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
