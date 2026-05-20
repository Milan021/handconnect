"use client";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "../../lib/supabase";
import Link from "next/link";
import { getSectorById, getSectorLabel, getSectorColor, SECTORS } from "../../lib/sectors";
import { ATHLETE_SKILLS, getSkillLabel } from "../../lib/skills";
import ChatWidget from "../../components/ChatWidget";
import BetaFeedback from "../../components/BetaFeedback";
import NotificationBell from "../../components/NotificationBell";

const C = {
  primary: "#1D4ED8", primaryLight: "#3B82F6", primaryDark: "#1E3A8A",
  accent: "#DC2626", accentLight: "#F87171",
  bg: "#0A0E1A", bgCard: "rgba(255,255,255,0.03)", bgHover: "rgba(255,255,255,0.07)",
  surface: "#111827", border: "rgba(255,255,255,0.08)",
  text: "#F1F5F9", muted: "rgba(255,255,255,0.5)", dim: "rgba(255,255,255,0.3)",
  green: "#10B981", greenBg: "rgba(16,185,129,0.12)", gold: "#FBBF24",
};

const CONTRACT_COLORS = { CDI: "#10B981", CDD: "#3B82F6", alternance: "#8B5CF6", stage: "#F59E0B", interim: "#EF4444" };

function Bdg({ children, color = C.primary, filled }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", background: filled ? color : `${color}18`, color: filled ? "#fff" : color, borderRadius: 6, fontSize: 10, fontWeight: 700, border: `1px solid ${color}30`, letterSpacing: 0.8, textTransform: "uppercase", whiteSpace: "nowrap" }}>
      {children}
    </span>
  );
}

export default function ProDashboard() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("offers");
  const [toast, setToast] = useState("");
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [myApplications, setMyApplications] = useState([]);
  const [appLoading, setAppLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  // Chargement auth
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

  // Chargement offres
  useEffect(() => {
    if (!user) return;
    async function fetchJobs() {
      setJobsLoading(true);
      const { data } = await supabase
        .from("jobs")
        .select("*, companies(id,name,logo_url)")
        .eq("is_active", true)
        .eq("job_type", "reconversion")
        .order("created_at", { ascending: false });
      setJobs(data || []);
      setJobsLoading(false);
    }
    fetchJobs();
  }, [user]);

  // Chargement candidatures
  useEffect(() => {
    if (!user) return;
    async function fetchApps() {
      setAppLoading(true);
      const { data } = await supabase
        .from("job_applications")
        .select("*, jobs(title,company,city,contract_type,sector)")
        .eq("applicant_id", user.id)
        .order("created_at", { ascending: false });
      setMyApplications(data || []);
      setAppLoading(false);
    }
    fetchApps();
  }, [user]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3500); };

  const matchingScore = (job) => {
    let score = 0;
    if (!profile) return score;
    if (profile.desired_sectors && job.sector && profile.desired_sectors.includes(job.sector)) score += 40;
    if (profile.city && job.city && job.city.toLowerCase().includes(profile.city.toLowerCase())) score += 30;
    if (job.handball_compatible) score += 20;
    return score;
  };

  const sortedJobs = useMemo(() => {
    return [...jobs].sort((a, b) => matchingScore(b) - matchingScore(a));
  }, [jobs, profile]);

  const handleLogout = async () => { await supabase.auth.signOut(); window.location.href = "/login"; };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", color: C.dim, fontSize: 14 }}>
        Chargement...
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'DM Sans', sans-serif" }}>
      {toast && (
        <div style={{ position: "fixed", top: 24, right: 24, padding: "14px 22px", borderRadius: 14, zIndex: 9999, background: toast.startsWith("❌") ? "rgba(239,68,68,0.15)" : "rgba(16,185,129,0.15)", backdropFilter: "blur(20px)", border: `1px solid ${toast.startsWith("❌") ? "rgba(239,68,68,0.3)" : "rgba(16,185,129,0.3)"}`, color: toast.startsWith("❌") ? "#FCA5A5" : "#6EE7B7", fontSize: 13, fontWeight: 600 }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <header style={{ background: "rgba(10,14,26,0.9)", backdropFilter: "blur(20px)", borderBottom: `1px solid ${C.border}`, padding: "0 24px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, boxShadow: `0 4px 16px ${C.primary}30` }}>🤾</div>
            <div>
              <h1 style={{ fontSize: 22, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 3, color: "#fff", lineHeight: 1, margin: 0 }}>HANDBALL<span style={{ color: C.primary }}>CONNECT</span></h1>
              <span style={{ fontSize: 9, color: C.dim, letterSpacing: 2, fontWeight: 600 }}>ESPACE PRO</span>
            </div>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {profile?.is_pro && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 8, background: `${C.gold}12`, border: `1px solid ${C.gold}25` }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: C.gold, textTransform: "uppercase", letterSpacing: 1 }}>PRO</span>
              </div>
            )}
            <Link href="/coaching" style={{ padding: "8px 14px", borderRadius: 10, border: `1px solid ${C.border}`, background: "rgba(255,255,255,0.04)", color: C.dim, textDecoration: "none", fontSize: 11, fontWeight: 600 }}>🎓 Coaching</Link>
            <button onClick={() => setShowFeedback(true)} style={{ padding: "8px 14px", borderRadius: 10, border: `1px solid ${C.border}`, background: "rgba(255,255,255,0.04)", color: C.dim, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>💬 Feedback</button>
            <NotificationBell user={user} />
            <button onClick={handleLogout} style={{ padding: "8px 14px", borderRadius: 10, border: "1px solid rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.08)", color: "#EF4444", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>🚪 Déconnexion</button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
        {/* Welcome + Profile card */}
        <div style={{ background: `linear-gradient(135deg, ${C.primary}10, ${C.accent}05)`, border: `1px solid ${C.primary}20`, borderRadius: 20, padding: 28, marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <div style={{ width: 58, height: 58, borderRadius: 16, background: `${C.primary}15`, border: `1px solid ${C.primary}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>🎯</div>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: 26, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 2, margin: 0, color: "#fff" }}>
                Bienvenue, <span style={{ color: C.primary }}>{profile?.first_name || "Champion"}</span>
              </h2>
              <p style={{ fontSize: 13, color: C.muted, margin: "4px 0 0" }}>
                {profile?.current_league ? `${profile.current_league.toUpperCase()} — ` : ""}
                {profile?.contract_end_date ? `Fin de contrat : ${new Date(profile.contract_end_date).toLocaleDateString("fr-FR")}` : "Préparez votre reconversion"}
              </p>
            </div>
            <button onClick={() => setEditingProfile(!editingProfile)} style={{ padding: "10px 20px", borderRadius: 10, border: `1px solid ${C.primary}30`, background: `${C.primary}10`, color: C.primaryLight, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
              {editingProfile ? "Annuler" : "✏️ Mon profil reconversion"}
            </button>
          </div>
        </div>

        {/* Profile Editor */}
        {editingProfile && (
          <ProProfileEditor user={user} profile={profile} onSave={(p) => { setProfile(p); setEditingProfile(false); showToast("✅ Profil mis à jour"); }} onToast={showToast} />
        )}

        {/* Tabs */}
        {/* Matching button */}
        <div style={{ marginBottom: 20 }}>
          <Link href="/match" style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "14px 24px", borderRadius: 12, background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`, color: "#fff", textDecoration: "none", fontSize: 14, fontWeight: 700, boxShadow: `0 6px 20px ${C.primary}30` }}>
            🔍 Rechercher un emploi
          </Link>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 24, borderBottom: `1px solid ${C.border}`, paddingBottom: 12 }}>
          {[
            { key: "offers", label: "🎯 Offres pour moi", count: jobs.length },
            { key: "applications", label: "📨 Mes candidatures", count: myApplications.length },
            { key: "profile", label: "👤 Mon profil" },
          ].map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{ padding: "10px 18px", borderRadius: 10, border: "none", background: activeTab === tab.key ? `${C.primary}15` : "transparent", color: activeTab === tab.key ? C.primaryLight : C.dim, fontSize: 13, fontWeight: activeTab === tab.key ? 700 : 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
              {tab.label}
              {tab.count !== undefined && (
                <span style={{ padding: "2px 8px", borderRadius: 10, background: activeTab === tab.key ? `${C.primary}25` : "rgba(255,255,255,0.06)", fontSize: 10, color: activeTab === tab.key ? C.primaryLight : C.dim }}>{tab.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* Tab: Offres */}
        {activeTab === "offers" && (
          <div>
            {jobsLoading ? (
              <div style={{ textAlign: "center", padding: 60, color: C.dim }}>Chargement des offres...</div>
            ) : sortedJobs.length === 0 ? (
              <div style={{ textAlign: "center", padding: 60, background: C.bgCard, borderRadius: 16, border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
                <p style={{ color: C.dim, fontSize: 14 }}>Aucune offre de reconversion disponible pour le moment.</p>
                <p style={{ color: C.muted, fontSize: 12, marginTop: 8 }}>Complétez votre profil pour recevoir des suggestions personnalisées.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {sortedJobs.map((job) => {
                  const score = matchingScore(job);
                  const ctColor = CONTRACT_COLORS[job.contract_type?.toLowerCase()] || C.primary;
                  return (
                    <div key={job.id} onClick={() => setSelectedJob(job)} style={{ background: C.bgCard, borderRadius: 16, padding: 20, border: `1px solid ${C.border}`, borderLeft: `3px solid ${score >= 70 ? C.green : score >= 40 ? C.primary : C.border}`, cursor: "pointer", transition: "all .25s" }} onMouseEnter={e => { e.currentTarget.style.background = C.bgHover; e.currentTarget.style.transform = "translateX(4px)"; }} onMouseLeave={e => { e.currentTarget.style.background = C.bgCard; e.currentTarget.style.transform = ""; }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                            <Bdg color={ctColor}>{job.contract_type}</Bdg>
                            {job.sector && <Bdg color={getSectorColor(job.sector)}>{getSectorLabel(job.sector)}</Bdg>}
                            {job.handball_compatible && <Bdg color={C.green} filled>Compatible handball</Bdg>}
                            {score >= 70 && <Bdg color={C.green}>🔥 Match {score}%</Bdg>}
                          </div>
                          <h3 style={{ margin: "0 0 3px", fontSize: 15, fontWeight: 700, color: C.text }}>{job.title}</h3>
                          <p style={{ margin: 0, fontSize: 12, color: ctColor, fontWeight: 600 }}>{job.companies?.name || job.company} · {job.city}</p>
                        </div>
                        <span style={{ fontSize: 11, color: C.dim }}>{new Date(job.created_at).toLocaleDateString("fr-FR")}</span>
                      </div>
                      {job.athlete_profile && <p style={{ fontSize: 12, color: C.gold, margin: "8px 0 0", fontStyle: "italic" }}>💡 {job.athlete_profile}</p>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab: Applications */}
        {activeTab === "applications" && (
          <div>
            {appLoading ? (
              <div style={{ textAlign: "center", padding: 60, color: C.dim }}>Chargement...</div>
            ) : myApplications.length === 0 ? (
              <div style={{ textAlign: "center", padding: 60, background: C.bgCard, borderRadius: 16, border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
                <p style={{ color: C.dim, fontSize: 14 }}>Vous n'avez pas encore postulé à une offre.</p>
                <button onClick={() => setActiveTab("offers")} style={{ marginTop: 16, padding: "10px 20px", borderRadius: 10, background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`, color: "#fff", border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Découvrir les offres</button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {myApplications.map((app) => {
                  const statusMeta = {
                    pending: { label: "En attente", color: C.gold, bg: "rgba(251,191,36,0.1)" },
                    seen: { label: "Vu", color: C.dim, bg: "rgba(255,255,255,0.05)" },
                    interview: { label: "Entretien", color: C.primary, bg: `${C.primary}15` },
                    accepted: { label: "Accepté", color: C.green, bg: "rgba(16,185,129,0.1)" },
                    rejected: { label: "Refusé", color: C.accent, bg: "rgba(220,38,38,0.1)" },
                  }[app.status] || { label: app.status, color: C.dim, bg: "rgba(255,255,255,0.05)" };
                  return (
                    <div key={app.id} style={{ background: C.bgCard, borderRadius: 16, padding: 18, border: `1px solid ${C.border}` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <h4 style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 700, color: C.text }}>{app.jobs?.title}</h4>
                          <p style={{ margin: 0, fontSize: 12, color: C.dim }}>{app.jobs?.company} · {app.jobs?.city}</p>
                        </div>
                        <span style={{ padding: "4px 10px", borderRadius: 6, background: statusMeta.bg, color: statusMeta.color, fontSize: 10, fontWeight: 700, border: `1px solid ${statusMeta.color}30` }}>{statusMeta.label}</span>
                      </div>
                      <p style={{ fontSize: 11, color: C.muted, margin: "8px 0 0" }}>Postulé le {new Date(app.created_at).toLocaleDateString("fr-FR")}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab: Profile */}
        {activeTab === "profile" && profile && (
          <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 18, padding: 28 }}>
            <h3 style={{ fontSize: 18, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 2, color: C.primary, margin: "0 0 20px" }}>👤 MON PROFIL RECONVERSION</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
              {[
                ["Statut", profile.is_pro ? "Handballeur Pro ✅" : "Non renseigné"],
                ["Ligue", profile.current_league?.toUpperCase() || "—"],
                ["Fin de contrat", profile.contract_end_date ? new Date(profile.contract_end_date).toLocaleDateString("fr-FR") : "—"],
                ["Disponibilité", profile.availability_date ? new Date(profile.availability_date).toLocaleDateString("fr-FR") : "—"],
                ["Secteurs visés", profile.desired_sectors?.length ? profile.desired_sectors.map(getSectorLabel).join(", ") : "—"],
                ["Compétences", profile.athlete_skills?.length ? profile.athlete_skills.map(getSkillLabel).join(", ") : "—"],
                ["Salaire visé", profile.salary_expectation || "—"],
                ["Recherche active", profile.searching_job ? "Oui ✅" : "Non"],
              ].map(([label, value]) => (
                <div key={label} style={{ padding: "12px 16px", background: "rgba(255,255,255,0.02)", borderRadius: 12, border: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 10, color: C.dim, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600, marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 14, color: C.text, fontWeight: 600 }}>{value}</div>
                </div>
              ))}
            </div>
            {profile.bio_reconversion && (
              <div style={{ marginTop: 16, padding: "14px 16px", background: "rgba(255,255,255,0.02)", borderRadius: 12, border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 10, color: C.dim, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600, marginBottom: 6 }}>Bio reconversion</div>
                <p style={{ fontSize: 13, color: C.text, lineHeight: 1.6, margin: 0 }}>{profile.bio_reconversion}</p>
              </div>
            )}
            {profile.professional_goals && (
              <div style={{ marginTop: 12, padding: "14px 16px", background: `${C.primary}08`, borderRadius: 12, border: `1px solid ${C.primary}20` }}>
                <div style={{ fontSize: 10, color: C.primaryLight, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600, marginBottom: 6 }}>Objectifs professionnels</div>
                <p style={{ fontSize: 13, color: C.text, lineHeight: 1.6, margin: 0 }}>{profile.professional_goals}</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Job Modal */}
      {selectedJob && (
        <JobApplyModal job={selectedJob} user={user} profile={profile} onClose={() => setSelectedJob(null)} onApplied={() => {
          setSelectedJob(null);
          showToast("✅ Candidature envoyée !");
          // Refresh applications
          supabase.from("job_applications").select("*, jobs(title,company,city,contract_type,sector)").eq("applicant_id", user.id).order("created_at", { ascending: false }).then(({ data }) => setMyApplications(data || []));
        }} />
      )}

      {showFeedback && <BetaFeedback user={user} onClose={() => setShowFeedback(false)} />}

      <ChatWidget user={user} />

      <div style={{ textAlign: "center", padding: "32px 0 16px", fontSize: 10, color: "rgba(255,255,255,0.12)" }}>
        HANDBALL CONNECT — Espace Pro — {new Date().getFullYear()}
      </div>
    </div>
  );
}

/* ═══════ PROFILE EDITOR ═══════ */
function ProProfileEditor({ user, profile, onSave, onToast }) {
  const [form, setForm] = useState({
    is_pro: profile?.is_pro || false,
    current_league: profile?.current_league || "",
    contract_end_date: profile?.contract_end_date ? new Date(profile.contract_end_date).toISOString().split("T")[0] : "",
    desired_sectors: profile?.desired_sectors || [],
    athlete_skills: profile?.athlete_skills || [],
    availability_date: profile?.availability_date ? new Date(profile.availability_date).toISOString().split("T")[0] : "",
    salary_expectation: profile?.salary_expectation || "",
    bio_reconversion: profile?.bio_reconversion || "",
    professional_goals: profile?.professional_goals || "",
    searching_job: profile?.searching_job || false,
    linkedin_url: profile?.linkedin_url || "",
  });
  const [saving, setSaving] = useState(false);

  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const toggleArray = (k, v) => setForm(p => ({
    ...p,
    [k]: p[k]?.includes(v) ? p[k].filter(x => x !== v) : [...(p[k] || []), v],
  }));

  const save = async () => {
    setSaving(true);
    const fields = {
      is_pro: form.is_pro,
      current_league: form.current_league || null,
      contract_end_date: form.contract_end_date || null,
      desired_sectors: form.desired_sectors.length ? form.desired_sectors : null,
      athlete_skills: form.athlete_skills.length ? form.athlete_skills : null,
      availability_date: form.availability_date || null,
      salary_expectation: form.salary_expectation || null,
      bio_reconversion: form.bio_reconversion || null,
      professional_goals: form.professional_goals || null,
      searching_job: form.searching_job,
      linkedin_url: form.linkedin_url || null,
    };
    const { error } = await supabase.from("profiles").update(fields).eq("id", user.id);
    setSaving(false);
    if (error) { onToast("❌ " + error.message); return; }
    onSave({ ...profile, ...fields });
  };

  const inpS = { width: "100%", padding: "12px 16px", background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, borderRadius: 12, color: C.text, fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" };
  const lblS = { fontSize: 10, color: C.dim, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600, marginBottom: 6, display: "block" };

  return (
    <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 18, padding: 28, marginBottom: 24 }}>
      <h3 style={{ fontSize: 18, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 2, color: C.primary, margin: "0 0 20px" }}>✏️ MON PROFIL RECONVERSION</h3>

      {/* Statut pro toggle */}
      <div onClick={() => upd("is_pro", !form.is_pro)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", background: form.is_pro ? `${C.green}08` : "rgba(255,255,255,0.02)", border: `1px solid ${form.is_pro ? `${C.green}30` : C.border}`, borderRadius: 12, cursor: "pointer", marginBottom: 20 }}>
        <div style={{ width: 40, height: 22, borderRadius: 11, background: form.is_pro ? C.green : "rgba(255,255,255,0.1)", position: "relative" }}>
          <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, left: form.is_pro ? 20 : 2, transition: "left .25s" }} />
        </div>
        <div>
          <div style={{ fontSize: 13, color: C.text, fontWeight: 600 }}>Je suis handballeur professionnel</div>
          <div style={{ fontSize: 11, color: C.muted }}>{form.is_pro ? "Profil visible pour les entreprises" : "Profil non identifié comme pro"}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
        <div><label style={lblS}>Ligue actuelle</label><select value={form.current_league} onChange={e => upd("current_league", e.target.value)} style={{ ...inpS, cursor: "pointer" }}><option value="">—</option><option value="lnh">LNH</option><option value="proligue">Proligue</option><option value="starligue">Starligue</option><option value="d1f">D1 Féminine</option><option value="d2f">D2 Féminine</option><option value="d2m">D2 Masculine</option></select></div>
        <div><label style={lblS}>Fin de contrat</label><input type="date" value={form.contract_end_date} onChange={e => upd("contract_end_date", e.target.value)} style={inpS} /></div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={lblS}>Secteurs d'activité visés</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {SECTORS.filter(s => s.id !== "autre").map(s => {
            const on = form.desired_sectors?.includes(s.id);
            return (
              <button key={s.id} type="button" onClick={() => toggleArray("desired_sectors", s.id)} style={{ padding: "8px 14px", borderRadius: 10, border: `1px solid ${on ? `${s.color}60` : C.border}`, background: on ? `${s.color}18` : "rgba(255,255,255,0.02)", color: on ? "#fff" : C.muted, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                {s.icon} {s.label}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={lblS}>Compétences transférables</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {ATHLETE_SKILLS.map(s => {
            const on = form.athlete_skills?.includes(s.id);
            return (
              <button key={s.id} type="button" onClick={() => toggleArray("athlete_skills", s.id)} style={{ padding: "8px 14px", borderRadius: 10, border: `1px solid ${on ? `${C.primary}60` : C.border}`, background: on ? `${C.primary}18` : "rgba(255,255,255,0.02)", color: on ? "#fff" : C.muted, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
        <div><label style={lblS}>Date de disponibilité</label><input type="date" value={form.availability_date} onChange={e => upd("availability_date", e.target.value)} style={inpS} /></div>
        <div><label style={lblS}>Salaire visé</label><input value={form.salary_expectation} onChange={e => upd("salary_expectation", e.target.value)} placeholder="Ex: 2000-2500€ net/mois" style={inpS} /></div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={lblS}>LinkedIn (optionnel)</label>
        <input type="url" value={form.linkedin_url} onChange={e => upd("linkedin_url", e.target.value)} placeholder="https://linkedin.com/in/..." style={inpS} />
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={lblS}>Bio reconversion</label>
        <textarea value={form.bio_reconversion} onChange={e => upd("bio_reconversion", e.target.value)} placeholder="Parlez de votre parcours sportif et de ce que vous apportez en entreprise..." rows={3} style={{ ...inpS, resize: "vertical", lineHeight: 1.6 }} />
      </div>

      <div style={{ marginBottom: 24 }}>
        <label style={lblS}>Objectifs professionnels</label>
        <textarea value={form.professional_goals} onChange={e => upd("professional_goals", e.target.value)} placeholder="Décrivez votre projet professionnel après le handball..." rows={3} style={{ ...inpS, resize: "vertical", lineHeight: 1.6 }} />
      </div>

      <div onClick={() => upd("searching_job", !form.searching_job)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", background: form.searching_job ? `${C.green}08` : "rgba(255,255,255,0.02)", border: `1px solid ${form.searching_job ? `${C.green}30` : C.border}`, borderRadius: 12, cursor: "pointer", marginBottom: 20 }}>
        <div style={{ width: 40, height: 22, borderRadius: 11, background: form.searching_job ? C.green : "rgba(255,255,255,0.1)", position: "relative" }}>
          <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, left: form.searching_job ? 20 : 2, transition: "left .25s" }} />
        </div>
        <div>
          <div style={{ fontSize: 13, color: C.text, fontWeight: 600 }}>Je recherche activement un emploi</div>
          <div style={{ fontSize: 11, color: C.muted }}>{form.searching_job ? "Visible dans les recherches entreprise" : "Non visible"}</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
        <button onClick={save} disabled={saving} style={{ padding: "12px 32px", border: "none", borderRadius: 12, background: saving ? "rgba(255,255,255,0.06)" : `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`, color: saving ? C.dim : "#fff", fontSize: 13, fontWeight: 700, cursor: saving ? "wait" : "pointer", boxShadow: saving ? "none" : `0 6px 20px ${C.primary}30` }}>
          {saving ? "Enregistrement..." : "💾 Enregistrer"}
        </button>
      </div>
    </div>
  );
}

/* ═══════ JOB APPLY MODAL ═══════ */
function JobApplyModal({ job, user, profile, onClose, onApplied }) {
  const [message, setMessage] = useState("");
  const [useProfileCv, setUseProfileCv] = useState(true);
  const [customCv, setCustomCv] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");

  const submit = async () => {
    setErr(""); setSubmitting(true);
    let cv_url = null, cv_filename = null;
    if (useProfileCv && profile?.cv_url) { cv_url = profile.cv_url; cv_filename = profile.cv_filename || "cv.pdf"; }
    else if (customCv) {
      if (customCv.type !== "application/pdf") { setErr("PDF uniquement"); setSubmitting(false); return; }
      if (customCv.size > 5 * 1024 * 1024) { setErr("Max 5 Mo"); setSubmitting(false); return; }
      const path = `${user.id}/job-${job.id}-${Date.now()}.pdf`;
      const { error: upErr } = await supabase.storage.from("cvs").upload(path, customCv, { contentType: "application/pdf", upsert: false });
      if (upErr) { setErr("Upload : " + upErr.message); setSubmitting(false); return; }
      const { data: pub } = supabase.storage.from("cvs").getPublicUrl(path);
      cv_url = pub?.publicUrl; cv_filename = customCv.name;
    }
    const { error: dbErr } = await supabase.from("job_applications").insert({
      job_id: job.id, applicant_id: user.id,
      message: message.trim() || null, cv_url, cv_filename,
    });
    if (dbErr) { setErr(dbErr.message); setSubmitting(false); return; }
    setSubmitting(false);
    onApplied();
  };

  const ctColor = CONTRACT_COLORS[job.contract_type?.toLowerCase()] || C.primary;

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(12px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: `linear-gradient(180deg,${C.surface},${C.bg})`, borderRadius: 24, maxWidth: 520, width: "100%", maxHeight: "90vh", overflowY: "auto", border: `1px solid ${C.border}` }}>
        <div style={{ padding: "24px 28px", background: `${ctColor}10`, borderBottom: `1px solid ${ctColor}20`, position: "relative" }}>
          <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "rgba(255,255,255,0.06)", border: "none", color: C.dim, width: 32, height: 32, borderRadius: "50%", cursor: "pointer", fontSize: 16 }}>✕</button>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
            <Bdg color={ctColor}>{job.contract_type}</Bdg>
            {job.sector && <Bdg color={getSectorColor(job.sector)}>{getSectorLabel(job.sector)}</Bdg>}
            {job.handball_compatible && <Bdg color={C.green} filled>Compatible handball</Bdg>}
          </div>
          <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700, color: C.text }}>{job.title}</h2>
          <p style={{ margin: 0, fontSize: 13, color: ctColor, fontWeight: 600 }}>{job.companies?.name || job.company} · {job.city}</p>
        </div>
        <div style={{ padding: 28 }}>
          <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.7, margin: "0 0 16px" }}>{job.description}</p>
          {job.salary_range && <div style={{ background: `${ctColor}08`, borderRadius: 12, padding: 14, border: `1px solid ${ctColor}15`, marginBottom: 16, textAlign: "center" }}><span style={{ fontSize: 11, color: C.dim, textTransform: "uppercase", letterSpacing: 1.5 }}>Rémunération</span><div style={{ fontSize: 20, color: ctColor, fontWeight: 800, fontFamily: "'Bebas Neue',sans-serif", marginTop: 4 }}>{job.salary_range}</div></div>}
          {job.athlete_profile && <div style={{ padding: "12px 16px", background: `${C.gold}08`, borderRadius: 10, border: `1px solid ${C.gold}20`, marginBottom: 16 }}><div style={{ fontSize: 10, color: C.gold, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600, marginBottom: 4 }}>Profil recherché</div><p style={{ fontSize: 13, color: C.text, margin: 0 }}>{job.athlete_profile}</p></div>}

          <h4 style={{ fontSize: 11, color: C.dim, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600, marginBottom: 10 }}>Votre candidature</h4>
          <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Présentez-vous et expliquez pourquoi vous correspondez au poste..." rows={4} style={{ width: "100%", padding: "12px 14px", background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 13, outline: "none", resize: "vertical", fontFamily: "inherit", lineHeight: 1.6, boxSizing: "border-box", marginBottom: 14 }} />

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 10, color: C.dim, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600, marginBottom: 6, display: "block" }}>CV</label>
            {profile?.cv_url && (
              <label style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: useProfileCv ? `${C.primary}10` : "rgba(255,255,255,0.02)", border: `1px solid ${useProfileCv ? C.primary + "40" : C.border}`, borderRadius: 10, cursor: "pointer", marginBottom: 8 }}>
                <input type="radio" checked={useProfileCv} onChange={() => { setUseProfileCv(true); setCustomCv(null); }} style={{ accentColor: C.primary }} />
                <div><div style={{ fontSize: 12, color: C.text, fontWeight: 600 }}>Mon CV enregistré</div><div style={{ fontSize: 10, color: C.dim }}>{profile.cv_filename || "cv.pdf"}</div></div>
              </label>
            )}
            <label style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: !useProfileCv ? `${C.primary}10` : "rgba(255,255,255,0.02)", border: `1px solid ${!useProfileCv ? C.primary + "40" : C.border}`, borderRadius: 10, cursor: "pointer" }}>
              {profile?.cv_url && <input type="radio" checked={!useProfileCv} onChange={() => setUseProfileCv(false)} style={{ accentColor: C.primary }} />}
              <div style={{ flex: 1 }}><div style={{ fontSize: 12, color: C.text, fontWeight: 600 }}>{profile?.cv_url ? "Utiliser un autre CV (PDF)" : "Joindre un CV (PDF, max 5 Mo)"}</div>{!useProfileCv && customCv && <div style={{ fontSize: 10, color: C.green }}>✓ {customCv.name}</div>}</div>
              {!useProfileCv && <span style={{ padding: "6px 12px", background: `${C.primary}20`, color: C.primaryLight, borderRadius: 6, fontSize: 11, fontWeight: 600 }}>Choisir</span>}
              <input type="file" accept="application/pdf" onChange={e => { const f = e.target.files?.[0]; if (f) { setCustomCv(f); setUseProfileCv(false); } }} style={{ display: "none" }} />
            </label>
          </div>

          {err && <div style={{ padding: "10px 14px", background: `${C.accent}10`, border: `1px solid ${C.accent}30`, borderRadius: 10, color: C.accent, fontSize: 12, marginBottom: 14 }}>{err}</div>}
          <button onClick={submit} disabled={submitting} style={{ width: "100%", padding: "14px 0", border: "none", borderRadius: 12, background: submitting ? "rgba(255,255,255,0.08)" : `linear-gradient(135deg,${C.primary},${C.primaryDark})`, color: "#fff", fontSize: 13, fontWeight: 700, cursor: submitting ? "wait" : "pointer" }}>{submitting ? "Envoi..." : "Envoyer ma candidature"}</button>
        </div>
      </div>
    </div>
  );
}
