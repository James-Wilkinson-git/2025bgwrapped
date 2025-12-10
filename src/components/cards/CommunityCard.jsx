import React from "react";
import "./Card.css";
import CardFooter from "./CardFooter";
import CardWatermark from "./CardWatermark";

function CommunityCard({ games }) {
  if (!games || games.length === 0) {
    return null;
  }

  console.log("Community games data:", games);

  const fallbackImage =
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="70" height="70"><rect width="70" height="70" fill="%23f093fb"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="14" fill="white" font-weight="bold">BGG</text></svg>';

  const proxyImageUrl = (url) => {
    if (!url || url.startsWith("data:")) return url;
    return `https://bgg-app-backend-1.onrender.com/api/proxy-image?url=${encodeURIComponent(
      url
    )}`;
  };

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = fallbackImage;
  };

  return (
    <div className="wrapped-card gradient-purple">
      <CardWatermark />
      <div className="card-content">
        <div className="card-header">
          <h2 className="year-label">✨ 2025 BG Wrapped ✨</h2>
          <h1 className="card-title">🌍 User Favs 🌍</h1>
        </div>
        <div className="games-showcase">
          {games.slice(0, 5).map((game, index) => (
            <div key={game._id} className="game-card">
              <div className="game-card-rank">#{index + 1}</div>
              <div className="game-card-image-wrapper">
                <img
                  src={proxyImageUrl(game.thumbnail) || fallbackImage}
                  alt={game.gameName}
                  className="game-card-image"
                  onError={handleImageError}
                />
              </div>
              <div className="game-card-content">
                <div className="game-card-name">{game.gameName}</div>
                <div className="game-card-plays">
                  🎯 {game.playCount} plays • {game.playerCount} players
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <CardFooter />
    </div>
  );
}

export default CommunityCard;
