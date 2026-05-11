"use client";
import { useState, useEffect, useCallback } from "react";

const FONT_LINK = "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap";

// ─── DATA ────────────────────────────────────────────────────────────────────

const initialAgents = {
  cto: {
    label: "🧠 Pôle CTO — Architecture & Vision",
    color: "#FF6B35",
    description: "Responsable de la vision technique, des choix d'architecture, de la roadmap produit et de la supervision des équipes tech.",
    agents: [
      {
        id: "cto-1",
        name: "Agent Architecte Solution",
        role: "CTO / Lead Architect",
        mission: "Définir l'architecture technique de Hand Connect (stack, infra, API, BDD). Valider les choix technologiques et assurer la scalabilité.",
        tasks: [
          "Définir le stack technique (React Native / Flutter, Node.js / Python, PostgreSQL / Firebase)",
          "Concevoir l'architecture microservices ou monolithique",
          "Mettre en place le CI/CD (GitHub Actions, Vercel, Docker)",
          "Définir la stratégie de déploiement (cloud provider, staging, prod)",
          "Superviser la sécurité et la conformité RGPD",
        ],
        status: "active",
        priority: "critical",
        kpis: ["Architecture validée", "Stack choisi", "Infra déployée"],
      },
      {
        id: "cto-2",
        name: "Agent Roadmap Produit",
        role: "Product Owner Technique",
        mission: "Structurer la roadmap technique, prioriser les features, coordonner les sprints entre dev et test.",
        tasks: [
          "Définir les User Stories et les critères d'acceptation",
          "Planifier les sprints (2 semaines) avec les dev et testeurs",
          "Prioriser le backlog selon la valeur business (MoSCoW)",
          "Coordonner les releases et les démos",
          "Rédiger la documentation technique",
        ],
        status: "active",
        priority: "high",
        kpis: ["Vélocité sprints", "Features livrées/sprint", "Backlog priorisé"],
      },
    ],
  },
  dev: {
    label: "💻 Pôle Développement",
    color: "#3B82F6",
    description: "Équipe de développeurs front-end, back-end et mobile responsable du code, des fonctionnalités et de l'intégration.",
    agents: [
      {
        id: "dev-1",
        name: "Agent Frontend Mobile",
        role: "Développeur Mobile (React Native / Flutter)",
        mission: "Développer l'application mobile Hand Connect pour iOS et Android avec une UX fluide et performante.",
        tasks: [
          "Développer les écrans : profil joueur, recherche club, messagerie, offres",
          "Implémenter le système d'authentification (OAuth, email/password)",
          "Intégrer les notifications push (Firebase Cloud Messaging)",
          "Optimiser les performances (lazy loading, cache, animations 60fps)",
          "Gérer le responsive et l'accessibilité",
        ],
        status: "active",
        priority: "critical",
        kpis: ["Écrans livrés", "Performance Lighthouse > 90", "Crash rate < 0.1%"],
      },
      {
        id: "dev-2",
        name: "Agent Backend API",
        role: "Développeur Backend (Node.js / Python)",
        mission: "Construire et maintenir l'API REST/GraphQL, la base de données et les services métier de Hand Connect.",
        tasks: [
          "Concevoir et implémenter les endpoints API (joueurs, clubs, offres, matchs)",
          "Modéliser la base de données (joueurs, clubs, contrats, statistiques)",
          "Implémenter le système de matching joueur/club intelligent",
          "Gérer l'upload et le stockage des médias (vidéos, photos profil)",
          "Mettre en place le système de messagerie temps réel (WebSocket)",
        ],
        status: "active",
        priority: "critical",
        kpis: ["Endpoints livrés", "Temps de réponse < 200ms", "Uptime 99.9%"],
      },
      {
        id: "dev-3",
        name: "Agent Dashboard Web",
        role: "Développeur Frontend Web (React / Next.js)",
        mission: "Développer le dashboard web pour les clubs et les administrateurs Hand Connect.",
        tasks: [
          "Créer le dashboard club (gestion effectif, recrutement, statistiques)",
          "Développer l'interface admin (validation profils, modération, analytics)",
          "Implémenter les visualisations de données (graphiques, stats joueurs)",
          "Intégrer le système de paiement (Stripe) pour les abonnements clubs",
          "Développer la landing page marketing",
        ],
        status: "pending",
        priority: "high",
        kpis: ["Pages livrées", "Conversion landing page", "Taux rebond < 40%"],
      },
    ],
  },
  test: {
    label: "🧪 Pôle Test & Qualité",
    color: "#10B981",
    description: "Équipe de testeurs QA responsable de la validation fonctionnelle, des tests automatisés et de la qualité globale du produit.",
    agents: [
      {
        id: "test-1",
        name: "Agent QA Fonctionnel",
        role: "Testeur QA / Recetteur",
        mission: "Valider chaque feature livrée par les développeurs, rédiger et exécuter les cas de test, reporter les bugs.",
        tasks: [
          "Rédiger les plans de test pour chaque User Story",
          "Exécuter les tests de recette (inscription, profil, matching, messagerie)",
          "Reporter et suivre les bugs sur Jira/Linear avec sévérité et reproductibilité",
          "Valider les corrections de bugs (test de non-régression)",
          "Tester sur les différents devices (iOS/Android, différentes tailles d'écran)",
        ],
        status: "active",
        priority: "high",
        kpis: ["Cas de test exécutés", "Taux de bugs bloquants < 5%", "Coverage fonctionnel > 80%"],
      },
      {
        id: "test-2",
        name: "Agent Test Automatisé",
        role: "QA Automation Engineer",
        mission: "Mettre en place et maintenir la suite de tests automatisés (unit, intégration, E2E) pour garantir la qualité continue.",
        tasks: [
          "Configurer le framework de tests (Jest, Cypress, Detox pour mobile)",
          "Écrire les tests unitaires pour les services backend critiques",
          "Automatiser les parcours E2E clés (inscription → profil → match → contact)",
          "Intégrer les tests dans le pipeline CI/CD",
          "Monitorer la couverture de code et les métriques qualité",
        ],
        status: "pending",
        priority: "medium",
        kpis: ["Couverture tests > 70%", "Tests E2E automatisés", "Temps pipeline < 10min"],
      },
    ],
  },
  commercial: {
    label: "📞 Pôle Commercial — Acquisition Clubs",
    color: "#F59E0B",
    description: "Équipe commerciale dédiée à contacter les présidents de clubs de handball pour leur proposer de tester Hand Connect en version bêta.",
    agents: [
      {
        id: "com-1",
        name: "Agent Prospection & Base de Données",
        role: "Sales Data Analyst",
        mission: "Constituer et enrichir la base de données de tous les clubs de handball en France avec les coordonnées des présidents.",
        tasks: [
          "Scraper les annuaires fédéraux (FFHB) pour lister tous les clubs par ligue/comité",
          "Collecter les noms et emails des présidents de club (site fédéral, LinkedIn, Google)",
          "Segmenter les clubs par division (N1, N2, N3, Régional, Départemental)",
          "Prioriser les clubs : commencer par N1/N2/N3 puis descendre",
          "Enrichir les fiches avec : taille effectif, ville, division, historique transferts",
        ],
        status: "active",
        priority: "critical",
        kpis: ["Nb clubs dans la BDD", "Taux d'enrichissement > 80%", "Contacts qualifiés"],
      },
      {
        id: "com-2",
        name: "Agent Emailing & Séquences",
        role: "Growth / Outbound Specialist",
        mission: "Concevoir et exécuter les campagnes d'emailing automatisées pour inviter les présidents à tester Hand Connect.",
        tasks: [
          "Rédiger les séquences email (3 touchpoints : intro → relance → dernier appel)",
          "Personnaliser chaque email avec le nom du club, la division, la ville",
          "Configurer l'outil d'emailing (Lemlist, Instantly, ou Brevo)",
          "A/B tester les objets d'email pour optimiser le taux d'ouverture",
          "Suivre les KPIs : taux d'ouverture, de clic, de réponse, de RDV pris",
        ],
        status: "active",
        priority: "critical",
        kpis: ["Taux ouverture > 40%", "Taux réponse > 15%", "RDV pris / semaine"],
      },
      {
        id: "com-3",
        name: "Agent Phoning & Closing",
        role: "Business Developer",
        mission: "Appeler les présidents de club pour présenter Hand Connect, répondre aux objections et convertir en utilisateurs bêta.",
        tasks: [
          "Préparer le script d'appel adapté au handball (parler le langage du hand)",
          "Appeler les présidents ayant ouvert les emails mais pas répondu",
          "Présenter la proposition de valeur : gratuit en bêta, gain de temps recrutement, visibilité joueurs",
          "Gérer les objections courantes ('on recrute en local', 'pas le temps', 'déjà Handnews')",
          "Planifier les démos et onboardings pour les clubs intéressés",
        ],
        status: "pending",
        priority: "high",
        kpis: ["Appels / jour", "Taux de conversion appel → démo", "Clubs onboardés"],
      },
      {
        id: "com-4",
        name: "Agent Partenariats & Réseaux",
        role: "Partnership Manager",
        mission: "Nouer des partenariats avec les ligues régionales, comités départementaux et médias handball pour amplifier l'acquisition.",
        tasks: [
          "Contacter les 18 ligues régionales FFHB pour proposer un partenariat",
          "Proposer aux ligues d'intégrer Hand Connect dans leur communication aux clubs",
          "Identifier et approcher les influenceurs/médias handball (HandNews, HandZone, Parlons Hand)",
          "Organiser des webinaires de présentation pour les comités départementaux",
          "Négocier une visibilité lors des événements fédéraux (AG, tournois)",
        ],
        status: "pending",
        priority: "medium",
        kpis: ["Ligues partenaires", "Articles/posts obtenus", "Clubs via partenariats"],
      },
    ],
  },
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const statusConfig = {
  active: { label: "Actif", color: "#10B981", bg: "rgba(16,185,129,0.12)" },
  pending: { label: "En attente", color: "#F59E0B", bg: "rgba(245,158,11,0.12)" },
  paused: { label: "Pausé", color: "#6B7280", bg: "rgba(107,114,128,0.12)" },
  done: { label: "Terminé", color: "#3B82F6", bg: "rgba(59,130,246,0.12)" },
};

const priorityConfig = {
  critical: { label: "Critique", color: "#EF4444", icon: "🔴" },
  high: { label: "Haute", color: "#F59E0B", icon: "🟠" },
  medium: { label: "Moyenne", color: "#3B82F6", icon: "🔵" },
  low: { label: "Basse", color: "#6B7280", icon: "⚪" },
};

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

function AgentCard({ agent, poleColor, onStatusChange, expanded, onToggle }) {
  const st = statusConfig[agent.status];
  const pr = priorityConfig[agent.priority];
  const [taskChecks, setTaskChecks] = useState(() => agent.tasks.map(() => false));

  const completedTasks = taskChecks.filter(Boolean).length;
  const progress = Math.round((completedTasks / agent.tasks.length) * 100);

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        border: `1px solid ${expanded ? poleColor + "44" : "rgba(255,255,255,0.06)"}`,
        borderRadius: 16,
        overflow: "hidden",
        transition: "all 0.3s ease",
        cursor: "pointer",
      }}
      onClick={onToggle}
    >
      {/* Header */}
      <div style={{ padding: "18px 20px", display: "flex", alignItems: "center", gap: 14 }}>
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            background: `linear-gradient(135deg, ${poleColor}22, ${poleColor}08)`,
            border: `1px solid ${poleColor}33`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            flexShrink: 0,
          }}
        >
          {agent.role.includes("CTO") ? "🏗️" : agent.role.includes("Mobile") ? "📱" : agent.role.includes("Backend") ? "⚙️" : agent.role.includes("Frontend") || agent.role.includes("Dashboard") ? "🖥️" : agent.role.includes("QA") || agent.role.includes("Test") ? "🔍" : agent.role.includes("Data") ? "📊" : agent.role.includes("Email") || agent.role.includes("Growth") ? "✉️" : agent.role.includes("Business") || agent.role.includes("Phoning") ? "📞" : agent.role.includes("Partner") ? "🤝" : agent.role.includes("Product") ? "📋" : "🤖"}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: "#fff", fontFamily: "'DM Sans', sans-serif" }}>{agent.name}</span>
            <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 6, background: st.bg, color: st.color, fontWeight: 600 }}>{st.label}</span>
            <span style={{ fontSize: 10, opacity: 0.5 }}>{pr.icon} {pr.label}</span>
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 3, fontFamily: "'DM Sans', sans-serif" }}>{agent.role}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Progress ring */}
          <div style={{ position: "relative", width: 36, height: 36 }}>
            <svg width="36" height="36" style={{ transform: "rotate(-90deg)" }}>
              <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="14" fill="none"
                stroke={poleColor}
                strokeWidth="3"
                strokeDasharray={`${(progress / 100) * 88} 88`}
                strokeLinecap="round"
                style={{ transition: "stroke-dasharray 0.5s ease" }}
              />
            </svg>
            <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.6)" }}>{progress}%</span>
          </div>
          <span style={{ fontSize: 16, transform: expanded ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.3s", color: "rgba(255,255,255,0.3)" }}>▾</span>
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div
          style={{ padding: "0 20px 20px", borderTop: "1px solid rgba(255,255,255,0.04)" }}
          onClick={(e) => e.stopPropagation()}
        >
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, margin: "14px 0", fontFamily: "'DM Sans', sans-serif" }}>
            <strong style={{ color: "rgba(255,255,255,0.7)" }}>Mission :</strong> {agent.mission}
          </p>

          {/* Status selector */}
          <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
            {Object.entries(statusConfig).map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => onStatusChange(agent.id, key)}
                style={{
                  padding: "4px 12px",
                  borderRadius: 8,
                  border: agent.status === key ? `1px solid ${cfg.color}` : "1px solid rgba(255,255,255,0.08)",
                  background: agent.status === key ? cfg.bg : "transparent",
                  color: agent.status === key ? cfg.color : "rgba(255,255,255,0.4)",
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                  transition: "all 0.2s",
                }}
              >
                {cfg.label}
              </button>
            ))}
          </div>

          {/* Tasks */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {agent.tasks.map((task, i) => (
              <label
                key={i}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  padding: "8px 12px",
                  borderRadius: 10,
                  background: taskChecks[i] ? "rgba(16,185,129,0.06)" : "rgba(255,255,255,0.02)",
                  border: `1px solid ${taskChecks[i] ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.04)"}`,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                <input
                  type="checkbox"
                  checked={taskChecks[i]}
                  onChange={() => {
                    const next = [...taskChecks];
                    next[i] = !next[i];
                    setTaskChecks(next);
                  }}
                  style={{ accentColor: poleColor, marginTop: 2, flexShrink: 0 }}
                />
                <span style={{
                  fontSize: 12,
                  color: taskChecks[i] ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.65)",
                  textDecoration: taskChecks[i] ? "line-through" : "none",
                  lineHeight: 1.5,
                  fontFamily: "'DM Sans', sans-serif",
                  transition: "all 0.2s",
                }}>
                  {task}
                </span>
              </label>
            ))}
          </div>

          {/* KPIs */}
          <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
            {agent.kpis.map((kpi, i) => (
              <span
                key={i}
                style={{
                  fontSize: 10,
                  padding: "4px 10px",
                  borderRadius: 8,
                  background: `${poleColor}11`,
                  border: `1px solid ${poleColor}22`,
                  color: poleColor,
                  fontWeight: 600,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                📈 {kpi}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PoleSection({ poleKey, pole, agents, onStatusChange, expandedId, setExpandedId }) {
  const totalTasks = agents.reduce((s, a) => s + a.tasks.length, 0);
  const activeAgents = agents.filter((a) => a.status === "active").length;

  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
        <div
          style={{
            width: 4,
            height: 40,
            borderRadius: 4,
            background: `linear-gradient(180deg, ${pole.color}, ${pole.color}44)`,
          }}
        />
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: 20, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 2, color: "#fff", margin: 0, lineHeight: 1.2 }}>
            {pole.label}
          </h2>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", margin: "4px 0 0", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5 }}>
            {pole.description}
          </p>
        </div>
        <div style={{ display: "flex", gap: 12, flexShrink: 0 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: pole.color, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 1 }}>{agents.length}</div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", fontFamily: "'DM Sans', sans-serif" }}>agents</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#10B981", fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 1 }}>{activeAgents}</div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", fontFamily: "'DM Sans', sans-serif" }}>actifs</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: "rgba(255,255,255,0.6)", fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 1 }}>{totalTasks}</div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", fontFamily: "'DM Sans', sans-serif" }}>tâches</div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {agents.map((agent) => (
          <AgentCard
            key={agent.id}
            agent={agent}
            poleColor={pole.color}
            onStatusChange={onStatusChange}
            expanded={expandedId === agent.id}
            onToggle={() => setExpandedId(expandedId === agent.id ? null : agent.id)}
          />
        ))}
      </div>
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────

export default function HandConnectAgents() {
  const [data, setData] = useState(initialAgents);
  const [activeTab, setActiveTab] = useState("all");
  const [expandedId, setExpandedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const handleStatusChange = useCallback((agentId, newStatus) => {
    setData((prev) => {
      const next = { ...prev };
      for (const key of Object.keys(next)) {
        next[key] = {
          ...next[key],
          agents: next[key].agents.map((a) =>
            a.id === agentId ? { ...a, status: newStatus } : a
          ),
        };
      }
      return next;
    });
  }, []);

  const tabs = [
    { key: "all", label: "Vue globale", icon: "🌐" },
    { key: "cto", label: "CTO", icon: "🧠" },
    { key: "dev", label: "Dev", icon: "💻" },
    { key: "test", label: "Test", icon: "🧪" },
    { key: "commercial", label: "Commercial", icon: "📞" },
  ];

  const filteredPoles = activeTab === "all"
    ? Object.entries(data)
    : Object.entries(data).filter(([key]) => key === activeTab);

  const allAgents = Object.values(data).flatMap((p) => p.agents);
  const totalAgents = allAgents.length;
  const activeAgents = allAgents.filter((a) => a.status === "active").length;
  const criticalAgents = allAgents.filter((a) => a.priority === "critical").length;
  const totalTasks = allAgents.reduce((s, a) => s + a.tasks.length, 0);

  return (
    <div style={{ minHeight: "100vh", background: "#0A0E1A", color: "#fff", fontFamily: "'DM Sans', sans-serif" }}>
      <link href={FONT_LINK} rel="stylesheet" />

      {/* Ambient background */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,107,53,0.06) 0%, transparent 70%)", top: -200, right: -100 }} />
        <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.04) 0%, transparent 70%)", bottom: -100, left: -150 }} />
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* HEADER */}
        <header style={{ background: "rgba(10,14,26,0.9)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "0 24px", position: "sticky", top: 0, zIndex: 100 }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 12, background: "linear-gradient(135deg, #FF6B35, #C13C00)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, boxShadow: "0 4px 16px rgba(255,107,53,0.3)" }}>🤾</div>
              <div>
                <h1 style={{ fontSize: 22, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 3, color: "#fff", lineHeight: 1, margin: 0 }}>
                  HAND<span style={{ color: "#FF6B35" }}>CONNECT</span>
                </h1>
                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: 2, fontWeight: 600 }}>GESTION DES SOUS-AGENTS</span>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <input
                type="text"
                placeholder="Rechercher un agent..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  padding: "8px 14px",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.04)",
                  color: "#fff",
                  fontSize: 12,
                  outline: "none",
                  width: 180,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              />
            </div>
          </div>
        </header>

        <main style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px" }}>
          {/* STATS */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 28 }}>
            {[
              { label: "Total Agents", value: totalAgents, color: "#FF6B35", icon: "🤖" },
              { label: "Agents Actifs", value: activeAgents, color: "#10B981", icon: "✅" },
              { label: "Critiques", value: criticalAgents, color: "#EF4444", icon: "🔴" },
              { label: "Total Tâches", value: totalTasks, color: "#3B82F6", icon: "📋" },
            ].map((stat, i) => (
              <div
                key={i}
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 14,
                  padding: "16px 18px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 20, marginBottom: 6 }}>{stat.icon}</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: stat.color, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 1 }}>{stat.value}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontWeight: 600, letterSpacing: 0.5 }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* TABS */}
          <div style={{ display: "flex", gap: 6, marginBottom: 24, flexWrap: "wrap" }}>
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                style={{
                  padding: "8px 16px",
                  borderRadius: 10,
                  border: activeTab === t.key ? "1px solid rgba(255,107,53,0.3)" : "1px solid rgba(255,255,255,0.06)",
                  background: activeTab === t.key ? "rgba(255,107,53,0.1)" : "rgba(255,255,255,0.02)",
                  color: activeTab === t.key ? "#FF6B35" : "rgba(255,255,255,0.5)",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                  transition: "all 0.2s",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {/* POLES */}
          {filteredPoles.map(([key, pole]) => {
            let agents = pole.agents;
            if (searchTerm) {
              const q = searchTerm.toLowerCase();
              agents = agents.filter(
                (a) =>
                  a.name.toLowerCase().includes(q) ||
                  a.role.toLowerCase().includes(q) ||
                  a.mission.toLowerCase().includes(q)
              );
            }
            if (agents.length === 0 && searchTerm) return null;
            return (
              <PoleSection
                key={key}
                poleKey={key}
                pole={pole}
                agents={agents}
                onStatusChange={handleStatusChange}
                expandedId={expandedId}
                setExpandedId={setExpandedId}
              />
            );
          })}

          {/* WORKFLOW */}
          <div style={{ marginTop: 12, padding: 24, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16 }}>
            <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 2, fontSize: 18, color: "#FF6B35", margin: "0 0 14px" }}>
              🔄 WORKFLOW — PIPELINE D'ACQUISITION CLUBS
            </h3>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              {[
                { step: "1", label: "Scraping FFHB", color: "#F59E0B" },
                { step: "2", label: "Enrichissement BDD", color: "#F59E0B" },
                { step: "3", label: "Séquence Email", color: "#F59E0B" },
                { step: "4", label: "Relance Phoning", color: "#FF6B35" },
                { step: "5", label: "Démo / Onboarding", color: "#10B981" },
                { step: "6", label: "Club Actif ✅", color: "#10B981" },
              ].map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{
                    padding: "8px 14px",
                    borderRadius: 10,
                    background: `${s.color}15`,
                    border: `1px solid ${s.color}33`,
                    color: s.color,
                    fontSize: 11,
                    fontWeight: 600,
                    fontFamily: "'DM Sans', sans-serif",
                    whiteSpace: "nowrap",
                  }}>
                    <span style={{ opacity: 0.5, marginRight: 4 }}>#{s.step}</span> {s.label}
                  </div>
                  {i < 5 && <span style={{ color: "rgba(255,255,255,0.15)", fontSize: 14 }}>→</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div style={{ textAlign: "center", padding: "32px 0 16px", fontSize: 10, color: "rgba(255,255,255,0.15)", fontFamily: "'DM Sans', sans-serif" }}>
            HAND CONNECT — Sous-Agents Management Dashboard — {new Date().getFullYear()}
          </div>
        </main>
      </div>
    </div>
  );
}
