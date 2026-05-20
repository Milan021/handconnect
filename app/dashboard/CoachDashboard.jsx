"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { REGIONS, getRegionLabel } from "../../lib/regions";
import Link from "next/link";
import useIsMobile from "../../lib/useIsMobile";

const C = {
  primary: "#8B5CF6",
  primaryDark: "#6D28D9",
  accent: "#DC2626",
  bg: "#0A0E1A",
  bgCard: "rgba(255,255,255,0.04)",
  text: "#F1F5F9",
  muted: "rgba(255,255,255,0.5)",
  dim: "rgba(255,255,255,0.3)",
  border: "rgba(255,255,255,0.08)",
  green: "#10B981",
  gold: "#FBBF24",
};

const DIPLOMAS = [
  { value: "", label: "— Choisir —" },
  { value: "none", label: "Aucun diplôme" },
  { value: "brevet_federal", label: "Brevet fédéral" },
  { value: "cqp", label: "CQP Animateur de Handball" },
  { value: "titre4", label: "Titre IV (BPJEPS Handball)" },
  { value: "titre5", label: "Titre V (DEJEPS / DESJEPS)" },
  { value: "be", label: "Brevet d'État" },
  { value: "staps", label: "Diplôme STAPS / Master" },
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
];

const SPECIALTIES = [
  { value: "gardiens", label: "🧤 Gardiens" },
  { value: "attaque", label: "⚡ Attaque" },
  { value: "defense", label: "🛡️ Défense" },
  { value: "physique", label: "💪 Préparation physique" },
  { value: "jeunes", label: "👶 Formation jeunes" },
  { value: "mental", label: "🧠 Préparation mentale" },
  { value: "video", label: "🎬 Analyse vidéo" },
];

const CATEGORIES = [
  { value: "mini_hand", label: "Mini-hand" },
  { value: "moins_11", label: "-11 ans" },
  { value: "moins_13", label: "-13 ans" },
  { value: "moins_15", label: "-15 ans" },
  { value: "moins_17", label: "-17 ans" },
  { value: "moins_18", label: "-18 ans" },
  { value: "moins_20", label: "-20 ans" },
  { value: "seniors", label: "Seniors" },
];

const ROLES = [
  { value: "", label: "— Choisir —" },
  { value: "entraineur_principal", label: "Entraîneur principal" },
  { value: "entraineur_adjoint", label: "Entraîneur adjoint" },
  { value: "prep_physique", label: "Préparateur physique" },
  { value: "entraineur_gardiens", label: "Entraîneur des gardiens" },
  { value: "formateur", label: "Formateur / Responsable formation" },
  { value: "manager", label: "Manager général" },
];

const inpStyle = {
  width: "100%",
  padding: "12px 16px",
  background: "rgba(255,255,255,0.04)",
  border: `1px solid ${C.border}`,
  borderRadius: 12,
  color: C.text,
  fontSize: 14,
  fontFamily: "'DM Sans', sans-serif",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color .2s",
};
const selStyle = { ...inpStyle, appearance: "none", cursor: "pointer" };
const labelStyle = {
  fontSize: 10,
  color: C.dim,
  textTransform: "uppercase",
  letterSpacing: 1.5,
  fontWeight: 600,
  marginBottom: 6,
  display: "block",
};

export default function CoachDashboard({ user, profile, onProfileUpdate }) {
  const isMobile = useIsMobile();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [form, setForm] = useState({
    first_name: profile?.first_name || "",
    last_name: profile?.last_name || "",
    phone: profile?.phone || "",
    email: profile?.email || user.email || "",
    city: profile?.city || "",
    region: profile?.region || "",
    mobile_other_regions: profile?.mobile_other_regions || false,
    coaching_diploma: profile?.coaching_diploma || "",
    coaching_level: profile?.coaching_level || "",
    coaching_current_role: profile?.coaching_current_role || "",
    coaching_experience_years: profile?.coaching_experience_years || "",
    coaching_specialties: Array.isArray(profile?.coaching_specialties) ? profile.coaching_specialties : [],
    coaching_categories: Array.isArray(profile?.coaching_categories) ? profile.coaching_categories : [],
    current_club: profile?.current_club || "",
    bio: profile?.bio || "",
    is_available: profile?.is_available ?? false,
  });

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  };

  useEffect(() => {
    // Si nouveau profil sans diplôme, ouvrir directement l'édition
    if (!profile?.coaching_diploma && !profile?.bio) setEditing(true);
  }, [profile]);

  const upd = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const toggleList = (key, v) =>
    setForm((p) => ({
      ...p,
      [key]: p[key].includes(v) ? p[key].filter((x) => x !== v) : [...p[key], v],
    }));

  const save = async () => {
    setSaving(true);
    const payload = {
      first_name: form.first_name.trim() || null,
      last_name: form.last_name.trim() || null,
      phone: form.phone.trim() || null,
      email: form.email.trim() || null,
      city: form.city.trim() || null,
      region: form.region || null,
      mobile_other_regions: !!form.mobile_other_regions,
      coaching_diploma: form.coaching_diploma || null,
      coaching_level: form.coaching_level || null,
      coaching_current_role: form.coaching_current_role || null,
      coaching_experience_years: form.coaching_experience_years ? parseInt(form.coaching_experience_years) : null,
      coaching_specialties: form.coaching_specialties,
      coaching_categories: form.coaching_categories,
      current_club: form.current_club.trim() || null,
      bio: form.bio.trim() || null,
      is_available: !!form.is_available,
    };
    const { data, error } = await supabase.from("profiles").update(payload).eq("id", user.id).select().single();
    setSaving(false);
    if (error) { showToast("❌ " + error.message); return; }
    setEditing(false);
    showToast("✅ Profil mis à jour !");
    onProfileUpdate && onProfileUpdate(data);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const completion = (() => {
    const src = profile || form;
    const fields = ["first_name", "last_name", "city", "coaching_diploma", "coaching_level", "bio"];
    const filled = fields.filter((f) => src?.[f] && String(src[f]).trim() !== "").length;
    const arrayFilled = (src?.coaching_specialties?.length || 0) > 0 ? 1 : 0;
    return Math.round(((filled + arrayFilled) / (fields.length + 1)) * 100);
  })();

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'DM Sans', sans-serif" }}>
      {toast && (
        <div style={{ position: "fixed", top: 24, right: 24, padding: "14px 22px", borderRadius: 14, zIndex: 9999, background: toast.startsWith("❌") ? "rgba(239,68,68,0.15)" : "rgba(16,185,129,0.15)", backdropFilter: "blur(20px)", border: `1px solid ${toast.startsWith("❌") ? "rgba(239,68,68,0.3)" : "rgba(16,185,129,0.3)"}`, color: toast.startsWith("❌") ? "#FCA5A5" : "#6EE7B7", fontSize: 13, fontWeight: 600 }}>{toast}</div>
      )}
      <style>{`input:focus,select:focus,textarea:focus{border-color:${C.primary}!important;box-shadow:0 0 0 3px rgba(139,92,246,0.15)!important}`}</style>

      <header style={{ background: "rgba(10,14,26,0.9)", backdropFilter: "blur(20px)", borderBottom: `1px solid ${C.border}`, padding: isMobile ? "10px 14px" : "0 24px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", minHeight: isMobile ? 56 : 64 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, boxShadow: `0 4px 16px ${C.primary}30` }}>🎯</div>
            <div>
              <h1 style={{ fontSize: 22, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 3, color: "#fff", lineHeight: 1, margin: 0 }}>HANDBALL<span style={{ color: C.primary }}>CONNECT</span></h1>
              <span style={{ fontSize: 9, color: C.dim, letterSpacing: 2, fontWeight: 600 }}>ESPACE ENTRAÎNEUR</span>
            </div>
          </Link>
          <button onClick={handleLogout} style={{ padding: "8px 14px", borderRadius: 10, border: "1px solid rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.08)", color: "#EF4444", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>🚪 Déconnexion</button>
        </div>
      </header>

      <main style={{ maxWidth: 1000, margin: "0 auto", padding: isMobile ? "20px 14px" : "32px 24px" }}>
        {/* Welcome */}
        <div style={{ background: `linear-gradient(135deg, ${C.primary}10, ${C.accent}05)`, border: `1px solid ${C.primary}20`, borderRadius: 20, padding: 28, marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 58, height: 58, borderRadius: 16, background: `${C.primary}15`, border: `1px solid ${C.primary}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>🎯</div>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: 26, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 2, margin: 0, color: "#fff" }}>
                {form.first_name || profile?.first_name || "Coach"} <span style={{ color: C.primary }}>{form.last_name || profile?.last_name || ""}</span>
              </h2>
              <p style={{ fontSize: 13, color: C.muted, margin: "4px 0 0" }}>Valorisez votre parcours d'entraîneur et trouvez votre prochain poste.</p>
            </div>
          </div>
        </div>

        {/* Completion bar */}
        <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: C.muted }}>Complétude du profil</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: completion === 100 ? C.green : C.primary }}>{completion}%</span>
          </div>
          <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${completion}%`, background: `linear-gradient(90deg, ${C.primary}, ${C.green})`, borderRadius: 3, transition: "width .4s" }} />
          </div>
        </div>

        {!editing ? (
          <>
            {/* Vue */}
            <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 18, padding: 24, marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: 0 }}>🎯 Mon profil entraîneur</h3>
                <button onClick={() => setEditing(true)} style={{ padding: "8px 18px", borderRadius: 10, border: "none", background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>✏️ Modifier</button>
              </div>

              {profile?.is_available && (
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 12px", background: `${C.green}15`, border: `1px solid ${C.green}30`, borderRadius: 8, marginBottom: 16, fontSize: 11, fontWeight: 700, color: C.green }}>● Disponible pour un nouveau poste</div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 14 }}>
                <Stat label="Diplôme" value={DIPLOMAS.find((d) => d.value === profile?.coaching_diploma)?.label || "—"} />
                <Stat label="Poste actuel" value={ROLES.find((r) => r.value === profile?.coaching_current_role)?.label || "—"} />
                <Stat label="Niveau entraîné" value={LEVELS.find((l) => l.value === profile?.coaching_level)?.label || "—"} />
                <Stat label="Expérience" value={profile?.coaching_experience_years ? `${profile.coaching_experience_years} an${profile.coaching_experience_years > 1 ? "s" : ""}` : "—"} />
                <Stat label="Club actuel" value={profile?.current_club || "Sans club"} />
                <Stat label="Région" value={getRegionLabel(profile?.region) + (profile?.mobile_other_regions ? " · 🌍 Mobile" : "")} />
              </div>

              {profile?.coaching_specialties?.length > 0 && (
                <div style={{ marginTop: 18 }}>
                  <p style={{ fontSize: 10, color: C.dim, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600, marginBottom: 8 }}>Spécialités</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {profile.coaching_specialties.map((s) => (
                      <span key={s} style={{ padding: "4px 10px", background: `${C.primary}15`, color: C.primary, borderRadius: 8, fontSize: 11, fontWeight: 600, border: `1px solid ${C.primary}30` }}>{SPECIALTIES.find((sp) => sp.value === s)?.label || s}</span>
                    ))}
                  </div>
                </div>
              )}

              {profile?.coaching_categories?.length > 0 && (
                <div style={{ marginTop: 14 }}>
                  <p style={{ fontSize: 10, color: C.dim, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600, marginBottom: 8 }}>Catégories entraînées</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {profile.coaching_categories.map((c) => (
                      <span key={c} style={{ padding: "4px 10px", background: "rgba(255,255,255,0.05)", color: C.muted, borderRadius: 8, fontSize: 11, fontWeight: 600, border: `1px solid ${C.border}` }}>{CATEGORIES.find((cat) => cat.value === c)?.label || c}</span>
                    ))}
                  </div>
                </div>
              )}

              {profile?.bio && (
                <div style={{ marginTop: 18, padding: 14, background: "rgba(255,255,255,0.02)", borderRadius: 10, border: `1px solid ${C.border}` }}>
                  <p style={{ fontSize: 10, color: C.dim, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600, marginBottom: 6 }}>Présentation</p>
                  <p style={{ fontSize: 13, color: C.muted, margin: 0, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{profile.bio}</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Édition */}
            <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 18, padding: 24, marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: "0 0 18px" }}>👤 Identité</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14 }}>
                <div><label style={labelStyle}>Prénom</label><input value={form.first_name} onChange={(e) => upd("first_name", e.target.value)} style={inpStyle} /></div>
                <div><label style={labelStyle}>Nom</label><input value={form.last_name} onChange={(e) => upd("last_name", e.target.value)} style={inpStyle} /></div>
                <div><label style={labelStyle}>Téléphone</label><input value={form.phone} onChange={(e) => upd("phone", e.target.value)} style={inpStyle} placeholder="06 XX XX XX XX" /></div>
                <div><label style={labelStyle}>Email</label><input value={form.email} onChange={(e) => upd("email", e.target.value)} style={inpStyle} /></div>
                <div><label style={labelStyle}>Ville</label><input value={form.city} onChange={(e) => upd("city", e.target.value)} style={inpStyle} /></div>
                <div>
                  <label style={labelStyle}>Région</label>
                  <select value={form.region} onChange={(e) => upd("region", e.target.value)} style={selStyle}>
                    <option value="">— Choisir —</option>
                    {REGIONS.map((r) => (<option key={r.value} value={r.value}>{r.label}</option>))}
                  </select>
                </div>
              </div>
              <label style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 12, cursor: "pointer" }}>
                <input type="checkbox" checked={form.mobile_other_regions} onChange={(e) => upd("mobile_other_regions", e.target.checked)} />
                <span style={{ fontSize: 13, color: C.muted }}>🌍 Mobile vers d'autres régions</span>
              </label>
            </div>

            <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 18, padding: 24, marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: "0 0 18px" }}>🎓 Formation & expérience</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14 }}>
                <div>
                  <label style={labelStyle}>Diplôme</label>
                  <select value={form.coaching_diploma} onChange={(e) => upd("coaching_diploma", e.target.value)} style={selStyle}>
                    {DIPLOMAS.map((d) => (<option key={d.value} value={d.value}>{d.label}</option>))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Poste actuel</label>
                  <select value={form.coaching_current_role} onChange={(e) => upd("coaching_current_role", e.target.value)} style={selStyle}>
                    {ROLES.map((r) => (<option key={r.value} value={r.value}>{r.label}</option>))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Niveau entraîné</label>
                  <select value={form.coaching_level} onChange={(e) => upd("coaching_level", e.target.value)} style={selStyle}>
                    {LEVELS.map((l) => (<option key={l.value} value={l.value}>{l.label}</option>))}
                  </select>
                </div>
                <div><label style={labelStyle}>Années d'expérience</label><input type="number" min="0" max="60" value={form.coaching_experience_years} onChange={(e) => upd("coaching_experience_years", e.target.value)} style={inpStyle} /></div>
                <div><label style={labelStyle}>Club actuel</label><input value={form.current_club} onChange={(e) => upd("current_club", e.target.value)} style={inpStyle} /></div>
              </div>
            </div>

            <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 18, padding: 24, marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: "0 0 12px" }}>⭐ Spécialités</h3>
              <p style={{ fontSize: 12, color: C.dim, margin: "0 0 14px" }}>Sélectionnez vos domaines de compétence.</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {SPECIALTIES.map((s) => {
                  const on = form.coaching_specialties.includes(s.value);
                  return (
                    <button key={s.value} type="button" onClick={() => toggleList("coaching_specialties", s.value)} style={{ padding: "8px 14px", borderRadius: 10, border: `1px solid ${on ? C.primary : C.border}`, background: on ? `${C.primary}18` : "transparent", color: on ? C.primary : C.muted, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{s.label}</button>
                  );
                })}
              </div>
            </div>

            <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 18, padding: 24, marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: "0 0 12px" }}>👥 Catégories entraînées</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {CATEGORIES.map((c) => {
                  const on = form.coaching_categories.includes(c.value);
                  return (
                    <button key={c.value} type="button" onClick={() => toggleList("coaching_categories", c.value)} style={{ padding: "8px 14px", borderRadius: 10, border: `1px solid ${on ? C.primary : C.border}`, background: on ? `${C.primary}18` : "transparent", color: on ? C.primary : C.muted, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{c.label}</button>
                  );
                })}
              </div>
            </div>

            <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 18, padding: 24, marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: "0 0 12px" }}>✍️ Présentation</h3>
              <textarea value={form.bio} onChange={(e) => upd("bio", e.target.value)} placeholder="Présentez votre parcours, votre philosophie de jeu, vos résultats…" rows={5} style={{ ...inpStyle, resize: "vertical", lineHeight: 1.6 }} />
              <label style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 14, cursor: "pointer" }}>
                <input type="checkbox" checked={form.is_available} onChange={(e) => upd("is_available", e.target.checked)} />
                <span style={{ fontSize: 13, color: C.muted }}>● Je suis disponible pour un nouveau poste</span>
              </label>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button onClick={() => setEditing(false)} style={{ padding: "12px 22px", borderRadius: 12, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Annuler</button>
              <button onClick={save} disabled={saving} style={{ padding: "12px 32px", border: "none", borderRadius: 12, background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`, color: "#fff", fontSize: 13, fontWeight: 700, cursor: saving ? "wait" : "pointer", boxShadow: `0 6px 20px ${C.primary}30`, opacity: saving ? 0.7 : 1 }}>{saving ? "Enregistrement..." : "💾 Enregistrer"}</button>
            </div>
          </>
        )}
      </main>

      <footer style={{ borderTop: `1px solid ${C.border}`, padding: "24px 20px", textAlign: "center", marginTop: 40 }}>
        <p style={{ fontSize: 11, color: C.dim, margin: 0 }}>HANDBALL CONNECT — Espace Entraîneur — {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div style={{ padding: 12, background: "rgba(255,255,255,0.02)", borderRadius: 10, border: `1px solid ${C.border}` }}>
      <div style={{ fontSize: 9, color: C.dim, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 13, color: C.text, fontWeight: 600 }}>{value || "—"}</div>
    </div>
  );
}
