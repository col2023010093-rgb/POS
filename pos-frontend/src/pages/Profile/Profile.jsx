import { useEffect, useState } from "react";
import axios from "axios";
import './Profile.css';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get("http://localhost:4000/api/profile");
        setProfile(res.data);
        setForm({ name: res.data.name, email: res.data.email });
      } catch (err) {
        setError("Failed to load profile.");
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async e => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await axios.put("http://localhost:4000/api/profile", form);
      setProfile(res.data);
      setEdit(false);
    } catch (err) {
      setError("Failed to update profile.");
    }
    setSaving(false);
  };

  if (loading) return <div className="profile-container"><div className="profile-loading">Loading...</div></div>;

  return (
    <div className="profile-container">
      <h1 className="profile-title">My Profile</h1>
      {error && <div className="profile-error">{error}</div>}
      {!edit ? (
        <div className="profile-details">
          <div>
            <span className="profile-label">Name:</span>
            <span className="profile-value">{profile?.name}</span>
          </div>
          <div>
            <span className="profile-label">Email:</span>
            <span className="profile-value">{profile?.email}</span>
          </div>
          <button className="profile-btn" onClick={() => setEdit(true)}>Edit Profile</button>
        </div>
      ) : (
        <form className="profile-form" onSubmit={handleSave}>
          <div>
            <label className="profile-label">Name:</label>
            <input
              className="profile-input"
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="profile-label">Email:</label>
            <input
              className="profile-input"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="profile-actions">
            <button className="profile-btn" type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </button>
            <button className="profile-btn profile-btn-cancel" type="button" onClick={() => setEdit(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}