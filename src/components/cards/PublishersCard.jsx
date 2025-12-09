import "./Card.css";

function PublishersCard({ username, publishers }) {
  const topPublishers = publishers.slice(0, 8);

  return (
    <div className="wrapped-card gradient-pink">
      <div className="card-content">
        <div className="card-header">
          <h2 className="year-label">2025</h2>
          <h1 className="card-title">Top Publishers</h1>
          <p className="username">@{username}</p>
        </div>

        <div className="tags-container">
          {topPublishers.map((item, index) => (
            <div key={index} className="tag-item">
              <span className="tag-text">{item.publisher}</span>
              <span className="tag-count">{item.count}</span>
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

export default PublishersCard;
