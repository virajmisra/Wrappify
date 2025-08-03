import { useEffect, useState } from "react";
import { useRouter } from "next/router";

interface WrappedItem {
  month: string;
}

export default function SavedWrapped() {
  const router = useRouter();
  const [savedWraps, setSavedWraps] = useState<WrappedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchSavedWraps = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/list-months");
      if (!res.ok) throw new Error("Failed to load saved wraps");
      const data = await res.json();
      // Sort descending by month
      const sorted = data.months.sort((a: string, b: string) => (a > b ? -1 : 1));
      setSavedWraps(sorted.map((m: string) => ({ month: m })));
    } catch (err: any) {
      setError(err.message || "Error loading saved wraps");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedWraps();
  }, []);

  return (
    <div style={{
      background: "linear-gradient(to bottom right, #121212, #1DB95420)",
      color: "white",
      minHeight: "100vh",
      padding: "2rem",
      fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    }}>
      <div style={{
        animation: "fadeIn 1s ease forwards",
        animationDelay: "0s",
        opacity: 0
      }}>
        <h1 style={{ color: "#1DB954", marginBottom: "1.5rem" }}>Saved Wraps</h1>
      </div>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "#1DB954" }}>{success}</p>}
      {!loading && savedWraps.length === 0 && (
        <p style={{
          color: "#1DB954",
          animation: "fadeIn 1s ease forwards",
          animationDelay: "0.5s",
          opacity: 0
        }}>
          No saved wraps found - save them to view here.
        </p>
      )}

      <ul style={{ listStyle: "none", paddingLeft: 0 }}>
        {savedWraps.map(({ month }, index) => {
          const [year, monthNum] = month.split("-");
          const date = new Date(Number(year), Number(monthNum) - 1);
          const monthName = date.toLocaleString("default", { month: "long", year: "numeric" });
          return (
            <li
              key={month}
              style={{
                backgroundColor: "#181818",
                padding: "1rem",
                marginBottom: "1rem",
                borderRadius: "8px",
                cursor: "pointer",
                boxShadow: "0 2px 6px rgba(0,0,0,0.6)",
                transition: "background-color 0.3s",
                userSelect: "none",
                animation: "fadeIn 0.5s ease forwards",
                animationDelay: `${index * 0.5 + 0.5}s`,
                opacity: 0,
              }}
              onClick={() => router.push(`/wrapped/${month}`)}
            >
              <span>{monthName}</span>
            </li>
          );
        })}
      </ul>

      <div style={{
        position: "fixed",
        bottom: "2rem",
        right: "2rem",
        animation: "fadeIn 1s ease forwards",
        animationDelay: "0s",
        opacity: 0
      }}>
        <a
          href="/"
          style={{
            backgroundColor: "#1DB954",
            borderRadius: "25px",
            color: "black",
            fontWeight: "bold",
            fontSize: "1rem",
            padding: "0.5rem 2rem",
            border: "none",
            cursor: "pointer",
            textDecoration: "none",
            transition: "transform 0.3s ease",
            display: "inline-block",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          ← Home
        </a>
      </div>
    </div>
  );
}