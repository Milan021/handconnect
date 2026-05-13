"use client";
import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";

const C = {
  primary: "#1D4ED8", primaryLight: "#3B82F6", primaryDark: "#1E3A8A",
  accent: "#DC2626", green: "#10B981", gold: "#FBBF24",
  bg: "#0B1120", surface: "#111827",
  text: "#F1F5F9", muted: "rgba(255,255,255,0.5)", dim: "rgba(255,255,255,0.3)",
  border: "rgba(255,255,255,0.08)", borderBlue: "rgba(29,78,216,0.4)",
};

const initials = (p) => `${(p?.first_name || "?")[0]}${(p?.last_name || "?")[0]}`;
const fullName = (p) => p ? `${p.first_name || ""} ${p.last_name || ""}`.trim() || "Utilisateur" : "Utilisateur";
const fmtTime = (iso) => {
  const d = new Date(iso); const now = new Date();
  const diff = (now - d) / 1000;
  if (diff < 60) return "à l'instant";
  if (diff < 3600) return `${Math.floor(diff / 60)} min`;
  if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  if (diff < 86400 * 7) return d.toLocaleDateString("fr-FR", { weekday: "short" });
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
};

export default function ChatWidget() {
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState("list"); // list | chat
  const [conversations, setConversations] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [profilesMap, setProfilesMap] = useState({});
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const msgEndRef = useRef(null);

  // Auth
  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(({ data }) => { if (mounted) setUser(data?.user || null); });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user || null));
    return () => { mounted = false; sub?.subscription?.unsubscribe(); };
  }, []);

  // Load conversations + pending requests
  const refreshList = async () => {
    if (!user) return;
    const [{ data: convs }, { data: reqs }] = await Promise.all([
      supabase.from("conversations").select("*").order("last_message_at", { ascending: false }),
      supabase.from("connections").select("*").eq("status", "pending").neq("requester_id", user.id),
    ]);
    setConversations(convs || []);
    setPendingRequests(reqs || []);
    const ids = new Set();
    (convs || []).forEach(c => { ids.add(c.participant_a); ids.add(c.participant_b); });
    (reqs || []).forEach(r => { ids.add(r.participant_a); ids.add(r.participant_b); });
    ids.delete(user.id);
    if (ids.size > 0) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, position, current_club, city, user_type")
        .in("id", [...ids]);
      setProfilesMap(Object.fromEntries((profs || []).map(p => [p.id, p])));
    }
  };

  useEffect(() => { refreshList(); }, [user]);

  // Subscribe to realtime: new messages + connection updates
  useEffect(() => {
    if (!user) return;
    const ch = supabase
      .channel(`user-${user.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, payload => {
        const m = payload.new;
        if (activeConvId && m.conversation_id === activeConvId) {
          setMessages(prev => prev.find(x => x.id === m.id) ? prev : [...prev, m]);
        }
        refreshList();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "connections" }, () => refreshList())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user, activeConvId]);

  // Unread counter
  useEffect(() => {
    if (!user) { setUnreadCount(0); return; }
    const fetchUnread = async () => {
      const { count } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .is("read_at", null)
        .neq("sender_id", user.id);
      setUnreadCount(count || 0);
    };
    fetchUnread();
    const t = setInterval(fetchUnread, 15000);
    return () => clearInterval(t);
  }, [user, messages, conversations]);

  // Scroll to bottom on messages change
  useEffect(() => { msgEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, view]);

  // Listen for custom events: open chat with a user
  useEffect(() => {
    const handler = async (e) => {
      const otherId = e.detail?.otherUserId;
      if (!otherId || !user) return;
      setOpen(true);
      setView("list");
      try {
        const { data: convId, error } = await supabase.rpc("get_or_create_conversation", { other_user_id: otherId });
        if (error) {
          // Pas de connexion accepted → on tente une demande
          await supabase.rpc("request_connection", { other_user_id: otherId });
          await refreshList();
          return;
        }
        await openConversation(convId);
      } catch (err) { console.error(err); }
    };
    window.addEventListener("hc-open-chat", handler);
    return () => window.removeEventListener("hc-open-chat", handler);
  }, [user]);

  const openConversation = async (convId) => {
    setActiveConvId(convId);
    setView("chat");
    const { data } = await supabase
      .from("messages").select("*")
      .eq("conversation_id", convId).order("created_at", { ascending: true });
    setMessages(data || []);
    // mark all as read
    await supabase.from("messages").update({ read_at: new Date().toISOString() })
      .eq("conversation_id", convId).neq("sender_id", user.id).is("read_at", null);
  };

  const sendMessage = async () => {
    const body = draft.trim();
    if (!body || !activeConvId || sending) return;
    setSending(true);
    const { data, error } = await supabase.from("messages")
      .insert({ conversation_id: activeConvId, sender_id: user.id, body })
      .select().single();
    if (!error && data) {
      setMessages(prev => [...prev, data]);
      setDraft("");
    }
    setSending(false);
  };

  const acceptConnection = async (connId) => {
    await supabase.from("connections")
      .update({ status: "accepted", responded_at: new Date().toISOString() })
      .eq("id", connId);
    await refreshList();
  };

  const rejectConnection = async (connId) => {
    await supabase.from("connections")
      .update({ status: "rejected", responded_at: new Date().toISOString() })
      .eq("id", connId);
    await refreshList();
  };

  const openConvByOtherId = async (otherId) => {
    const { data: convId } = await supabase.rpc("get_or_create_conversation", { other_user_id: otherId });
    if (convId) await openConversation(convId);
  };

  if (!user) return null;

  const activeConv = conversations.find(c => c.id === activeConvId);
  const otherIdOf = (c) => c.participant_a === user.id ? c.participant_b : c.participant_a;
  const otherOfActive = activeConv ? profilesMap[otherIdOf(activeConv)] : null;
  const badgeNum = unreadCount + pendingRequests.length;

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button onClick={() => setOpen(true)} aria-label="Ouvrir le chat" style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 9998,
          width: 60, height: 60, borderRadius: "50%", border: "none", cursor: "pointer",
          background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`,
          color: "#fff", fontSize: 26,
          boxShadow: "0 8px 30px rgba(29,78,216,0.5), 0 0 0 1px rgba(255,255,255,0.05)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          💬
          {badgeNum > 0 && (
            <span style={{
              position: "absolute", top: 2, right: 2,
              minWidth: 22, height: 22, borderRadius: 11, padding: "0 6px",
              background: C.accent, color: "#fff", fontSize: 11, fontWeight: 800,
              display: "flex", alignItems: "center", justifyContent: "center",
              border: `2px solid ${C.bg}`,
            }}>{badgeNum > 99 ? "99+" : badgeNum}</span>
          )}
        </button>
      )}

      {/* Panel */}
      {open && (
        <div style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 9998,
          width: 360, maxWidth: "calc(100vw - 32px)",
          height: 560, maxHeight: "calc(100vh - 48px)",
          background: `linear-gradient(180deg, ${C.surface}, ${C.bg})`,
          borderRadius: 18, border: `1px solid ${C.border}`,
          boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
          display: "flex", flexDirection: "column", overflow: "hidden",
          animation: "hcChatIn .25s ease",
        }}>
          {/* Header */}
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "14px 16px", borderBottom: `1px solid ${C.border}`,
            background: `${C.primary}10`,
          }}>
            {view === "chat" && (
              <button onClick={() => { setView("list"); setActiveConvId(null); setMessages([]); }}
                style={{ background: "rgba(255,255,255,0.05)", border: "none", color: C.text, width: 28, height: 28, borderRadius: 8, cursor: "pointer", fontSize: 14 }}
                aria-label="Retour">←</button>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              {view === "list" && (
                <>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>💬 Messagerie</div>
                  <div style={{ fontSize: 10, color: C.dim }}>{conversations.length} conversation{conversations.length > 1 ? "s" : ""}</div>
                </>
              )}
              {view === "chat" && otherOfActive && (
                <>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{fullName(otherOfActive)}</div>
                  <div style={{ fontSize: 10, color: C.dim, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{otherOfActive.current_club || otherOfActive.city || ""}</div>
                </>
              )}
            </div>
            <button onClick={() => setOpen(false)} aria-label="Fermer"
              style={{ background: "rgba(255,255,255,0.05)", border: "none", color: C.text, width: 28, height: 28, borderRadius: 8, cursor: "pointer", fontSize: 14 }}>✕</button>
          </div>

          {/* Body */}
          {view === "list" && (
            <div style={{ flex: 1, overflowY: "auto" }}>
              {/* Demandes reçues */}
              {pendingRequests.length > 0 && (
                <div>
                  <div style={{ padding: "10px 16px 6px", fontSize: 10, color: C.gold, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 700 }}>🤝 Demandes reçues ({pendingRequests.length})</div>
                  {pendingRequests.map(r => {
                    const otherId = r.participant_a === user.id ? r.participant_b : r.participant_a;
                    const p = profilesMap[otherId];
                    return (
                      <div key={r.id} style={{ padding: "10px 16px", borderBottom: `1px solid ${C.border}`, background: "rgba(251,191,36,0.04)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                          <div style={{ width: 36, height: 36, borderRadius: "50%", background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, flexShrink: 0 }}>{initials(p)}</div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, color: C.text, fontWeight: 600 }}>{fullName(p)}</div>
                            <div style={{ fontSize: 10, color: C.dim }}>souhaite se connecter avec vous</div>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button onClick={() => acceptConnection(r.id)} style={{ flex: 1, padding: "6px 10px", background: `${C.green}15`, color: C.green, border: `1px solid ${C.green}30`, borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>✓ Accepter</button>
                          <button onClick={() => rejectConnection(r.id)} style={{ flex: 1, padding: "6px 10px", background: `${C.accent}15`, color: C.accent, border: `1px solid ${C.accent}30`, borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>✕ Refuser</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Conversations */}
              <div style={{ padding: "10px 16px 6px", fontSize: 10, color: C.dim, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 700 }}>Conversations</div>
              {conversations.length === 0 ? (
                <div style={{ padding: 40, textAlign: "center", color: C.dim, fontSize: 12 }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>💬</div>
                  Aucune conversation pour le moment.<br />
                  <span style={{ fontSize: 11 }}>Envoyez une demande de connexion depuis un profil.</span>
                </div>
              ) : (
                conversations.map(c => {
                  const otherId = otherIdOf(c);
                  const p = profilesMap[otherId];
                  return (
                    <button key={c.id} onClick={() => openConversation(c.id)} style={{
                      width: "100%", padding: "12px 16px", border: "none", background: "transparent",
                      borderBottom: `1px solid ${C.border}`, cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 10, textAlign: "left",
                      transition: "background .15s",
                    }} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
                       onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <div style={{ width: 38, height: 38, borderRadius: "50%", background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, flexShrink: 0 }}>{initials(p)}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, color: C.text, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{fullName(p)}</div>
                        <div style={{ fontSize: 10, color: C.dim }}>{fmtTime(c.last_message_at)}</div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          )}

          {view === "chat" && (
            <>
              <div style={{ flex: 1, overflowY: "auto", padding: "14px 14px 4px", display: "flex", flexDirection: "column", gap: 8 }}>
                {messages.length === 0 && (
                  <div style={{ textAlign: "center", color: C.dim, fontSize: 12, padding: 30 }}>
                    <div style={{ fontSize: 28, marginBottom: 6 }}>👋</div>
                    Démarrez la conversation
                  </div>
                )}
                {messages.map(m => {
                  const mine = m.sender_id === user.id;
                  return (
                    <div key={m.id} style={{ display: "flex", justifyContent: mine ? "flex-end" : "flex-start" }}>
                      <div style={{
                        maxWidth: "78%", padding: "8px 12px", borderRadius: 14,
                        background: mine ? `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})` : "rgba(255,255,255,0.06)",
                        color: mine ? "#fff" : C.text, fontSize: 13, lineHeight: 1.5,
                        borderBottomRightRadius: mine ? 4 : 14,
                        borderBottomLeftRadius: mine ? 14 : 4,
                        whiteSpace: "pre-wrap", wordBreak: "break-word",
                      }}>
                        {m.body}
                        <div style={{ fontSize: 9, opacity: 0.6, marginTop: 3, textAlign: "right" }}>{fmtTime(m.created_at)}</div>
                      </div>
                    </div>
                  );
                })}
                <div ref={msgEndRef} />
              </div>
              <form onSubmit={e => { e.preventDefault(); sendMessage(); }} style={{ padding: 12, borderTop: `1px solid ${C.border}`, display: "flex", gap: 8 }}>
                <input
                  value={draft} onChange={e => setDraft(e.target.value)}
                  placeholder="Écrivez votre message…"
                  maxLength={2000}
                  style={{ flex: 1, padding: "10px 14px", background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 13, outline: "none" }}
                />
                <button type="submit" disabled={!draft.trim() || sending} style={{
                  padding: "10px 14px", border: "none", borderRadius: 10,
                  background: !draft.trim() || sending ? "rgba(255,255,255,0.06)" : `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`,
                  color: "#fff", fontSize: 13, fontWeight: 700, cursor: !draft.trim() || sending ? "not-allowed" : "pointer",
                }}>➤</button>
              </form>
            </>
          )}
        </div>
      )}
      <style jsx global>{`
        @keyframes hcChatIn { from { opacity: 0; transform: translateY(16px) scale(.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>
    </>
  );
}
