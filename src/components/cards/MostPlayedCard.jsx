import "./Card.css";

function MostPlayedCard({ username, games }) {
  const topGames = games.slice(0, 5);

  const fallbackImage =
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="70" height="70"><rect width="70" height="70" fill="%23667eea"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="14" fill="white" font-weight="bold">BGG</text></svg>';

  const handleImageError = (e) => {
    console.log("Image failed to load:", e.target.src);
    // Prevent infinite loop by removing the error handler after first failure
    e.target.onerror = null;
    e.target.src = fallbackImage;
  };

  return (
    <div className="wrapped-card gradient-blue">
      <div className="card-content">
        <div className="card-header">
          <h2 className="year-label">✨ 2025 ✨</h2>
          <h1 className="card-title">🏆 Most Played Games 🏆</h1>
          <p className="username">{username}</p>
        </div>

        <div className="games-showcase">
          {topGames.map((game, index) => (
            <div key={game.gameId} className="game-card">
              <div className="game-card-rank">#{index + 1}</div>
              <div className="game-card-image-wrapper">
                <img
                  src={game.thumbnail || fallbackImage}
                  alt={game.gameName}
                  className="game-card-image"
                  onError={handleImageError}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="game-card-content">
                <div className="game-card-name">{game.gameName}</div>
                <div className="game-card-plays">🎯 {game.playCount} plays</div>
              </div>
            </div>
          ))}
        </div>

        <div className="card-footer">
          <p className="footer-text">🎲 2025 BG Wrapped</p>
        </div>
      </div>
    </div>
  );
}

export default MostPlayedCard;
