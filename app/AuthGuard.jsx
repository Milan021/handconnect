"use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function AuthGuard({ children }) {
  const [ready, setReady] = useState(true);

  useEffect(() => {
    // Le middleware serveur gère le blocage des routes : ici on écoute
    // uniquement la déconnexion pour rediriger immédiatement vers /login.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        window.location.href = "/login";
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  if (!ready) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#0A0E1A",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: "linear-gradient(135deg, #FF6B35, #C13C00)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 24, boxShadow: "0 8px 32px rgba(255,107,53,0.3)",
            animation: "pulse 1.5s ease-in-out infinite",
          }}>🤾</div>
          <div style={{
            color: "rgba(255,255,255,0.3)",
            fontSize: 13,
            fontFamily: "'DM Sans', sans-serif",
          }}>Chargement...</div>
        </div>
        <style>{`@keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.7; transform: scale(0.95); } }`}</style>
      </div>
    );
  }

  return children;
}
