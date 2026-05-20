"use client";
import { useState } from "react";
import { supabase } from "../lib/supabase";

const C = {
  primary: "#1D4ED8", primaryLight: "#3B82F6", primaryDark: "#1E3A8A",
  accent: "#DC2626", accentLight: "#F87171",
  bg: "#0A0E1A", bgCard: "rgba(255,255,255,0.03)",
  surface: "#111827", border: "rgba(255,255,255,0.08)",
  text: "#F1F5F9", muted: "rgba(255,255,255,0.5)", dim: "rgba(255,255,255,0.3)",
  green: "#10B981", gold: "#FBBF24",
};

export default function BetaFeedback({ user, onClose }) {
  const [form, setForm] = useState({ type: "ux", category: "", rating: 0, message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");

  const submit = async () => {
    setErr("");
    if (!form.message.trim()) { setErr("Veuillez écrire un message."); return; }
    setSubmitting(true);
    const { error } = await supabase.from("beta_feedback").insert({
      user_id: user?.id || null,
      email: user?.email || null,
      type: form.type,
      category: form.category || null,
      rating: form.rating || null,
      message: form.message.trim(),
    });
    setSubmitting(false);
    if (error) { setErr(error.message); return; }
    setSent(true);
  };

  const inpS = { width: "100%", padding: "12px 16px", background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, borderRadius: 12, color: C.text, fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: C.surface, borderRadius: 20, maxWidth: 460, width: "100%", border: `1px solid ${C.border}`, padding: 28 }}>
        {sent ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🙏</div>
            <h3 style={{ fontSize: 18, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 2, color: "#fff", margin: "0 0 8px" }}>MERCI !</h3>
            <p style={{ fontSize: 13, color: C.muted }}>Votre feedback aide à améliorer Handball Connect.</p>
            <button onClick={onClose} style={{ marginTop: 16, padding: "10px 24px", borderRadius: 10, border: "none", background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Fermer</button>
          </div>
        ) : (
          <>
            <h3 style={{ fontSize: 18, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 2, color: "#fff", margin: "0 0 16px" }}>💬 VOTRE AVIS COMPTE</h3>

            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 10, color: C.dim, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600, marginBottom: 6, display: "block" }}>Type</label>
              <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} style={{ ...inpS, cursor: "pointer" }}>
                <option value="ux">Expérience utilisateur</option>
                <option value="bug">Bug / Problème technique</option>
                <option value="feature">Idée de fonctionnalité</option>
                <option value="performance">Performance</option>
                <option value="other">Autre</option>
              </select>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 10, color: C.dim, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600, marginBottom: 6, display: "block" }}>Note (optionnel)</label>
              <div style={{ display: "flex", gap: 6 }}>
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} onClick={() => setForm(p => ({ ...p, rating: n }))} style={{ width: 36, height: 36, borderRadius: "50%", border: `1px solid ${form.rating >= n ? `${C.gold}60` : C.border}`, background: form.rating >= n ? `${C.gold}18` : "rgba(255,255,255,0.02)", color: form.rating >= n ? C.gold : C.dim, fontSize: 16, cursor: "pointer" }}>★</button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 10, color: C.dim, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600, marginBottom: 6, display: "block" }}>Message</label>
              <textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} placeholder="Décrivez votre expérience, un bug, ou une idée..." rows={4} style={{ ...inpS, resize: "vertical", lineHeight: 1.6 }} />
            </div>

            {err && <div style={{ padding: "10px 14px", background: `${C.accent}10`, border: `1px solid ${C.accent}30`, borderRadius: 10, color: C.accent, fontSize: 12, marginBottom: 12 }}>{err}</div>}

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={onClose} style={{ padding: "10px 18px", borderRadius: 10, border: `1px solid ${C.border}`, background: "transparent", color: C.dim, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Annuler</button>
              <button onClick={submit} disabled={submitting} style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`, color: "#fff", fontSize: 12, fontWeight: 700, cursor: submitting ? "wait" : "pointer" }}>Envoyer</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
