"use client";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

const C = {
  primary: "#1D4ED8", primaryLight: "#3B82F6",
  bg: "#0A0E1A", bgCard: "rgba(255,255,255,0.03)",
  border: "rgba(255,255,255,0.08)",
  text: "#F1F5F9", muted: "rgba(255,255,255,0.5)", dim: "rgba(255,255,255,0.3)",
  green: "#10B981", gold: "#FBBF24", accent: "#DC2626",
};

export default function NotificationBell({ user }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadNotifications();

    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` }, (payload) => {
        setNotifications(prev => [payload.new, ...prev]);
        setUnreadCount(c => c + 1);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  async function loadNotifications() {
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);
    setNotifications(data || []);
    setUnreadCount((data || []).filter(n => !n.is_read).length);
  }

  const markAllRead = async () => {
    await supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id).eq("is_read", false);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  const markRead = async (id) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const typeIcon = (type) => {
    switch (type) {
      case "job_match": return "🔥";
      case "application_status": return "📨";
      case "message": return "💬";
      case "placement": return "✅";
      case "mentorship": return "🎓";
      default: return "🔔";
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <button onClick={() => setOpen(!open)} style={{ position: "relative", padding: "8px 10px", borderRadius: 10, border: `1px solid ${C.border}`, background: "rgba(255,255,255,0.04)", color: C.dim, fontSize: 16, cursor: "pointer" }}>
        🔔
        {unreadCount > 0 && (
          <span style={{ position: "absolute", top: -4, right: -4, width: 18, height: 18, borderRadius: "50%", background: C.accent, color: "#fff", fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{unreadCount}</span>
        )}
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 199 }} />
          <div style={{ position: "absolute", top: 44, right: 0, width: 360, maxHeight: 480, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 16, boxShadow: "0 24px 64px rgba(0,0,0,0.5)", zIndex: 200, overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Notifications</span>
              {unreadCount > 0 && (
                <button onClick={markAllRead} style={{ background: "none", border: "none", color: C.primaryLight, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Tout marquer lu</button>
              )}
            </div>
            <div style={{ overflowY: "auto", flex: 1 }}>
              {notifications.length === 0 ? (
                <div style={{ padding: 32, textAlign: "center", color: C.dim, fontSize: 13 }}>Aucune notification</div>
              ) : (
                notifications.map(n => (
                  <div
                    key={n.id}
                    onClick={() => markRead(n.id)}
                    style={{
                      padding: "12px 18px",
                      borderBottom: `1px solid ${C.border}`,
                      background: n.is_read ? "transparent" : "rgba(29,78,216,0.06)",
                      cursor: "pointer",
                      display: "flex",
                      gap: 10,
                      alignItems: "flex-start",
                    }}
                  >
                    <span style={{ fontSize: 18 }}>{typeIcon(n.type)}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 2 }}>{n.title}</div>
                      {n.body && <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.5 }}>{n.body}</div>}
                      <div style={{ fontSize: 10, color: C.dim, marginTop: 4 }}>{new Date(n.created_at).toLocaleDateString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</div>
                    </div>
                    {!n.is_read && <span style={{ width: 8, height: 8, borderRadius: "50%", background: C.primary, marginTop: 6, flexShrink: 0 }} />}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
