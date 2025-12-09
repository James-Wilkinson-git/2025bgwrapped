import "./Card.css";

function MostPlayedCard({ username, games }) {
  const topGames = games.slice(0, 5);

  const handleImageError = (e) => {
    e.target.src = "https://placehold.co/70x70/667eea/ffffff?text=BGG";
  };

  return (
    <div className="wrapped-card gradient-blue">
      <div className="card-content">
        <div className="card-header">
          <h2 className="year-label">2025</h2>
          <h1 className="card-title">Most Played Games</h1>
          <p className="username">@{username}</p>
        </div>

        <div className="games-list">
          {topGames.map((game, index) => (
            <div key={game.gameId} className="game-item">
              <div className="game-rank">#{index + 1}</div>
              <img
                src={game.thumbnail}
                alt={game.gameName}
                className="game-thumbnail"
                onError={handleImageError}
              />
              <div className="game-info">
                <div className="game-name">{game.gameName}</div>
                <div className="game-stats">{game.playCount} plays</div>
              </div>
            </div>
          ))}
        </div>

        <div className="card-footer">
          <p className="footer-text">🎲 BGG Wrapped</p>
        </div>
      </div>
    </div>
  );
}

export default MostPlayedCard;
