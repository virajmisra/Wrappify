import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function WrappedPage() {
  const router = useRouter();
  const { month } = router.query;
  const [wrappedData, setWrappedData] = useState<{ tracks: any[], artists: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveMessage, setSaveMessage] = useState("");
  const [showSaveButton, setShowSaveButton] = useState(true);
  const [wrapAvailable, setWrapAvailable] = useState(true);

  useEffect(() => {
    if (!month) return;

    const today = new Date();
    const currentMonth = today.toISOString().slice(0, 7);
    // const isCurrentMonth = month === currentMonth;
    // const isBefore29th = today.getDate() < 29;

    // if (isCurrentMonth && isBefore29th) {
    //   setWrapAvailable(false);
    //   setLoading(false);
    //   return;
    // } else {
    //   setWrapAvailable(true);
    // }
    setWrapAvailable(true);

    if (month === today.toISOString().slice(0, 7)) {
      // TEMP: fetch live short term data for testing
      Promise.all([
        fetch("/api/top-tracks").then(res => res.json()),
        fetch("/api/top-artists").then(res => res.json()),
      ]).then(([tracksRes, artistsRes]) => {
        setWrappedData({
          tracks: tracksRes.items || [],
          artists: artistsRes.items || [],
        });
        setLoading(false);
      });

      // Check if already saved this month
      fetch(`/api/get-monthly-wrapped?month=${month}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.top_tracks && data.top_tracks.length > 0) {
            setSaveMessage("Saved");
          }
        })
        .catch(() => { /* ignore errors */ });
    } else {
      fetch(`/api/get-monthly-wrapped?month=${month}`)
        .then(res => res.json())
        .then(data => {
          setWrappedData({
            tracks: data.top_tracks || [],
            artists: data.top_artists || [],
          });
          setLoading(false);
        });
    }
  }, [month]);

  const saveWrapped = async () => {
    if (!wrappedData || !month) return;
    setSaveMessage("Saving...");

    try {
      const res = await fetch("/api/save-monthly-wrapped", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          month,
          top_tracks: wrappedData.tracks,
          top_artists: wrappedData.artists,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSaveMessage("Saved!");
        setTimeout(() => {
          setSaveMessage("");
          setShowSaveButton(false);
        }, 3000);
      } else {
        setSaveMessage(data.error || "Failed to save wrapped.");
      }
    } catch (err) {
      setSaveMessage("Something went wrong.");
    }
  };

  if (loading) {
    return (
      <div style={{ height: "100vh", backgroundColor: "#121212", color: "white", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <h2>Loading your Wrapped...</h2>
      </div>
    );
  }

  // if (!wrapAvailable) {
  //   return (
  //     <div style={{ height: "100vh", backgroundColor: "#121212", color: "white", display: "flex", justifyContent: "center", alignItems: "center", padding: "2rem", textAlign: "center" }}>
  //       <h2>This month's Wrapped will be available on the 29th.</h2>
  //     </div>
  //   );
  // }

  if (!wrappedData) {
    return <p>Unable to load wrapped data.</p>;
  }

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        backgroundColor: "#121212",
        color: "white",
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        overflow: "hidden",
        position: "relative"
      }}
    >
      <div style={{ flex: 1, padding: "2rem", overflowY: "auto", borderRight: "1px solid #333" }}>
        <h2
          style={{
            color: "#1DB954",
            marginBottom: "1.5rem",
            animation: "fadeIn 1s ease forwards",
            animationDelay: "0s",
          }}
        >
          Top Tracks
        </h2>
        <ol style={{ paddingLeft: "1.5rem" }}>
          {wrappedData.tracks.map((track, index) => (
            <li key={track.id} style={{
  marginBottom: "1.2rem",
  backgroundColor: "#1a1a1a",
  padding: "1rem",
  borderRadius: "8px",
  boxShadow: "0 0 5px rgba(0,0,0,0.2)",
  animation: "fadeIn 0.5s ease forwards",
  animationDelay: `${0.5 * index + 1}s`,
  opacity: 0,
  display: "flex",
  alignItems: "center",
  gap: "1rem"
}}>
  {track.album?.images?.[0]?.url && (
    <img
      src={track.album.images[0].url}
      alt={track.name}
      style={{ width: "48px", height: "48px", borderRadius: "8px", objectFit: "cover" }}
    />
  )}
  <div>
    <div style={{ fontWeight: "bold" }}>{track.name}</div>
    <div style={{ color: "#aaa" }}>{track.artists[0].name}</div>
  </div>
</li>
          ))}
        </ol>
      </div>

      <div style={{ flex: 1, padding: "2rem", overflowY: "auto" }}>
        <h2
          style={{
            color: "#1DB954",
            marginBottom: "1.5rem",
            animation: "fadeIn 1s ease forwards",
            animationDelay: "0s",
          }}
        >
          Top Artists
        </h2>
        <ol style={{ paddingLeft: "1.5rem" }}>
          {wrappedData.artists.map((artist, index) => (
            <li key={artist.id} style={{
              marginBottom: "1.2rem",
              backgroundColor: "#1a1a1a",
              padding: "1rem",
              borderRadius: "8px",
              boxShadow: "0 0 5px rgba(0,0,0,0.2)",
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              animation: "fadeIn 0.5s ease forwards",
              animationDelay: `${0.5 * index + 1 + wrappedData.tracks.length * 0.5}s`,
              opacity: 0,
            }}>
              <div style={{ fontWeight: "bold", minWidth: "24px", textAlign: "right" }}>
                {index + 1}.
              </div>
              {artist.images?.[0]?.url && (
                <img
                  src={artist.images[0].url}
                  alt={artist.name}
                  style={{ width: "48px", height: "48px", borderRadius: "50%", objectFit: "cover" }}
                />
              )}
              <div>
                <div style={{ fontWeight: "bold" }}>{artist.name}</div>
              </div>
            </li>
          ))}
        </ol>

        {wrappedData && (
          <div
            style={{
              marginTop: "2rem",
              display: "flex",
              gap: "1rem",
              animation: "fadeIn 0.5s ease forwards",
              animationDelay: `${1 + 0.5 * wrappedData.tracks.length + 0.5 * (wrappedData.artists.length - 1) + 0.3}s`,
              opacity: 0,
            }}
          >
            <Link
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
            </Link>

            {month === new Date().toISOString().slice(0, 7) && showSaveButton && wrapAvailable && (
              <button
                onClick={saveWrapped}
                disabled={saveMessage === "Saving..."}
                style={{
                  backgroundColor: saveMessage === "Saved" ? "#444" : "#1DB954",
                  border: "none",
                  borderRadius: "25px",
                  color: "black",
                  fontWeight: "bold",
                  fontSize: "1rem",
                  padding: "0.5rem 2rem",
                  cursor: saveMessage === "Saved" ? "default" : "pointer",
                  transition: "background-color 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  if (saveMessage !== "Saved") e.currentTarget.style.backgroundColor = "#1ed760";
                }}
                onMouseLeave={(e) => {
                  if (saveMessage !== "Saved") e.currentTarget.style.backgroundColor = "#1DB954";
                }}
              >
                {saveMessage || "Save This Month's Wrapped"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}