import { useState } from "react";
import API from "../api/api";
import Navbar from "../components/Navbar";

export default function Home() {
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleShorten = async () => {
    if (!url) {
      alert("Please enter a URL");
      return;
    }

    try {
      setLoading(true);

      const res = await API.post("/shorten", {
        original_url: url,
      });

      setShortUrl(res.data.short_url);
      setUrl("");
    } catch (err) {
      console.error(err);
      alert("Error shortening URL");
    } finally {
      setLoading(false);
    }
  };

  return (
    
    <>
      <Navbar onSearch={() => {}} />

      <div
        style={{
          marginTop: "60px",
          padding: "40px",
          textAlign: "center",
        }}
      >
        <h1>Shorten Your URL in Seconds 🚀</h1>

        {/* INPUT */}
        <div style={{ marginTop: "30px" }}>
          <input
            type="text"
            placeholder="Enter your long URL..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            style={{
              width: "300px",
              padding: "10px",
              borderRadius: "5px",
              marginRight: "10px",
            }}
          />

          <button onClick={handleShorten}>
            {loading ? "Shortening..." : "Shorten"}
          </button>
        </div>

        {/* RESULT */}
        {shortUrl && (
          <div style={{ marginTop: "30px" }}>
            <h3>Your Short URL:</h3>

            <a
              href={shortUrl}
              target="_blank"
              rel="noreferrer"
              style={{ color: "blue" }}
            >
              {shortUrl}
            </a>

            <br />
            <br />

            <button
              onClick={() => {
                navigator.clipboard.writeText(shortUrl);
                alert("Copied!");
              }}
            >
              Copy
            </button>
          </div>
        )}
      </div>
    </>
  );
}
