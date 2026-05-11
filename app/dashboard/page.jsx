"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import Link from "next/link";

const FONT_LINK = "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap";

const TYPE_META = {
  joueur: { icon: "🤾", label: "Joueur", color: "#FF6B35", welcomeMsg: "Trouvez votre prochain club et montrez vos stats." },
  club: { icon: "🏟️", label: "Club", color: "#3B82F6", welcomeMsg: "Recrutez les meilleurs talents du handball." },
  entraineur: { icon: "🎯", label: "Entraîneur", color: "#8B5CF6", welcomeMsg: "Valorisez votre parcours et trouvez votre prochain poste." },
};

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = "/login"; return; }
      setUser(user);
      const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (profileData?.role === "admin") { window.location.href = "/agents"; return; }
      setProfile(profileData);
      setLoading(false);
    };
    getUser();
  }, []);

  const handleLogout = async () => { await supabase.auth.signOut(); window.location.href = "/login"; };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#0A0E1A", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <link href={FONT_LINK} rel="stylesheet" />
        <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 14, fontFamily: "'DM Sans', sans-serif" }}>Chargement...</div>
      </div>
    );
  }

  const meta = TYPE_META[profile?.user_type] || TYPE_META.joueur;

  return (
    <div style={{ minHeight: "100vh", background: "#0A0E1A", color: "#fff", fontFamily: "'DM Sans', sans-serif" }}>
      <link href={FONT_LINK} rel="stylesheet" />
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,107,53,0.06) 0%, transparent 70%)", top: -200, right: -100 }} />
        <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.04) 0%, transparent 70%)", bottom: -100, left: -150 }} />
      </div>
      <div style={{ position: "relative", zIndex: 1 }}>
        <header style={{ background: "rgba(10,14,26,0.9)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "0 24px", position: "sticky", top: 0, zIndex: 100 }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
              <div style={{ width: 38, height: 38, borderRadius: 12, background: "linear-gradient(135deg, #FF6B35, #C13C00)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, boxShadow: "0 4px 16px rgba(255,107,53,0.3)" }}>🤾</div>
              <div>
                <h1 style={{ fontSize: 22, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 3, color: "#fff", lineHeight: 1, margin: 0 }}>HAND<span style={{ color: "#FF6B35" }}>CONNECT</span></h1>
                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: 2, fontWeight: 600 }}>MON ESPACE</span>
              </div>
            </Link>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 10, background: `${meta.color}12`, border: `1px solid ${meta.color}25` }}>
                <span style={{ fontSize: 14 }}>{meta.icon}</span>
                <span style={{ fontSize: 11, color: meta.color, fontWeight: 600 }}>{meta.label}</span>
              </div>
              <button onClick={handleLogout} style={{ padding: "8px 14px", borderRadius: 10, border: "1px solid rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.08)", color: "#EF4444", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: 6 }}>🚪 Déconnexion</button>
            </div>
          </div>
        </header>
        <main style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>
          <div style={{ background: `linear-gradient(135deg, ${meta.color}12, ${meta.color}04)`, border: `1px solid ${meta.color}25`, borderRadius: 20, padding: "32px 28px", marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 14 }}>
              <div style={{ width: 64, height: 64, borderRadius: 18, background: `${meta.color}15`, border: `1px solid ${meta.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>{meta.icon}</div>
              <div>
                <h2 style={{ fontSize: 28, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 2, margin: 0, color: "#fff" }}>Bienvenue, <span style={{ color: meta.color }}>{profile?.first_name || "Utilisateur"}</span> 👋</h2>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", margin: "4px 0 0" }}>{meta.welcomeMsg}</p>
              </div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 32 }}>
            {[
              { icon: "👤", label: "Mon profil", value: "À compléter", color: "#FF6B35", desc: "Ajoutez vos infos pour être visible" },
              { icon: "📢", label: "Annonces", value: "Explorer", color: "#3B82F6", desc: "Consultez les offres disponibles" },
              { icon: "💬", label: "Messages", value: "0 nouveau", color: "#10B981", desc: "Votre messagerie Hand Connect" },
            ].map((card, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "20px 22px", cursor: "pointer", transition: "all 0.3s ease" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${card.color}30`; e.currentTarget.style.transform = "translateY(-3px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.transform = ""; }}>
                <div style={{ fontSize: 26, marginBottom: 10 }}>{card.icon}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600, marginBottom: 4 }}>{card.label}</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: card.color, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 1 }}>{card.value}</div>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", margin: "6px 0 0", lineHeight: 1.5 }}>{card.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 24 }}>
            <h3 style={{ fontSize: 16, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 2, color: "#FF6B35", margin: "0 0 16px" }}>📋 MES INFORMATIONS</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {[["Prénom", profile?.first_name], ["Nom", profile?.last_name], ["Email", profile?.email], ["Type", meta.label], ["Inscrit le", profile?.created_at ? new Date(profile.created_at).toLocaleDateString("fr-FR") : "—"]].map(([label, value], i) => (
                <div key={i} style={{ padding: "12px 16px", background: "rgba(255,255,255,0.02)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.04)" }}>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600, marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 14, color: "#fff", fontWeight: 600 }}>{value || "—"}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ textAlign: "center", padding: "40px 0 16px", fontSize: 10, color: "rgba(255,255,255,0.15)" }}>HAND CONNECT — Mon Espace — {new Date().getFullYear()}</div>
        </main>
      </div>
    </div>
  );
}
