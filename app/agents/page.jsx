"use client";
import { useState, useRef, useEffect } from "react";

const C = { primary: "#1D4ED8", primaryLight: "#3B82F6", primaryDark: "#1E3A8A", accent: "#DC2626", accentLight: "#F87171", bg: "#0B1120", bgCard: "rgba(255,255,255,0.04)", bgHover: "rgba(255,255,255,0.07)", surface: "#111827", border: "rgba(255,255,255,0.08)", text: "#F1F5F9", muted: "rgba(255,255,255,0.5)", dim: "rgba(255,255,255,0.3)", green: "#10B981", gold: "#FBBF24", purple: "#8B5CF6", cyan: "#06B6D4" };

const HANDCONNECT_CONTEXT = `
HandConnect est une plateforme SaaS de mise en relation pour le handball amateur français.
Modèle : 100% abonnement, AUCUNE commission sur recrutement (risque juridique agent sportif).
Stack technique : Next.js + Supabase + Vercel + Stripe.
Cibles : clubs amateurs (N1 à départemental), joueurs, entraîneurs (Titre IV/V FFHB), entreprises sponsors.
Pricing : Club Free (0€), Club Standard (19€/mois), Club Premium (49€/mois), Joueur Boost (5€/mois), Entraîneur Pro (10€/mois), Sponsor (500-2000€/an).
Région de lancement : Auvergne-Rhône-Alpes (46k licenciés, 2ème région).
Fondateur : ex-handballeur pro + amateur actif, SASU créée, budget année 1 : 2000€.
Fonctionnalités clés : profils joueurs avec stats FFHB, profils entraîneurs Titre IV/V, annonces avec avantages (prime/logement/job/formation), système de plans avec contenu verrouillé.
Statut : maquette frontend terminée, pas encore de backend.
`;

const AGENTS = [
  {
    id: "cto",
    name: "CTO",
    title: "Directeur Technique",
    icon: "⚙️",
    color: C.primary,
    desc: "Architecture, choix techniques, scalabilité, sécurité",
    systemPrompt: `Tu es le CTO de HandConnect. ${HANDCONNECT_CONTEXT}
Ton rôle : prendre les décisions d'architecture technique, choisir les technologies, gérer la scalabilité, la sécurité et la dette technique.
Tu connais parfaitement Next.js, Supabase, Vercel, Stripe, React.
Tu réponds de manière concise et technique. Tu proposes des solutions concrètes avec du code quand nécessaire.
Tu priorises : simplicité > performance > features. Le fondateur est seul et a un budget limité.
Tu ne proposes jamais de solutions over-engineered. MVP first.`
  },
  {
    id: "ba",
    name: "BA",
    title: "Business Analyst",
    icon: "📋",
    color: C.green,
    desc: "Specs fonctionnelles, user stories, parcours utilisateur",
    systemPrompt: `Tu es le Business Analyst de HandConnect. ${HANDCONNECT_CONTEXT}
Ton rôle : rédiger les specs fonctionnelles, les user stories, les critères d'acceptation, les parcours utilisateur.
Tu structures tes réponses avec : User Story (As a... I want... So that...), Critères d'acceptation, Parcours utilisateur, Edge cases.
Tu connais le monde du handball amateur français, les besoins des présidents de club, des joueurs en recherche de club, des entraîneurs diplômés.
Tu traduis les besoins métier en specs techniques exploitables par le développeur.
Format : concis, structuré, actionnable.`
  },
  {
    id: "dev",
    name: "DEV",
    title: "Développeur Full-Stack",
    icon: "💻",
    color: C.purple,
    desc: "Code, implémentation, Next.js, Supabase, React",
    systemPrompt: `Tu es le développeur full-stack de HandConnect. ${HANDCONNECT_CONTEXT}
Ton rôle : coder les features, implémenter les specs du BA, suivre l'architecture du CTO.
Stack : Next.js 16 (App Router), React, Supabase (auth + DB + storage), Vercel (hosting), Stripe (paiements).
Tu écris du code propre, commenté, et fonctionnel. Tu fournis des fichiers complets, pas des extraits.
Tu respectes les conventions : "use client" pour les composants interactifs, server components par défaut.
Tu priorises le code simple et maintenable. Le fondateur doit pouvoir comprendre et modifier ton code.
Quand tu proposes du code, précise toujours le chemin du fichier et les dépendances à installer.`
  },
  {
    id: "qa",
    name: "QA",
    title: "Testeur / QA",
    icon: "🔍",
    color: C.gold,
    desc: "Tests, bugs, scénarios, qualité, edge cases",
    systemPrompt: `Tu es le QA / Testeur de HandConnect. ${HANDCONNECT_CONTEXT}
Ton rôle : identifier les bugs, écrire les scénarios de test, vérifier la qualité, anticiper les edge cases.
Tu penses comme un utilisateur (président de club pressé, joueur sur mobile, entraîneur qui découvre le site).
Tu structures tes réponses : Scénario de test, Étapes, Résultat attendu, Résultat observé (si bug), Sévérité (Bloquant/Majeur/Mineur/Cosmétique).
Tu testes : parcours utilisateur, responsive mobile, accessibilité, performance, sécurité basique.
Tu es méthodique et exhaustif mais priorisé : les bugs bloquants d'abord.`
  },
  {
    id: "commercial",
    name: "COMMERCIAL",
    title: "Responsable Commercial",
    icon: "🤝",
    color: C.accent,
    desc: "Prospection clubs, sponsors, pitch, go-to-market",
    systemPrompt: `Tu es le responsable commercial de HandConnect. ${HANDCONNECT_CONTEXT}
Ton rôle : prospecter les clubs, convaincre les sponsors, rédiger les pitchs, définir la stratégie go-to-market.
Tu connais parfaitement le monde du handball amateur français : les ligues régionales, les comités départementaux, la FFHB, les tournois, les problèmes de recrutement en amateur.
Tu sais parler aux présidents de club bénévoles (pas de jargon startup).
Tu proposes : emails de prospection, scripts d'appel, argumentaires, objections/réponses, plans de prospection, partenariats.
Tu priorises la région ARA (Auvergne-Rhône-Alpes) pour le lancement.
Tu es orienté résultats : chaque action doit mener à un RDV, un essai gratuit, ou une conversion.`
  },
];

/* ═══════ CHAT COMPONENT ═══════ */
function AgentChat({ agent, onBack }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEnd = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const allMessages = [...messages, { role: "user", content: userMsg }];
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: agent.systemPrompt,
          messages: allMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await response.json();
      const reply = data.content?.map(b => b.text || "").join("\n") || "Erreur de réponse.";
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", content: "❌ Erreur de connexion à l'API. Vérifiez votre configuration." }]);
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const suggestions = {
    cto: ["Quelle architecture DB pour les profils joueurs ?", "Comment structurer l'auth Supabase ?", "Plan de migration vers la prod ?"],
    ba: ["User story : inscription d'un club", "Parcours utilisateur : publier une annonce", "Specs pour le système d'abonnement"],
    dev: ["Code la page d'inscription", "Implémente le composant AnnonceCard", "Setup Stripe pour les abonnements"],
    qa: ["Scénarios de test pour l'inscription", "Checklist avant mise en prod", "Tests responsive sur mobile"],
    commercial: ["Email de prospection pour un club N3", "Pitch pour un sponsor local", "Plan de prospection ARA mois 1"],
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 60px)" }}>
      {/* Header */}
      <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 14, background: `${agent.color}08` }}>
        <button onClick={onBack} style={{ background: C.bgCard, border: `1px solid ${C.border}`, color: C.muted, width: 36, height: 36, borderRadius: 10, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>←</button>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: `${agent.color}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{agent.icon}</div>
        <div>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.text }}>{agent.name} — {agent.title}</h2>
          <p style={{ margin: 0, fontSize: 12, color: C.muted }}>{agent.desc}</p>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.green, boxShadow: `0 0 8px ${C.green}60` }} />
          <span style={{ fontSize: 11, color: C.green, fontWeight: 600 }}>En ligne</span>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
        {messages.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>{agent.icon}</div>
            <h3 style={{ color: C.text, fontSize: 18, fontWeight: 700, margin: "0 0 8px" }}>Bienvenue dans le chat {agent.name}</h3>
            <p style={{ color: C.muted, fontSize: 13, margin: "0 0 24px", lineHeight: 1.6 }}>Je suis votre {agent.title} dédié à HandConnect. Posez-moi vos questions ou choisissez un sujet ci-dessous.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 400, margin: "0 auto" }}>
              {(suggestions[agent.id] || []).map(s => (
                <button key={s} onClick={() => { setInput(s); inputRef.current?.focus(); }} style={{ padding: "10px 16px", background: `${agent.color}10`, border: `1px solid ${agent.color}20`, borderRadius: 10, color: agent.color, fontSize: 12, fontWeight: 500, cursor: "pointer", textAlign: "left", transition: "all .2s" }}
                  onMouseEnter={e => { e.currentTarget.style.background = `${agent.color}20`; }}
                  onMouseLeave={e => { e.currentTarget.style.background = `${agent.color}10`; }}>
                  💬 {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", animation: "fadeUp .3s ease" }}>
            <div style={{ maxWidth: "75%", padding: "12px 16px", borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px", background: m.role === "user" ? `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})` : C.bgCard, border: m.role === "user" ? "none" : `1px solid ${C.border}`, color: C.text, fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
              {m.role === "assistant" && <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}><span style={{ fontSize: 14 }}>{agent.icon}</span><span style={{ fontSize: 11, color: agent.color, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>{agent.name}</span></div>}
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div style={{ padding: "12px 20px", borderRadius: "16px 16px 16px 4px", background: C.bgCard, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 14 }}>{agent.icon}</span>
              <div style={{ display: "flex", gap: 4 }}>
                {[0, 1, 2].map(j => <div key={j} style={{ width: 6, height: 6, borderRadius: "50%", background: agent.color, opacity: 0.4, animation: `pulse 1.2s ease-in-out ${j * 0.2}s infinite` }} />)}
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEnd} />
      </div>

      {/* Input */}
      <div style={{ padding: "16px 20px", borderTop: `1px solid ${C.border}`, background: C.surface }}>
        <div style={{ display: "flex", gap: 10, maxWidth: 800, margin: "0 auto" }}>
          <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder={`Message au ${agent.name}...`} rows={1} style={{ flex: 1, padding: "12px 16px", background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 12, color: C.text, fontSize: 13, outline: "none", resize: "none", fontFamily: "inherit", lineHeight: 1.5, transition: "border-color .2s" }}
            onFocus={e => { e.target.style.borderColor = agent.color; }}
            onBlur={e => { e.target.style.borderColor = C.border; }} />
          <button onClick={sendMessage} disabled={!input.trim() || loading} style={{ padding: "12px 20px", border: "none", borderRadius: 12, background: input.trim() && !loading ? `linear-gradient(135deg, ${agent.color}, ${agent.color}cc)` : C.bgCard, color: input.trim() && !loading ? "#fff" : C.dim, fontSize: 14, fontWeight: 700, cursor: input.trim() && !loading ? "pointer" : "default", transition: "all .2s", boxShadow: input.trim() && !loading ? `0 4px 14px ${agent.color}30` : "none" }}>
            {loading ? "..." : "→"}
          </button>
        </div>
        <p style={{ textAlign: "center", fontSize: 10, color: C.dim, marginTop: 8 }}>Appuyez sur Entrée pour envoyer · Shift+Entrée pour un saut de ligne</p>
      </div>
    </div>
  );
}

/* ═══════ MAIN PAGE ═══════ */
export default function AgentsPage() {
  const [activeAgent, setActiveAgent] = useState(null);

  const css = `@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes pulse{0%,100%{opacity:.3;transform:scale(1)}50%{opacity:.8;transform:scale(1.2)}}
textarea:focus{border-color:${C.primary}!important;box-shadow:0 0 0 3px ${C.primary}15!important}
::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:4px}`;

  if (activeAgent) {
    const agent = AGENTS.find(a => a.id === activeAgent);
    return <>
      <style>{css}</style>
      <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" }}>
        <header style={{ background: `${C.bg}ee`, backdropFilter: "blur(20px)", borderBottom: `1px solid ${C.border}`, padding: "0 20px", position: "sticky", top: 0, zIndex: 100 }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", height: 60, gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg,${C.primary},${C.accent})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🤾</div>
            <h1 style={{ fontSize: 20, fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 3, color: "#fff", lineHeight: 1 }}>HAND<span style={{ color: C.primary }}>CONNECT</span></h1>
            <span style={{ fontSize: 10, color: C.muted, background: `${agent.color}15`, padding: "3px 10px", borderRadius: 6, fontWeight: 600, border: `1px solid ${agent.color}30`, marginLeft: 8 }}>{agent.icon} {agent.name}</span>
          </div>
        </header>
        <AgentChat agent={agent} onBack={() => setActiveAgent(null)} />
      </div>
    </>;
  }

  return <>
    <style>{css}</style>
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "fixed", top: -300, right: -200, width: 700, height: 700, borderRadius: "50%", background: `radial-gradient(circle,${C.primary}08,transparent 70%)`, pointerEvents: "none" }} />

      <header style={{ background: `${C.bg}ee`, backdropFilter: "blur(20px)", borderBottom: `1px solid ${C.border}`, padding: "0 20px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg,${C.primary},${C.accent})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🤾</div>
            <h1 style={{ fontSize: 20, fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 3, color: "#fff", lineHeight: 1 }}>HAND<span style={{ color: C.primary }}>CONNECT</span></h1>
          </div>
          <a href="/" style={{ fontSize: 12, color: C.muted, textDecoration: "none", padding: "7px 14px", border: `1px solid ${C.border}`, borderRadius: 8 }}>← Retour au site</a>
        </div>
      </header>

      <main style={{ maxWidth: 900, margin: "0 auto", padding: "40px 20px" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 38, letterSpacing: 3, color: C.text, margin: "0 0 8px" }}>ÉQUIPE <span style={{ color: C.primary }}>IA</span></h2>
          <p style={{ color: C.muted, fontSize: 14, maxWidth: 500, margin: "0 auto", lineHeight: 1.7 }}>Votre équipe virtuelle dédiée à HandConnect. Chaque agent connaît le projet et répond dans son domaine d'expertise.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
          {AGENTS.map((a, i) => (
            <div key={a.id} onClick={() => setActiveAgent(a.id)} style={{ background: C.bgCard, borderRadius: 18, padding: 24, border: `1px solid ${C.border}`, cursor: "pointer", transition: "all .35s cubic-bezier(0.16,1,0.3,1)", animation: `fadeUp .5s ease ${i * 0.08}s both`, position: "relative", overflow: "hidden" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.borderColor = `${a.color}40`; e.currentTarget.style.boxShadow = `0 20px 60px ${a.color}12`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = ""; }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${a.color}, ${a.color}66)` }} />
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: `${a.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, border: `1px solid ${a.color}25` }}>{a.icon}</div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: C.text, fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 2 }}>{a.name}</h3>
                  <p style={{ margin: 0, fontSize: 11, color: a.color, fontWeight: 600 }}>{a.title}</p>
                </div>
              </div>
              <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, margin: "0 0 16px" }}>{a.desc}</p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.green, boxShadow: `0 0 6px ${C.green}60` }} />
                  <span style={{ fontSize: 10, color: C.green, fontWeight: 600 }}>En ligne</span>
                </div>
                <span style={{ fontSize: 11, color: a.color, fontWeight: 600, background: `${a.color}10`, padding: "4px 12px", borderRadius: 8, border: `1px solid ${a.color}20` }}>Ouvrir le chat →</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 32, padding: 20, background: `${C.primary}06`, borderRadius: 14, border: `1px solid ${C.primary}10`, textAlign: "center" }}>
          <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.7 }}>
            💡 Chaque agent a accès au contexte complet de HandConnect : modèle économique, stack technique, cibles, pricing, et stratégie de lancement. Les conversations sont indépendantes entre agents.
          </p>
        </div>
      </main>
    </div>
  </>;
}
