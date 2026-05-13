"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import Link from "next/link";

const C = {
  primary: "#1D4ED8",
  primaryLight: "#3B82F6",
  primaryDark: "#1E3A8A",
  accent: "#DC2626",
  bg: "#0A0E1A",
  text: "#F1F5F9",
  muted: "rgba(255,255,255,0.5)",
  dim: "rgba(255,255,255,0.3)",
  border: "rgba(255,255,255,0.06)",
  green: "#10B981",
  gold: "#FBBF24",
};

const POSITIONS = [
  { value: "gardien", label: "Gardien" },
  { value: "ailier_gauche", label: "Ailier gauche" },
  { value: "ailier_droit", label: "Ailier droit" },
  { value: "arriere_gauche", label: "Arrière gauche" },
  { value: "arriere_droit", label: "Arrière droit" },
  { value: "demi_centre", label: "Demi-centre" },
  { value: "pivot", label: "Pivot" },
];

const DIVISIONS = [
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

const PLAN_META = {
  free: { label: "Free", color: C.dim, icon: "🆓" },
  standard: { label: "Standard", color: C.primary, icon: "⭐" },
  premium: { label: "Premium", color: C.gold, icon: "👑" },
};

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

export default function ClubDashboard({ user, profile }) {
  const [club, setClub] = useState(null);
  const [loadingClub, setLoadingClub] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [form, setForm] = useState({
    name: "",
    short_name: "",
    city: "",
    division: "",
    seeking_positions: [],
    phone: "",
    email: "",
  });

  useEffect(() => {
    const fetchClub = async () => {
      const { data, error } = await supabase
        .from("clubs")
        .select("*")
        .eq("owner_id", user.id)
        .maybeSingle();
      if (!error && data) {
        setClub(data);
        setForm({
          name: data.name || "",
          short_name: data.short_name || "",
          city: data.city || "",
          division: data.division || "",
          seeking_positions: Array.isArray(data.seeking_positions) ? data.seeking_positions : [],
          phone: data.phone || "",
          email: data.email || "",
        });
      } else {
        setEditing(true);
        setForm((p) => ({
          ...p,
          city: profile?.city || "",
          phone: profile?.phone || "",
          email: profile?.email || user.email || "",
        }));
      }
      setLoadingClub(false);
    };
    fetchClub();
  }, [user, profile]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  };

  const upd = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const togglePosition = (v) =>
    setForm((p) => ({
      ...p,
      seeking_positions: p.seeking_positions.includes(v)
        ? p.seeking_positions.filter((x) => x !== v)
        : [...p.seeking_positions, v],
    }));

  const canSave =
    form.name.trim().length >= 2 &&
    form.city.trim().length > 0 &&
    form.division;

  const save = async () => {
    if (!canSave) return;
    setSaving(true);
    const payload = {
      owner_id: user.id,
      name: form.name.trim(),
      short_name: form.short_name.trim() || null,
      city: form.city.trim(),
      division: form.division,
      seeking_positions: form.seeking_positions,
      phone: form.phone.trim() || null,
      email: form.email.trim() || null,
    };
    let result;
    if (club?.id) {
      result = await supabase.from("clubs").update(payload).eq("id", club.id).select().single();
    } else {
      result = await supabase
        .from("clubs")
        .insert({ ...payload, plan: "free" })
        .select()
        .single();
    }
    setSaving(false);
    if (result.error) {
      showToast("❌ Erreur : " + result.error.message);
      return;
    }
    setClub(result.data);
    setEditing(false);
    showToast("✅ Club mis à jour !");
  };

  const cancel = () => {
    if (club) {
      setForm({
        name: club.name || "",
        short_name: club.short_name || "",
        city: club.city || "",
        division: club.division || "",
        seeking_positions: Array.isArray(club.seeking_positions) ? club.seeking_positions : [],
        phone: club.phone || "",
        email: club.email || "",
      });
      setEditing(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const completion = (() => {
    const fields = ["name", "short_name", "city", "division", "phone", "email"];
    const src = club || form;
    const filled = fields.filter((f) => src?.[f] && String(src[f]).trim() !== "").length;
    return Math.round((filled / fields.length) * 100);
  })();

  const planMeta = PLAN_META[club?.plan] || PLAN_META.free;

  if (loadingClub) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: C.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ color: C.dim, fontSize: 14, fontFamily: "'DM Sans', sans-serif" }}>
          Chargement de votre club...
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        color: C.text,
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {toast && (
        <div
          style={{
            position: "fixed",
            top: 24,
            right: 24,
            padding: "14px 22px",
            borderRadius: 14,
            zIndex: 9999,
            background: toast.startsWith("❌")
              ? "rgba(239,68,68,0.15)"
              : "rgba(16,185,129,0.15)",
            backdropFilter: "blur(20px)",
            border: `1px solid ${
              toast.startsWith("❌") ? "rgba(239,68,68,0.3)" : "rgba(16,185,129,0.3)"
            }`,
            color: toast.startsWith("❌") ? "#FCA5A5" : "#6EE7B7",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          {toast}
        </div>
      )}

      <style>{`input:focus,select:focus,textarea:focus{border-color:${C.primary}!important;box-shadow:0 0 0 3px rgba(29,78,216,0.15)!important}`}</style>

      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <div
          style={{
            position: "absolute",
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${C.primary}08 0%, transparent 70%)`,
            top: -200,
            right: -100,
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${C.accent}05 0%, transparent 70%)`,
            bottom: -100,
            left: -150,
          }}
        />
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Header */}
        <header
          style={{
            background: "rgba(10,14,26,0.9)",
            backdropFilter: "blur(20px)",
            borderBottom: `1px solid ${C.border}`,
            padding: "0 24px",
            position: "sticky",
            top: 0,
            zIndex: 100,
          }}
        >
          <div
            style={{
              maxWidth: 1100,
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              height: 64,
            }}
          >
            <Link
              href="/"
              style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 12,
                  background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  boxShadow: `0 4px 16px ${C.primary}30`,
                }}
              >
                🤾
              </div>
              <div>
                <h1
                  style={{
                    fontSize: 22,
                    fontFamily: "'Bebas Neue', sans-serif",
                    letterSpacing: 3,
                    color: "#fff",
                    lineHeight: 1,
                    margin: 0,
                  }}
                >
                  HAND<span style={{ color: C.primary }}>CONNECT</span>
                </h1>
                <span style={{ fontSize: 9, color: C.dim, letterSpacing: 2, fontWeight: 600 }}>
                  ESPACE CLUB
                </span>
              </div>
            </Link>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 14px",
                  borderRadius: 10,
                  background: `${planMeta.color}12`,
                  border: `1px solid ${planMeta.color}25`,
                }}
              >
                <span style={{ fontSize: 14 }}>{planMeta.icon}</span>
                <span style={{ fontSize: 11, color: planMeta.color, fontWeight: 700 }}>
                  {planMeta.label}
                </span>
              </div>
              <button
                onClick={handleLogout}
                style={{
                  padding: "8px 14px",
                  borderRadius: 10,
                  border: "1px solid rgba(239,68,68,0.2)",
                  background: "rgba(239,68,68,0.08)",
                  color: "#EF4444",
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                🚪 Déconnexion
              </button>
            </div>
          </div>
        </header>

        <main style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
          {/* Welcome */}
          <div
            style={{
              background: `linear-gradient(135deg, ${C.primary}10, ${C.accent}05)`,
              border: `1px solid ${C.primary}20`,
              borderRadius: 20,
              padding: "28px",
              marginBottom: 24,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: 16,
                  background: `${C.primary}15`,
                  border: `1px solid ${C.primary}30`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 26,
                }}
              >
                🏟️
              </div>
              <div style={{ flex: 1 }}>
                <h2
                  style={{
                    fontSize: 26,
                    fontFamily: "'Bebas Neue', sans-serif",
                    letterSpacing: 2,
                    margin: 0,
                    color: "#fff",
                  }}
                >
                  {club?.name ? (
                    <>
                      <span style={{ color: C.primary }}>{club.name}</span>
                    </>
                  ) : (
                    <>
                      Bienvenue,{" "}
                      <span style={{ color: C.primary }}>{profile?.first_name || "Club"}</span> 👋
                    </>
                  )}
                </h2>
                <p style={{ fontSize: 13, color: C.muted, margin: "4px 0 0" }}>
                  Recrutez les meilleurs talents du handball.
                </p>
              </div>
            </div>
          </div>

          {/* Completion bar */}
          <div
            style={{
              background: "rgba(255,255,255,0.03)",
              border: `1px solid ${C.border}`,
              borderRadius: 14,
              padding: "16px 20px",
              marginBottom: 24,
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>
                  Complétion fiche club
                </span>
                <span
                  style={{
                    fontSize: 12,
                    color: completion === 100 ? C.green : C.primary,
                    fontWeight: 700,
                  }}
                >
                  {completion}%
                </span>
              </div>
              <div
                style={{
                  height: 6,
                  background: "rgba(255,255,255,0.06)",
                  borderRadius: 3,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${completion}%`,
                    background:
                      completion === 100
                        ? C.green
                        : `linear-gradient(90deg, ${C.primary}, ${C.accent})`,
                    borderRadius: 3,
                    transition: "width .6s ease",
                  }}
                />
              </div>
            </div>
            {completion < 100 && !editing && (
              <button
                onClick={() => setEditing(true)}
                style={{
                  padding: "8px 16px",
                  border: "none",
                  borderRadius: 10,
                  background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`,
                  color: "#fff",
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  boxShadow: `0 4px 14px ${C.primary}30`,
                }}
              >
                Compléter →
              </button>
            )}
          </div>

          {/* Quick cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 14,
              marginBottom: 24,
            }}
          >
            <div
              onClick={() => setEditing(true)}
              style={{
                background: "rgba(255,255,255,0.03)",
                border: `1px solid ${C.border}`,
                borderRadius: 16,
                padding: "20px 22px",
                cursor: "pointer",
                transition: "all .3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = `${C.primary}30`;
                e.currentTarget.style.transform = "translateY(-3px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = C.border;
                e.currentTarget.style.transform = "";
              }}
            >
              <div style={{ fontSize: 26, marginBottom: 10 }}>🏟️</div>
              <div
                style={{
                  fontSize: 10,
                  color: C.dim,
                  textTransform: "uppercase",
                  letterSpacing: 1.5,
                  fontWeight: 600,
                  marginBottom: 4,
                }}
              >
                Ma fiche club
              </div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  color: completion === 100 ? C.green : C.primary,
                  fontFamily: "'Bebas Neue', sans-serif",
                  letterSpacing: 1,
                }}
              >
                {completion === 100 ? "Complète ✓" : "À compléter"}
              </div>
              <p style={{ fontSize: 11, color: C.dim, margin: "6px 0 0", lineHeight: 1.5 }}>
                Visible des joueurs et entraîneurs
              </p>
            </div>
            <Link
              href="/publier-annonce"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: `1px solid ${C.border}`,
                borderRadius: 16,
                padding: "20px 22px",
                cursor: "pointer",
                transition: "all .3s ease",
                textDecoration: "none",
                display: "block",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = `${C.green}30`;
                e.currentTarget.style.transform = "translateY(-3px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = C.border;
                e.currentTarget.style.transform = "";
              }}
            >
              <div style={{ fontSize: 26, marginBottom: 10 }}>📢</div>
              <div
                style={{
                  fontSize: 10,
                  color: C.dim,
                  textTransform: "uppercase",
                  letterSpacing: 1.5,
                  fontWeight: 600,
                  marginBottom: 4,
                }}
              >
                Publier
              </div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  color: C.green,
                  fontFamily: "'Bebas Neue', sans-serif",
                  letterSpacing: 1,
                }}
              >
                Nouvelle annonce
              </div>
              <p style={{ fontSize: 11, color: C.dim, margin: "6px 0 0", lineHeight: 1.5 }}>
                Recruter un joueur ou un coach
              </p>
            </Link>
            <Link
              href="/"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: `1px solid ${C.border}`,
                borderRadius: 16,
                padding: "20px 22px",
                cursor: "pointer",
                transition: "all .3s ease",
                textDecoration: "none",
                display: "block",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = `${C.primaryLight}30`;
                e.currentTarget.style.transform = "translateY(-3px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = C.border;
                e.currentTarget.style.transform = "";
              }}
            >
              <div style={{ fontSize: 26, marginBottom: 10 }}>🤾</div>
              <div
                style={{
                  fontSize: 10,
                  color: C.dim,
                  textTransform: "uppercase",
                  letterSpacing: 1.5,
                  fontWeight: 600,
                  marginBottom: 4,
                }}
              >
                Explorer
              </div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  color: C.primaryLight,
                  fontFamily: "'Bebas Neue', sans-serif",
                  letterSpacing: 1,
                }}
              >
                Joueurs
              </div>
              <p style={{ fontSize: 11, color: C.dim, margin: "6px 0 0", lineHeight: 1.5 }}>
                Trouver des profils disponibles
              </p>
            </Link>
          </div>

          {/* Profile section */}
          <div
            style={{
              background: "rgba(255,255,255,0.03)",
              border: `1px solid ${C.border}`,
              borderRadius: 18,
              padding: 28,
              marginBottom: 24,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <h3
                style={{
                  fontSize: 18,
                  fontFamily: "'Bebas Neue', sans-serif",
                  letterSpacing: 2,
                  color: C.primary,
                  margin: 0,
                }}
              >
                🏟️ {editing ? "MODIFIER MA FICHE CLUB" : "MA FICHE CLUB"}
              </h3>
              {!editing && club && (
                <button
                  onClick={() => setEditing(true)}
                  style={{
                    padding: "8px 16px",
                    border: `1px solid ${C.primary}30`,
                    borderRadius: 10,
                    background: `${C.primary}10`,
                    color: C.primaryLight,
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  ✏️ Modifier
                </button>
              )}
            </div>

            {editing ? (
              <div>
                {/* Identity */}
                <div style={{ marginBottom: 20 }}>
                  <h4
                    style={{
                      fontSize: 11,
                      color: C.dim,
                      textTransform: "uppercase",
                      letterSpacing: 2,
                      marginBottom: 12,
                      fontWeight: 600,
                      borderBottom: `1px solid ${C.border}`,
                      paddingBottom: 8,
                    }}
                  >
                    🏷️ Identité
                  </h4>
                  <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14 }}>
                    <div>
                      <label style={labelStyle}>Nom du club *</label>
                      <input
                        value={form.name}
                        onChange={(e) => upd("name", e.target.value)}
                        style={inpStyle}
                        placeholder="Handball Club de Lyon"
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Sigle</label>
                      <input
                        value={form.short_name}
                        onChange={(e) => upd("short_name", e.target.value)}
                        style={inpStyle}
                        placeholder="HBCL"
                        maxLength={6}
                      />
                    </div>
                  </div>
                </div>

                {/* Localisation */}
                <div style={{ marginBottom: 20 }}>
                  <h4
                    style={{
                      fontSize: 11,
                      color: C.dim,
                      textTransform: "uppercase",
                      letterSpacing: 2,
                      marginBottom: 12,
                      fontWeight: 600,
                      borderBottom: `1px solid ${C.border}`,
                      paddingBottom: 8,
                    }}
                  >
                    📍 Localisation & niveau
                  </h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <div>
                      <label style={labelStyle}>Ville *</label>
                      <input
                        value={form.city}
                        onChange={(e) => upd("city", e.target.value)}
                        style={inpStyle}
                        placeholder="Lyon"
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Division *</label>
                      <select
                        value={form.division}
                        onChange={(e) => upd("division", e.target.value)}
                        style={selStyle}
                      >
                        {DIVISIONS.map((d) => (
                          <option key={d.value} value={d.value}>
                            {d.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Recrutement */}
                <div style={{ marginBottom: 20 }}>
                  <h4
                    style={{
                      fontSize: 11,
                      color: C.dim,
                      textTransform: "uppercase",
                      letterSpacing: 2,
                      marginBottom: 12,
                      fontWeight: 600,
                      borderBottom: `1px solid ${C.border}`,
                      paddingBottom: 8,
                    }}
                  >
                    🎯 Postes recherchés
                  </h4>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {POSITIONS.map((p) => {
                      const on = form.seeking_positions.includes(p.value);
                      return (
                        <button
                          key={p.value}
                          type="button"
                          onClick={() => togglePosition(p.value)}
                          style={{
                            padding: "9px 14px",
                            borderRadius: 10,
                            border: `1px solid ${on ? `${C.primary}60` : C.border}`,
                            background: on ? `${C.primary}18` : "rgba(255,255,255,0.02)",
                            color: on ? "#fff" : C.muted,
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: "pointer",
                            transition: "all .2s",
                          }}
                        >
                          {p.label}
                        </button>
                      );
                    })}
                  </div>
                  <p style={{ fontSize: 11, color: C.dim, marginTop: 8 }}>
                    Sélectionnez les postes que vous cherchez à recruter (optionnel)
                  </p>
                </div>

                {/* Contact */}
                <div style={{ marginBottom: 24 }}>
                  <h4
                    style={{
                      fontSize: 11,
                      color: C.dim,
                      textTransform: "uppercase",
                      letterSpacing: 2,
                      marginBottom: 12,
                      fontWeight: 600,
                      borderBottom: `1px solid ${C.border}`,
                      paddingBottom: 8,
                    }}
                  >
                    ✉️ Contact
                  </h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <div>
                      <label style={labelStyle}>Téléphone</label>
                      <input
                        value={form.phone}
                        onChange={(e) => upd("phone", e.target.value)}
                        style={inpStyle}
                        placeholder="04 78 12 34 56"
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Email contact</label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => upd("email", e.target.value)}
                        style={inpStyle}
                        placeholder="contact@club.fr"
                      />
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                  {club && (
                    <button
                      onClick={cancel}
                      style={{
                        padding: "12px 24px",
                        border: `1px solid ${C.border}`,
                        borderRadius: 12,
                        background: "transparent",
                        color: C.muted,
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Annuler
                    </button>
                  )}
                  <button
                    onClick={save}
                    disabled={!canSave || saving}
                    style={{
                      padding: "12px 32px",
                      border: "none",
                      borderRadius: 12,
                      background:
                        canSave && !saving
                          ? `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`
                          : "rgba(29,78,216,0.2)",
                      color: canSave && !saving ? "#fff" : "rgba(255,255,255,0.4)",
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: canSave && !saving ? "pointer" : "not-allowed",
                      boxShadow: canSave && !saving ? `0 6px 20px ${C.primary}30` : "none",
                    }}
                  >
                    {saving ? "Enregistrement..." : club ? "💾 Enregistrer" : "🚀 Créer mon club"}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {/* Identity */}
                <div style={{ marginBottom: 18 }}>
                  <h4
                    style={{
                      fontSize: 11,
                      color: C.dim,
                      textTransform: "uppercase",
                      letterSpacing: 2,
                      marginBottom: 10,
                      fontWeight: 600,
                    }}
                  >
                    🏷️ Identité
                  </h4>
                  <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 10 }}>
                    {[
                      ["Nom du club", club?.name],
                      ["Sigle", club?.short_name],
                    ].map(([l, v], i) => (
                      <div
                        key={i}
                        style={{
                          padding: "12px 16px",
                          background: "rgba(255,255,255,0.02)",
                          borderRadius: 12,
                          border: `1px solid ${C.border}`,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 10,
                            color: C.dim,
                            textTransform: "uppercase",
                            letterSpacing: 1.5,
                            fontWeight: 600,
                            marginBottom: 4,
                          }}
                        >
                          {l}
                        </div>
                        <div
                          style={{
                            fontSize: 14,
                            color: v ? C.text : C.dim,
                            fontWeight: 600,
                          }}
                        >
                          {v || "—"}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Localisation */}
                <div style={{ marginBottom: 18 }}>
                  <h4
                    style={{
                      fontSize: 11,
                      color: C.dim,
                      textTransform: "uppercase",
                      letterSpacing: 2,
                      marginBottom: 10,
                      fontWeight: 600,
                    }}
                  >
                    📍 Localisation & niveau
                  </h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {[
                      ["Ville", club?.city],
                      [
                        "Division",
                        DIVISIONS.find((d) => d.value === club?.division)?.label,
                      ],
                    ].map(([l, v], i) => (
                      <div
                        key={i}
                        style={{
                          padding: "12px 16px",
                          background: "rgba(255,255,255,0.02)",
                          borderRadius: 12,
                          border: `1px solid ${C.border}`,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 10,
                            color: C.dim,
                            textTransform: "uppercase",
                            letterSpacing: 1.5,
                            fontWeight: 600,
                            marginBottom: 4,
                          }}
                        >
                          {l}
                        </div>
                        <div
                          style={{
                            fontSize: 14,
                            color: v ? C.text : C.dim,
                            fontWeight: 600,
                          }}
                        >
                          {v || "—"}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recrutement */}
                <div style={{ marginBottom: 18 }}>
                  <h4
                    style={{
                      fontSize: 11,
                      color: C.dim,
                      textTransform: "uppercase",
                      letterSpacing: 2,
                      marginBottom: 10,
                      fontWeight: 600,
                    }}
                  >
                    🎯 Postes recherchés
                  </h4>
                  {Array.isArray(club?.seeking_positions) && club.seeking_positions.length > 0 ? (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {club.seeking_positions.map((p) => (
                        <span
                          key={p}
                          style={{
                            padding: "6px 14px",
                            background: `${C.primary}15`,
                            color: C.primaryLight,
                            border: `1px solid ${C.primary}30`,
                            borderRadius: 10,
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                        >
                          {POSITIONS.find((x) => x.value === p)?.label || p}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div
                      style={{
                        padding: "12px 16px",
                        background: "rgba(255,255,255,0.02)",
                        borderRadius: 12,
                        border: `1px solid ${C.border}`,
                        color: C.dim,
                        fontSize: 13,
                      }}
                    >
                      Aucun poste défini
                    </div>
                  )}
                </div>

                {/* Contact */}
                <div style={{ marginBottom: 18 }}>
                  <h4
                    style={{
                      fontSize: 11,
                      color: C.dim,
                      textTransform: "uppercase",
                      letterSpacing: 2,
                      marginBottom: 10,
                      fontWeight: 600,
                    }}
                  >
                    ✉️ Contact
                  </h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {[
                      ["Téléphone", club?.phone],
                      ["Email", club?.email],
                    ].map(([l, v], i) => (
                      <div
                        key={i}
                        style={{
                          padding: "12px 16px",
                          background: "rgba(255,255,255,0.02)",
                          borderRadius: 12,
                          border: `1px solid ${C.border}`,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 10,
                            color: C.dim,
                            textTransform: "uppercase",
                            letterSpacing: 1.5,
                            fontWeight: 600,
                            marginBottom: 4,
                          }}
                        >
                          {l}
                        </div>
                        <div
                          style={{
                            fontSize: 13,
                            color: v ? C.text : C.dim,
                            fontFamily: "monospace",
                          }}
                        >
                          {v || "—"}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Plan + created */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14 }}>
                  <div
                    style={{
                      padding: "12px 16px",
                      background: "rgba(255,255,255,0.02)",
                      borderRadius: 12,
                      border: `1px solid ${C.border}`,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        color: C.dim,
                        textTransform: "uppercase",
                        letterSpacing: 1.5,
                        fontWeight: 600,
                        marginBottom: 4,
                      }}
                    >
                      Abonnement
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: planMeta.color,
                        fontWeight: 700,
                      }}
                    >
                      {planMeta.icon} {planMeta.label}
                    </div>
                  </div>
                  <div
                    style={{
                      padding: "12px 16px",
                      background: "rgba(255,255,255,0.02)",
                      borderRadius: 12,
                      border: `1px solid ${C.border}`,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        color: C.dim,
                        textTransform: "uppercase",
                        letterSpacing: 1.5,
                        fontWeight: 600,
                        marginBottom: 4,
                      }}
                    >
                      Inscrit le
                    </div>
                    <div style={{ fontSize: 13, color: C.text }}>
                      {club?.created_at
                        ? new Date(club.created_at).toLocaleDateString("fr-FR")
                        : "—"}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div
            style={{
              textAlign: "center",
              padding: "32px 0 16px",
              fontSize: 10,
              color: "rgba(255,255,255,0.12)",
            }}
          >
            HAND CONNECT — Espace Club — {new Date().getFullYear()}
          </div>
        </main>
      </div>
    </div>
  );
}
