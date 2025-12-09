import "./Card.css";

function MechanicsCard({ username, mechanics }) {
  const topMechanics = mechanics.slice(0, 8);

  return (
    <div className="wrapped-card gradient-green">
      <div className="card-content">
        <div className="card-header">
          <h2 className="year-label">2025</h2>
          <h1 className="card-title">Favorite Mechanics</h1>
          <p className="username">@{username}</p>
        </div>

        <div className="tags-container">
          {topMechanics.map((item, index) => (
            <div key={index} className="tag-item">
              <span className="tag-text">{item.mechanic}</span>
              <span className="tag-count">{item.count}</span>
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

export default MechanicsCard;
