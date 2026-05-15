"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "../lib/supabase";

const C = {
  primary:"#1D4ED8", primaryLight:"#3B82F6", primaryDark:"#1E3A8A",
  accent:"#DC2626", green:"#10B981", greenBg:"rgba(16,185,129,0.12)",
  gold:"#FBBF24", bg:"#0B1120", bgCard:"rgba(255,255,255,0.04)",
  surface:"#111827", border:"rgba(255,255,255,0.08)", text:"#F1F5F9",
  muted:"rgba(255,255,255,0.5)", dim:"rgba(255,255,255,0.3)",
};

export default function ChatWidget({ user }) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState("list"); // list | chat
  const [convs, setConvs] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [profiles, setProfiles] = useState({});
  const [totalUnread, setTotalUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Charger les conversations
  const loadConversations = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("conversations")
      .select("*")
      .or(`participant_a.eq.${user.id},participant_b.eq.${user.id}`)
      .order("updated_at", { ascending: false });

    if (data) {
      setConvs(data);
      // Compter les non-lus
      let unread = 0;
      for (const c of data) {
        if (c.participant_a === user.id) unread += c.unread_a || 0;
        else unread += c.unread_b || 0;
      }
      setTotalUnread(unread);

      // Charger les profils des autres participants
      const otherIds = data.map(c => c.participant_a === user.id ? c.participant_b : c.participant_a);
      const uniqueIds = [...new Set(otherIds)];
      if (uniqueIds.length > 0) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("id,first_name,last_name,user_type")
          .in("id", uniqueIds);
        if (profs) {
          const map = {};
          profs.forEach(p => { map[p.id] = p; });
          setProfiles(prev => ({ ...prev, ...map }));
        }
      }
    }
  }, [user]);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  // Polling conversations toutes les 15s
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(loadConversations, 15000);
    return () => clearInterval(interval);
  }, [user, loadConversations]);

  // Charger les messages d'une conversation
  const openConversation = async (conv) => {
    setActiveConv(conv);
    setView("chat");
    setLoading(true);

    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conv.id)
      .order("created_at", { ascending: true });

    setMessages(data || []);
    setLoading(false);

    // Marquer comme lu
    await supabase.rpc("mark_messages_read", { conv_id: conv.id });
    loadConversations();

    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  // Ouvrir un chat depuis un événement externe (bouton "Discuter" sur un profil)
  useEffect(() => {
    const handler = async (e) => {
      const otherUserId = e.detail?.otherUserId;
      if (!otherUserId || !user) return;

      setOpen(true);

      // Obtenir ou créer la conversation
      const { data: convId, error } = await supabase.rpc("get_or_create_conversation", { other_user_id: otherUserId });
      if (error) { console.error(error); return; }

      // Recharger les conversations
      await loadConversations();

      // Trouver et ouvrir la conversation
      const { data: freshConvs } = await supabase
        .from("conversations")
        .select("*")
        .eq("id", convId)
        .single();

      if (freshConvs) {
        openConversation(freshConvs);
      }
    };
    window.addEventListener("hc-open-chat", handler);
    return () => window.removeEventListener("hc-open-chat", handler);
  }, [user, loadConversations]);

  // Realtime : écouter les nouveaux messages
  useEffect(() => {
    if (!activeConv) return;
    const channel = supabase
      .channel(`messages:${activeConv.id}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${activeConv.id}`,
      }, (payload) => {
        setMessages(prev => [...prev, payload.new]);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
        // Marquer comme lu si c'est un message de l'autre
        if (payload.new.sender_id !== user.id) {
          supabase.rpc("mark_messages_read", { conv_id: activeConv.id });
          loadConversations();
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeConv, user]);

  // Envoyer un message
  const sendMessage = async () => {
    if (!input.trim() || !activeConv || sending) return;
    const content = input.trim();
    setInput("");
    setSending(true);

    await supabase.from("messages").insert({
      conversation_id: activeConv.id,
      sender_id: user.id,
      content,
    });

    setSending(false);
    inputRef.current?.focus();
  };

  const getOtherProfile = (conv) => {
    const otherId = conv.participant_a === user.id ? conv.participant_b : conv.participant_a;
    return profiles[otherId] || { first_name: "Utilisateur", last_name: "", user_type: "" };
  };

  const getUnread = (conv) => {
    if (conv.participant_a === user.id) return conv.unread_a || 0;
    return conv.unread_b || 0;
  };

  const typeLabel = (t) => {
    if (t === "club") return "🏟️ Club";
    if (t === "entraineur") return "🎯 Coach";
    return "🤾 Joueur";
  };

  const formatTime = (ts) => {
    if (!ts) return "";
    const d = new Date(ts);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return "À l'instant";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}min`;
    if (diff < 86400000) return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  };

  if (!user) return null;

  return (
    <>
      {/* Bouton flottant */}
      <button onClick={() => setOpen(!open)} style={{
        position: "fixed", bottom: 24, right: 24, width: 56, height: 56,
        borderRadius: "50%", border: "none", cursor: "pointer", zIndex: 999,
        background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`,
        boxShadow: `0 8px 32px ${C.primary}40`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 24, transition: "transform .2s, box-shadow .2s",
        transform: open ? "scale(0.9)" : "scale(1)",
      }}
        onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.1)"; }}
        onMouseLeave={e => { e.currentTarget.style.transform = open ? "scale(0.9)" : "scale(1)"; }}
      >
        {open ? "✕" : "💬"}
        {totalUnread > 0 && !open && (
          <div style={{
            position: "absolute", top: -4, right: -4, width: 22, height: 22,
            borderRadius: "50%", background: C.accent, color: "#fff",
            fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center",
            justifyContent: "center", border: `2px solid ${C.bg}`,
            animation: "pulse 2s infinite",
          }}>{totalUnread > 9 ? "9+" : totalUnread}</div>
        )}
      </button>

      {/* Fenêtre de chat */}
      {open && (
        <div style={{
          position: "fixed", bottom: 90, right: 24, width: 380, height: 520,
          background: C.surface, borderRadius: 20, overflow: "hidden",
          border: `1px solid ${C.border}`, zIndex: 998,
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
          display: "flex", flexDirection: "column",
          animation: "modalUp .3s cubic-bezier(0.16,1,0.3,1)",
        }}>
          {/* Header */}
          <div style={{
            padding: "16px 20px", background: `${C.primary}10`,
            borderBottom: `1px solid ${C.border}`,
            display: "flex", alignItems: "center", gap: 10,
          }}>
            {view === "chat" && (
              <button onClick={() => { setView("list"); setActiveConv(null); }} style={{
                background: "rgba(255,255,255,0.06)", border: "none", color: C.dim,
                padding: "4px 8px", borderRadius: 6, cursor: "pointer", fontSize: 11, fontWeight: 600,
              }}>←</button>
            )}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>
                {view === "list" ? "Messages" : (() => {
                  const p = getOtherProfile(activeConv);
                  return `${p.first_name} ${p.last_name}`;
                })()}
              </div>
              {view === "chat" && (
                <div style={{ fontSize: 10, color: C.dim }}>
                  {typeLabel(getOtherProfile(activeConv).user_type)}
                </div>
              )}
            </div>
            {view === "list" && totalUnread > 0 && (
              <span style={{
                padding: "2px 8px", background: `${C.accent}20`, color: C.accent,
                borderRadius: 10, fontSize: 10, fontWeight: 700,
              }}>{totalUnread} non lu{totalUnread > 1 ? "s" : ""}</span>
            )}
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {/* ── LISTE DES CONVERSATIONS ── */}
            {view === "list" && (
              <div>
                {convs.length === 0 ? (
                  <div style={{ padding: 40, textAlign: "center", color: C.dim }}>
                    <div style={{ fontSize: 40, marginBottom: 10 }}>💬</div>
                    <p style={{ fontSize: 13 }}>Aucune conversation</p>
                    <p style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
                      Connectez-vous avec des joueurs, coachs ou clubs pour commencer à discuter.
                    </p>
                  </div>
                ) : (
                  convs.map(conv => {
                    const other = getOtherProfile(conv);
                    const unread = getUnread(conv);
                    return (
                      <div key={conv.id} onClick={() => openConversation(conv)} style={{
                        padding: "14px 20px", cursor: "pointer",
                        borderBottom: `1px solid ${C.border}`,
                        background: unread > 0 ? `${C.primary}08` : "transparent",
                        transition: "background .15s",
                        display: "flex", alignItems: "center", gap: 12,
                      }}
                        onMouseEnter={e => { e.currentTarget.style.background = `${C.primary}10`; }}
                        onMouseLeave={e => { e.currentTarget.style.background = unread > 0 ? `${C.primary}08` : "transparent"; }}
                      >
                        <div style={{
                          width: 40, height: 40, borderRadius: "50%",
                          background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: "#fff", fontSize: 14, fontWeight: 800, flexShrink: 0,
                          fontFamily: "'Bebas Neue',sans-serif",
                        }}>
                          {(other.first_name || "?")[0]}{(other.last_name || "?")[0]}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: 13, fontWeight: unread > 0 ? 700 : 600, color: C.text }}>
                              {other.first_name} {other.last_name}
                            </span>
                            <span style={{ fontSize: 10, color: C.dim, flexShrink: 0 }}>
                              {formatTime(conv.last_message_at)}
                            </span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 2 }}>
                            <span style={{
                              fontSize: 11, color: unread > 0 ? C.text : C.muted,
                              fontWeight: unread > 0 ? 600 : 400,
                              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                              maxWidth: 220,
                            }}>
                              {conv.last_message || "Nouvelle conversation"}
                            </span>
                            {unread > 0 && (
                              <span style={{
                                width: 18, height: 18, borderRadius: "50%",
                                background: C.primary, color: "#fff", fontSize: 10,
                                fontWeight: 800, display: "flex", alignItems: "center",
                                justifyContent: "center", flexShrink: 0,
                              }}>{unread}</span>
                            )}
                          </div>
                          <div style={{ fontSize: 9, color: C.dim, marginTop: 2 }}>
                            {typeLabel(other.user_type)}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* ── MESSAGES ── */}
            {view === "chat" && (
              <div style={{ padding: "16px 16px 8px", display: "flex", flexDirection: "column", gap: 6 }}>
                {loading && <div style={{ textAlign: "center", padding: 20, color: C.dim, fontSize: 12 }}>Chargement...</div>}
                {!loading && messages.length === 0 && (
                  <div style={{ textAlign: "center", padding: 30, color: C.dim, fontSize: 12 }}>
                    Envoyez votre premier message !
                  </div>
                )}
                {messages.map(msg => {
                  const isMine = msg.sender_id === user.id;
                  return (
                    <div key={msg.id} style={{
                      display: "flex", justifyContent: isMine ? "flex-end" : "flex-start",
                    }}>
                      <div style={{
                        maxWidth: "75%", padding: "10px 14px", borderRadius: 16,
                        borderBottomRightRadius: isMine ? 4 : 16,
                        borderBottomLeftRadius: isMine ? 16 : 4,
                        background: isMine
                          ? `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`
                          : "rgba(255,255,255,0.06)",
                        color: isMine ? "#fff" : C.text,
                        fontSize: 13, lineHeight: 1.5, wordBreak: "break-word",
                      }}>
                        {msg.content}
                        <div style={{
                          fontSize: 9, marginTop: 4, textAlign: "right",
                          color: isMine ? "rgba(255,255,255,0.5)" : C.dim,
                        }}>
                          {new Date(msg.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input (uniquement en mode chat) */}
          {view === "chat" && (
            <div style={{
              padding: "12px 16px", borderTop: `1px solid ${C.border}`,
              display: "flex", gap: 8, alignItems: "center",
            }}>
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder="Votre message..."
                style={{
                  flex: 1, padding: "10px 14px", borderRadius: 12,
                  border: `1px solid ${C.border}`, background: "rgba(255,255,255,0.04)",
                  color: "#fff", fontSize: 13, outline: "none",
                  fontFamily: "inherit",
                }}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || sending}
                style={{
                  width: 40, height: 40, borderRadius: "50%", border: "none",
                  background: !input.trim()
                    ? "rgba(255,255,255,0.06)"
                    : `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`,
                  color: !input.trim() ? C.dim : "#fff",
                  fontSize: 16, cursor: !input.trim() ? "default" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all .2s", flexShrink: 0,
                }}
              >
                ➤
              </button>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
      `}</style>
    </>
  );
}