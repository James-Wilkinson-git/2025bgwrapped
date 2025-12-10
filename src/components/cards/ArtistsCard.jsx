import "./Card.css";
import CardFooter from "./CardFooter";
import CardWatermark from "./CardWatermark";

function ArtistsCard({ username, artists }) {
  const topArtists = artists.slice(0, 8);

  return (
    <div className="wrapped-card gradient-orange">
      <CardWatermark />
      <div className="card-content">
        <div className="card-header">
          <h2 className="year-label">✨ 2025 BG Wrapped ✨</h2>
          <h1 className="card-title">🖌️ Top Artists 🖌️</h1>
          <p className="username">{username}</p>
        </div>

        <div className="tags-container">
          {topArtists.map((item, index) => (
            <div key={index} className="tag-item">
              <span className="tag-text">{item.artist}</span>
              <span className="tag-count">{item.count}</span>
            </div>
          ))}
        </div>
      </div>
      <CardFooter />
    </div>
  );
}

export default ArtistsCard;
