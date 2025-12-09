import "./Card.css";

function StatsCard({ username, stats }) {
  return (
    <div className="wrapped-card gradient-purple">
      <div className="card-content">
        <div className="card-header">
          <h2 className="year-label">2025</h2>
          <h1 className="card-title">Your Year in Games</h1>
          <p className="username">@{username}</p>
        </div>

        <div className="stats-grid">
          <div className="stat-item large">
            <div className="stat-value">{stats.totalPlays}</div>
            <div className="stat-label">Total Plays</div>
          </div>

          <div className="stat-item large">
            <div className="stat-value">{stats.uniqueGames}</div>
            <div className="stat-label">Unique Games</div>
          </div>

          {stats.boardGamerAge && (
            <div className="stat-item large">
              <div className="stat-value">{stats.boardGamerAge}</div>
              <div className="stat-label">Your Board Gamer Age</div>
              <div className="stat-sublabel">
                Playing games from {stats.mostCommonYear}
              </div>
            </div>
          )}
        </div>

        <div className="card-footer">
          <p className="footer-text">🎲 2025 BG Wrapped</p>
        </div>
      </div>
    </div>
  );
}

export default StatsCard;
