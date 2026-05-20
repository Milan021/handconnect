"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import Link from "next/link";
import ChatWidget from "../../components/ChatWidget";

const C = {
  primary: "#1D4ED8", primaryLight: "#3B82F6", primaryDark: "#1E3A8A",
  accent: "#DC2626", accentLight: "#F87171",
  bg: "#0A0E1A", bgCard: "rgba(255,255,255,0.03)", bgHover: "rgba(255,255,255,0.07)",
  surface: "#111827", border: "rgba(255,255,255,0.08)",
  text: "#F1F5F9", muted: "rgba(255,255,255,0.5)", dim: "rgba(255,255,255,0.3)",
  green: "#10B981", gold: "#FBBF24",
};

export default function CoachingPage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mentors, setMentors] = useState([]);
  const [myMentorships, setMyMentorships] = useState([]);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [requestMsg, setRequestMsg] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    async function init() {
      const { data: { user: u } } = await supabase.auth.getUser();
      if (!u) { window.location.href = "/login"; return; }
      setUser(u);
      const { data: p } = await supabase.from("profiles").select("*").eq("id", u.id).single();
      setProfile(p || {});
      setLoading(false);
    }
    init();
  }, []);

  useEffect(() => {
    if (!user) return;
    async function loadMentors() {
      const { data } = await supabase
        .from("mentors")
        .select("*, profiles(first_name,last_name,current_league,bio_reconversion,avatar_url)")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      setMentors(data || []);
    }
    loadMentors();

    async function loadMyMentorships() {
      const { data } = await supabase
        .from("mentorship_requests")
        .select("*, mentors(profile_id, expertise, profiles(first_name,last_name))")
        .eq("mentee_id", user.id)
        .order("created_at", { ascending: false });
      setMyMentorships(data || []);
    }
    loadMyMentorships();
  }, [user]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3500); };

  const requestMentorship = async () => {
    if (!selectedMentor) return;
    const { error } = await supabase.from("mentorship_requests").insert({
      mentor_id: selectedMentor.id,
      mentee_id: user.id,
      message: requestMsg.trim() || null,
    });
    if (error) { showToast("❌ " + error.message); return; }
    setSelectedMentor(null);
    setRequestMsg("");
    showToast("✅ Demande envoyée !");
    const { data } = await supabase
      .from("mentorship_requests")
      .select("*, mentors(profile_id, expertise, profiles(first_name,last_name))")
      .eq("mentee_id", user.id)
      .order("created_at", { ascending: false });
    setMyMentorships(data || []);
  };

  const handleLogout = async () => { await supabase.auth.signOut(); window.location.href = "/login"; };

  if (loading) return <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", color: C.dim }}>Chargement...</div>;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'DM Sans', sans-serif" }}>
      {toast && <div style={{ position: "fixed", top: 24, right: 24, padding: "14px 22px", borderRadius: 14, zIndex: 9999, background: toast.startsWith("❌") ? "rgba(239,68,68,0.15)" : "rgba(16,185,129,0.15)", backdropFilter: "blur(20px)", border: `1px solid ${toast.startsWith("❌") ? "rgba(239,68,68,0.3)" : "rgba(16,185,129,0.3)"}`, color: toast.startsWith("❌") ? "#FCA5A5" : "#6EE7B7", fontSize: 13, fontWeight: 600 }}>{toast}</div>}

      <header style={{ background: "rgba(10,14,26,0.9)", backdropFilter: "blur(20px)", borderBottom: `1px solid ${C.border}`, padding: "0 24px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🤾</div>
            <h1 style={{ fontSize: 22, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 3, color: "#fff", lineHeight: 1, margin: 0 }}>HANDBALL<span style={{ color: C.primary }}>CONNECT</span></h1>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Link href="/pro" style={{ padding: "8px 16px", borderRadius: 10, border: `1px solid ${C.border}`, color: C.muted, textDecoration: "none", fontSize: 12, fontWeight: 600 }}>← Mon espace</Link>
            <button onClick={handleLogout} style={{ padding: "8px 14px", borderRadius: 10, border: "1px solid rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.08)", color: "#EF4444", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>🚪 Déconnexion</button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 32, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 2, color: "#fff", margin: "0 0 8px" }}>
            COACHING <span style={{ color: C.primary }}>& MENTORAT</span>
          </h2>
          <p style={{ fontSize: 14, color: C.muted, margin: 0 }}>
            Des anciens handballeurs reconvertis vous accompagnent dans votre transition professionnelle.
          </p>
        </div>

        {/* My mentorships */}
        {myMentorships.length > 0 && (
          <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20, marginBottom: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text, margin: "0 0 12px" }}>Mes mentorats</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {myMentorships.map(m => {
                const statusColor = { pending: C.gold, accepted: C.green, rejected: C.accent, completed: C.dim }[m.status] || C.dim;
                return (
                  <div key={m.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "rgba(255,255,255,0.02)", borderRadius: 10, border: `1px solid ${C.border}` }}>
                    <div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{m.mentors?.profiles?.first_name} {m.mentors?.profiles?.last_name}</span>
                      <span style={{ fontSize: 11, color: C.dim, marginLeft: 8 }}>{m.mentors?.expertise?.join(", ")}</span>
                    </div>
                    <span style={{ padding: "3px 10px", borderRadius: 6, background: `${statusColor}12`, color: statusColor, fontSize: 10, fontWeight: 700, border: `1px solid ${statusColor}30`, textTransform: "uppercase" }}>{m.status}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Mentors grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {mentors.length === 0 && <p style={{ color: C.dim }}>Aucun mentor disponible pour le moment.</p>}
          {mentors.map(m => {
            const p = m.profiles;
            const alreadyRequested = myMentorships.some(req => req.mentor_id === m.id);
            return (
              <div key={m.id} style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20, transition: "all .25s" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🎓</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{p?.first_name} {p?.last_name}</div>
                    <div style={{ fontSize: 11, color: C.dim }}>{p?.current_league?.toUpperCase()} · {m.availability}</div>
                  </div>
                </div>
                {m.bio && <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.6, margin: "0 0 12px" }}>{m.bio}</p>}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
                  {m.expertise?.map((e, i) => (
                    <span key={i} style={{ padding: "3px 10px", background: `${C.primary}12`, border: `1px solid ${C.primary}25`, borderRadius: 6, fontSize: 10, color: C.primaryLight, fontWeight: 600 }}>{e}</span>
                  ))}
                </div>
                <button
                  onClick={() => setSelectedMentor(m)}
                  disabled={alreadyRequested}
                  style={{
                    width: "100%",
                    padding: "10px 0",
                    borderRadius: 10,
                    border: "none",
                    background: alreadyRequested ? "rgba(255,255,255,0.04)" : `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`,
                    color: alreadyRequested ? C.dim : "#fff",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: alreadyRequested ? "default" : "pointer",
                  }}
                >
                  {alreadyRequested ? "Demande envoyée" : "Demander un mentorat"}
                </button>
              </div>
            );
          })}
        </div>
      </main>

      {/* Request modal */}
      {selectedMentor && (
        <div onClick={() => setSelectedMentor(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: C.surface, borderRadius: 20, maxWidth: 440, width: "100%", border: `1px solid ${C.border}`, padding: 28 }}>
            <h3 style={{ fontSize: 18, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 2, color: "#fff", margin: "0 0 8px" }}>DEMANDE DE MENTORAT</h3>
            <p style={{ fontSize: 13, color: C.muted, margin: "0 0 16px" }}>
              Auprès de {selectedMentor.profiles?.first_name} {selectedMentor.profiles?.last_name}
            </p>
            <textarea
              value={requestMsg}
              onChange={e => setRequestMsg(e.target.value)}
              placeholder="Présentez-vous et expliquez ce que vous attendez du mentorat..."
              rows={4}
              style={{ width: "100%", padding: "12px 16px", background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, borderRadius: 12, color: C.text, fontSize: 13, fontFamily: "inherit", outline: "none", resize: "vertical", lineHeight: 1.6, boxSizing: "border-box", marginBottom: 16 }}
            />
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setSelectedMentor(null)} style={{ padding: "10px 18px", borderRadius: 10, border: `1px solid ${C.border}`, background: "transparent", color: C.dim, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Annuler</button>
              <button onClick={requestMentorship} style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Envoyer</button>
            </div>
          </div>
        </div>
      )}

      <ChatWidget user={user} />
      <div style={{ textAlign: "center", padding: "32px 0 16px", fontSize: 10, color: "rgba(255,255,255,0.12)" }}>
        HANDBALL CONNECT — Coaching — {new Date().getFullYear()}
      </div>
    </div>
  );
}
