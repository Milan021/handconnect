"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { TRAINING_CENTERS, CENTER_TYPE_META, SECTION_SPORTIVE_META, getCenterById } from "../../lib/training-centers";
import { REGIONS, getRegionLabel } from "../../lib/regions";
import useIsMobile from "../../lib/useIsMobile";

const FONT_LINK = "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap";

const C = {
  primary: "#1D4ED8", primaryLight: "#3B82F6", primaryDark: "#1E3A8A",
  accent: "#DC2626", bg: "#0A0E1A", text: "#F1F5F9",
  muted: "rgba(255,255,255,0.5)", dim: "rgba(255,255,255,0.3)",
  border: "rgba(255,255,255,0.06)", green: "#10B981", gold: "#FBBF24",
};

const POSITIONS = [
  { value: "", label: "— Choisir —" },
  { value: "gardien", label: "Gardien" },
  { value: "ailier_gauche", label: "Ailier gauche" },
  { value: "ailier_droit", label: "Ailier droit" },
  { value: "arriere_gauche", label: "Arrière gauche" },
  { value: "arriere_droit", label: "Arrière droit" },
  { value: "demi_centre", label: "Demi-centre" },
  { value: "pivot", label: "Pivot" },
];

const LEVELS = [
  { value: "", label: "— Choisir —" },
  { value: "departemental", label: "Départemental" },
  { value: "regional", label: "Régional" },
  { value: "pre_nationale", label: "Pré-Nationale" },
  { value: "n3", label: "Nationale 3" },
  { value: "n2", label: "Nationale 2" },
  { value: "n1", label: "Nationale 1" },
  { value: "proligue", label: "Proligue" },
  { value: "starligue", label: "Starligue" },
  { value: "d2f", label: "D2 Féminine" },
  { value: "d1f", label: "D1 Féminine" },
  { value: "lnh", label: "LNH / Équipe de France" },
];

const DIVISIONS_MAP = {
  departemental: "Départemental", regional: "Régional", pre_nationale: "Pré-Nationale",
  n3: "N3", n2: "N2", n1: "N1", proligue: "Proligue", starligue: "Starligue",
  d2f: "D2 Féminine", d1f: "D1 Féminine",
};

const inpStyle = {
  width: "100%", padding: "12px 16px", background: "rgba(255,255,255,0.04)",
  border: `1px solid ${C.border}`, borderRadius: 12, color: C.text,
  fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: "none",
  boxSizing: "border-box", transition: "border-color .2s",
};
const selStyle = { ...inpStyle, appearance: "none", cursor: "pointer" };
const labelStyle = {
  fontSize: 10, color: C.dim, textTransform: "uppercase",
  letterSpacing: 1.5, fontWeight: 600, marginBottom: 6, display: "block",
};

export default function AnnoncesPage() {
  const isMobile = useIsMobile();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [tab, setTab] = useState("annonces");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  // Annonces state
  const [annonces, setAnnonces] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [filter, setFilter] = useState("all");
  const [applying, setApplying] = useState(null);
  const [applyMsg, setApplyMsg] = useState("");
  const [applyLoading, setApplyLoading] = useState(false);

  // Profile state
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});
  const [cvUploading, setCvUploading] = useState(false);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3500); };

  useEffect(() => {
    const init = async () => {
      const { data: { user: u } } = await supabase.auth.getUser();
      if (!u) { window.location.href = "/login"; return; }

      const { data: prof } = await supabase.from("profiles").select("*").eq("id", u.id).single();
      if (prof?.user_type === "club") { window.location.href = "/dashboard"; return; }

      setUser(u);
      setProfile(prof);
      setForm(prof || {});

      const [{ data: annoncesData }, { data: appsData }] = await Promise.all([
        supabase.from("annonces").select("*").order("created_at", { ascending: false }),
        supabase.from("applications").select("annonce_id, status").eq("applicant_id", u.id),
      ]);
      setAnnonces(annoncesData || []);
      setMyApplications(appsData || []);
      setLoading(false);
    };
    init();
  }, []);

  const handleLogout = async () => { await supabase.auth.signOut(); window.location.href = "/login"; };

  // ── Apply ────────────────────────────────────────────────
  const apply = async (annonceId) => {
    setApplyLoading(true);
    const { error } = await supabase.from("applications").insert({
      annonce_id: annonceId,
      applicant_id: user.id,
      message: applyMsg.trim() || null,
      cv_url: profile?.cv_url || null,
      cv_filename: profile?.cv_filename || null,
    });
    if (error) {
      showToast("❌ " + error.message);
    } else {
      setMyApplications(prev => [...prev, { annonce_id: annonceId, status: "pending" }]);
      setApplying(null);
      setApplyMsg("");
      showToast("✅ Candidature envoyée !");
      fetch("/api/notify-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ annonce_id: annonceId, applicant_id: user.id }),
      }).catch(err => console.warn("Notification email non envoyée:", err));
    }
    setApplyLoading(false);
  };

  // ── Save profile ─────────────────────────────────────────
  const saveProfile = async () => {
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      first_name: form.first_name, last_name: form.last_name,
      height_cm: form.height_cm ? parseInt(form.height_cm) : null,
      weight_kg: form.weight_kg ? parseInt(form.weight_kg) : null,
      age: form.age ? parseInt(form.age) : null,
      position: form.position || null, hand_side: form.hand_side || null,
      best_level: form.best_level || null, current_level: form.current_level || null,
      current_club: form.current_club || null, city: form.city || null,
      training_center: form.training_center || null,
      is_section_sportive: !!form.is_section_sportive,
      region: form.region || null,
      mobile_other_regions: !!form.mobile_other_regions,
      phone: form.phone || null, bio: form.bio || null,
      is_available: form.is_available || false,
    }).eq("id", user.id);
    if (error) {
      showToast("❌ " + error.message);
    } else {
      setProfile({ ...profile, ...form });
      setEditing(false);
      showToast("✅ Profil mis à jour !");
    }
    setSaving(false);
  };

  // ── CV ───────────────────────────────────────────────────
  const uploadCV = async (file) => {
    if (!file) return;
    if (file.type !== "application/pdf") { showToast("❌ Format PDF uniquement"); return; }
    if (file.size > 5 * 1024 * 1024) { showToast("❌ Fichier trop volumineux (max 5 Mo)"); return; }
    setCvUploading(true);
    const path = `${user.id}/cv-${Date.now()}.pdf`;
    const { error: upErr } = await supabase.storage.from("cvs").upload(path, file, { contentType: "application/pdf", upsert: false });
    if (upErr) { showToast("❌ " + upErr.message); setCvUploading(false); return; }
    const { data: pub } = supabase.storage.from("cvs").getPublicUrl(path);
    const updates = { cv_url: pub?.publicUrl, cv_filename: file.name, cv_uploaded_at: new Date().toISOString() };
    const { error: dbErr } = await supabase.from("profiles").update(updates).eq("id", user.id);
    if (dbErr) { showToast("❌ " + dbErr.message); setCvUploading(false); return; }
    setProfile(p => ({ ...p, ...updates }));
    showToast("✅ CV enregistré !");
    setCvUploading(false);
  };

  const deleteCV = async () => {
    if (!profile?.cv_url || !confirm("Supprimer votre CV ?")) return;
    setCvUploading(true);
    const match = profile.cv_url.match(/\/cvs\/(.+)$/);
    if (match) await supabase.storage.from("cvs").remove([match[1]]);
    const { error } = await supabase.from("profiles").update({ cv_url: null, cv_filename: null, cv_uploaded_at: null }).eq("id", user.id);
    if (error) { showToast("❌ " + error.message); setCvUploading(false); return; }
    setProfile(p => ({ ...p, cv_url: null, cv_filename: null, cv_uploaded_at: null }));
    showToast("🗑️ CV supprimé");
    setCvUploading(false);
  };

  const updateField = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const completion = (() => {
    const fields = ["first_name", "last_name", "height_cm", "weight_kg", "age", "position", "hand_side", "best_level", "current_level", "city"];
    const filled = fields.filter(f => profile?.[f] && profile[f] !== "").length;
    return Math.round((filled / fields.length) * 100);
  })();

  if (loading) return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <link href={FONT_LINK} rel="stylesheet" />
      <div style={{ color: C.dim, fontSize: 14, fontFamily: "'DM Sans', sans-serif" }}>Chargement...</div>
    </div>
  );

  const filteredAnnonces = annonces.filter(a => filter === "all" || a.type === filter);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'DM Sans', sans-serif" }}>
      <link href={FONT_LINK} rel="stylesheet" />

      {toast && (
        <div style={{ position: "fixed", top: 24, right: 24, padding: "14px 22px", borderRadius: 14, zIndex: 9999, background: toast.startsWith("❌") ? "rgba(239,68,68,0.15)" : "rgba(16,185,129,0.15)", backdropFilter: "blur(20px)", border: `1px solid ${toast.startsWith("❌") ? "rgba(239,68,68,0.3)" : "rgba(16,185,129,0.3)"}`, color: toast.startsWith("❌") ? "#FCA5A5" : "#6EE7B7", fontSize: 13, fontWeight: 600 }}>
          {toast}
        </div>
      )}

      <style>{`@keyframes slideDown{from{opacity:0;transform:translateY(-12px)}to{opacity:1;transform:translateY(0)}}input:focus,select:focus,textarea:focus{border-color:${C.primary}!important;box-shadow:0 0 0 3px rgba(29,78,216,0.15)!important}`}</style>

      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", background: `radial-gradient(circle, ${C.primary}08 0%, transparent 70%)`, top: -200, right: -100 }} />
        <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: `radial-gradient(circle, ${C.accent}05 0%, transparent 70%)`, bottom: -100, left: -150 }} />
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Header */}
        <header style={{ background: "rgba(10,14,26,0.9)", backdropFilter: "blur(20px)", borderBottom: `1px solid ${C.border}`, padding: isMobile ? "10px 14px" : "0 24px", position: "sticky", top: 0, zIndex: 100 }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexDirection: isMobile ? "column" : "row", gap: isMobile ? 10 : 0, height: isMobile ? "auto" : 64 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, alignSelf: isMobile ? "flex-start" : "auto" }}>
              <div style={{ width: 36, height: 36, borderRadius: 11, background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, boxShadow: `0 4px 16px ${C.primary}30` }}>🤾</div>
              <div>
                <h1 style={{ fontSize: isMobile ? 18 : 22, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: isMobile ? 2 : 3, color: "#fff", lineHeight: 1, margin: 0 }}>HANDBALL<span style={{ color: C.primary }}>CONNECT</span></h1>
                <span style={{ fontSize: 9, color: C.dim, letterSpacing: 2, fontWeight: 600 }}>ESPACE JOUEUR</span>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, width: isMobile ? "100%" : "auto" }}>
              <nav style={{ display: "flex", gap: 4, flex: isMobile ? 1 : "none" }}>
                {[["annonces", "📢 Annonces"], ["profil", "👤 Profil"]].map(([t, label]) => (
                  <button key={t} onClick={() => { setTab(t); setEditing(false); }} style={{ flex: isMobile ? 1 : "none", padding: "8px 12px", borderRadius: 10, border: `1px solid ${tab === t ? C.primary + "60" : C.border}`, background: tab === t ? `${C.primary}15` : "transparent", color: tab === t ? "#fff" : C.muted, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "all .2s", whiteSpace: "nowrap" }}>
                    {label}
                  </button>
                ))}
              </nav>
              <button onClick={handleLogout} style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.08)", color: "#EF4444", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>🚪</button>
            </div>
          </div>
        </header>

        <main style={{ maxWidth: 900, margin: "0 auto", padding: isMobile ? "20px 14px" : "32px 24px" }}>

          {/* ════════ ONGLET ANNONCES ════════ */}
          {tab === "annonces" && (
            <div>
              <div style={{ marginBottom: 20 }}>
                <h2 style={{ fontSize: isMobile ? 24 : 32, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: isMobile ? 2 : 3, margin: "0 0 6px", color: "#fff" }}>📢 ANNONCES DE RECRUTEMENT</h2>
                <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>Toutes les offres des clubs · {annonces.length} annonce{annonces.length !== 1 ? "s" : ""}</p>
              </div>

              {/* Filters */}
              <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
                {[
                  ["all", "🔍 Toutes", annonces.length],
                  ["player", "🤾 Joueurs", annonces.filter(a => a.type === "player").length],
                  ["trainer", "🎯 Entraîneurs", annonces.filter(a => a.type === "trainer").length],
                ].map(([val, label, count]) => (
                  <button key={val} onClick={() => setFilter(val)} style={{ padding: "8px 16px", borderRadius: 10, border: `1px solid ${filter === val ? C.primary + "60" : C.border}`, background: filter === val ? `${C.primary}15` : "rgba(255,255,255,0.02)", color: filter === val ? "#fff" : C.muted, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                    {label} <span style={{ opacity: 0.6 }}>({count})</span>
                  </button>
                ))}
              </div>

              {filteredAnnonces.length === 0 ? (
                <div style={{ textAlign: "center", padding: 60, color: C.dim }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
                  <p style={{ fontSize: 14, margin: 0 }}>Aucune annonce disponible pour le moment.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {filteredAnnonces.map(a => {
                    const isTr = a.type === "trainer";
                    const ac = isTr ? "#8B5CF6" : C.primary;
                    const myApp = myApplications.find(x => x.annonce_id === a.id);
                    const isApplying = applying === a.id;
                    const statusMeta = myApp ? {
                      pending: { label: "Candidature envoyée", color: C.gold },
                      seen: { label: "Vue par le club", color: C.primaryLight },
                      accepted: { label: "Candidature acceptée ✓", color: C.green },
                      rejected: { label: "Candidature refusée", color: C.accent },
                    }[myApp.status] : null;

                    return (
                      <div key={a.id} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}`, borderLeft: `3px solid ${ac}`, borderRadius: 14, overflow: "hidden" }}>
                        <div style={{ padding: "20px 22px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 10 }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
                                <span style={{ fontSize: 10, padding: "3px 9px", borderRadius: 5, background: `${ac}15`, color: ac, fontWeight: 700, border: `1px solid ${ac}30` }}>{isTr ? "🎯 Entraîneur" : "🤾 Joueur"}</span>
                                {a.is_urgent && <span style={{ fontSize: 10, padding: "3px 9px", borderRadius: 5, background: `${C.accent}15`, color: C.accent, fontWeight: 700, border: `1px solid ${C.accent}30` }}>🔥 Urgent</span>}
                                {a.division && <span style={{ fontSize: 10, padding: "3px 9px", borderRadius: 5, background: "rgba(255,255,255,0.04)", color: C.muted, fontWeight: 600, border: `1px solid ${C.border}` }}>{DIVISIONS_MAP[a.division] || a.division}</span>}
                                {a.position && <span style={{ fontSize: 10, padding: "3px 9px", borderRadius: 5, background: "rgba(255,255,255,0.04)", color: C.muted, fontWeight: 600, border: `1px solid ${C.border}` }}>{POSITIONS.find(p => p.value === a.position)?.label || a.position}</span>}
                              </div>
                              <h3 style={{ margin: "0 0 4px", fontSize: 16, color: "#fff", fontWeight: 700 }}>{a.title}</h3>
                              <div style={{ fontSize: 12, color: C.muted }}>
                                {a.club_name && <strong style={{ color: C.text }}>{a.club_name}</strong>}
                                {a.city && <span> · 📍 {a.city}</span>}
                                <span style={{ marginLeft: 8, opacity: 0.6 }}>· {new Date(a.created_at).toLocaleDateString("fr-FR")}</span>
                              </div>
                            </div>
                            <div style={{ flexShrink: 0 }}>
                              {statusMeta ? (
                                <div style={{ padding: "6px 12px", borderRadius: 8, fontSize: 11, fontWeight: 700, color: statusMeta.color, background: `${statusMeta.color}15`, border: `1px solid ${statusMeta.color}30`, whiteSpace: "nowrap" }}>
                                  {statusMeta.label}
                                </div>
                              ) : (
                                <button onClick={() => { setApplying(isApplying ? null : a.id); setApplyMsg(""); }} style={{ padding: "9px 18px", borderRadius: 10, border: `1px solid ${ac}40`, background: isApplying ? `${ac}25` : `${ac}12`, color: isApplying ? C.muted : ac, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "all .2s" }}>
                                  {isApplying ? "✕ Annuler" : "📩 Postuler"}
                                </button>
                              )}
                            </div>
                          </div>
                          {a.description && (
                            <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.65, margin: "10px 0 0" }}>{a.description}</p>
                          )}
                          {a.salary_range && (
                            <div style={{ marginTop: 10, fontSize: 12, color: C.green, fontWeight: 600 }}>💶 {a.salary_range}</div>
                          )}
                        </div>

                        {isApplying && (
                          <div style={{ borderTop: `1px solid ${C.border}`, padding: "16px 22px", background: "rgba(0,0,0,0.2)" }}>
                            <div style={{ fontSize: 11, color: C.dim, fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Votre message (optionnel)</div>
                            <textarea value={applyMsg} onChange={e => setApplyMsg(e.target.value)} placeholder="Présentez-vous brièvement, expliquez pourquoi vous correspondez au profil…" rows={3} style={{ ...inpStyle, resize: "vertical", lineHeight: 1.6 }} />
                            {profile?.cv_url && (
                              <div style={{ fontSize: 11, color: C.dim, marginTop: 6 }}>📄 CV <strong style={{ color: C.primaryLight }}>{profile.cv_filename || "CV.pdf"}</strong> joint automatiquement.</div>
                            )}
                            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12 }}>
                              <button onClick={() => { setApplying(null); setApplyMsg(""); }} style={{ padding: "9px 18px", border: `1px solid ${C.border}`, borderRadius: 10, background: "transparent", color: C.muted, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Annuler</button>
                              <button onClick={() => apply(a.id)} disabled={applyLoading} style={{ padding: "9px 22px", border: "none", borderRadius: 10, background: `linear-gradient(135deg, ${ac}, ${C.primaryDark})`, color: "#fff", fontSize: 12, fontWeight: 700, cursor: applyLoading ? "wait" : "pointer", opacity: applyLoading ? 0.7 : 1, fontFamily: "'DM Sans', sans-serif" }}>
                                {applyLoading ? "Envoi…" : "📩 Envoyer la candidature"}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ════════ ONGLET MON PROFIL ════════ */}
          {tab === "profil" && (
            <div>
              {/* Completion bar */}
              <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 20px", marginBottom: 24, display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>Complétion du profil</span>
                    <span style={{ fontSize: 12, color: completion === 100 ? C.green : C.primary, fontWeight: 700 }}>{completion}%</span>
                  </div>
                  <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${completion}%`, background: completion === 100 ? C.green : `linear-gradient(90deg, ${C.primary}, ${C.accent})`, borderRadius: 3, transition: "width .6s ease" }} />
                  </div>
                </div>
                {!editing && <button onClick={() => setEditing(true)} style={{ padding: "8px 16px", border: "none", borderRadius: 10, background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`, color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", boxShadow: `0 4px 14px ${C.primary}30`, fontFamily: "'DM Sans', sans-serif" }}>✏️ Modifier</button>}
              </div>

              {/* Profile card */}
              <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}`, borderRadius: 18, padding: 28, marginBottom: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <h3 style={{ fontSize: 18, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 2, color: C.primary, margin: 0 }}>📋 {editing ? "MODIFIER MON PROFIL" : "MON PROFIL"}</h3>
                  {!editing && <button onClick={() => setEditing(true)} style={{ padding: "8px 16px", border: `1px solid ${C.primary}30`, borderRadius: 10, background: `${C.primary}10`, color: C.primaryLight, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>✏️ Modifier</button>}
                </div>

                {editing ? (
                  <div>
                    {/* Identity */}
                    <div style={{ marginBottom: 20 }}>
                      <h4 style={{ fontSize: 11, color: C.dim, textTransform: "uppercase", letterSpacing: 2, marginBottom: 12, fontWeight: 600, borderBottom: `1px solid ${C.border}`, paddingBottom: 8 }}>👤 Identité</h4>
                      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14 }}>
                        <div><label style={labelStyle}>Prénom</label><input value={form.first_name || ""} onChange={e => updateField("first_name", e.target.value)} style={inpStyle} placeholder="Votre prénom" /></div>
                        <div><label style={labelStyle}>Nom</label><input value={form.last_name || ""} onChange={e => updateField("last_name", e.target.value)} style={inpStyle} placeholder="Votre nom" /></div>
                        <div><label style={labelStyle}>Âge</label><input type="number" value={form.age || ""} onChange={e => updateField("age", e.target.value)} style={inpStyle} placeholder="Ex: 25" min="14" max="60" /></div>
                        <div><label style={labelStyle}>Téléphone</label><input value={form.phone || ""} onChange={e => updateField("phone", e.target.value)} style={inpStyle} placeholder="06 12 34 56 78" /></div>
                        <div><label style={labelStyle}>Ville</label><input value={form.city || ""} onChange={e => updateField("city", e.target.value)} style={inpStyle} placeholder="Ex: Lyon" /></div>
                        <div><label style={labelStyle}>Club actuel</label><input value={form.current_club || ""} onChange={e => updateField("current_club", e.target.value)} style={inpStyle} placeholder="Ex: AS Bondy" /></div>
                        <div style={{ gridColumn: "1 / -1" }}>
                          <label style={labelStyle}>Région</label>
                          <select value={form.region || ""} onChange={e => updateField("region", e.target.value)} style={selStyle}>
                            <option value="">— Choisir une région —</option>
                            {REGIONS.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                          </select>
                        </div>
                        <div style={{ gridColumn: "1 / -1" }}>
                          <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", padding: "12px 14px", background: form.mobile_other_regions ? "rgba(16,185,129,0.08)" : "rgba(255,255,255,0.02)", borderRadius: 10, border: `1px solid ${form.mobile_other_regions ? "rgba(16,185,129,0.4)" : C.border}`, transition: "all .2s" }}>
                            <input type="checkbox" checked={!!form.mobile_other_regions} onChange={e => updateField("mobile_other_regions", e.target.checked)} style={{ marginTop: 2, accentColor: C.green, width: 16, height: 16 }} />
                            <div><div style={{ fontSize: 13, color: C.text, fontWeight: 600 }}>🌍 Mobile vers d&apos;autres régions</div><div style={{ fontSize: 11, color: C.dim, marginTop: 2 }}>Prêt(e) à rejoindre un club dans une autre région</div></div>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Physical */}
                    <div style={{ marginBottom: 20 }}>
                      <h4 style={{ fontSize: 11, color: C.dim, textTransform: "uppercase", letterSpacing: 2, marginBottom: 12, fontWeight: 600, borderBottom: `1px solid ${C.border}`, paddingBottom: 8 }}>📏 Caractéristiques physiques</h4>
                      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "1fr 1fr 1fr", gap: 14 }}>
                        <div><label style={labelStyle}>Taille (cm)</label><input type="number" value={form.height_cm || ""} onChange={e => updateField("height_cm", e.target.value)} style={inpStyle} placeholder="Ex: 185" /></div>
                        <div><label style={labelStyle}>Poids (kg)</label><input type="number" value={form.weight_kg || ""} onChange={e => updateField("weight_kg", e.target.value)} style={inpStyle} placeholder="Ex: 82" /></div>
                        <div><label style={labelStyle}>Main forte</label>
                          <select value={form.hand_side || ""} onChange={e => updateField("hand_side", e.target.value)} style={selStyle}>
                            <option value="">— Choisir —</option>
                            <option value="droitier">Droitier</option>
                            <option value="gaucher">Gaucher</option>
                            <option value="ambidextre">Ambidextre</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Handball */}
                    <div style={{ marginBottom: 20 }}>
                      <h4 style={{ fontSize: 11, color: C.dim, textTransform: "uppercase", letterSpacing: 2, marginBottom: 12, fontWeight: 600, borderBottom: `1px solid ${C.border}`, paddingBottom: 8 }}>🤾 Handball</h4>
                      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "1fr 1fr 1fr", gap: 14 }}>
                        <div><label style={labelStyle}>Poste</label>
                          <select value={form.position || ""} onChange={e => updateField("position", e.target.value)} style={selStyle}>
                            {POSITIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                          </select>
                        </div>
                        <div><label style={labelStyle}>Meilleur niveau</label>
                          <select value={form.best_level || ""} onChange={e => updateField("best_level", e.target.value)} style={selStyle}>
                            {LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                          </select>
                        </div>
                        <div><label style={labelStyle}>Niveau actuel</label>
                          <select value={form.current_level || ""} onChange={e => updateField("current_level", e.target.value)} style={selStyle}>
                            {LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Centre de formation */}
                    <div style={{ marginBottom: 20 }}>
                      <h4 style={{ fontSize: 11, color: C.dim, textTransform: "uppercase", letterSpacing: 2, marginBottom: 12, fontWeight: 600, borderBottom: `1px solid ${C.border}`, paddingBottom: 8 }}>🏆 Centre de formation / Section sportive</h4>
                      <select value={form.training_center || ""} onChange={e => updateField("training_center", e.target.value)} style={{ ...selStyle, marginBottom: 10 }}>
                        <option value="">— Aucun —</option>
                        <optgroup label="Pôles Espoirs FFHB">
                          {TRAINING_CENTERS.filter(c => c.type === "pole").map(c => <option key={c.id} value={c.id}>{c.label} ({c.city})</option>)}
                        </optgroup>
                        <optgroup label="Centres de formation masculins">
                          {TRAINING_CENTERS.filter(c => c.type === "pro_m").map(c => <option key={c.id} value={c.id}>{c.label} ({c.city})</option>)}
                        </optgroup>
                        <optgroup label="Centres de formation féminins">
                          {TRAINING_CENTERS.filter(c => c.type === "pro_f").map(c => <option key={c.id} value={c.id}>{c.label} ({c.city})</option>)}
                        </optgroup>
                      </select>
                      <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", padding: "12px 14px", background: form.is_section_sportive ? `${SECTION_SPORTIVE_META.color}10` : "rgba(255,255,255,0.02)", borderRadius: 10, border: `1px solid ${form.is_section_sportive ? SECTION_SPORTIVE_META.color + "40" : C.border}`, transition: "all .2s" }}>
                        <input type="checkbox" checked={!!form.is_section_sportive} onChange={e => updateField("is_section_sportive", e.target.checked)} style={{ marginTop: 2, accentColor: SECTION_SPORTIVE_META.color, width: 16, height: 16 }} />
                        <div><div style={{ fontSize: 13, color: C.text, fontWeight: 600 }}>{SECTION_SPORTIVE_META.icon} Je suis en section sportive scolaire</div><div style={{ fontSize: 11, color: C.dim, marginTop: 2 }}>Collège ou lycée avec section sportive handball</div></div>
                      </label>
                    </div>

                    {/* Availability */}
                    <div style={{ marginBottom: 20 }}>
                      <h4 style={{ fontSize: 11, color: C.dim, textTransform: "uppercase", letterSpacing: 2, marginBottom: 12, fontWeight: 600, borderBottom: `1px solid ${C.border}`, paddingBottom: 8 }}>📡 Disponibilité</h4>
                      <div onClick={() => updateField("is_available", !form.is_available)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", background: form.is_available ? "rgba(16,185,129,0.08)" : "rgba(255,255,255,0.02)", border: `1px solid ${form.is_available ? "rgba(16,185,129,0.3)" : C.border}`, borderRadius: 12, cursor: "pointer", transition: "all .25s" }}>
                        <div style={{ width: 40, height: 22, borderRadius: 11, background: form.is_available ? C.green : "rgba(255,255,255,0.1)", position: "relative", transition: "background .25s" }}>
                          <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, left: form.is_available ? 20 : 2, transition: "left .25s", boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }} />
                        </div>
                        <div>
                          <div style={{ fontSize: 13, color: C.text, fontWeight: 600 }}>Je suis disponible pour un transfert</div>
                          <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{form.is_available ? "Votre profil apparaîtra dans les recherches des clubs" : "Votre profil ne sera pas visible dans les recherches"}</div>
                        </div>
                      </div>
                    </div>

                    {/* Bio */}
                    <div style={{ marginBottom: 24 }}>
                      <h4 style={{ fontSize: 11, color: C.dim, textTransform: "uppercase", letterSpacing: 2, marginBottom: 12, fontWeight: 600, borderBottom: `1px solid ${C.border}`, paddingBottom: 8 }}>✍️ Présentation</h4>
                      <textarea value={form.bio || ""} onChange={e => updateField("bio", e.target.value)} placeholder="Décrivez votre profil, vos qualités, ce que vous recherchez..." rows={4} style={{ ...inpStyle, resize: "vertical", lineHeight: 1.6 }} />
                    </div>

                    {/* Buttons */}
                    <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                      <button onClick={() => { setEditing(false); setForm(profile || {}); }} style={{ padding: "12px 24px", border: `1px solid ${C.border}`, borderRadius: 12, background: "transparent", color: C.muted, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Annuler</button>
                      <button onClick={saveProfile} disabled={saving} style={{ padding: "12px 32px", border: "none", borderRadius: 12, background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`, color: "#fff", fontSize: 13, fontWeight: 700, cursor: saving ? "wait" : "pointer", boxShadow: `0 6px 20px ${C.primary}30`, opacity: saving ? 0.7 : 1, fontFamily: "'DM Sans', sans-serif" }}>{saving ? "Enregistrement..." : "💾 Enregistrer"}</button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ marginBottom: 18 }}>
                      <h4 style={{ fontSize: 11, color: C.dim, textTransform: "uppercase", letterSpacing: 2, marginBottom: 10, fontWeight: 600 }}>👤 Identité</h4>
                      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "1fr 1fr 1fr", gap: 10 }}>
                        {[["Prénom", profile?.first_name], ["Nom", profile?.last_name], ["Âge", profile?.age ? `${profile.age} ans` : null], ["Téléphone", profile?.phone], ["Ville", profile?.city], ["Club actuel", profile?.current_club], ["Région", getRegionLabel(profile?.region)], ["Mobilité", profile?.mobile_other_regions ? "🌍 Autres régions OK" : "Région actuelle"]].map(([l, v], i) => (
                          <div key={i} style={{ padding: "12px 16px", background: "rgba(255,255,255,0.02)", borderRadius: 12, border: `1px solid ${C.border}` }}>
                            <div style={{ fontSize: 10, color: C.dim, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600, marginBottom: 4 }}>{l}</div>
                            <div style={{ fontSize: 14, color: v ? C.text : C.dim, fontWeight: 600 }}>{v || "—"}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{ marginBottom: 18 }}>
                      <h4 style={{ fontSize: 11, color: C.dim, textTransform: "uppercase", letterSpacing: 2, marginBottom: 10, fontWeight: 600 }}>🤾 Handball</h4>
                      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "1fr 1fr 1fr", gap: 10 }}>
                        {[["Poste", POSITIONS.find(p => p.value === profile?.position)?.label], ["Meilleur niveau", LEVELS.find(l => l.value === profile?.best_level)?.label], ["Niveau actuel", LEVELS.find(l => l.value === profile?.current_level)?.label], ["Taille", profile?.height_cm ? `${profile.height_cm} cm` : null], ["Poids", profile?.weight_kg ? `${profile.weight_kg} kg` : null], ["Main forte", profile?.hand_side ? profile.hand_side.charAt(0).toUpperCase() + profile.hand_side.slice(1) : null]].map(([l, v], i) => (
                          <div key={i} style={{ padding: "12px 16px", background: "rgba(255,255,255,0.02)", borderRadius: 12, border: `1px solid ${C.border}` }}>
                            <div style={{ fontSize: 10, color: C.dim, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600, marginBottom: 4 }}>{l}</div>
                            <div style={{ fontSize: 14, color: v ? C.text : C.dim, fontWeight: 600 }}>{v || "—"}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: profile?.is_available ? "rgba(16,185,129,0.06)" : "rgba(255,255,255,0.02)", borderRadius: 12, border: `1px solid ${profile?.is_available ? "rgba(16,185,129,0.2)" : C.border}` }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: profile?.is_available ? C.green : C.dim, boxShadow: profile?.is_available ? `0 0 8px ${C.green}60` : "none" }} />
                      <span style={{ fontSize: 13, color: profile?.is_available ? C.green : C.muted, fontWeight: 600 }}>{profile?.is_available ? "Disponible pour un transfert" : "Non disponible"}</span>
                    </div>
                    {profile?.bio && (
                      <div style={{ marginTop: 14, padding: "14px 18px", background: "rgba(255,255,255,0.02)", borderRadius: 12, border: `1px solid ${C.border}` }}>
                        <div style={{ fontSize: 10, color: C.dim, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600, marginBottom: 6 }}>✍️ Présentation</div>
                        <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.7, margin: 0 }}>{profile.bio}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* CV Section */}
              <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}`, borderRadius: 18, padding: 28 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h3 style={{ fontSize: 18, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 2, color: C.primary, margin: 0 }}>📄 MON CV</h3>
                  {profile?.cv_url && <span style={{ fontSize: 10, color: C.green, fontWeight: 700, background: "rgba(16,185,129,0.1)", padding: "4px 10px", borderRadius: 20, border: "1px solid rgba(16,185,129,0.3)" }}>● Disponible</span>}
                </div>
                <p style={{ fontSize: 12, color: C.muted, marginBottom: 16, lineHeight: 1.6 }}>Votre CV (PDF, max 5 Mo) sera joint automatiquement à vos candidatures.</p>
                {profile?.cv_url ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", background: `${C.primary}08`, borderRadius: 12, border: `1px solid ${C.primary}20` }}>
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: `${C.primary}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>📄</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, color: C.text, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{profile.cv_filename || "Mon CV.pdf"}</div>
                      {profile.cv_uploaded_at && <div style={{ fontSize: 10, color: C.dim, marginTop: 2 }}>Envoyé le {new Date(profile.cv_uploaded_at).toLocaleDateString("fr-FR")}</div>}
                    </div>
                    <a href={profile.cv_url} target="_blank" rel="noopener noreferrer" style={{ padding: "8px 14px", background: `${C.primary}20`, color: C.primaryLight, borderRadius: 8, fontSize: 11, fontWeight: 600, textDecoration: "none", border: `1px solid ${C.primary}30` }}>👁️ Voir</a>
                    <label style={{ padding: "8px 14px", background: "rgba(255,255,255,0.06)", color: C.text, borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: cvUploading ? "wait" : "pointer", border: `1px solid ${C.border}` }}>
                      {cvUploading ? "..." : "🔄 Remplacer"}
                      <input type="file" accept="application/pdf" onChange={e => uploadCV(e.target.files?.[0])} disabled={cvUploading} style={{ display: "none" }} />
                    </label>
                    <button onClick={deleteCV} disabled={cvUploading} style={{ padding: "8px 12px", background: `${C.accent}15`, color: C.accent, borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: cvUploading ? "wait" : "pointer", border: `1px solid ${C.accent}30`, fontFamily: "'DM Sans', sans-serif" }}>🗑️</button>
                  </div>
                ) : (
                  <label style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 20px", background: "rgba(255,255,255,0.02)", border: `2px dashed ${C.border}`, borderRadius: 14, cursor: cvUploading ? "wait" : "pointer", transition: "all .2s" }} onMouseEnter={e => { if (!cvUploading) e.currentTarget.style.borderColor = `${C.primary}50`; }} onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; }}>
                    <div style={{ fontSize: 36, marginBottom: 10 }}>{cvUploading ? "⏳" : "📤"}</div>
                    <div style={{ fontSize: 13, color: C.text, fontWeight: 600, marginBottom: 4 }}>{cvUploading ? "Envoi en cours…" : "Cliquez pour ajouter votre CV"}</div>
                    <div style={{ fontSize: 11, color: C.dim }}>PDF uniquement, 5 Mo max</div>
                    <input type="file" accept="application/pdf" onChange={e => uploadCV(e.target.files?.[0])} disabled={cvUploading} style={{ display: "none" }} />
                  </label>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
