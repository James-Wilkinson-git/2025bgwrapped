import { useState } from "react";
import "./UsernameInput.css";
import bggLogo from "../bgglogo.png";

function UsernameInput({ onSubmit, loading, error }) {
  const [username, setUsername] = useState("");
  const [forceRefresh, setForceRefresh] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      onSubmit(username.trim(), forceRefresh);
    }
  };

  return (
    <div className="username-input-container">
      <div className="username-input-card">
        <h1 className="title">🎲 2025 BG Wrapped</h1>
        <p className="subtitle">See your year in board games</p>

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p className="loading-text">Fetching your plays from BGG...</p>
            <p className="loading-subtext">This may take a while</p>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="input-form">
              <input
                type="text"
                value={username}
                autoCapitalize="none"
                autoComplete="off"
                autoCorrect="off"
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter BGG username"
                className="username-input"
              />
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  margin: "10px 0",
                }}
              >
                <input
                  type="checkbox"
                  checked={forceRefresh}
                  onChange={(e) => setForceRefresh(e.target.checked)}
                  style={{ marginRight: "8px" }}
                />
                Force refresh from BGG (takes a while)
              </label>
              <button type="submit" className="submit-button">
                Generate Wrapped
              </button>
            </form>
          </>
        )}

        {error && <p className="error-message">{error}</p>}
        <img
          src={bggLogo}
          alt="Powered by BGG"
          className="bgg-logo"
          style={{ maxWidth: "200px", marginTop: "20px" }}
        />
      </div>
    </div>
  );
}

export default UsernameInput;
