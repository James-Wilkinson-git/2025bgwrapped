import { useState } from "react";
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

  const handleNext = () => {
    if (currentCard < cards.length - 1) {
      setCurrentCard(currentCard + 1);
    }
  };

  const handlePrev = () => {
    if (currentCard > 0) {
      setCurrentCard(currentCard - 1);
    }
  };

  const CurrentCardComponent = cards[currentCard].component;

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
