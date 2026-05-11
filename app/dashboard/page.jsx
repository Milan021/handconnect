"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import Link from "next/link";

const FONT_LINK = "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap";

const C = { primary: "#1D4ED8", primaryLight: "#3B82F6", primaryDark: "#1E3A8A", accent: "#DC2626", bg: "#0A0E1A", text: "#F1F5F9", muted: "rgba(255,255,255,0.5)", dim: "rgba(255,255,255,0.3)", border: "rgba(255,255,255,0.06)", green: "#10B981", gold: "#FBBF24" };

const TYPE_META = {
  joueur: { icon: "🤾", label: "Joueur", color: C.primary, welcomeMsg: "Trouvez votre prochain club et montrez vos stats." },
  club: { icon: "🏟️", label: "Club", color: "#3B82F6", welcomeMsg: "Recrutez les meilleurs talents du handball." },
  entraineur: { icon: "🎯", label: "Entraîneur", color: "#8B5CF6", welcomeMsg: "Valorisez votre parcours et trouvez votre prochain poste." },
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

const inpStyle = { width: "100%", padding: "12px 16px", background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, borderRadius: 12, color: C.text, fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: "none", boxSizing: "border-box", transition: "border-color .2s" };
const selStyle = { ...inpStyle, appearance: "none", cursor: "pointer" };
const labelStyle = { fontSize: 10, color: C.dim, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600, marginBottom: 6, display: "block" };

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [form, setForm] = useState({});

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = "/login"; return; }
      setUser(user);
      const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (profileData?.role === "admin") { window.location.href = "/agents"; return; }
      setProfile(profileData);
      setForm(profileData || {});
      setLoading(false);
    };
    getUser();
  }, []);

  const handleLogout = async () => { await supabase.auth.signOut(); window.location.href = "/login"; };

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3500); };

  const updateField = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const saveProfile = async () => {
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      first_name: form.first_name,
      last_name: form.last_name,
      height_cm: form.height_cm ? parseInt(form.height_cm) : null,
      weight_kg: form.weight_kg ? parseInt(form.weight_kg) : null,
      age: form.age ? parseInt(form.age) : null,
      position: form.position || null,
      hand_side: form.hand_side || null,
      best_level: form.best_level || null,
      current_level: form.current_level || null,
      current_club: form.current_club || null,
      city: form.city || null,
      phone: form.phone || null,
      bio: form.bio || null,
      is_available: form.is_available || false,
    }).eq("id", user.id);

    if (error) {
      showToast("❌ Erreur : " + error.message);
    } else {
      setProfile({ ...profile, ...form });
      setEditing(false);
      showToast("✅ Profil mis à jour !");
    }
    setSaving(false);
  };

  const getCompletionPercent = () => {
    const fields = ["first_name", "last_name", "height_cm", "weight_kg", "age", "position", "hand_side", "best_level", "current_level", "city"];
    const filled = fields.filter(f => profile?.[f] && profile[f] !== "").length;
    return Math.round((filled / fields.length) * 100);
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <link href={FONT_LINK} rel="stylesheet" />
        <div style={{ color: C.dim, fontSize: 14, fontFamily: "'DM Sans', sans-serif" }}>Chargement...</div>
      </div>
    );
  }

  const meta = TYPE_META[profile?.user_type] || TYPE_META.joueur;
  const completion = getCompletionPercent();

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'DM Sans', sans-serif" }}>
      <link href={FONT_LINK} rel="stylesheet" />

      {/* Toast */}
      {toast && <div style={{ position: "fixed", top: 24, right: 24, padding: "14px 22px", borderRadius: 14, zIndex: 9999, background: toast.startsWith("❌") ? "rgba(239,68,68,0.15)" : "rgba(16,185,129,0.15)", backdropFilter: "blur(20px)", border: `1px solid ${toast.startsWith("❌") ? "rgba(239,68,68,0.3)" : "rgba(16,185,129,0.3)"}`, color: toast.startsWith("❌") ? "#FCA5A5" : "#6EE7B7", fontSize: 13, fontWeight: 600, animation: "slideDown .4s cubic-bezier(0.16,1,0.3,1)" }}>{toast}</div>}

      <style>{`@keyframes slideDown{from{opacity:0;transform:translateY(-12px)}to{opacity:1;transform:translateY(0)}}input:focus,select:focus,textarea:focus{border-color:${C.primary}!important;box-shadow:0 0 0 3px rgba(29,78,216,0.15)!important}`}</style>

      {/* Ambient */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", background: `radial-gradient(circle, ${C.primary}08 0%, transparent 70%)`, top: -200, right: -100 }} />
        <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: `radial-gradient(circle, ${C.accent}05 0%, transparent 70%)`, bottom: -100, left: -150 }} />
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Header */}
        <header style={{ background: "rgba(10,14,26,0.9)", backdropFilter: "blur(20px)", borderBottom: `1px solid ${C.border}`, padding: "0 24px", position: "sticky", top: 0, zIndex: 100 }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
              <div style={{ width: 38, height: 38, borderRadius: 12, background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, boxShadow: `0 4px 16px ${C.primary}30` }}>🤾</div>
              <div>
                <h1 style={{ fontSize: 22, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 3, color: "#fff", lineHeight: 1, margin: 0 }}>HAND<span style={{ color: C.primary }}>CONNECT</span></h1>
                <span style={{ fontSize: 9, color: C.dim, letterSpacing: 2, fontWeight: 600 }}>MON ESPACE</span>
              </div>
            </Link>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 10, background: `${meta.color}12`, border: `1px solid ${meta.color}25` }}>
                <span style={{ fontSize: 14 }}>{meta.icon}</span>
                <span style={{ fontSize: 11, color: meta.color, fontWeight: 600 }}>{meta.label}</span>
              </div>
              <button onClick={handleLogout} style={{ padding: "8px 14px", borderRadius: 10, border: "1px solid rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.08)", color: "#EF4444", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>🚪 Déconnexion</button>
            </div>
          </div>
        </header>

        <main style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
          {/* Welcome */}
          <div style={{ background: `linear-gradient(135deg, ${C.primary}10, ${C.accent}05)`, border: `1px solid ${C.primary}20`, borderRadius: 20, padding: "28px 28px", marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 58, height: 58, borderRadius: 16, background: `${C.primary}15`, border: `1px solid ${C.primary}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>{meta.icon}</div>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: 26, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 2, margin: 0, color: "#fff" }}>Bienvenue, <span style={{ color: C.primary }}>{profile?.first_name || "Utilisateur"}</span> 👋</h2>
                <p style={{ fontSize: 13, color: C.muted, margin: "4px 0 0" }}>{meta.welcomeMsg}</p>
              </div>
            </div>
          </div>

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
            {completion < 100 && !editing && <button onClick={() => setEditing(true)} style={{ padding: "8px 16px", border: "none", borderRadius: 10, background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`, color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", boxShadow: `0 4px 14px ${C.primary}30` }}>Compléter →</button>}
          </div>

          {/* Quick cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 24 }}>
            {[
              { icon: "👤", label: "Mon profil", value: completion === 100 ? "Complet ✓" : "À compléter", color: completion === 100 ? C.green : C.primary, desc: "Vos informations joueur", onClick: () => setEditing(true) },
              { icon: "📢", label: "Annonces", value: "Explorer", color: C.primaryLight, desc: "Consultez les offres disponibles" },
              { icon: "💬", label: "Messages", value: "0 nouveau", color: C.green, desc: "Votre messagerie" },
            ].map((card, i) => (
              <div key={i} onClick={card.onClick} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}`, borderRadius: 16, padding: "20px 22px", cursor: "pointer", transition: "all .3s ease" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = `${card.color}30`; e.currentTarget.style.transform = "translateY(-3px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = ""; }}>
                <div style={{ fontSize: 26, marginBottom: 10 }}>{card.icon}</div>
                <div style={{ fontSize: 10, color: C.dim, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600, marginBottom: 4 }}>{card.label}</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: card.color, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 1 }}>{card.value}</div>
                <p style={{ fontSize: 11, color: C.dim, margin: "6px 0 0", lineHeight: 1.5 }}>{card.desc}</p>
              </div>
            ))}
          </div>

          {/* Profile section */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}`, borderRadius: 18, padding: 28, marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 2, color: C.primary, margin: 0 }}>📋 {editing ? "MODIFIER MON PROFIL" : "MON PROFIL"}</h3>
              {!editing && <button onClick={() => setEditing(true)} style={{ padding: "8px 16px", border: `1px solid ${C.primary}30`, borderRadius: 10, background: `${C.primary}10`, color: C.primaryLight, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>✏️ Modifier</button>}
            </div>

            {editing ? (
              /* ═══════ EDIT MODE ═══════ */
              <div>
                {/* Identity */}
                <div style={{ marginBottom: 20 }}>
                  <h4 style={{ fontSize: 11, color: C.dim, textTransform: "uppercase", letterSpacing: 2, marginBottom: 12, fontWeight: 600, borderBottom: `1px solid ${C.border}`, paddingBottom: 8 }}>👤 Identité</h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <div><label style={labelStyle}>Prénom</label><input value={form.first_name || ""} onChange={e => updateField("first_name", e.target.value)} style={inpStyle} placeholder="Votre prénom" /></div>
                    <div><label style={labelStyle}>Nom</label><input value={form.last_name || ""} onChange={e => updateField("last_name", e.target.value)} style={inpStyle} placeholder="Votre nom" /></div>
                    <div><label style={labelStyle}>Âge</label><input type="number" value={form.age || ""} onChange={e => updateField("age", e.target.value)} style={inpStyle} placeholder="Ex: 25" min="14" max="60" /></div>
                    <div><label style={labelStyle}>Téléphone</label><input value={form.phone || ""} onChange={e => updateField("phone", e.target.value)} style={inpStyle} placeholder="06 12 34 56 78" /></div>
                    <div><label style={labelStyle}>Ville</label><input value={form.city || ""} onChange={e => updateField("city", e.target.value)} style={inpStyle} placeholder="Ex: Lyon" /></div>
                    <div><label style={labelStyle}>Club actuel</label><input value={form.current_club || ""} onChange={e => updateField("current_club", e.target.value)} style={inpStyle} placeholder="Ex: AS Bondy" /></div>
                  </div>
                </div>

                {/* Physical */}
                <div style={{ marginBottom: 20 }}>
                  <h4 style={{ fontSize: 11, color: C.dim, textTransform: "uppercase", letterSpacing: 2, marginBottom: 12, fontWeight: 600, borderBottom: `1px solid ${C.border}`, paddingBottom: 8 }}>📏 Caractéristiques physiques</h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                    <div><label style={labelStyle}>Taille (cm)</label><input type="number" value={form.height_cm || ""} onChange={e => updateField("height_cm", e.target.value)} style={inpStyle} placeholder="Ex: 185" min="140" max="220" /></div>
                    <div><label style={labelStyle}>Poids (kg)</label><input type="number" value={form.weight_kg || ""} onChange={e => updateField("weight_kg", e.target.value)} style={inpStyle} placeholder="Ex: 82" min="40" max="150" /></div>
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
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                    <div><label style={labelStyle}>Poste</label>
                      <select value={form.position || ""} onChange={e => updateField("position", e.target.value)} style={selStyle}>
                        {POSITIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                      </select>
                    </div>
                    <div><label style={labelStyle}>Meilleur niveau joué</label>
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
                  <button onClick={() => { setEditing(false); setForm(profile || {}); }} style={{ padding: "12px 24px", border: `1px solid ${C.border}`, borderRadius: 12, background: "transparent", color: C.muted, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Annuler</button>
                  <button onClick={saveProfile} disabled={saving} style={{ padding: "12px 32px", border: "none", borderRadius: 12, background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`, color: "#fff", fontSize: 13, fontWeight: 700, cursor: saving ? "wait" : "pointer", boxShadow: `0 6px 20px ${C.primary}30`, opacity: saving ? 0.7 : 1 }}>{saving ? "Enregistrement..." : "💾 Enregistrer"}</button>
                </div>
              </div>
            ) : (
              /* ═══════ VIEW MODE ═══════ */
              <div>
                {/* Identity */}
                <div style={{ marginBottom: 18 }}>
                  <h4 style={{ fontSize: 11, color: C.dim, textTransform: "uppercase", letterSpacing: 2, marginBottom: 10, fontWeight: 600 }}>👤 Identité</h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                    {[["Prénom", profile?.first_name], ["Nom", profile?.last_name], ["Âge", profile?.age ? `${profile.age} ans` : null], ["Téléphone", profile?.phone], ["Ville", profile?.city], ["Club actuel", profile?.current_club]].map(([l, v], i) => (
                      <div key={i} style={{ padding: "12px 16px", background: "rgba(255,255,255,0.02)", borderRadius: 12, border: `1px solid ${C.border}` }}>
                        <div style={{ fontSize: 10, color: C.dim, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600, marginBottom: 4 }}>{l}</div>
                        <div style={{ fontSize: 14, color: v ? C.text : C.dim, fontWeight: 600 }}>{v || "—"}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Physical */}
                <div style={{ marginBottom: 18 }}>
                  <h4 style={{ fontSize: 11, color: C.dim, textTransform: "uppercase", letterSpacing: 2, marginBottom: 10, fontWeight: 600 }}>📏 Physique</h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                    {[["Taille", profile?.height_cm ? `${profile.height_cm} cm` : null], ["Poids", profile?.weight_kg ? `${profile.weight_kg} kg` : null], ["Main forte", profile?.hand_side ? profile.hand_side.charAt(0).toUpperCase() + profile.hand_side.slice(1) : null]].map(([l, v], i) => (
                      <div key={i} style={{ padding: "12px 16px", background: "rgba(255,255,255,0.02)", borderRadius: 12, border: `1px solid ${C.border}` }}>
                        <div style={{ fontSize: 10, color: C.dim, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600, marginBottom: 4 }}>{l}</div>
                        <div style={{ fontSize: 14, color: v ? C.text : C.dim, fontWeight: 600 }}>{v || "—"}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Handball */}
                <div style={{ marginBottom: 18 }}>
                  <h4 style={{ fontSize: 11, color: C.dim, textTransform: "uppercase", letterSpacing: 2, marginBottom: 10, fontWeight: 600 }}>🤾 Handball</h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                    {[["Poste", POSITIONS.find(p => p.value === profile?.position)?.label], ["Meilleur niveau", LEVELS.find(l => l.value === profile?.best_level)?.label], ["Niveau actuel", LEVELS.find(l => l.value === profile?.current_level)?.label]].map(([l, v], i) => (
                      <div key={i} style={{ padding: "12px 16px", background: "rgba(255,255,255,0.02)", borderRadius: 12, border: `1px solid ${C.border}` }}>
                        <div style={{ fontSize: 10, color: C.dim, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600, marginBottom: 4 }}>{l}</div>
                        <div style={{ fontSize: 14, color: v ? C.text : C.dim, fontWeight: 600 }}>{v || "—"}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Availability */}
                <div style={{ marginBottom: 18, display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: profile?.is_available ? "rgba(16,185,129,0.06)" : "rgba(255,255,255,0.02)", borderRadius: 12, border: `1px solid ${profile?.is_available ? "rgba(16,185,129,0.2)" : C.border}` }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: profile?.is_available ? C.green : C.dim, boxShadow: profile?.is_available ? `0 0 8px ${C.green}60` : "none" }} />
                  <span style={{ fontSize: 13, color: profile?.is_available ? C.green : C.muted, fontWeight: 600 }}>{profile?.is_available ? "Disponible pour un transfert" : "Non disponible"}</span>
                </div>

                {/* Bio */}
                {profile?.bio && (
                  <div style={{ padding: "14px 18px", background: "rgba(255,255,255,0.02)", borderRadius: 12, border: `1px solid ${C.border}` }}>
                    <div style={{ fontSize: 10, color: C.dim, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600, marginBottom: 6 }}>✍️ Présentation</div>
                    <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.7, margin: 0 }}>{profile.bio}</p>
                  </div>
                )}

                {/* Email + inscription */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14 }}>
                  <div style={{ padding: "12px 16px", background: "rgba(255,255,255,0.02)", borderRadius: 12, border: `1px solid ${C.border}` }}>
                    <div style={{ fontSize: 10, color: C.dim, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600, marginBottom: 4 }}>Email</div>
                    <div style={{ fontSize: 13, color: C.text, fontFamily: "monospace" }}>{profile?.email}</div>
                  </div>
                  <div style={{ padding: "12px 16px", background: "rgba(255,255,255,0.02)", borderRadius: 12, border: `1px solid ${C.border}` }}>
                    <div style={{ fontSize: 10, color: C.dim, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600, marginBottom: 4 }}>Inscrit le</div>
                    <div style={{ fontSize: 13, color: C.text }}>{profile?.created_at ? new Date(profile.created_at).toLocaleDateString("fr-FR") : "—"}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{ textAlign: "center", padding: "32px 0 16px", fontSize: 10, color: "rgba(255,255,255,0.12)" }}>HAND CONNECT — Mon Espace — {new Date().getFullYear()}</div>
        </main>
      </div>
    </div>
  );
}
