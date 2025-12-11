import { useState, useEffect } from "react";
import {
  Routes,
  Route,
  useParams,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import "./App.css";
import UsernameInput from "./components/UsernameInput";
import WrappedCards from "./components/WrappedCards";

function WrappedPage() {
  const { username: urlUsername } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [username, setUsername] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [excludeBGA, setExcludeBGA] = useState(false);

  useEffect(() => {
    if (urlUsername) {
      const excludeFromUrl = searchParams.get("excludeBGA") === "true";
      setExcludeBGA(excludeFromUrl);
      handleFetchData(urlUsername, false, excludeFromUrl);
    }
  }, [urlUsername, searchParams]);

  const handleFetchData = async (
    user,
    forceRefresh = false,
    exclude = false
  ) => {
    setLoading(true);
    setError("");
    setUsername(user);
    setExcludeBGA(exclude);

    // Only update URL after successful fetch

    try {
      const excludeParam = exclude ? "&excludeBGA=true" : "";
      const excludeParamNoQ = exclude ? "?excludeBGA=true" : "";

      // If forceRefresh, always fetch plays from BGG
      if (forceRefresh) {
        const playsRes = await fetch(
          `https://bgg-app-backend-1.onrender.com/api/plays/${user}?refetch=true${excludeParam}`
        );
        if (!playsRes.ok) {
          throw new Error("Failed to fetch plays data from BGG");
        }
        await playsRes.json();
      }
      // Try to fetch analytics first to see if data exists
      const [statsRes, mostPlayedRes] = await Promise.all([
        fetch(
          `https://bgg-app-backend-1.onrender.com/api/analytics/${user}/stats${excludeParamNoQ}`
        ),
        fetch(
          `https://bgg-app-backend-1.onrender.com/api/analytics/${user}/most-played${excludeParamNoQ}`
        ),
      ]);
      let stats = null;
      let mostPlayed = null;
      // If analytics data exists, use it
      if (statsRes.ok && mostPlayedRes.ok) {
        stats = await statsRes.json();
        mostPlayed = await mostPlayedRes.json();
        // Check if we actually have data
        if (stats.totalPlays > 0 || mostPlayed.mostPlayed?.length > 0) {
          setData({ stats, mostPlayed });
          if (!urlUsername) {
            navigate(`/${user}${exclude ? "?excludeBGA=true" : ""}`);
          }
          return;
        }
      }
      // If no data exists, fetch plays from BGG first
      if (!forceRefresh) {
        const playsRes = await fetch(
          `https://bgg-app-backend-1.onrender.com/api/plays/${user}${excludeParamNoQ}`
        );
        if (!playsRes.ok) {
          throw new Error("Failed to fetch plays data from BGG");
        }
        await playsRes.json();
        // Now fetch analytics again
        const [newStatsRes, newMostPlayedRes] = await Promise.all([
          fetch(
            `https://bgg-app-backend-1.onrender.com/api/analytics/${user}/stats${excludeParamNoQ}`
          ),
          fetch(
            `https://bgg-app-backend-1.onrender.com/api/analytics/${user}/most-played${excludeParamNoQ}`
          ),
        ]);
        if (!newStatsRes.ok || !newMostPlayedRes.ok) {
          throw new Error("Failed to fetch analytics data");
        }
        stats = await newStatsRes.json();
        mostPlayed = await newMostPlayedRes.json();
      }
      setData({ stats, mostPlayed });
      if (!urlUsername) {
        navigate(`/${user}${exclude ? "?excludeBGA=true" : ""}`);
      }
    } catch (err) {
      setError(
        err.message || "Failed to fetch data. Make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // Force refresh: always fetch plays from BGG, then analytics
  const handleRefreshData = async () => {
    if (!username) return;
    setLoading(true);
    setError("");
    try {
      const playsRes = await fetch(
        `https://bgg-app-backend-1.onrender.com/api/plays/${username}?refetch=true`
      );
      if (!playsRes.ok) {
        throw new Error("Failed to fetch plays data from BGG");
      }
      await playsRes.json();
      // Now fetch analytics again
      const [statsRes, mostPlayedRes] = await Promise.all([
        fetch(
          `https://bgg-app-backend-1.onrender.com/api/analytics/${username}/stats`
        ),
        fetch(
          `https://bgg-app-backend-1.onrender.com/api/analytics/${username}/most-played`
        ),
      ]);
      if (!statsRes.ok || !mostPlayedRes.ok) {
        throw new Error("Failed to fetch analytics data");
      }
      const stats = await statsRes.json();
      const mostPlayed = await mostPlayedRes.json();
      setData({ stats, mostPlayed });
    } catch (err) {
      setError(
        err.message ||
          "Failed to refresh data. Make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setUsername("");
    setData(null);
    setError("");
    setLoading(false);
    navigate("/");
  };

  // Helper to check if stats are truly empty
  function isStatsEmpty(stats, mostPlayed) {
    if (!stats || !mostPlayed) return true;
    if (typeof stats.totalPlays !== "number" || stats.totalPlays < 1)
      return true;
    if (!mostPlayed.mostPlayed || mostPlayed.mostPlayed.length < 1) return true;
    return false;
  }

  return (
    <div className="app">
      {loading ? (
        <div className="username-input-container">
          <div className="username-input-card">
            <h1 className="title">🎲 2025 BG Wrapped</h1>
            <p className="subtitle">See your year in board games</p>
            <div className="loading-container">
              <div className="spinner"></div>
              <p className="loading-text">Fetching your plays from BGG...</p>
              <p className="loading-subtext">This may take a while</p>
            </div>
            {/* Optionally show error here if needed */}
          </div>
        </div>
      ) : !data ? (
        <UsernameInput
          onSubmit={handleFetchData}
          loading={loading}
          error={error}
          excludeBGA={excludeBGA}
        />
      ) : isStatsEmpty(data.stats, data.mostPlayed) ? (
        <div className="no-plays-message">
          <h2>No plays found for this user.</h2>
          <p>
            If you just entered your username, please wait a moment and refresh.
            If you have plays on BGG, they will appear once loaded.
          </p>
          <button onClick={() => handleFetchData(username)}>Retry</button>
        </div>
      ) : (
        <WrappedCards username={username} data={data} onReset={handleReset} />
      )}
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<WrappedPage />} />
      <Route path="/:username" element={<WrappedPage />} />
    </Routes>
  );
}

export default App;
