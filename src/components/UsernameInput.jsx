import { useState } from "react";
import "./UsernameInput.css";

function UsernameInput({ onSubmit, loading, error }) {
  const [username, setUsername] = useState("");
  const [excludeBGA, setExcludeBGA] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      onSubmit(username.trim(), excludeBGA);
    }
  };

  return (
    <div className="username-input-container">
      <div className="username-input-card">
        <h1 className="title">🎲 2025 BGG Wrapped</h1>
        <p className="subtitle">See your year in board games</p>

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p className="loading-text">Fetching your plays from BGG...</p>
            <p className="loading-subtext">This may take a while</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="input-form">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter BGG username"
              className="username-input"
            />
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={excludeBGA}
                onChange={(e) => setExcludeBGA(e.target.checked)}
                className="checkbox-input"
              />
              <span>Exclude Board Game Arena plays</span>
            </label>
            <button type="submit" className="submit-button">
              Generate Wrapped
            </button>
          </form>
        )}

        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
}

export default UsernameInput;
