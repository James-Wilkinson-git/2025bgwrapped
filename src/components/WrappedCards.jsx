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
      const imageUrl = URL.createObjectURL(blob);

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
                <img src="${imageUrl}" alt="${filename}" />
                <div class="instructions">
                  <strong>📲 How to Save:</strong>
                  Tap and hold the image above, then select<br>"Add to Photos" or "Save Image"
                </div>
              </body>
            </html>
          `);
          newTab.document.close();
        } else {
          alert("Please enable popups to save images.");
        }
      } else {
        // Desktop/Android - direct download
        const link = document.createElement("a");
        link.href = imageUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(imageUrl);
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
      const blob = await generateImageFromBackend();
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
          alert("Share failed. Please use the Save Image button.");
        }
      } else {
        alert(
          "Share is not supported on this device. Use the Save Image button."
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
        <div className="story-user">
          <div className="user-avatar">🎲</div>
          <span className="user-name">{username}</span>
        </div>
        <button className="close-button" onClick={onReset} title="New User">
          ✕
        </button>
      </div>

      {/* Main card viewer */}
      <div className="card-viewer">
        {/* Top tap navigation areas */}
        <div
          className="tap-area tap-left"
          onClick={handlePrev}
          style={{ visibility: currentCard > 0 ? "visible" : "hidden" }}
        />
        <div
          className="tap-area tap-right"
          onClick={handleNext}
          style={{
            visibility: currentCard < totalCards - 1 ? "visible" : "hidden",
          }}
        />

        {/* Bottom tap navigation areas */}
        <div
          className="tap-area tap-left bottom"
          onClick={handlePrev}
          style={{ visibility: currentCard > 0 ? "visible" : "hidden" }}
        />
        <div
          className="tap-area tap-right bottom"
          onClick={handleNext}
          style={{
            visibility: currentCard < totalCards - 1 ? "visible" : "hidden",
          }}
        />

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
