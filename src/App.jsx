import { useState } from "react";
import "./App.css";
import UsernameInput from "./components/UsernameInput";
import WrappedCards from "./components/WrappedCards";

function App() {
  const [username, setUsername] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFetchData = async (user, excludeBGA = false) => {
    setLoading(true);
    setError("");
    setUsername(user);

    try {
      // First, fetch plays data to populate the database
      const excludeParam = excludeBGA ? "?excludeBGA=true" : "";
      const playsRes = await fetch(
        `https://bgg-app-backend-1.onrender.com/api/plays/${user}${excludeParam}`
      );

      if (!playsRes.ok) {
        throw new Error("Failed to fetch plays data from BGG");
      }

      await playsRes.json();

      // Then fetch both stats and most played data
      const [statsRes, mostPlayedRes] = await Promise.all([
        fetch(
          `https://bgg-app-backend-1.onrender.com/api/analytics/${user}/stats${excludeParam}`
        ),
        fetch(
          `https://bgg-app-backend-1.onrender.com/api/analytics/${user}/most-played${excludeParam}`
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
        err.message || "Failed to fetch data. Make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setUsername("");
    setData(null);
    setError("");
  };

  return (
    <div className="app">
      {!data ? (
        <UsernameInput
          onSubmit={handleFetchData}
          loading={loading}
          error={error}
        />
      ) : (
        <WrappedCards username={username} data={data} onReset={handleReset} />
      )}
    </div>
  );
}

export default App;
