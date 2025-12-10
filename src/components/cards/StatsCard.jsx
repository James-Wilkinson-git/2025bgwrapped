import "./Card.css";
import CardFooter from "./CardFooter";
import CardWatermark from "./CardWatermark";

function StatsCard({ username, stats }) {
  return (
    <div className="wrapped-card gradient-purple">
      <CardWatermark />
      <div className="card-content">
        <div className="card-header">
          <h2 className="year-label">✨ 2025 BG Wrapped ✨</h2>
          <h1 className="card-title">🎲 Your Year in Games 🎲</h1>
          <p className="username">{username}</p>
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

          {stats.averageGameAge !== null &&
            stats.averageGameAge !== undefined && (
              <div className="stat-item large">
                <div className="stat-value">{stats.averageGameAge}</div>
                <div className="stat-label">Average Game Age</div>
                <div className="stat-sublabel">
                  {stats.averageGameAge === 0
                    ? "Playing the hottest new releases! 🔥"
                    : stats.averageGameAge === 1
                    ? "Playing games about 1 year old"
                    : `Playing games about ${stats.averageGameAge} years old`}
                </div>
              </div>
            )}
        </div>
      </div>
      <CardFooter />
    </div>
  );
}

export default StatsCard;
