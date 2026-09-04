import { useEffect, useState } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase";
import { NEWS } from "../../lib/collections";
import { seedNews } from "../../lib/seedData";
import "./news.css";

const emptyForm = { title: "", content: "", category: "news" };

export default function NewsManagerDashboard({ currentUser }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedNotice, setSeedNotice] = useState("");

  async function handleSeed() {
    setSeeding(true);
    setSeedNotice("");
    try {
      const { seeded, skipped } = await seedNews(currentUser?.uid);
      setSeedNotice(
        skipped
          ? "Sample news skipped — posts already exist."
          : `Added ${seeded} sample posts.`,
      );
    } catch {
      setSeedNotice("Could not add sample news. Please try again.");
    } finally {
      setSeeding(false);
    }
  }

  useEffect(() => {
    const q = query(collection(db, NEWS), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  function validate(values) {
    const next = {};
    if (!values.title.trim()) next.title = "Add a title before posting.";
    else if (values.title.trim().length > 100) next.title = "Keep the title under 100 characters.";
    if (!values.content.trim()) next.content = "Write the update — this field can't be empty.";
    return next;
  }

  function startEdit(item) {
    setEditingId(item.id);
    setForm({ title: item.title, content: item.content, category: item.category });
    setErrors({});
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setErrors({});
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validation = validate(form);
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    setSubmitting(true);
    try {
      if (editingId) {
        await updateDoc(doc(db, NEWS, editingId), {
          title: form.title.trim(),
          content: form.content.trim(),
          category: form.category,
        });
      } else {
        await addDoc(collection(db, NEWS), {
          title: form.title.trim(),
          content: form.content.trim(),
          category: form.category,
          postedBy: currentUser?.uid ?? "unknown",
          createdAt: serverTimestamp(),
        });
      }
      cancelEdit();
    } catch (err) {
      console.error("Failed to save news item:", err);
      setErrors({ submit: "Couldn't save this post — check your connection and try again." });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Remove this post? This can't be undone.")) return;
    try {
      await deleteDoc(doc(db, NEWS, id));
    } catch (err) {
      console.error("Failed to delete news item:", err);
    }
  }

  return (
    <div className="news-wrap">
      <h1 className="news-heading">News Manager</h1>
      <p className="news-subheading">
        Post news and emergency alerts. Anything you publish here appears on the public feed immediately.
      </p>

      <form className="manager-panel" onSubmit={handleSubmit} noValidate>
        <h2>{editingId ? "Edit post" : "New post"}</h2>

        <div className="field">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Kelani river levels rising near Kaduwela"
          />
          {errors.title && <div className="field-error">{errors.title}</div>}
        </div>

        <div className="field">
          <label htmlFor="content">Details</label>
          <textarea
            id="content"
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            placeholder="What's happening, where, and what people should do."
          />
          {errors.content && <div className="field-error">{errors.content}</div>}
        </div>

        <div className="field">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            <option value="news">News</option>
            <option value="emergency">Emergency alert</option>
          </select>
        </div>

        {errors.submit && <div className="field-error">{errors.submit}</div>}

        <div className="form-actions" style={{ justifyContent: "flex-start", gap: "0.6rem" }}>
          <button className="btn-primary" type="submit" disabled={submitting}>
            {submitting ? "Saving…" : editingId ? "Save changes" : "Publish post"}
          </button>
          {editingId && (
            <button type="button" className="btn-ghost" onClick={cancelEdit}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="card-head card-head-row">
        <h2>Published posts</h2>
        <button type="button" className="btn-ghost" onClick={handleSeed} disabled={seeding}>
          {seeding ? "Adding…" : "Seed Sample News"}
        </button>
      </div>

      {seedNotice && <p className="news-subheading">{seedNotice}</p>}

      {loading && <div className="news-empty">Loading…</div>}
      {!loading && items.length === 0 && <div className="news-empty">Nothing posted yet.</div>}

      {!loading && items.length > 0 && (
        <ul className="news-list">
          {items.map((item) => (
            <li key={item.id} className={`news-item ${item.category === "emergency" ? "emergency" : ""}`}>
              <h3>{item.title}</h3>
              <p>{item.content}</p>
              <div className="meta">{item.category === "emergency" ? "Emergency alert" : "News"}</div>
              <div className="manager-item-actions">
                <button className="btn-ghost" onClick={() => startEdit(item)}>Edit</button>
                <button className="btn-danger" onClick={() => handleDelete(item.id)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}