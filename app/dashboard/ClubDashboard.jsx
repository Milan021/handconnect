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
  const [tab, setTab] = useState("club");
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
    founded_year: "",
    member_count: "",
    goals: "",
    motivation: "",
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
          founded_year: data.founded_year || "",
          member_count: data.member_count || "",
          goals: data.goals || "",
          motivation: data.motivation || "",
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

  // Lit le plan choisi à l'inscription (depuis register page) pour l'appliquer à la création
  const [pendingPlan, setPendingPlan] = useState(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    const planFromUrl = url.searchParams.get("plan");
    const planFromStorage = window.localStorage.getItem("hc_pending_plan");
    const valid = ["free", "standard", "premium"];
    const plan = valid.includes(planFromUrl) ? planFromUrl : (valid.includes(planFromStorage) ? planFromStorage : null);
    if (plan) setPendingPlan(plan);
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  };

  // Annonces + candidatures
  const [myAnnonces, setMyAnnonces] = useState([]);
  const [annoncesLoading, setAnnoncesLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    const fetchAnnoncesAndApps = async () => {
      setAnnoncesLoading(true);
      const { data: annoncesData } = await supabase
        .from("annonces")
        .select("*")
        .eq("author_id", user.id)
        .order("created_at", { ascending: false });
      if (!annoncesData || annoncesData.length === 0) { setMyAnnonces([]); setAnnoncesLoading(false); return; }
      const ids = annoncesData.map(a => a.id);
      const { data: appsData } = await supabase
        .from("applications")
        .select("*")
        .in("annonce_id", ids)
        .order("created_at", { ascending: false });
      const applicantIds = [...new Set((appsData || []).map(a => a.applicant_id))];
      let profMap = {};
      if (applicantIds.length > 0) {
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, first_name, last_name, position, current_club, city, age, height_cm, phone, email, cv_url, cv_filename")
          .in("id", applicantIds);
        profMap = Object.fromEntries((profilesData || []).map(p => [p.id, p]));
      }
      const grouped = annoncesData.map(a => ({
        ...a,
        applications: (appsData || []).filter(x => x.annonce_id === a.id).map(app => ({ ...app, applicant: profMap[app.applicant_id] })),
      }));
      setMyAnnonces(grouped);
      setAnnoncesLoading(false);
    };
    fetchAnnoncesAndApps();
  }, [user]);

  const updateAppStatus = async (appId, newStatus, annonceId) => {
    const { error } = await supabase.from("applications").update({ status: newStatus }).eq("id", appId);
    if (error) { showToast("❌ " + error.message); return; }
    setMyAnnonces(prev => prev.map(a => a.id !== annonceId ? a : ({
      ...a,
      applications: a.applications.map(x => x.id === appId ? { ...x, status: newStatus } : x),
    })));
    showToast("✅ Statut mis à jour");
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
      founded_year: form.founded_year ? parseInt(form.founded_year) : null,
      member_count: form.member_count ? parseInt(form.member_count) : null,
      goals: form.goals.trim() || null,
      motivation: form.motivation.trim() || null,
    };
    let result;
    if (club?.id) {
      result = await supabase.from("clubs").update(payload).eq("id", club.id).select().single();
    } else {
      // Création : applique le plan choisi + démarre l'essai 7 jours
      const now = new Date();
      const trialEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      result = await supabase
        .from("clubs")
        .insert({
          ...payload,
          plan: "free", // ancien champ : conservé pour compat
          subscription_plan: pendingPlan || "free",
          subscription_status: "trial",
          trial_started_at: now.toISOString(),
          trial_ends_at: trialEnd.toISOString(),
        })
        .select()
        .single();
    }
    setSaving(false);
    if (result.error) {
      showToast("❌ Erreur : " + result.error.message);
      return;
    }
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("hc_pending_plan");
    }
    setClub(result.data);
    setEditing(false);
    showToast(club?.id ? "✅ Club mis à jour !" : "🎁 Essai 7 jours démarré !");
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
        founded_year: club.founded_year || "",
        member_count: club.member_count || "",
        goals: club.goals || "",
        motivation: club.motivation || "",
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

  const currentPlan = club?.subscription_plan || club?.plan || "free";
  const planMeta = PLAN_META[currentPlan] || PLAN_META.free;

  const pendingCount = myAnnonces.reduce(
    (sum, a) => sum + (a.applications || []).filter((app) => app.status === "pending").length,
    0
  );

  // Essai gratuit : calcul des jours restants
  const trialInfo = (() => {
    if (!club?.trial_ends_at) return null;
    const end = new Date(club.trial_ends_at);
    const now = new Date();
    const diffMs = end - now;
    const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    const isActive = club.subscription_status === "trial" && diffMs > 0;
    const isExpired = club.subscription_status === "trial" && diffMs <= 0;
    return { daysLeft: Math.max(0, daysLeft), isActive, isExpired, endDate: end };
  })();

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

      <style>{`input:focus,select:focus,textarea:focus{border-color:${C.primary}!important;box-shadow:0 0 0 3px rgba(29,78,216,0.15)!important}@keyframes pulse-badge{0%,100%{transform:scale(1);box-shadow:0 0 0 0 rgba(220,38,38,0.5)}50%{transform:scale(1.08);box-shadow:0 0 0 6px rgba(220,38,38,0)}}`}</style>

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
                  HANDBALL<span style={{ color: C.primary }}>CONNECT</span>
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

          {/* Trial banner */}
          {trialInfo && (trialInfo.isActive || trialInfo.isExpired) && (
            <div
              style={{
                background: trialInfo.isExpired
                  ? "linear-gradient(135deg, rgba(239,68,68,0.12), rgba(239,68,68,0.04))"
                  : `linear-gradient(135deg, ${C.green}15, ${C.green}05)`,
                border: `1px solid ${trialInfo.isExpired ? "rgba(239,68,68,0.3)" : `${C.green}30`}`,
                borderRadius: 16,
                padding: "16px 20px",
                marginBottom: 20,
                display: "flex",
                alignItems: "center",
                gap: 16,
                flexWrap: "wrap",
              }}
            >
              <div style={{ fontSize: 28 }}>{trialInfo.isExpired ? "⏰" : "🎁"}</div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: trialInfo.isExpired ? "#EF4444" : C.green,
                    marginBottom: 2,
                  }}
                >
                  {trialInfo.isExpired
                    ? "Période d'essai expirée"
                    : `Essai gratuit · ${trialInfo.daysLeft} jour${trialInfo.daysLeft > 1 ? "s" : ""} restant${trialInfo.daysLeft > 1 ? "s" : ""}`}
                </div>
                <div style={{ fontSize: 12, color: C.muted }}>
                  {trialInfo.isExpired
                    ? `Souscrivez à ${planMeta.label} pour continuer à utiliser HandballConnect.`
                    : `Plan ${planMeta.label} actif jusqu'au ${trialInfo.endDate.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}`}
                </div>
              </div>
              <Link
                href="/?tab=tarifs"
                style={{
                  padding: "10px 18px",
                  borderRadius: 10,
                  background: trialInfo.isExpired
                    ? "linear-gradient(135deg,#EF4444,#DC2626)"
                    : `linear-gradient(135deg,${C.primary},${C.primaryDark})`,
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 700,
                  textDecoration: "none",
                  letterSpacing: 0.5,
                  whiteSpace: "nowrap",
                }}
              >
                {trialInfo.isExpired ? "Souscrire maintenant" : "Gérer l'abonnement"}
              </Link>
            </div>
          )}

          {/* Tab bar */}
          <div style={{ display: "flex", gap: 4, marginBottom: 24, background: "rgba(255,255,255,0.02)", border: `1px solid ${C.border}`, borderRadius: 14, padding: 4 }}>
            {[
              ["club", "🏟️ Mon Club", null],
              ["annonces", "📢 Annonces", pendingCount],
            ].map(([t, label, badge]) => (
              <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: "10px 16px", borderRadius: 10, border: "none", background: tab === t ? `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})` : "transparent", color: tab === t ? "#fff" : C.muted, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "all .2s", boxShadow: tab === t ? `0 4px 14px ${C.primary}30` : "none", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <span>{label}</span>
                {badge > 0 && (
                  <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 22, height: 22, padding: "0 6px", borderRadius: 11, background: tab === t ? "rgba(255,255,255,0.2)" : C.accent, color: "#fff", fontSize: 11, fontWeight: 800, animation: tab !== t ? "pulse-badge 1.6s ease-in-out infinite" : "none" }}>{badge}</span>
                )}
              </button>
            ))}
          </div>

          {/* ── ONGLET MON CLUB ── */}
          {tab === "club" && (<>

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

                {/* Présentation */}
                <div style={{ marginBottom: 20 }}>
                  <h4 style={{ fontSize: 11, color: C.dim, textTransform: "uppercase", letterSpacing: 2, marginBottom: 12, fontWeight: 600, borderBottom: `1px solid ${C.border}`, paddingBottom: 8 }}>📋 Présentation du club</h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                    <div>
                      <label style={labelStyle}>Année de création</label>
                      <input type="number" value={form.founded_year} onChange={(e) => upd("founded_year", e.target.value)} style={inpStyle} placeholder="Ex : 1985" min="1850" max={new Date().getFullYear()} />
                    </div>
                    <div>
                      <label style={labelStyle}>Nombre de licenciés</label>
                      <input type="number" value={form.member_count} onChange={(e) => upd("member_count", e.target.value)} style={inpStyle} placeholder="Ex : 250" min="0" max="10000" />
                    </div>
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <label style={labelStyle}>Objectifs du club</label>
                    <textarea value={form.goals} onChange={(e) => upd("goals", e.target.value)} placeholder="Ex : Montée en Nationale 3 d'ici 2027, structuration du centre de formation, développement du handball féminin…" rows={3} maxLength={500} style={{ ...inpStyle, resize: "vertical", lineHeight: 1.6, fontFamily: "inherit" }} />
                    <div style={{ textAlign: "right", fontSize: 10, color: C.dim, marginTop: 4 }}>{(form.goals || "").length}/500</div>
                  </div>
                  <div>
                    <label style={labelStyle}>Pourquoi rejoindre votre club ?</label>
                    <textarea value={form.motivation} onChange={(e) => upd("motivation", e.target.value)} placeholder="Ex : Ambiance familiale, infrastructures neuves, équipe technique diplômée, hébergement possible pour les joueurs venant de loin…" rows={4} maxLength={800} style={{ ...inpStyle, resize: "vertical", lineHeight: 1.6, fontFamily: "inherit" }} />
                    <div style={{ textAlign: "right", fontSize: 10, color: C.dim, marginTop: 4 }}>{(form.motivation || "").length}/800</div>
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

                {/* Présentation (view) */}
                {(club?.founded_year || club?.member_count || club?.goals || club?.motivation) && (
                  <div style={{ marginBottom: 18 }}>
                    <h4 style={{ fontSize: 11, color: C.dim, textTransform: "uppercase", letterSpacing: 2, marginBottom: 10, fontWeight: 600 }}>📋 Présentation</h4>
                    {(club?.founded_year || club?.member_count) && (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                        {[["Créé en", club?.founded_year || null], ["Licenciés", club?.member_count ? `${club.member_count}` : null]].map(([l, v], i) => (
                          <div key={i} style={{ padding: "12px 16px", background: "rgba(255,255,255,0.02)", borderRadius: 12, border: `1px solid ${C.border}` }}>
                            <div style={{ fontSize: 10, color: C.dim, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600, marginBottom: 4 }}>{l}</div>
                            <div style={{ fontSize: 14, color: v ? C.text : C.dim, fontWeight: 600 }}>{v || "—"}</div>
                          </div>
                        ))}
                      </div>
                    )}
                    {club?.goals && (
                      <div style={{ padding: "12px 16px", background: "rgba(255,255,255,0.02)", borderRadius: 12, border: `1px solid ${C.border}`, marginBottom: 10 }}>
                        <div style={{ fontSize: 10, color: C.dim, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600, marginBottom: 6 }}>🎯 Objectifs</div>
                        <p style={{ fontSize: 13, color: C.text, lineHeight: 1.6, margin: 0, whiteSpace: "pre-wrap" }}>{club.goals}</p>
                      </div>
                    )}
                    {club?.motivation && (
                      <div style={{ padding: "12px 16px", background: `${C.primary}08`, borderRadius: 12, border: `1px solid ${C.primary}20` }}>
                        <div style={{ fontSize: 10, color: C.primaryLight, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600, marginBottom: 6 }}>💎 Pourquoi nous rejoindre</div>
                        <p style={{ fontSize: 13, color: C.text, lineHeight: 1.6, margin: 0, whiteSpace: "pre-wrap" }}>{club.motivation}</p>
                      </div>
                    )}
                  </div>
                )}

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

          <div style={{ textAlign: "center", padding: "32px 0 16px", fontSize: 10, color: "rgba(255,255,255,0.12)" }}>
            HANDBALL CONNECT — Espace Club — {new Date().getFullYear()}
          </div>

          </>)}

          {/* ── ONGLET ANNONCES ── */}
          {tab === "annonces" && (<>

          {/* ═══════ MES ANNONCES & CANDIDATURES ═══════ */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}`, borderRadius: 18, padding: 28, marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
              <h3 style={{ fontSize: 18, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 2, color: C.primary, margin: 0 }}>📨 MES ANNONCES & CANDIDATURES</h3>
              <Link href="/publier-annonce" style={{ padding: "8px 16px", border: `1px solid ${C.primary}30`, borderRadius: 10, background: `${C.primary}10`, color: C.primaryLight, fontSize: 11, fontWeight: 600, textDecoration: "none" }}>+ Nouvelle annonce</Link>
            </div>

            {annoncesLoading ? (
              <div style={{ textAlign: "center", padding: 40, color: C.dim, fontSize: 13 }}>Chargement…</div>
            ) : myAnnonces.length === 0 ? (
              <div style={{ textAlign: "center", padding: 40, color: C.dim }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>📭</div>
                <p style={{ margin: 0, fontSize: 13 }}>Aucune annonce publiée pour le moment.</p>
                <Link href="/publier-annonce" style={{ display: "inline-block", marginTop: 12, padding: "10px 20px", background: `linear-gradient(135deg,${C.primary},${C.primaryDark})`, color: "#fff", borderRadius: 10, fontSize: 12, fontWeight: 700, textDecoration: "none" }}>Publier ma première annonce</Link>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {myAnnonces.map(a => {
                  const isTr = a.type === "trainer";
                  const ac = isTr ? C.accent : C.primary;
                  const isOpen = expanded === a.id;
                  const apps = a.applications || [];
                  const pending = apps.filter(x => x.status === "pending").length;
                  return (
                    <div key={a.id} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${pending > 0 ? C.accent + "40" : C.border}`, borderLeft: `3px solid ${ac}`, borderRadius: 12, overflow: "hidden" }}>
                      <div onClick={async () => {
                        const opening = !isOpen;
                        setExpanded(opening ? a.id : null);
                        if (opening && pending > 0) {
                          const pendingIds = apps.filter(x => x.status === "pending").map(x => x.id);
                          await supabase.from("applications").update({ status: "seen" }).in("id", pendingIds);
                          setMyAnnonces(prev => prev.map(x => x.id !== a.id ? x : ({
                            ...x,
                            applications: x.applications.map(app => app.status === "pending" ? { ...app, status: "seen" } : app),
                          })));
                        }
                      }} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "14px 18px", cursor: "pointer", transition: "background .2s" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                            <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: `${ac}15`, color: ac, fontWeight: 700, border: `1px solid ${ac}30` }}>{isTr ? "🎯 Coach" : "🤾 Joueur"}</span>
                            {a.is_urgent && <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: C.accent, color: "#fff", fontWeight: 700 }}>Urgent</span>}
                            {pending > 0 && <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: C.accent, color: "#fff", fontWeight: 700, animation: "pulse-badge 1.6s ease-in-out infinite" }}>🔔 {pending} nouveau{pending > 1 ? "x" : ""}</span>}
                          </div>
                          <h4 style={{ margin: 0, fontSize: 14, color: C.text, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.title}</h4>
                          <p style={{ margin: "2px 0 0", fontSize: 11, color: C.dim }}>{a.city || "—"} · {new Date(a.created_at).toLocaleDateString("fr-FR")}</p>
                        </div>
                        <div style={{ textAlign: "center", padding: "6px 14px", background: apps.length > 0 ? `${C.primary}15` : "rgba(255,255,255,0.04)", borderRadius: 10, border: `1px solid ${apps.length > 0 ? C.primary + "30" : C.border}`, minWidth: 70 }}>
                          <div style={{ fontSize: 18, fontWeight: 800, color: apps.length > 0 ? C.primaryLight : C.dim, fontFamily: "'Bebas Neue', sans-serif" }}>{apps.length}</div>
                          <div style={{ fontSize: 9, color: C.dim, textTransform: "uppercase", letterSpacing: 1, fontWeight: 600 }}>candidat{apps.length > 1 ? "s" : ""}</div>
                        </div>
                        <span style={{ fontSize: 14, color: C.dim, transform: isOpen ? "rotate(180deg)" : "", transition: "transform .2s" }}>▼</span>
                      </div>

                      {isOpen && (
                        <div style={{ borderTop: `1px solid ${C.border}`, background: "rgba(0,0,0,0.2)" }}>
                          {apps.length === 0 ? (
                            <div style={{ padding: 24, textAlign: "center", color: C.dim, fontSize: 12 }}>Aucune candidature reçue pour cette annonce.</div>
                          ) : (
                            <div style={{ display: "flex", flexDirection: "column" }}>
                              {apps.map(app => {
                                const ap = app.applicant;
                                const statusMeta = {
                                  pending: { label: "Nouveau", color: C.gold, bg: "rgba(251,191,36,0.1)" },
                                  seen: { label: "Vu", color: C.dim, bg: "rgba(255,255,255,0.05)" },
                                  accepted: { label: "Accepté", color: C.green, bg: "rgba(16,185,129,0.1)" },
                                  rejected: { label: "Refusé", color: C.accent, bg: "rgba(220,38,38,0.1)" },
                                }[app.status || "pending"];
                                return (
                                  <div key={app.id} style={{ padding: "16px 18px", borderBottom: `1px solid ${C.border}` }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10, flexWrap: "wrap" }}>
                                      <div style={{ width: 38, height: 38, borderRadius: "50%", background: `linear-gradient(135deg,${C.primary},${C.primaryDark})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 800, fontFamily: "'Bebas Neue', sans-serif" }}>
                                        {(ap?.first_name || "?")[0]}{(ap?.last_name || "?")[0]}
                                      </div>
                                      <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: 13, color: C.text, fontWeight: 700 }}>{ap ? `${ap.first_name || ""} ${ap.last_name || ""}` : "Candidat inconnu"}</div>
                                        <div style={{ fontSize: 11, color: C.dim }}>
                                          {ap?.position && `${ap.position} · `}{ap?.current_club || "Sans club"}{ap?.city && ` · ${ap.city}`}{ap?.age && ` · ${ap.age} ans`}
                                        </div>
                                      </div>
                                      <span style={{ fontSize: 10, padding: "4px 10px", borderRadius: 6, background: statusMeta.bg, color: statusMeta.color, fontWeight: 700, border: `1px solid ${statusMeta.color}30` }}>{statusMeta.label}</span>
                                      <span style={{ fontSize: 10, color: C.dim }}>{new Date(app.created_at).toLocaleDateString("fr-FR")}</span>
                                    </div>

                                    {app.message && (
                                      <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "10px 14px", marginBottom: 10, fontSize: 12, color: C.text, lineHeight: 1.6, fontStyle: "italic", borderLeft: `2px solid ${C.primary}40` }}>
                                        « {app.message} »
                                      </div>
                                    )}

                                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                                      {app.cv_url && (
                                        <a href={app.cv_url} target="_blank" rel="noopener noreferrer" style={{ padding: "6px 12px", background: `${C.primary}15`, color: C.primaryLight, borderRadius: 6, fontSize: 11, fontWeight: 600, textDecoration: "none", border: `1px solid ${C.primary}30` }}>📄 Télécharger CV</a>
                                      )}
                                      {ap?.email && (
                                        <a href={`mailto:${ap.email}`} style={{ padding: "6px 12px", background: "rgba(255,255,255,0.05)", color: C.text, borderRadius: 6, fontSize: 11, fontWeight: 600, textDecoration: "none", border: `1px solid ${C.border}` }}>✉️ {ap.email}</a>
                                      )}
                                      {ap?.phone && (
                                        <a href={`tel:${ap.phone}`} style={{ padding: "6px 12px", background: "rgba(255,255,255,0.05)", color: C.text, borderRadius: 6, fontSize: 11, fontWeight: 600, textDecoration: "none", border: `1px solid ${C.border}`, fontFamily: "monospace" }}>📱 {ap.phone}</a>
                                      )}
                                      {ap?.id && (
                                        <button onClick={() => window.dispatchEvent(new CustomEvent("hc-open-chat", { detail: { otherUserId: ap.id } }))} style={{ padding: "6px 12px", background: `${C.primary}15`, color: C.primaryLight, borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer", border: `1px solid ${C.primary}30` }}>💬 Discuter</button>
                                      )}
                                      <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                                        {app.status !== "accepted" && <button onClick={() => updateAppStatus(app.id, "accepted", a.id)} style={{ padding: "6px 10px", background: `${C.green}15`, color: C.green, border: `1px solid ${C.green}30`, borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>✓ Accepter</button>}
                                        {app.status !== "rejected" && <button onClick={() => updateAppStatus(app.id, "rejected", a.id)} style={{ padding: "6px 10px", background: `${C.accent}15`, color: C.accent, border: `1px solid ${C.accent}30`, borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>✕ Refuser</button>}
                                        {app.status === "pending" && <button onClick={() => updateAppStatus(app.id, "seen", a.id)} style={{ padding: "6px 10px", background: "rgba(255,255,255,0.05)", color: C.muted, border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>👁️ Vu</button>}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          </>)}

        </main>
      </div>
    </div>
  );
}
