"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import Link from "next/link";

const C = {
  primary: "#1D4ED8", primaryLight: "#3B82F6", primaryDark: "#1E3A8A",
  accent: "#DC2626", accentLight: "#F87171",
  bg: "#0A0E1A", bgCard: "rgba(255,255,255,0.03)", bgHover: "rgba(255,255,255,0.07)",
  surface: "#111827", border: "rgba(255,255,255,0.08)",
  text: "#F1F5F9", muted: "rgba(255,255,255,0.5)", dim: "rgba(255,255,255,0.3)",
  green: "#10B981", gold: "#FBBF24",
};

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("metrics");

  const [metrics, setMetrics] = useState(null);
  const [signups, setSignups] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [placements, setPlacements] = useState([]);

  useEffect(() => {
    async function init() {
      const { data: { user: u } } = await supabase.auth.getUser();
      if (!u) { window.location.href = "/login"; return; }
      setUser(u);
      const { data: p } = await supabase.from("profiles").select("*").eq("id", u.id).single();
      if (p?.role !== "admin") { window.location.href = "/"; return; }
      setProfile(p);
      setLoading(false);
    }
    init();
  }, []);

  useEffect(() => {
    if (!profile || profile.role !== "admin") return;
    loadData();
  }, [profile, activeTab]);

  async function loadData() {
    if (activeTab === "metrics" || activeTab === "overview") {
      const { data: m } = await supabase.from("beta_metrics").select("*").order("metric_date", { ascending: false }).limit(1).maybeSingle();
      setMetrics(m);
    }
    if (activeTab === "signups") {
      const { data } = await supabase.from("beta_signups").select("*").order("created_at", { ascending: false });
      setSignups(data || []);
    }
    if (activeTab === "feedback") {
      const { data } = await supabase.from("beta_feedback").select("*").order("created_at", { ascending: false });
      setFeedback(data || []);
    }
    if (activeTab === "users") {
      const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(50);
      setProfiles(data || []);
    }
    if (activeTab === "companies") {
      const { data } = await supabase.from("companies").select("*, profiles(first_name,last_name)").order("created_at", { ascending: false });
      setCompanies(data || []);
    }
    if (activeTab === "placements") {
      const { data } = await supabase.from("placements").select("*, jobs(title), profiles(first_name,last_name), companies(name)").order("created_at", { ascending: false });
      setPlacements(data || []);
    }
  }

  const handleLogout = async () => { await supabase.auth.signOut(); window.location.href = "/login"; };

  if (loading) return <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", color: C.dim }}>Chargement...</div>;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'DM Sans', sans-serif" }}>
      <header style={{ background: "rgba(10,14,26,0.9)", backdropFilter: "blur(20px)", borderBottom: `1px solid ${C.border}`, padding: "0 24px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🤾</div>
            <h1 style={{ fontSize: 22, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 3, color: "#fff", lineHeight: 1, margin: 0 }}>HANDBALL<span style={{ color: C.primary }}>CONNECT</span></h1>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 11, color: C.gold, padding: "4px 10px", borderRadius: 6, background: `${C.gold}12`, border: `1px solid ${C.gold}25`, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Admin</span>
            <button onClick={handleLogout} style={{ padding: "8px 14px", borderRadius: 10, border: "1px solid rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.08)", color: "#EF4444", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>🚪 Déconnexion</button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
        <h2 style={{ fontSize: 28, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 2, color: "#fff", margin: "0 0 24px" }}>DASHBOARD <span style={{ color: C.primary }}>ADMIN</span></h2>

        <div style={{ display: "flex", gap: 8, marginBottom: 24, borderBottom: `1px solid ${C.border}`, paddingBottom: 12, flexWrap: "wrap" }}>
          {[
            { key: "overview", label: "📊 Vue d'ensemble" },
            { key: "signups", label: "📝 Inscriptions beta" },
            { key: "feedback", label: "💬 Feedback" },
            { key: "users", label: "👤 Utilisateurs" },
            { key: "companies", label: "🏢 Entreprises" },
            { key: "placements", label: "✅ Placements" },
          ].map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)} style={{ padding: "10px 16px", borderRadius: 10, border: "none", background: activeTab === t.key ? `${C.primary}15` : "transparent", color: activeTab === t.key ? C.primaryLight : C.dim, fontSize: 12, fontWeight: activeTab === t.key ? 700 : 600, cursor: "pointer" }}>{t.label}</button>
          ))}
        </div>

        {activeTab === "overview" && metrics && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14 }}>
            {[
              { label: "Inscriptions beta", value: metrics.total_signups || 0, color: C.primary },
              { label: "Joueurs", value: metrics.signups_joueurs || 0, color: C.green },
              { label: "Entreprises", value: metrics.signups_entreprises || 0, color: C.accent },
              { label: "Profils pros", value: metrics.active_profiles || 0, color: C.gold },
              { label: "Entreprises actives", value: metrics.active_companies || 0, color: C.accentLight },
              { label: "Offres publiées", value: metrics.jobs_posted || 0, color: C.primaryLight },
              { label: "Candidatures", value: metrics.applications_sent || 0, color: C.green },
              { label: "Placements", value: metrics.placements || 0, color: C.gold },
            ].map((stat, i) => (
              <div key={i} style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20, textAlign: "center" }}>
                <div style={{ fontSize: 32, fontFamily: "'Bebas Neue', sans-serif", color: stat.color, letterSpacing: 1 }}>{stat.value}</div>
                <div style={{ fontSize: 11, color: C.dim, marginTop: 4, textTransform: "uppercase", letterSpacing: 1 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "signups" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {signups.length === 0 && <p style={{ color: C.dim }}>Aucune inscription.</p>}
            {signups.map(s => (
              <div key={s.id} style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{s.first_name} {s.last_name}</span>
                    <span style={{ fontSize: 11, color: C.muted, marginLeft: 8 }}>{s.email}</span>
                  </div>
                  <span style={{ padding: "3px 10px", borderRadius: 6, background: s.type === "joueur" ? `${C.green}12` : `${C.accent}12`, color: s.type === "joueur" ? C.green : C.accent, fontSize: 10, fontWeight: 700, border: `1px solid ${s.type === "joueur" ? `${C.green}30` : `${C.accent}30`}` }}>{s.type}</span>
                </div>
                <div style={{ fontSize: 11, color: C.dim, marginTop: 6 }}>
                  {s.current_club && <span>Club: {s.current_club} · </span>}
                  {s.current_league && <span>Ligue: {s.current_league.toUpperCase()} · </span>}
                  {s.company_name && <span>Entreprise: {s.company_name} · </span>}
                  Inscrit le {new Date(s.created_at).toLocaleDateString("fr-FR")}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "feedback" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {feedback.length === 0 && <p style={{ color: C.dim }}>Aucun feedback.</p>}
            {feedback.map(f => (
              <div key={f.id} style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ padding: "3px 8px", borderRadius: 4, background: `${C.primary}15`, color: C.primaryLight, fontSize: 10, fontWeight: 700 }}>{f.type}</span>
                    {f.rating && <span style={{ color: C.gold, fontSize: 12 }}>{"★".repeat(f.rating)}{"☆".repeat(5 - f.rating)}</span>}
                  </div>
                  <span style={{ fontSize: 10, color: C.dim }}>{new Date(f.created_at).toLocaleDateString("fr-FR")}</span>
                </div>
                <p style={{ fontSize: 13, color: C.text, margin: "8px 0 0", lineHeight: 1.5 }}>{f.message}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === "users" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {profiles.map(p => (
              <div key={p.id} style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{p.first_name} {p.last_name}</span>
                  <span style={{ fontSize: 11, color: C.dim, marginLeft: 8 }}>{p.email}</span>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {p.is_pro && <span style={{ padding: "2px 8px", borderRadius: 4, background: `${C.gold}12`, color: C.gold, fontSize: 10, fontWeight: 700 }}>PRO</span>}
                  <span style={{ padding: "2px 8px", borderRadius: 4, background: `${C.primary}12`, color: C.primaryLight, fontSize: 10, fontWeight: 700 }}>{p.role}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "companies" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {companies.map(c => (
              <div key={c.id} style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{c.name}</div>
                <div style={{ fontSize: 11, color: C.dim, marginTop: 2 }}>{c.sector} · {c.city} · {c.size} · {c.profiles?.first_name} {c.profiles?.last_name}</div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "placements" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {placements.length === 0 && <p style={{ color: C.dim }}>Aucun placement.</p>}
            {placements.map(pl => (
              <div key={pl.id} style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{pl.profiles?.first_name} {pl.profiles?.last_name} → {pl.companies?.name}</div>
                <div style={{ fontSize: 11, color: C.dim, marginTop: 2 }}>Poste: {pl.jobs?.title} · Commission: {pl.commission_amount}€ · {new Date(pl.placement_date).toLocaleDateString("fr-FR")}</div>
              </div>
            ))}
          </div>
        )}
      </main>

      <div style={{ textAlign: "center", padding: "32px 0 16px", fontSize: 10, color: "rgba(255,255,255,0.12)" }}>
        HANDBALL CONNECT — Admin — {new Date().getFullYear()}
      </div>
    </div>
  );
}
