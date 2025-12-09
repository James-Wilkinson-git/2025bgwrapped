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
                  src={game.thumbnail}
                  alt={game.gameName}
                  className="game-card-image"
                  onError={handleImageError}
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
