import "./Card.css";
import CardFooter from "./CardFooter";
import CardWatermark from "./CardWatermark";

function CategoriesCard({ username, categories }) {
  const topCategories = categories.slice(0, 8);

  return (
    <div className="wrapped-card gradient-orange">
      <CardWatermark />
      <div className="card-content">
        <div className="card-header">
          <h2 className="year-label">✨ 2026 BG Wrapped ✨</h2>
          <h1 className="card-title">🎨 Top Themes 🎨</h1>
          <p className="username">{username}</p>
        </div>

        <div className="tags-container">
          <div key="category-header" className="tag-item">
            <span className="tag-text">Category</span>
            <span className="tag-count"># of Plays</span>
          </div>
          {topCategories.map((item, index) => (
            <div key={index} className="tag-item">
              <span className="tag-text">{item.category}</span>
              <span className="tag-count">{item.count}</span>
            </div>
          ))}
        </div>
      </div>
      <CardFooter />
    </div>
  );
}

export default CategoriesCard;
