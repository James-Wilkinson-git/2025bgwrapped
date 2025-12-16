import { useState } from "react";
import "./UsernameInput.css";
import bggLogo from "../bgglogo.png";

function UsernameInput({ onSubmit, error, excludeBGA: initialExcludeBGA }) {
  const [username, setUsername] = useState("");
  const [forceRefresh, setForceRefresh] = useState(false);
  const [excludeBGA, setExcludeBGA] = useState(initialExcludeBGA || false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      onSubmit(username.trim(), forceRefresh, excludeBGA);
    }
  };

  return (
    <div className="username-input-container">
      <div className="username-input-card">
        <h1 className="title">🎲 2025 BG Wrapped</h1>
        <p className="subtitle">See your year in board games</p>

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
          <label
            style={{
              margin: "10px 0",
            }}
          >
            <input
              type="checkbox"
              checked={excludeBGA}
              onChange={(e) => setExcludeBGA(e.target.checked)}
              style={{ marginRight: "8px" }}
            />
            Exclude digital plays (BGA, Steam, Apps, Yucatta, Tabletopia)
          </label>
          <button type="submit" className="submit-button">
            Generate Wrapped
          </button>
          <div class="bgstats">
            If you use <b>BGStats</b> you will need to make sure your connection
            to BGG is still working, many reports that it wasn't syncing. Click
            the Cog in BGStats, then Under Syncing, Board Game Geek, make sure
            you are logged in, then under Sync Settings, enable auto post, I
            also recommend you anonymize locations and players if you value your
            privacy as this will be public on bgg and therefore here as well.
            Then go to your plays, click the small cog, at the bottom select all
            unposted plays, then select share, post or update to BGG
          </div>
        </form>

        {error && <p className="error-message">{error}</p>}
        <a
          href="https://boardgamegeek.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src={bggLogo}
            alt="Powered by BGG"
            className="bgg-logo"
            style={{ maxWidth: "200px", marginTop: "20px" }}
          />
        </a>
      </div>
    </div>
  );
}

export default UsernameInput;
