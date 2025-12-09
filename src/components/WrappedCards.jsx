import { useState, useRef } from "react";
import { toPng } from "html-to-image";
import "./WrappedCards.css";
import StatsCard from "./cards/StatsCard";
import MostPlayedCard from "./cards/MostPlayedCard";
import MechanicsCard from "./cards/MechanicsCard";
import CategoriesCard from "./cards/CategoriesCard";
import PublishersCard from "./cards/PublishersCard";

function WrappedCards({ username, data, onReset }) {
  const [currentCard, setCurrentCard] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const cardRef = useRef(null);

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
        const actualCard = cardElement.querySelector(".wrapped-card");

        if (actualCard) {
          // Always capture at Instagram Stories resolution (1080x1920)
          const dataUrl = await toPng(actualCard, {
            quality: 1,
            width: 1080,
            height: 1920,
            skipFonts: false,
            filter: (node) => {
              // Skip any external resources that might cause issues
              return !node.src || !node.src.startsWith("http");
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
          disabled={downloading}
        >
          {downloading ? "Downloading..." : "📥 Download Card"}
        </button>
        <button className="reset-btn" onClick={onReset}>
          🔄 New User
        </button>
      </div>
    </div>
  );
}

export default WrappedCards;
