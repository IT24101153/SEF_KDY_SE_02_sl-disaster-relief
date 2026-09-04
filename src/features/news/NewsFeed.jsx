// NewsFeed.jsx
// Public news + emergency feed. No login required.
// Reads live from Firestore "news" collection, newest first.
// Also exports <EmergencyBanner /> alone so Member A can drop it on the landing page.

import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";
import "./news.css";

function formatDate(timestamp) {
  if (!timestamp?.toDate) return "";
  return timestamp.toDate().toLocaleString("en-LK", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function EmergencyBanner({ items }) {
  const latest = items.find((n) => n.category === "emergency");
  if (!latest) return null;
  return (
    <div className="emergency-banner" role="alert">
      <span className="tag">EMERGENCY</span>
      <div className="body">
        <strong>{latest.title}</strong>
        <span>{latest.content.slice(0, 120)}{latest.content.length > 120 ? "…" : ""}</span>
      </div>
    </div>
  );
}

export default function NewsFeed() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "news"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (err) => {
        console.error("News feed failed to load:", err);
        setLoading(false);
      }
    );
    return unsub;
  }, []);

  return (
    <div className="news-wrap">
      <h1 className="news-heading">News & Emergency Alerts</h1>
      <p className="news-subheading">
        The latest verified updates on flooding, landslides and relief efforts across the country.
      </p>

      {!loading && <EmergencyBanner items={items} />}

      {loading && <div className="news-empty">Loading updates…</div>}

      {!loading && items.length === 0 && (
        <div className="news-empty">No news posted yet. Check back soon.</div>
      )}

      {!loading && items.length > 0 && (
        <ul className="news-list">
          {items.map((item) => (
            <li key={item.id} className={`news-item ${item.category === "emergency" ? "emergency" : ""}`}>
              <h3>{item.title}</h3>
              <p>{item.content}</p>
              <div className="meta">
                {item.category === "emergency" ? "Emergency alert" : "News"} · {formatDate(item.createdAt)}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}