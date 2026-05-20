"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import Link from "next/link";
import { getSectorLabel, getSectorColor, SECTORS } from "../../lib/sectors";
import { getSkillLabel } from "../../lib/skills";
import ChatWidget from "../../components/ChatWidget";

const C = {
  primary: "#1D4ED8", primaryLight: "#3B82F6", primaryDark: "#1E3A8A",
  accent: "#DC2626", accentLight: "#F87171",
  bg: "#0A0E1A", bgCard: "rgba(255,255,255,0.03)", bgHover: "rgba(255,255,255,0.07)",
  surface: "#111827", border: "rgba(255,255,255,0.08)",
  text: "#F1F5F9", muted: "rgba(255,255,255,0.5)", dim: "rgba(255,255,255,0.3)",
  green: "#10B981", greenBg: "rgba(16,185,129,0.12)", gold: "#FBBF24",
};

const CONTRACT_COLORS = { CDI: "#10B981", CDD: "#3B82F6", alternance: "#8B5CF6", stage: "#F59E0B", interim: "#EF4444", "mi-temps": "#EC4899", "temps-partiel": "#06B6D4" };
const CONTRACT_TYPES = ["CDI", "CDD", "alternance", "stage", "interim", "mi-temps", "temps-partiel"];

function Bdg({ children, color = C.primary, filled }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", background: filled ? color : `${color}18`, color: filled ? "#fff" : color, borderRadius: 6, fontSize: 10, fontWeight: 700, border: `1px solid ${color}30`, letterSpacing: 0.8, textTransform: "uppercase", whiteSpace: "nowrap" }}>
      {children}
    </span>
  );
}

function ScoreRing({ score }) {
  const color = score >= 80 ? C.green : score >= 50 ? C.primary : score >= 30 ? C.gold : C.dim;
  const circumference = 2 * Math.PI * 18;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div style={{ position: "relative", width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width="44" height="44" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="22" cy="22" r="18" stroke={`${color}20`} strokeWidth="4" fill="none" />
        <circle cx="22" cy="22" r="18" stroke={color} strokeWidth="4" fill="none" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <span style={{ position: "absolute", fontSize: 11, fontWeight: 800, color }}>{score}</span>
    </div>
  );
}

export default function MatchPage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  // Filters
  const [filters, setFilters] = useState({
    sectors: [],
    contractTypes: [],
    city: "",
    handballCompatible: false,
    minScore: 0,
    remotePolicy: "",
    searchText: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  // Jobs
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);

  // Saved searches
  const [savedSearches, setSavedSearches] = useState([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveName, setSaveName] = useState("");

  // Applications
  const [myApplications, setMyApplications] = useState([]);

  useEffect(() => {
    async function init() {
      const { data: { user: u } } = await supabase.auth.getUser();
      if (!u) { window.location.href = "/login"; return; }
      setUser(u);
      const { data: p } = await supabase.from("profiles").select("*").eq("id", u.id).single();
      setProfile(p || {});
      // Load saved searches
      const { data: ss } = await supabase.from("saved_searches").select("*").eq("user_id", u.id).order("created_at", { ascending: false });
      setSavedSearches(ss || []);
      // Load my applications
      const { data: apps } = await supabase.from("job_applications").select("job_id,status").eq("applicant_id", u.id);
      setMyApplications(apps || []);
      setLoading(false);
    }
    init();
  }, []);

  useEffect(() => {
    if (!user) return;
    async function fetchJobs() {
      setJobsLoading(true);
      let q = supabase
        .from("jobs")
        .select("*, companies(id,name,logo_url,size)")
        .eq("is_active", true)
        .eq("job_type", "reconversion")
        .order("created_at", { ascending: false });
      const { data } = await q;
      setJobs(data || []);
      setJobsLoading(false);
    }
    fetchJobs();
  }, [user]);

  const hasApplied = useCallback((jobId) => {
    return myApplications.some(a => a.job_id === jobId);
  }, [myApplications]);

  const matchingScore = useCallback((job) => {
    let score = 0;
    if (!profile) return score;
    // Sector match (40 pts)
    if (profile.desired_sectors?.length && job.sector && profile.desired_sectors.includes(job.sector)) score += 40;
    // City match (30 pts)
    if (profile.city && job.city && job.city.toLowerCase().includes(profile.city.toLowerCase())) score += 30;
    // Handball compatible (20 pts)
    if (job.handball_compatible) score += 20;
    // Reconversion type (10 pts)
    if (job.job_type === "reconversion") score += 10;
    return score;
  }, [profile]);

  const filteredJobs = useMemo(() => {
    let result = jobs.map(j => ({ ...j, _score: matchingScore(j), _applied: hasApplied(j.id) }));

    if (filters.sectors.length > 0) {
      result = result.filter(j => filters.sectors.includes(j.sector));
    }
    if (filters.contractTypes.length > 0) {
      result = result.filter(j => filters.contractTypes.includes(j.contract_type));
    }
    if (filters.city.trim()) {
      const c = filters.city.toLowerCase();
      result = result.filter(j => j.city?.toLowerCase().includes(c));
    }
    if (filters.handballCompatible) {
      result = result.filter(j => j.handball_compatible);
    }
    if (filters.minScore > 0) {
      result = result.filter(j => j._score >= filters.minScore);
    }
    if (filters.remotePolicy) {
      result = result.filter(j => j.remote_policy === filters.remotePolicy);
    }
    if (filters.searchText.trim()) {
      const t = filters.searchText.toLowerCase();
      result = result.filter(j =>
        j.title?.toLowerCase().includes(t) ||
        j.description?.toLowerCase().includes(t) ||
        j.companies?.name?.toLowerCase().includes(t) ||
        j.athlete_profile?.toLowerCase().includes(t)
      );
    }

    // Sort: score desc, then applied last, then date desc
    result.sort((a, b) => {
      if (b._score !== a._score) return b._score - a._score;
      if (a._applied !== b._applied) return a._applied ? 1 : -1;
      return new Date(b.created_at) - new Date(a.created_at);
    });

    return result;
  }, [jobs, filters, matchingScore, hasApplied]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3500); };

  const toggleFilter = (key, val) => {
    setFilters(prev => {
      const arr = prev[key] || [];
      const next = arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];
      return { ...prev, [key]: next };
    });
  };

  const activeFilterCount = useMemo(() => {
    let c = filters.sectors.length + filters.contractTypes.length;
    if (filters.city.trim()) c++;
    if (filters.handballCompatible) c++;
    if (filters.minScore > 0) c++;
    if (filters.remotePolicy) c++;
    if (filters.searchText.trim()) c++;
    return c;
  }, [filters]);

  const saveSearch = async () => {
    if (!saveName.trim()) return;
    const { error } = await supabase.from("saved_searches").insert({
      user_id: user.id,
      name: saveName.trim(),
      filters,
    });
    if (error) { showToast("❌ " + error.message); return; }
    setShowSaveModal(false);
    setSaveName("");
    const { data } = await supabase.from("saved_searches").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setSavedSearches(data || []);
    showToast("✅ Recherche sauvegardée");
  };

  const loadSearch = (search) => {
    setFilters(search.filters);
    setShowFilters(true);
  };

  const deleteSearch = async (id) => {
    await supabase.from("saved_searches").delete().eq("id", id);
    setSavedSearches(prev => prev.filter(s => s.id !== id));
  };

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
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, boxShadow: `0 4px 16px ${C.primary}30` }}>🤾</div>
            <h1 style={{ fontSize: 22, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 3, color: "#fff", lineHeight: 1, margin: 0 }}>HANDBALL<span style={{ color: C.primary }}>CONNECT</span></h1>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Link href="/pro" style={{ padding: "8px 16px", borderRadius: 10, border: `1px solid ${C.border}`, color: C.muted, textDecoration: "none", fontSize: 12, fontWeight: 600 }}>← Mon espace</Link>
            <button onClick={handleLogout} style={{ padding: "8px 14px", borderRadius: 10, border: "1px solid rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.08)", color: "#EF4444", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>🚪 Déconnexion</button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
        {/* Title */}
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 32, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 2, color: "#fff", margin: "0 0 6px" }}>
            TROUVEZ VOTRE <span style={{ color: C.primary }}>MATCH</span>
          </h2>
          <p style={{ fontSize: 14, color: C.muted, margin: 0 }}>
            {profile?.desired_sectors?.length
              ? `Secteurs visés : ${profile.desired_sectors.map(getSectorLabel).join(", ")}`
              : "Complétez votre profil pour un matching optimal"}
            {profile?.city ? ` · ${profile.city}` : ""}
          </p>
        </div>

        {/* Search bar + filter toggle */}
        <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 260, position: "relative" }}>
            <input
              value={filters.searchText}
              onChange={e => setFilters(p => ({ ...p, searchText: e.target.value }))}
              placeholder="Rechercher un poste, une entreprise, un mot-clé..."
              style={{ width: "100%", padding: "12px 16px 12px 42px", background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, borderRadius: 12, color: C.text, fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
            />
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 16, color: C.dim }}>🔍</span>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{ padding: "12px 20px", borderRadius: 12, border: `1px solid ${showFilters ? C.primary + "40" : C.border}`, background: showFilters ? `${C.primary}10` : "rgba(255,255,255,0.02)", color: showFilters ? C.primaryLight : C.dim, fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap" }}
          >
            ⚙️ Filtres {activeFilterCount > 0 && <span style={{ padding: "2px 8px", borderRadius: 10, background: C.primary, color: "#fff", fontSize: 10 }}>{activeFilterCount}</span>}
          </button>
          <button
            onClick={() => setShowSaveModal(true)}
            style={{ padding: "12px 20px", borderRadius: 12, border: `1px solid ${C.border}`, background: "rgba(255,255,255,0.02)", color: C.dim, fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}
          >
            💾 Sauvegarder
          </button>
        </div>

        {/* Filters panel */}
        {showFilters && (
          <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, marginBottom: 24 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
              {/* Sectors */}
              <div>
                <label style={{ fontSize: 10, color: C.dim, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600, marginBottom: 10, display: "block" }}>Secteurs</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {SECTORS.filter(s => s.id !== "autre").map(s => {
                    const on = filters.sectors.includes(s.id);
                    return (
                      <button key={s.id} onClick={() => toggleFilter("sectors", s.id)} style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${on ? `${s.color}60` : C.border}`, background: on ? `${s.color}18` : "rgba(255,255,255,0.02)", color: on ? "#fff" : C.muted, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                        {s.icon} {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Contract types */}
              <div>
                <label style={{ fontSize: 10, color: C.dim, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600, marginBottom: 10, display: "block" }}>Type de contrat</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {CONTRACT_TYPES.map(ct => {
                    const on = filters.contractTypes.includes(ct);
                    const col = CONTRACT_COLORS[ct] || C.primary;
                    return (
                      <button key={ct} onClick={() => toggleFilter("contractTypes", ct)} style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${on ? `${col}60` : C.border}`, background: on ? `${col}18` : "rgba(255,255,255,0.02)", color: on ? "#fff" : C.muted, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                        {ct}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* City + remote */}
              <div>
                <label style={{ fontSize: 10, color: C.dim, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600, marginBottom: 10, display: "block" }}>Localisation</label>
                <input
                  value={filters.city}
                  onChange={e => setFilters(p => ({ ...p, city: e.target.value }))}
                  placeholder="Ville ou région"
                  style={{ width: "100%", padding: "10px 14px", background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box", marginBottom: 10 }}
                />
                <select
                  value={filters.remotePolicy}
                  onChange={e => setFilters(p => ({ ...p, remotePolicy: e.target.value }))}
                  style={{ width: "100%", padding: "10px 14px", background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box", cursor: "pointer" }}
                >
                  <option value="">Tous modes de travail</option>
                  <option value="non">Sur site</option>
                  <option value="partiel">Hybride</option>
                  <option value="total">Full remote</option>
                </select>
              </div>

              {/* Score + handball */}
              <div>
                <label style={{ fontSize: 10, color: C.dim, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600, marginBottom: 10, display: "block" }}>Matching</label>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.muted, marginBottom: 4 }}>
                    <span>Score minimum</span>
                    <span>{filters.minScore}%</span>
                  </div>
                  <input
                    type="range" min={0} max={100} step={10}
                    value={filters.minScore}
                    onChange={e => setFilters(p => ({ ...p, minScore: parseInt(e.target.value) }))}
                    style={{ width: "100%", accentColor: C.primary }}
                  />
                </div>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                  <input type="checkbox" checked={filters.handballCompatible} onChange={e => setFilters(p => ({ ...p, handballCompatible: e.target.checked }))} style={{ accentColor: C.primary }} />
                  <span style={{ fontSize: 12, color: C.text }}>Compatible handball uniquement</span>
                </label>
              </div>
            </div>

            {/* Saved searches list */}
            {savedSearches.length > 0 && (
              <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
                <label style={{ fontSize: 10, color: C.dim, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600, marginBottom: 10, display: "block" }}>Recherches sauvegardées</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {savedSearches.map(ss => (
                    <div key={ss.id} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}`, borderRadius: 8 }}>
                      <button onClick={() => loadSearch(ss)} style={{ background: "none", border: "none", color: C.primaryLight, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{ss.name}</button>
                      <button onClick={() => deleteSearch(ss.id)} style={{ background: "none", border: "none", color: C.dim, fontSize: 10, cursor: "pointer", padding: 0 }}>✕</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
              <button onClick={() => setFilters({ sectors: [], contractTypes: [], city: "", handballCompatible: false, minScore: 0, remotePolicy: "", searchText: "" })} style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${C.border}`, background: "transparent", color: C.dim, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Réinitialiser</button>
            </div>
          </div>
        )}

        {/* Results header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <span style={{ fontSize: 13, color: C.muted }}>
            {jobsLoading ? "Chargement..." : `${filteredJobs.length} offre${filteredJobs.length !== 1 ? "s" : ""} trouvée${filteredJobs.length !== 1 ? "s" : ""}`}
          </span>
          {profile?.desired_sectors?.length === 0 && (
            <Link href="/pro" style={{ fontSize: 12, color: C.primaryLight, textDecoration: "none", fontWeight: 600 }}>
              ⚠️ Compléter mon profil pour un meilleur matching →
            </Link>
          )}
        </div>

        {/* Results */}
        {jobsLoading ? (
          <div style={{ textAlign: "center", padding: 80, color: C.dim }}>Chargement des offres...</div>
        ) : filteredJobs.length === 0 ? (
          <div style={{ textAlign: "center", padding: 80, background: C.bgCard, borderRadius: 16, border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <p style={{ color: C.dim, fontSize: 15, fontWeight: 600, margin: "0 0 8px" }}>Aucune offre ne correspond à vos critères</p>
            <p style={{ color: C.muted, fontSize: 13, margin: 0 }}>Essayez d'élargir vos filtres ou de modifier votre recherche.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filteredJobs.map(job => {
              const ctColor = CONTRACT_COLORS[job.contract_type?.toLowerCase()] || C.primary;
              const isApplied = job._applied;
              return (
                <div
                  key={job.id}
                  onClick={() => !isApplied && setSelectedJob(job)}
                  style={{
                    background: C.bgCard,
                    borderRadius: 16,
                    padding: 20,
                    border: `1px solid ${C.border}`,
                    borderLeft: `3px solid ${job._score >= 70 ? C.green : job._score >= 40 ? C.primary : C.border}`,
                    cursor: isApplied ? "default" : "pointer",
                    transition: "all .25s",
                    opacity: isApplied ? 0.7 : 1,
                  }}
                  onMouseEnter={e => { if (!isApplied) { e.currentTarget.style.background = C.bgHover; e.currentTarget.style.transform = "translateX(4px)"; } }}
                  onMouseLeave={e => { e.currentTarget.style.background = C.bgCard; e.currentTarget.style.transform = ""; }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                        <Bdg color={ctColor}>{job.contract_type}</Bdg>
                        {job.sector && <Bdg color={getSectorColor(job.sector)}>{getSectorLabel(job.sector)}</Bdg>}
                        {job.handball_compatible && <Bdg color={C.green} filled>Compatible handball</Bdg>}
                        {job.remote_policy && job.remote_policy !== "non" && <Bdg color={C.primaryLight}>{job.remote_policy === "partiel" ? "Hybride" : "Remote"}</Bdg>}
                        {isApplied && <Bdg color={C.dim}>Déjà postulé</Bdg>}
                      </div>
                      <h3 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 700, color: C.text }}>{job.title}</h3>
                      <p style={{ margin: "0 0 8px", fontSize: 13, color: ctColor, fontWeight: 600 }}>{job.companies?.name || job.company} · {job.city}</p>
                      {job.salary_range && <p style={{ margin: "0 0 8px", fontSize: 12, color: C.gold, fontWeight: 600 }}>💰 {job.salary_range}</p>}
                      {job.athlete_profile && <p style={{ fontSize: 12, color: C.gold, margin: 0, fontStyle: "italic" }}>💡 {job.athlete_profile}</p>}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <ScoreRing score={job._score} />
                      {!isApplied && (
                        <span style={{ padding: "8px 16px", borderRadius: 10, background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`, color: "#fff", fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>
                          Voir l'offre
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Job Detail Modal */}
      {selectedJob && (
        <JobDetailModal job={selectedJob} user={user} profile={profile} score={selectedJob._score} onClose={() => setSelectedJob(null)} onApplied={() => {
          setSelectedJob(null);
          showToast("✅ Candidature envoyée !");
          setMyApplications(prev => [...prev, { job_id: selectedJob.id, status: "pending" }]);
        }} />
      )}

      {/* Save Search Modal */}
      {showSaveModal && (
        <div onClick={() => setShowSaveModal(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: C.surface, borderRadius: 20, maxWidth: 400, width: "100%", border: `1px solid ${C.border}`, padding: 28 }}>
            <h3 style={{ fontSize: 18, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 2, color: "#fff", margin: "0 0 16px" }}>💾 SAUVEGARDER LA RECHERCHE</h3>
            <p style={{ fontSize: 13, color: C.muted, margin: "0 0 16px" }}>Recevez une alerte quand de nouvelles offres correspondent à ces critères.</p>
            <input
              value={saveName}
              onChange={e => setSaveName(e.target.value)}
              placeholder="Ex: CDI sécurité Paris"
              style={{ width: "100%", padding: "12px 16px", background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, borderRadius: 12, color: C.text, fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box", marginBottom: 16 }}
            />
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setShowSaveModal(false)} style={{ padding: "10px 18px", borderRadius: 10, border: `1px solid ${C.border}`, background: "transparent", color: C.dim, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Annuler</button>
              <button onClick={saveSearch} disabled={!saveName.trim()} style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`, color: "#fff", fontSize: 12, fontWeight: 700, cursor: saveName.trim() ? "pointer" : "not-allowed" }}>Sauvegarder</button>
            </div>
          </div>
        </div>
      )}

      <ChatWidget user={user} />

      <div style={{ textAlign: "center", padding: "32px 0 16px", fontSize: 10, color: "rgba(255,255,255,0.12)" }}>
        HANDBALL CONNECT — Matching — {new Date().getFullYear()}
      </div>
    </div>
  );
}

/* ═══════ JOB DETAIL MODAL (apply inline) ═══════ */
function JobDetailModal({ job, user, profile, score, onClose, onApplied }) {
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");
  const ctColor = CONTRACT_COLORS[job.contract_type?.toLowerCase()] || C.primary;

  const submit = async () => {
    setErr(""); setSubmitting(true);
    let cv_url = null, cv_filename = null;
    if (profile?.cv_url) { cv_url = profile.cv_url; cv_filename = profile.cv_filename || "cv.pdf"; }
    const { error } = await supabase.from("job_applications").insert({
      job_id: job.id, applicant_id: user.id,
      message: message.trim() || null, cv_url, cv_filename,
    });
    setSubmitting(false);
    if (error) { setErr(error.message); return; }
    onApplied();
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(12px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: `linear-gradient(180deg,${C.surface},${C.bg})`, borderRadius: 24, maxWidth: 560, width: "100%", maxHeight: "90vh", overflowY: "auto", border: `1px solid ${C.border}` }}>
        <div style={{ padding: "24px 28px", background: `${ctColor}10`, borderBottom: `1px solid ${ctColor}20`, position: "relative" }}>
          <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "rgba(255,255,255,0.06)", border: "none", color: C.dim, width: 32, height: 32, borderRadius: "50%", cursor: "pointer", fontSize: 16 }}>✕</button>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
            <Bdg color={ctColor}>{job.contract_type}</Bdg>
            {job.sector && <Bdg color={getSectorColor(job.sector)}>{getSectorLabel(job.sector)}</Bdg>}
            {job.handball_compatible && <Bdg color={C.green} filled>Compatible handball</Bdg>}
            {score >= 50 && <Bdg color={score >= 80 ? C.green : C.primary}>Match {score}%</Bdg>}
          </div>
          <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 700, color: C.text }}>{job.title}</h2>
          <p style={{ margin: 0, fontSize: 13, color: ctColor, fontWeight: 600 }}>{job.companies?.name || job.company} · {job.city}</p>
        </div>

        <div style={{ padding: 28 }}>
          {job.description && <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.7, margin: "0 0 16px" }}>{job.description}</p>}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
            {job.salary_range && (
              <div style={{ background: `${C.gold}08`, borderRadius: 10, padding: 12, border: `1px solid ${C.gold}15`, textAlign: "center" }}>
                <div style={{ fontSize: 10, color: C.gold, textTransform: "uppercase", letterSpacing: 1 }}>Rémunération</div>
                <div style={{ fontSize: 16, color: C.gold, fontWeight: 800 }}>{job.salary_range}</div>
              </div>
            )}
            {job.remote_policy && (
              <div style={{ background: `${C.primary}08`, borderRadius: 10, padding: 12, border: `1px solid ${C.primary}15`, textAlign: "center" }}>
                <div style={{ fontSize: 10, color: C.primaryLight, textTransform: "uppercase", letterSpacing: 1 }}>Télétravail</div>
                <div style={{ fontSize: 16, color: C.primaryLight, fontWeight: 700 }}>{job.remote_policy === "non" ? "Sur site" : job.remote_policy === "partiel" ? "Hybride" : "Full remote"}</div>
              </div>
            )}
            {job.experience_level && (
              <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: 12, border: `1px solid ${C.border}`, textAlign: "center" }}>
                <div style={{ fontSize: 10, color: C.dim, textTransform: "uppercase", letterSpacing: 1 }}>Expérience</div>
                <div style={{ fontSize: 14, color: C.text, fontWeight: 600 }}>{job.experience_level === "debutant" ? "Débutant" : job.experience_level === "intermediaire" ? "Intermédiaire" : "Confirmé"}</div>
              </div>
            )}
            {job.companies?.size && (
              <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: 12, border: `1px solid ${C.border}`, textAlign: "center" }}>
                <div style={{ fontSize: 10, color: C.dim, textTransform: "uppercase", letterSpacing: 1 }}>Taille</div>
                <div style={{ fontSize: 14, color: C.text, fontWeight: 600 }}>{job.companies.size}</div>
              </div>
            )}
          </div>

          {job.benefits?.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, color: C.dim, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600, marginBottom: 8 }}>Avantages</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {job.benefits.map((b, i) => (
                  <span key={i} style={{ padding: "4px 10px", background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 11, color: C.muted }}>{b}</span>
                ))}
              </div>
            </div>
          )}

          {job.athlete_profile && (
            <div style={{ padding: "14px 16px", background: `${C.gold}08`, borderRadius: 10, border: `1px solid ${C.gold}20`, marginBottom: 20 }}>
              <div style={{ fontSize: 10, color: C.gold, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600, marginBottom: 6 }}>Profil recherché</div>
              <p style={{ fontSize: 13, color: C.text, margin: 0, lineHeight: 1.6 }}>{job.athlete_profile}</p>
            </div>
          )}

          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 20 }}>
            <h4 style={{ fontSize: 11, color: C.dim, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600, marginBottom: 10 }}>Postuler à cette offre</h4>
            <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Présentez-vous et expliquez pourquoi vous correspondez au poste..." rows={3} style={{ width: "100%", padding: "12px 14px", background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 13, outline: "none", resize: "vertical", fontFamily: "inherit", lineHeight: 1.6, boxSizing: "border-box", marginBottom: 12 }} />
            {profile?.cv_url && (
              <p style={{ fontSize: 11, color: C.dim, margin: "0 0 12px" }}>📎 Votre CV sera joint automatiquement ({profile.cv_filename || "cv.pdf"})</p>
            )}
            {err && <div style={{ padding: "10px 14px", background: `${C.accent}10`, border: `1px solid ${C.accent}30`, borderRadius: 10, color: C.accent, fontSize: 12, marginBottom: 12 }}>{err}</div>}
            <button onClick={submit} disabled={submitting} style={{ width: "100%", padding: "14px 0", border: "none", borderRadius: 12, background: submitting ? "rgba(255,255,255,0.08)" : `linear-gradient(135deg,${C.primary},${C.primaryDark})`, color: "#fff", fontSize: 13, fontWeight: 700, cursor: submitting ? "wait" : "pointer" }}>{submitting ? "Envoi..." : "Envoyer ma candidature"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
