import "./Card.css";
import CardFooter from "./CardFooter";
import CardWatermark from "./CardWatermark";

function MechanicsCard({ username, mechanics }) {
  const topMechanics = mechanics.slice(0, 8);

  return (
    <div className="wrapped-card gradient-green">
      <CardWatermark />
      <div className="card-content">
        <div className="card-header">
          <h2 className="year-label">✨ 2025 BG Wrapped ✨</h2>
          <h1 className="card-title">⚙️ Fav Mechanics ⚙️</h1>
          <p className="username">{username}</p>
        </div>

        <div className="tags-container">
          {topMechanics.map((item, index) => (
            <div key={index} className="tag-item">
              <span className="tag-text">{item.mechanic}</span>
              <span className="tag-count">{item.count}</span>
            </div>
          ))}
        </div>
      </div>
      <CardFooter />
    </div>
  );
}

export default MechanicsCard;
