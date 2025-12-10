import React, { useState, useEffect } from "react";
import "./WrappedCards.css";
import StatsCard from "./cards/StatsCard";
import MostPlayedCard from "./cards/MostPlayedCard";
import MechanicsCard from "./cards/MechanicsCard";
import CategoriesCard from "./cards/CategoriesCard";
import PublishersCard from "./cards/PublishersCard";
import DesignersCard from "./cards/DesignersCard";
import ArtistsCard from "./cards/ArtistsCard";
import CommunityCard from "./cards/CommunityCard";
import CardFooter from "./cards/CardFooter";

function WrappedCards({ username, data, onReset, onRefresh }) {
  const [currentCard, setCurrentCard] = useState(0);
  const [uiVisible, setUiVisible] = useState(true);
  const [communityGames, setCommunityGames] = useState([]);
  const [copySuccess, setCopySuccess] = useState(false);

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
      props: { publishers: data.mostPlayed.topPublishers || [] },
    },
    {
      id: "designers",
      component: DesignersCard,
      props: { designers: data.mostPlayed.topDesigners || [] },
    },
    {
      id: "artists",
      component: ArtistsCard,
      props: { artists: data.mostPlayed.topArtists || [] },
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

  const handleToggleUI = () => {
    setUiVisible(!uiVisible);
  };

  const handleShare = async () => {
    try {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
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
      {uiVisible && (
        <div className="story-progress">
          {cards.map((_, index) => (
            <div
              key={index}
              className={`progress-bar ${
                index === currentCard ? "active" : ""
              } ${index < currentCard ? "complete" : ""}`}
            />
          ))}
        </div>
      )}

      {/* Top header with username and close button */}
      {uiVisible && (
        <div className="story-header">
          <button className="close-button" onClick={onReset} title="New User">
            ✕
          </button>
        </div>
      )}

      {/* Main card viewer */}
      <div className="card-viewer">
        {/* Navigation buttons */}
        {uiVisible && (
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
        )}
        {uiVisible && (
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
        )}

        <div className="card-wrapper" id={`card-${currentCard}`}>
          <CurrentCardComponent
            username={username}
            {...cards[currentCard].props}
          />
        </div>
      </div>

      {/* Bottom controls */}
      {uiVisible && (
        <div className="controls-wrapper">
          <div className="story-actions">
            <button
              type="button"
              className="story-action-button"
              onClick={handleShare}
              title="Share Link"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
              <span>{copySuccess ? "Copied!" : "Share"}</span>
            </button>
            <button
              type="button"
              className="story-action-button"
              onClick={handleToggleUI}
              title="Hide UI"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <span>Hide UI</span>
            </button>
            <button
              type="button"
              className="story-action-button"
              onClick={onRefresh}
              title="Refresh Data"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="23 4 23 10 17 10" />
                <path d="M1 20a11 11 0 0 1 17.9-7.9L23 10" />
              </svg>
              <span>Refresh</span>
            </button>
          </div>
        </div>
      )}
      {!uiVisible && (
        <button
          type="button"
          className="show-ui-button"
          onClick={handleToggleUI}
          title="Show UI"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
            <line x1="1" y1="1" x2="23" y2="23" />
          </svg>
        </button>
      )}
    </div>
  );
}

export default WrappedCards;
