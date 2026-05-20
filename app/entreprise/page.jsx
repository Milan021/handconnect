"use client";
import { useState, useEffect } from "react";
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

const COMPANY_SIZES = [
  { value: "TPE", label: "TPE (< 10 salariés)" },
  { value: "PME", label: "PME (10-250 salariés)" },
  { value: "ETI", label: "ETI (250-5000 salariés)" },
  { value: "grand_groupe", label: "Grand groupe (> 5000 salariés)" },
];

const CONTRACT_TYPES = ["CDI", "CDD", "alternance", "stage", "interim", "mi-temps", "temps-partiel"];

export default function EntrepriseDashboard() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("company");
  const [toast, setToast] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);

  // Offres
  const [myJobs, setMyJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [expandedJob, setExpandedJob] = useState(null);

  // Candidatures
  const [jobApplications, setJobApplications] = useState({});

  // Handballeurs
  const [proPlayers, setProPlayers] = useState([]);
  const [playersLoading, setPlayersLoading] = useState(true);

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

  // Charger company
  useEffect(() => {
    if (!user) return;
    async function fetchCompany() {
      const { data } = await supabase.from("companies").select("*").eq("owner_id", user.id).maybeSingle();
      setCompany(data);
    }
    fetchCompany();
  }, [user]);

  // Charger offres
  useEffect(() => {
    if (!user) return;
    async function fetchJobs() {
      setJobsLoading(true);
      const { data } = await supabase
        .from("jobs")
        .select("*")
        .or(`author_id.eq.${user.id},company_id.in.(${company?.id || '00000000-0000-0000-0000-000000000000'})`)
        .order("created_at", { ascending: false });
      setMyJobs(data || []);
      setJobsLoading(false);
    }
    fetchJobs();
  }, [user, company]);

  // Charger candidatures par offre
  useEffect(() => {
    if (!myJobs.length) return;
    async function fetchApps() {
      const ids = myJobs.map(j => j.id);
      const { data } = await supabase
        .from("job_applications")
        .select("*, profiles(id,first_name,last_name,current_league,position,city,age,height_cm,athlete_skills,desired_sectors,bio_reconversion)")
        .in("job_id", ids)
        .order("created_at", { ascending: false });
      const grouped = {};
      (data || []).forEach(app => {
        if (!grouped[app.job_id]) grouped[app.job_id] = [];
        grouped[app.job_id].push(app);
      });
      setJobApplications(grouped);
    }
    fetchApps();
  }, [myJobs]);

  // Charger handballeurs pro
  useEffect(() => {
    if (!user) return;
    async function fetchPlayers() {
      setPlayersLoading(true);
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("is_pro", true)
        .eq("searching_job", true)
        .order("created_at", { ascending: false })
        .limit(50);
      setProPlayers(data || []);
      setPlayersLoading(false);
    }
    fetchPlayers();
  }, [user]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3500); };
  const handleLogout = async () => { await supabase.auth.signOut(); window.location.href = "/login"; };

  if (loading) {
    return <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", color: C.dim }}>Chargement...</div>;
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'DM Sans', sans-serif" }}>
      {toast && (
        <div style={{ position: "fixed", top: 24, right: 24, padding: "14px 22px", borderRadius: 14, zIndex: 9999, background: toast.startsWith("❌") ? "rgba(239,68,68,0.15)" : "rgba(16,185,129,0.15)", backdropFilter: "blur(20px)", border: `1px solid ${toast.startsWith("❌") ? "rgba(239,68,68,0.3)" : "rgba(16,185,129,0.3)"}`, color: toast.startsWith("❌") ? "#FCA5A5" : "#6EE7B7", fontSize: 13, fontWeight: 600 }}>{toast}</div>
      )}

      {/* Header */}
      <header style={{ background: "rgba(10,14,26,0.9)", backdropFilter: "blur(20px)", borderBottom: `1px solid ${C.border}`, padding: "0 24px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🤾</div>
            <div>
              <h1 style={{ fontSize: 22, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 3, color: "#fff", margin: 0 }}>HANDBALL<span style={{ color: C.primary }}>CONNECT</span></h1>
              <span style={{ fontSize: 9, color: C.dim, letterSpacing: 2, fontWeight: 600 }}>ESPACE ENTREPRISE</span>
            </div>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => setShowFeedback(true)} style={{ padding: "8px 14px", borderRadius: 10, border: `1px solid ${C.border}`, background: "rgba(255,255,255,0.04)", color: C.dim, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>💬 Feedback</button>
            <NotificationBell user={user} />
            <button onClick={handleLogout} style={{ padding: "8px 14px", borderRadius: 10, border: "1px solid rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.08)", color: "#EF4444", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>🚪 Déconnexion</button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
        {/* Welcome */}
        <div style={{ background: `linear-gradient(135deg, ${C.accent}10, ${C.primary}05)`, border: `1px solid ${C.accent}20`, borderRadius: 20, padding: 28, marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <div style={{ width: 58, height: 58, borderRadius: 16, background: `${C.accent}15`, border: `1px solid ${C.accent}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>🏢</div>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: 26, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 2, margin: 0, color: "#fff" }}>
                {company?.name ? <><span style={{ color: C.accent }}>{company.name}</span></> : <>Bienvenue, <span style={{ color: C.accent }}>{profile?.first_name || "Recruteur"}</span></>}
              </h2>
              <p style={{ fontSize: 13, color: C.muted, margin: "4px 0 0" }}>Recrutez des profils d'exception issus du handball professionnel.</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24, borderBottom: `1px solid ${C.border}`, paddingBottom: 12 }}>
          {[
            { key: "company", label: "🏢 Mon entreprise" },
            { key: "offers", label: "📢 Mes offres", count: myJobs.length },
            { key: "players", label: "🤾 Profils handballeurs", count: proPlayers.length },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{ padding: "10px 18px", borderRadius: 10, border: "none", background: activeTab === tab.key ? `${C.accent}15` : "transparent", color: activeTab === tab.key ? C.accentLight : C.dim, fontSize: 13, fontWeight: activeTab === tab.key ? 700 : 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
              {tab.label}
              {tab.count !== undefined && <span style={{ padding: "2px 8px", borderRadius: 10, background: activeTab === tab.key ? `${C.accent}25` : "rgba(255,255,255,0.06)", fontSize: 10 }}>{tab.count}</span>}
            </button>
          ))}
        </div>

        {/* Tab: Company */}
        {activeTab === "company" && (
          <CompanyEditor user={user} company={company} onSave={(c) => { setCompany(c); showToast("✅ Entreprise mise à jour"); }} />
        )}

        {/* Tab: Offers */}
        {activeTab === "offers" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 2, color: C.accent, margin: 0 }}>📢 MES OFFRES D'EMPLOI</h3>
              <button onClick={() => setActiveTab("new-offer")} style={{ padding: "10px 20px", borderRadius: 10, background: `linear-gradient(135deg, ${C.accent}, #991B1B)`, color: "#fff", border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>+ Nouvelle offre</button>
            </div>

            {jobsLoading ? (
              <div style={{ textAlign: "center", padding: 40, color: C.dim }}>Chargement...</div>
            ) : myJobs.length === 0 ? (
              <div style={{ textAlign: "center", padding: 60, background: C.bgCard, borderRadius: 16, border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
                <p style={{ color: C.dim }}>Aucune offre publiée.</p>
                <button onClick={() => setActiveTab("new-offer")} style={{ marginTop: 16, padding: "12px 24px", borderRadius: 10, background: `linear-gradient(135deg, ${C.accent}, #991B1B)`, color: "#fff", border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Publier ma première offre</button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {myJobs.map(job => {
                  const apps = jobApplications[job.id] || [];
                  const isOpen = expandedJob === job.id;
                  return (
                    <div key={job.id} style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderLeft: `3px solid ${job.is_active ? C.accent : C.dim}`, borderRadius: 12, overflow: "hidden" }}>
                      <div onClick={() => setExpandedJob(isOpen ? null : job.id)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "14px 18px", cursor: "pointer" }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                            <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: `${C.accent}15`, color: C.accent, fontWeight: 700, border: `1px solid ${C.accent}30` }}>{job.contract_type}</span>
                            {job.reconversion_package === "basic" && <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: `${C.primary}15`, color: C.primaryLight, fontWeight: 700, border: `1px solid ${C.primary}30` }}>🤝 Accompagnement base</span>}
                            {job.reconversion_package === "complete" && <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: `${C.gold}15`, color: C.gold, fontWeight: 700, border: `1px solid ${C.gold}30` }}>⭐ Accompagnement complet</span>}
                            {!job.is_active && <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: C.dim, color: "#fff", fontWeight: 700 }}>Clôturée</span>}
                          </div>
                          <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: C.text }}>{job.title}</h4>
                          <p style={{ margin: "2px 0 0", fontSize: 11, color: C.dim }}>{job.city} · {new Date(job.created_at).toLocaleDateString("fr-FR")}</p>
                        </div>
                        <div style={{ textAlign: "center", padding: "6px 14px", background: apps.length > 0 ? `${C.primary}15` : "rgba(255,255,255,0.04)", borderRadius: 10, border: `1px solid ${apps.length > 0 ? C.primary + "30" : C.border}` }}>
                          <div style={{ fontSize: 18, fontWeight: 800, color: apps.length > 0 ? C.primaryLight : C.dim, fontFamily: "'Bebas Neue', sans-serif" }}>{apps.length}</div>
                          <div style={{ fontSize: 9, color: C.dim, textTransform: "uppercase" }}>candidat{apps.length > 1 ? "s" : ""}</div>
                        </div>
                        <span style={{ fontSize: 14, color: C.dim, transform: isOpen ? "rotate(180deg)" : "", transition: "transform .2s" }}>▼</span>
                      </div>
                      {isOpen && (
                        <div style={{ borderTop: `1px solid ${C.border}`, background: "rgba(0,0,0,0.2)" }}>
                          {apps.length === 0 ? (
                            <div style={{ padding: 24, textAlign: "center", color: C.dim, fontSize: 12 }}>Aucune candidature pour cette offre.</div>
                          ) : (
                            <div>
                              {apps.map(app => (
                                <div key={app.id} style={{ padding: "16px 18px", borderBottom: `1px solid ${C.border}` }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                                    <div style={{ width: 38, height: 38, borderRadius: "50%", background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 800 }}>
                                      {(app.profiles?.first_name?.[0] || "?")}{(app.profiles?.last_name?.[0] || "?")}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                      <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{app.profiles?.first_name} {app.profiles?.last_name}</div>
                                      <div style={{ fontSize: 11, color: C.dim }}>
                                        {app.profiles?.current_league?.toUpperCase() || ""} {app.profiles?.position && `· ${app.profiles.position}`} {app.profiles?.city && `· ${app.profiles.city}`}
                                      </div>
                                    </div>
                                    <span style={{ fontSize: 10, padding: "4px 10px", borderRadius: 6, background: "rgba(251,191,36,0.1)", color: C.gold, fontWeight: 700, border: `1px solid ${C.gold}30` }}>{app.status}</span>
                                  </div>
                                  {app.profiles?.athlete_skills?.length > 0 && (
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                                      {app.profiles.athlete_skills.map(s => (
                                        <span key={s} style={{ fontSize: 10, padding: "3px 8px", background: `${C.primary}15`, color: C.primaryLight, borderRadius: 6, border: `1px solid ${C.primary}20` }}>{getSkillLabel(s)}</span>
                                      ))}
                                    </div>
                                  )}
                                  {app.message && (
                                    <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "10px 14px", marginBottom: 10, fontSize: 12, color: C.text, fontStyle: "italic", borderLeft: `2px solid ${C.accent}40` }}>« {app.message} »</div>
                                  )}
                                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                    {app.cv_url && <a href={app.cv_url} target="_blank" rel="noopener noreferrer" style={{ padding: "6px 12px", background: `${C.primary}15`, color: C.primaryLight, borderRadius: 6, fontSize: 11, fontWeight: 600, textDecoration: "none", border: `1px solid ${C.primary}30` }}>📄 CV</a>}
                                    <button onClick={() => window.dispatchEvent(new CustomEvent("hc-open-chat", { detail: { otherUserId: app.applicant_id } }))} style={{ padding: "6px 12px", background: `${C.primary}15`, color: C.primaryLight, borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer", border: `1px solid ${C.primary}30` }}>💬 Discuter</button>
                                    <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                                      {app.status !== "accepted" && <button onClick={() => updateAppStatus(app.id, "accepted")} style={{ padding: "6px 10px", background: `${C.green}15`, color: C.green, border: `1px solid ${C.green}30`, borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>✓ Accepter</button>}
                                      {app.status !== "rejected" && <button onClick={() => updateAppStatus(app.id, "rejected")} style={{ padding: "6px 10px", background: `${C.accent}15`, color: C.accent, border: `1px solid ${C.accent}30`, borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>✕ Refuser</button>}
                                      {app.status === "pending" && <button onClick={() => updateAppStatus(app.id, "seen")} style={{ padding: "6px 10px", background: "rgba(255,255,255,0.05)", color: C.muted, border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>👁️ Vu</button>}
                                    </div>
                                  </div>
                                </div>
                              ))}
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
        )}

        {/* Tab: Players */}
        {activeTab === "players" && (
          <div>
            <h3 style={{ fontSize: 18, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 2, color: C.accent, margin: "0 0 20px" }}>🤾 PROFILS HANDBALLEURS PRO</h3>
            {playersLoading ? (
              <div style={{ textAlign: "center", padding: 40, color: C.dim }}>Chargement...</div>
            ) : proPlayers.length === 0 ? (
              <div style={{ textAlign: "center", padding: 60, background: C.bgCard, borderRadius: 16, border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🤾</div>
                <p style={{ color: C.dim }}>Aucun handballeur pro en recherche active pour le moment.</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
                {proPlayers.map(player => (
                  <div key={player.id} style={{ background: C.bgCard, borderRadius: 16, padding: 20, border: `1px solid ${C.border}`, transition: "all .25s" }} onMouseEnter={e => { e.currentTarget.style.borderColor = `${C.primary}40`; e.currentTarget.style.transform = "translateY(-2px)"; }} onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = ""; }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                      <div style={{ width: 46, height: 46, borderRadius: "50%", background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 14 }}>
                        {(player.first_name?.[0] || "?")}{(player.last_name?.[0] || "?")}
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{player.first_name} {player.last_name}</div>
                        <div style={{ fontSize: 11, color: C.dim }}>{player.current_league?.toUpperCase() || ""} {player.position && `· ${player.position}`}</div>
                      </div>
                    </div>
                    {player.desired_sectors?.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                        {player.desired_sectors.map(s => (
                          <span key={s} style={{ fontSize: 10, padding: "3px 8px", background: `${getSectorColor(s)}15`, color: getSectorColor(s), borderRadius: 6, fontWeight: 600 }}>{getSectorLabel(s)}</span>
                        ))}
                      </div>
                    )}
                    {player.athlete_skills?.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                        {player.athlete_skills.slice(0, 4).map(s => (
                          <span key={s} style={{ fontSize: 10, padding: "3px 8px", background: "rgba(255,255,255,0.04)", color: C.muted, borderRadius: 6 }}>{getSkillLabel(s)}</span>
                        ))}
                      </div>
                    )}
                    <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                      <button onClick={() => window.dispatchEvent(new CustomEvent("hc-open-chat", { detail: { otherUserId: player.id } }))} style={{ flex: 1, padding: "10px 0", borderRadius: 10, background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`, color: "#fff", border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Contacter</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: New Offer */}
        {activeTab === "new-offer" && (
          <JobOfferForm user={user} company={company} onPublished={() => {
            setActiveTab("offers");
            showToast("✅ Offre publiée !");
            // Refresh
            supabase.from("jobs").select("*").or(`author_id.eq.${user.id},company_id.in.(${company?.id || '00000000-0000-0000-0000-000000000000'})`).order("created_at", { ascending: false }).then(({ data }) => setMyJobs(data || []));
          }} />
        )}
      </main>

      {showFeedback && <BetaFeedback user={user} onClose={() => setShowFeedback(false)} />}

      <ChatWidget user={user} />

      <div style={{ textAlign: "center", padding: "32px 0 16px", fontSize: 10, color: "rgba(255,255,255,0.12)" }}>
        HANDBALL CONNECT — Espace Entreprise — {new Date().getFullYear()}
      </div>
    </div>
  );

  async function updateAppStatus(appId, newStatus) {
    const { error } = await supabase.from("job_applications").update({ status: newStatus }).eq("id", appId);
    if (error) { showToast("❌ " + error.message); return; }
    showToast("✅ Statut mis à jour");
    // Refresh
    const ids = myJobs.map(j => j.id);
    const { data } = await supabase.from("job_applications").select("*, profiles(id,first_name,last_name,current_league,position,city,age,height_cm,athlete_skills,desired_sectors,bio_reconversion)").in("job_id", ids).order("created_at", { ascending: false });
    const grouped = {};
    (data || []).forEach(app => { if (!grouped[app.job_id]) grouped[app.job_id] = []; grouped[app.job_id].push(app); });
    setJobApplications(grouped);
  }
}

/* ═══════ COMPANY EDITOR ═══════ */
function CompanyEditor({ user, company, onSave }) {
  const [form, setForm] = useState({
    name: company?.name || "",
    sector: company?.sector || "",
    size: company?.size || "PME",
    city: company?.city || "",
    region: company?.region || "",
    description: company?.description || "",
    why_athletes: company?.why_athletes || "",
    website: company?.website || "",
    contact_name: company?.contact_name || "",
    contact_email: company?.contact_email || "",
    contact_phone: company?.contact_phone || "",
  });
  const [saving, setSaving] = useState(false);

  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const save = async () => {
    setSaving(true);
    const payload = { ...form, owner_id: user.id };
    let result;
    if (company?.id) {
      result = await supabase.from("companies").update(payload).eq("id", company.id).select().single();
    } else {
      result = await supabase.from("companies").insert({ ...payload, plan: "free" }).select().single();
    }
    setSaving(false);
    if (result.error) { alert("Erreur: " + result.error.message); return; }
    onSave(result.data);
  };

  const inpS = { width: "100%", padding: "12px 16px", background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, borderRadius: 12, color: C.text, fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" };
  const lblS = { fontSize: 10, color: C.dim, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600, marginBottom: 6, display: "block" };

  return (
    <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 18, padding: 28 }}>
      <h3 style={{ fontSize: 18, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 2, color: C.accent, margin: "0 0 20px" }}>🏢 {company ? "MODIFIER MON ENTREPRISE" : "CRÉER MON ENTREPRISE"}</h3>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
        <div><label style={lblS}>Nom de l'entreprise *</label><input value={form.name} onChange={e => upd("name", e.target.value)} placeholder="Ex: Securitas France" style={inpS} /></div>
        <div><label style={lblS}>Site web</label><input type="url" value={form.website} onChange={e => upd("website", e.target.value)} placeholder="https://www..." style={inpS} /></div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
        <div><label style={lblS}>Secteur d'activité *</label><select value={form.sector} onChange={e => upd("sector", e.target.value)} style={{ ...inpS, cursor: "pointer" }}><option value="">— Choisir —</option>{SECTORS.filter(s => s.id !== "autre").map(s => <option key={s.id} value={s.id}>{s.label}</option>)}</select></div>
        <div><label style={lblS}>Taille</label><select value={form.size} onChange={e => upd("size", e.target.value)} style={{ ...inpS, cursor: "pointer" }}>{COMPANY_SIZES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}</select></div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
        <div><label style={lblS}>Ville *</label><input value={form.city} onChange={e => upd("city", e.target.value)} placeholder="Lyon" style={inpS} /></div>
        <div><label style={lblS}>Région</label><input value={form.region} onChange={e => upd("region", e.target.value)} placeholder="Auvergne-Rhône-Alpes" style={inpS} /></div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={lblS}>Description</label>
        <textarea value={form.description} onChange={e => upd("description", e.target.value)} placeholder="Présentez votre entreprise en quelques lignes..." rows={3} style={{ ...inpS, resize: "vertical", lineHeight: 1.6 }} />
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={lblS}>Pourquoi recruter des anciens handballeurs ?</label>
        <textarea value={form.why_athletes} onChange={e => upd("why_athletes", e.target.value)} placeholder="Expliquez ce que vous valorisez dans le profil des sportifs de haut niveau..." rows={3} style={{ ...inpS, resize: "vertical", lineHeight: 1.6 }} />
      </div>

      <h4 style={{ fontSize: 11, color: C.dim, textTransform: "uppercase", letterSpacing: 2, marginBottom: 12, fontWeight: 600, borderBottom: `1px solid ${C.border}`, paddingBottom: 8 }}>✉️ Contact</h4>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 24 }}>
        <div><label style={lblS}>Nom du contact</label><input value={form.contact_name} onChange={e => upd("contact_name", e.target.value)} style={inpS} /></div>
        <div><label style={lblS}>Email</label><input type="email" value={form.contact_email} onChange={e => upd("contact_email", e.target.value)} style={inpS} /></div>
        <div><label style={lblS}>Téléphone</label><input value={form.contact_phone} onChange={e => upd("contact_phone", e.target.value)} style={inpS} /></div>
      </div>

      <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
        <button onClick={save} disabled={saving || !form.name || !form.sector || !form.city} style={{ padding: "12px 32px", border: "none", borderRadius: 12, background: saving || !form.name || !form.sector || !form.city ? "rgba(255,255,255,0.06)" : `linear-gradient(135deg, ${C.accent}, #991B1B)`, color: saving ? C.dim : "#fff", fontSize: 13, fontWeight: 700, cursor: saving ? "wait" : "pointer" }}>
          {saving ? "Enregistrement..." : company ? "💾 Enregistrer" : "🚀 Créer mon entreprise"}
        </button>
      </div>
    </div>
  );
}

/* ═══════ JOB OFFER FORM ═══════ */
function JobOfferForm({ user, company, onPublished }) {
  const [form, setForm] = useState({
    title: "", description: "", contract_type: "CDI", sector: company?.sector || "",
    city: company?.city || "", salary_range: "", job_type: "reconversion",
    athlete_profile: "", experience_level: "debutant", remote_policy: "non",
    benefits: [], handball_compatible: false, schedule_info: "",
    reconversion_package: "none",
  });
  const [saving, setSaving] = useState(false);

  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const toggleBenefit = (v) => setForm(p => ({ ...p, benefits: p.benefits.includes(v) ? p.benefits.filter(x => x !== v) : [...p.benefits, v] }));

  const save = async () => {
    if (!form.title || !form.description || !form.city) return;
    setSaving(true);
    const payload = { ...form, author_id: user.id, company_id: company?.id || null };
    const { error } = await supabase.from("jobs").insert(payload);
    setSaving(false);
    if (error) { alert("Erreur: " + error.message); return; }
    onPublished();
  };

  const inpS = { width: "100%", padding: "12px 16px", background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, borderRadius: 12, color: C.text, fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" };
  const lblS = { fontSize: 10, color: C.dim, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600, marginBottom: 6, display: "block" };

  return (
    <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 18, padding: 28 }}>
      <h3 style={{ fontSize: 18, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 2, color: C.accent, margin: "0 0 20px" }}>📢 NOUVELLE OFFRE</h3>

      <div style={{ marginBottom: 14 }}><label style={lblS}>Intitulé du poste *</label><input value={form.title} onChange={e => upd("title", e.target.value)} placeholder="Ex: Responsable sécurité événementielle" style={inpS} /></div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        <div><label style={lblS}>Entreprise</label><input value={company?.name || ""} disabled style={{ ...inpS, opacity: 0.5, cursor: "not-allowed" }} /></div>
        <div><label style={lblS}>Contrat *</label><select value={form.contract_type} onChange={e => upd("contract_type", e.target.value)} style={{ ...inpS, cursor: "pointer" }}>{CONTRACT_TYPES.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}</select></div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        <div><label style={lblS}>Secteur</label><select value={form.sector} onChange={e => upd("sector", e.target.value)} style={{ ...inpS, cursor: "pointer" }}><option value="">—</option>{SECTORS.filter(s => s.id !== "autre").map(s => <option key={s.id} value={s.id}>{s.label}</option>)}</select></div>
        <div><label style={lblS}>Ville *</label><input value={form.city} onChange={e => upd("city", e.target.value)} style={inpS} /></div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        <div><label style={lblS}>Rémunération</label><input value={form.salary_range} onChange={e => upd("salary_range", e.target.value)} placeholder="Ex: 2000-2500€ net/mois" style={inpS} /></div>
        <div><label style={lblS}>Expérience requise</label><select value={form.experience_level} onChange={e => upd("experience_level", e.target.value)} style={{ ...inpS, cursor: "pointer" }}><option value="debutant">Débutant</option><option value="intermediaire">Intermédiaire</option><option value="confirme">Confirmé</option></select></div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <label style={lblS}>Description du poste *</label>
        <textarea value={form.description} onChange={e => upd("description", e.target.value)} placeholder="Décrivez le poste, les missions, l'équipe..." rows={4} style={{ ...inpS, resize: "vertical", lineHeight: 1.6 }} />
      </div>

      <div style={{ marginBottom: 14 }}>
        <label style={lblS}>Profil athlète recherché (optionnel)</label>
        <textarea value={form.athlete_profile} onChange={e => upd("athlete_profile", e.target.value)} placeholder="Ex: Ancien sportif de haut niveau souhaité. Le leadership et la gestion du stress sont essentiels." rows={2} style={{ ...inpS, resize: "vertical", lineHeight: 1.6 }} />
      </div>

      <div style={{ marginBottom: 14 }}>
        <label style={lblS}>Avantages</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {["prime", "logement", "formation", "horaires_flexibles", "titre_restaurant", "mutuelle", "teletravail"].map(b => (
            <button key={b} type="button" onClick={() => toggleBenefit(b)} style={{ padding: "8px 14px", borderRadius: 10, border: `1px solid ${form.benefits.includes(b) ? `${C.green}60` : C.border}`, background: form.benefits.includes(b) ? `${C.green}18` : "rgba(255,255,255,0.02)", color: form.benefits.includes(b) ? C.green : C.muted, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
              {b.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      <div onClick={() => upd("handball_compatible", !form.handball_compatible)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: form.handball_compatible ? `${C.green}08` : "rgba(255,255,255,0.02)", border: `1px solid ${form.handball_compatible ? `${C.green}30` : C.border}`, borderRadius: 10, cursor: "pointer", marginBottom: 14 }}>
        <div style={{ width: 36, height: 20, borderRadius: 10, background: form.handball_compatible ? C.green : "rgba(255,255,255,0.1)", position: "relative" }}><div style={{ width: 16, height: 16, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, left: form.handball_compatible ? 18 : 2, transition: "left .2s" }} /></div>
        <span style={{ fontSize: 12, color: form.handball_compatible ? C.green : C.dim, fontWeight: 600 }}>Horaires compatibles avec la pratique du handball</span>
      </div>

      {form.handball_compatible && <div style={{ marginBottom: 14 }}><label style={lblS}>Précisions horaires</label><input value={form.schedule_info} onChange={e => upd("schedule_info", e.target.value)} placeholder="Ex: Mi-temps possible, horaires décalés" style={inpS} /></div>}

      <div style={{ marginBottom: 14 }}>
        <label style={lblS}>Accompagnement reconversion offert au joueur</label>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { key: "none", label: "Aucun accompagnement", desc: "L'entreprise gère la reconversion en interne.", color: C.dim },
            { key: "basic", label: "Accompagnement de base", desc: "Bilan de compétences + 2 séances coaching (valeur ~800€).", color: C.primaryLight },
            { key: "complete", label: "Accompagnement complet", desc: "Bilan + 6 mois coaching + formation soft skills (valeur ~2 500€).", color: C.gold },
          ].map(pkg => (
            <div key={pkg.key} onClick={() => upd("reconversion_package", pkg.key)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 12, border: `1px solid ${form.reconversion_package === pkg.key ? `${pkg.color}50` : C.border}`, background: form.reconversion_package === pkg.key ? `${pkg.color}08` : "rgba(255,255,255,0.02)", cursor: "pointer" }}>
              <div style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${form.reconversion_package === pkg.key ? pkg.color : C.dim}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {form.reconversion_package === pkg.key && <div style={{ width: 10, height: 10, borderRadius: "50%", background: pkg.color }} />}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: form.reconversion_package === pkg.key ? pkg.color : C.text }}>{pkg.label}</div>
                <div style={{ fontSize: 11, color: C.dim, marginTop: 2 }}>{pkg.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
        <button onClick={save} disabled={saving || !form.title || !form.description || !form.city} style={{ padding: "12px 32px", border: "none", borderRadius: 12, background: saving || !form.title || !form.description || !form.city ? "rgba(255,255,255,0.06)" : `linear-gradient(135deg, ${C.accent}, #991B1B)`, color: saving ? C.dim : "#fff", fontSize: 13, fontWeight: 700, cursor: saving ? "wait" : "pointer" }}>
          {saving ? "Publication..." : "📢 Publier l'offre"}
        </button>
      </div>
    </div>
  );
}
