import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();
  const [monthlyWrapped, setMonthlyWrapped] = useState<{ tracks: any[], artists: any[] } | null>(null);
  const [wrappedToShow, setWrappedToShow] = useState<"current" | "previous" | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [hasSavedWraps, setHasSavedWraps] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const today = new Date();
  const isAfter29th = today.getDate() >= 29;

  const currentMonth = new Date().toISOString().slice(0, 7);

  const monthNames = today.toLocaleString("default", { month: "long" });
  const currentMonthName = today.toLocaleString("default", { month: "long" });
  const previousMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const previousMonthName = previousMonthDate.toLocaleString("default", { month: "long" });

  useEffect(() => {
    if (session) {
      fetch("/api/list-months")
        .then((res) => res.json())
        .then((data) => {
          if (data.months) {
            setAvailableMonths(data.months);
            setHasSavedWraps(data.months.length > 0);
          } else {
            setHasSavedWraps(false);
          }
        });
    }
  }, [session]);

  useEffect(() => {
    setIsSaved(false);
  }, [selectedMonth, monthlyWrapped]);

  const fetchWrapped = async () => {
    if (!selectedMonth) return;

    const todayKey = new Date().toISOString().slice(0, 7);
    const todayDate = new Date();
    const isSelectedCurrentMonth = selectedMonth === todayKey;
    const isBefore29th = todayDate.getDate() < 29;

    if (isSelectedCurrentMonth && isBefore29th) {
      // Only fetch short-term data if it's the current month and before the 29th
      const [tracksRes, artistsRes] = await Promise.all([
        fetch("/api/top-tracks").then(res => res.json()),
        fetch("/api/top-artists").then(res => res.json())
      ]);
      setMonthlyWrapped({
        tracks: tracksRes.items || [],
        artists: artistsRes.items || [],
      });
    } else {
      // Always try to load the saved wrapped from Supabase
      const res = await fetch(`/api/get-monthly-wrapped?month=${selectedMonth}`);
      const data = await res.json();

      if (res.ok) {
        setMonthlyWrapped({
          tracks: data.top_tracks || [],
          artists: data.top_artists || [],
        });
      } else {
        setMonthlyWrapped({ tracks: [], artists: [] });
        setSaveMessage(data.error || "No saved data for that month.");
      }
    }
  };

  useEffect(() => {
    if (session && selectedMonth) {
      fetchWrapped();
    }
  }, [session, selectedMonth]);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(to bottom right, #121212, #1DB95420)",
        color: "white",
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        padding: "0",
        textAlign: "center",
        flexDirection: "column",
      }}
    >
      {!session ? (
        <>
          <h1 style={{
            fontWeight: "bold",
            fontSize: "3rem",
            marginBottom: "1rem",
            animation: "fadeIn 1s ease-in",
            animationDelay: "0s",
            animationFillMode: "both",
          }}>
            Wrappify
          </h1>
          <p style={{
            fontSize: "1.25rem",
            marginBottom: "2rem",
            maxWidth: "600px",
            animation: "fadeIn 1.5s ease-in",
            animationDelay: "0.5s",
            animationFillMode: "both",
          }}>
            Track your month-to-month listening history.
          </p>
          <button
            onClick={() => signIn("spotify")}
            style={{
              backgroundColor: "#1DB954",
              border: "none",
              borderRadius: "25px",
              color: "black",
              fontWeight: "bold",
              fontSize: "1.25rem",
              padding: "1rem 3rem",
              cursor: "pointer",
              transition: "transform 0.3s ease",
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            Log in with Spotify
          </button>
        </>
      ) : (
        <div
          style={{
            maxWidth: "600px",
            width: "100%",
            backgroundColor: "#181818",
            borderRadius: "8px",
            padding: "2rem",
            color: "white",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            height: "500px",
            textAlign: "center",
            animation: "fadeIn 1s ease-in",
            animationFillMode: "both",
            animationDelay: "0.5s",
          }}
        >
          <p style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "1rem", alignSelf: "center" }}>
            Welcome, {session.user?.name}
          </p>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <div style={{ flex: 1, textAlign: "left" }}>
              <button
                onClick={() => router.push('/saved')}
                style={{
                  backgroundColor: "#1DB954",
                  border: "none",
                  borderRadius: "20px",
                  color: "black",
                  padding: "0.5rem 1.5rem",
                  cursor: "pointer",
                  fontWeight: "bold",
                  transition: "transform 0.3s ease",
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
              >
                View Saved Wraps
              </button>
            </div>

            <div style={{ flex: 1, textAlign: "right" }}>
              <button
                onClick={() => router.push(`/wrapped/${currentMonth}`)}
                style={{
                  backgroundColor: "#1DB954",
                  border: "none",
                  borderRadius: "20px",
                  color: "black",
                  padding: "0.5rem 1.5rem",
                  cursor: "pointer",
                  fontWeight: "bold",
                  transition: "transform 0.3s ease",
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
              >
                View {currentMonthName} Wrapped
              </button>
            </div>
          </div>

          {monthlyWrapped && (monthlyWrapped.tracks.length || monthlyWrapped.artists.length) ? (
            <>
              <h2>
                {wrappedToShow === "current"
                  ? `${currentMonthName} Wrapped`
                  : `${previousMonthName} Wrapped`}
              </h2>

              <h3>Top Tracks</h3>
              <ul>
                {monthlyWrapped.tracks.map((track, i) => (
                  <li key={track.id}>
                    #{i + 1}: {track.name} — {track.artists[0].name}
                  </li>
                ))}
              </ul>

              <h3>Top Artists</h3>
              <ul>
                {monthlyWrapped.artists.map((artist, i) => (
                  <li key={artist.id}>
                    #{i + 1}: {artist.name}
                  </li>
                ))}
              </ul>

              {wrappedToShow === "current" && !isSaved && (
                <div style={{ marginTop: "1rem" }}>
                  <button
                    onClick={saveWrapped}
                    disabled={isSaving}
                    style={{
                      backgroundColor: "#1DB954",
                      border: "none",
                      borderRadius: "25px",
                      color: "black",
                      fontWeight: "bold",
                      fontSize: "1rem",
                      padding: "0.5rem 1.5rem",
                      cursor: isSaving ? "not-allowed" : "pointer",
                      transition: "transform 0.3s ease",
                    }}
                    onMouseEnter={(e) => !isSaving && (e.currentTarget.style.transform = "scale(1.05)")}
                    onMouseLeave={(e) => !isSaving && (e.currentTarget.style.transform = "scale(1)")}
                  >
                    {isSaving ? "Saving..." : "Save This Month's Wrapped"}
                  </button>
                  {saveMessage && <p style={{ marginTop: "0.5rem" }}>{saveMessage}</p>}
                </div>
              )}
            </>
          ) : (
            selectedMonth && (
              <p style={{ fontStyle: "italic", marginTop: "1rem" }}>
                {wrappedToShow === "current"
                  ? `${currentMonthName} Wrapped is unavailable.`
                  : `${previousMonthName} Wrapped is unavailable.`}
              </p>
            )
          )}

          <div style={{ textAlign: "center", marginTop: "auto" }}>
            <button
              onClick={() => signOut()}
              style={{
                backgroundColor: "#1DB954",
                border: "none",
                borderRadius: "25px",
                color: "black",
                fontWeight: "bold",
                fontSize: "1rem",
                padding: "0.5rem 2rem",
                cursor: "pointer",
                transition: "background-color 0.3s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1ed760")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#1DB954")}
            >
              Log out
            </button>
          </div>
        </div>
      )}
    </main>
  );

  async function saveWrapped() {
    if (!monthlyWrapped) return;

    setIsSaving(true);
    setSaveMessage("");

    try {
      const res = await fetch("/api/save-monthly-wrapped", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          month: currentMonth,
          topTracks: monthlyWrapped.tracks,
          topArtists: monthlyWrapped.artists,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSaveMessage("Monthly Wrapped saved successfully!");
        setIsSaved(true);
      } else {
        setSaveMessage("Failed to save: " + data.error);
      }
    } catch (err) {
      setSaveMessage("An error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  }
}