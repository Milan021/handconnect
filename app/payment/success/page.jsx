"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const C = {
  bg: "#0A0E1A",
  primary: "#1D4ED8",
  primaryLight: "#3B82F6",
  green: "#10B981",
  text: "#F1F5F9",
  muted: "rgba(255,255,255,0.5)",
  dim: "rgba(255,255,255,0.3)",
  border: "rgba(255,255,255,0.08)",
};

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", color: C.dim, fontFamily: "'DM Sans', sans-serif" }}>
        Chargement...
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVerifying(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif", padding: 20 }}>
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <div style={{ width: "100%", maxWidth: 420, padding: "40px 32px", background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}`, borderRadius: 24, textAlign: "center" }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: `${C.green}15`, border: `1px solid ${C.green}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 20px" }}>
          ✅
        </div>
        <h1 style={{ fontSize: 28, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 3, color: "#fff", margin: "0 0 12px" }}>PAIEMENT <span style={{ color: C.green }}>REUSSI</span></h1>
        <p style={{ fontSize: 14, color: C.muted, margin: "0 0 24px", lineHeight: 1.6 }}>
          Votre abonnement annuel à <strong style={{ color: C.text }}>99€</strong> est confirmé.
          <br />Vous avez maintenant accès à tous les profils handballeurs pro.
        </p>
        {verifying ? (
          <div style={{ color: C.dim, fontSize: 13 }}>Activation de votre compte...</div>
        ) : (
          <Link href="/entreprise" style={{ display: "inline-block", padding: "14px 32px", borderRadius: 12, background: `linear-gradient(135deg, ${C.primary}, #1E3A8A)`, color: "#fff", textDecoration: "none", fontSize: 14, fontWeight: 700 }}>
            Accéder à mon espace entreprise →
          </Link>
        )}
        <p style={{ fontSize: 11, color: C.dim, marginTop: 20 }}>
          Commission de recrutement : 2 500€ uniquement si vous embauchez.
        </p>
      </div>
    </div>
  );
}
