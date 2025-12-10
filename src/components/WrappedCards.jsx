import React, { useState, useEffect } from "react";
import "./WrappedCards.css";
import StatsCard from "./cards/StatsCard";
import MostPlayedCard from "./cards/MostPlayedCard";
import MechanicsCard from "./cards/MechanicsCard";
import CategoriesCard from "./cards/CategoriesCard";
import PublishersCard from "./cards/PublishersCard";
import CommunityCard from "./cards/CommunityCard";

function WrappedCards({ username, data, onReset }) {
  const [currentCard, setCurrentCard] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [communityGames, setCommunityGames] = useState([]);

  // Fetch community popular games
  useEffect(() => {
    const fetchCommunityGames = async () => {
      try {
        const response = await fetch(
          "https://bgg-app-backend-1.onrender.com/api/analytics/popular-games"
        );
        const result = await response.json();
        setCommunityGames(result.popularGames || []);
      } catch (error) {
        console.error("Failed to fetch community games:", error);
      }
    };
    fetchCommunityGames();
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
    ...(communityGames.length > 0
      ? [
          {
            id: "community",
            component: CommunityCard,
            props: { games: communityGames },
          },
        ]
      : []),
  ];

  // Generate image via backend API
  const generateImageFromBackend = async () => {
    const currentCardData = cards[currentCard];
    const cardType = currentCardData.id;
    let cardData;

    // Prepare data based on card type
    if (cardType === "stats") {
      cardData = data.stats;
    } else if (cardType === "most-played") {
      cardData = data.mostPlayed.mostPlayed;
    } else if (cardType === "community") {
      cardData = communityGames;
    } else if (cardType === "mechanics") {
      cardData = data.mostPlayed.topMechanics;
    } else if (cardType === "categories") {
      cardData = data.mostPlayed.topCategories;
    } else if (cardType === "publishers") {
      cardData = data.mostPlayed.topPublishers;
    }

    // Call backend API to generate image
    const response = await fetch(
      `https://bgg-app-backend-1.onrender.com/api/generate-card/${cardType}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          data: cardData,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to generate image");
    }

    return await response.blob();
  };

  const handleSaveImage = async () => {
    setDownloading(true);
    try {
      const filename = `${username}-2025-wrapped-${currentCard + 1}.png`;
      const blob = await generateImageFromBackend();

      // Try to use native share API first (works on iOS without popups)
      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({
          files: [new File([blob], filename, { type: "image/png" })],
        })
      ) {
        const file = new File([blob], filename, { type: "image/png" });
        await navigator.share({
          files: [file],
          title: "2025 BGG Wrapped",
          text: `My 2025 Board Game Wrapped - Card ${currentCard + 1}`,
        });
      } else {
        // Desktop fallback - direct download
        const imageUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = imageUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(imageUrl);
      }
    } catch (err) {
      // User cancelled or error occurred
      if (err.name !== "AbortError") {
        console.error("Failed to save image:", err);
        alert("Failed to save image: " + (err.message || "Unknown error"));
      }
    } finally {
      setDownloading(false);
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

  return (
    <div className="wrapped-container">
      {/* Progress indicators at top */}
      <div className="story-progress">
        {cards.map((_, index) => (
          <div
            key={index}
            className={`progress-bar ${index === currentCard ? "active" : ""} ${
              index < currentCard ? "complete" : ""
            }`}
          />
        ))}
      </div>

      {/* Top header with username and close button */}
      <div className="story-header">
        <button className="close-button" onClick={onReset} title="New User">
          ✕
        </button>
      </div>

      {/* Main card viewer */}
      <div className="card-viewer">
        {/* Navigation buttons */}
        <button
          className="nav-button nav-button-left"
          onClick={handlePrev}
          disabled={currentCard === 0}
          aria-label="Previous card"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <button
          className="nav-button nav-button-right"
          onClick={handleNext}
          disabled={currentCard >= totalCards - 1}
          aria-label="Next card"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        <div className="card-wrapper" id={`card-${currentCard}`}>
          <CurrentCardComponent
            username={username}
            {...cards[currentCard].props}
          />
        </div>
      </div>

      {/* Bottom controls */}
      <div className="controls-wrapper">
        <div className="story-actions">
          <button
            type="button"
            className="story-action-button"
            onClick={handleSaveImage}
            disabled={downloading}
            title="Save"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>Save</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default WrappedCards;
