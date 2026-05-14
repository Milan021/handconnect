"use client";
import { useState } from "react";
import Link from "next/link";

const FONT_LINK = "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap";

const AMOUNTS = [5, 10, 25, 50];

export default function SoutenirPage() {
  const [selected, setSelected] = useState(null);
  const [custom, setCustom] = useState("");
  const [isCustom, setIsCustom] = useState(false);

  const amount = isCustom ? (parseInt(custom) || 0) : (selected || 0);

  const handleDonate = () => {
    if (amount < 1) return;
    // Pour l'instant, rediriger vers un lien de paiement Stripe (à configurer)
    // En attendant Stripe, on peut utiliser un simple lien PayPal ou afficher un message
    alert(`Merci pour votre don de ${amount}€ ! L'intégration Stripe arrive bientôt.`);
    // Quand Stripe sera configuré :
    // window.location.href = `/api/create-donation?amount=${amount * 100}`;
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0A0E1A", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif", position: "relative", overflow: "hidden", padding: 20 }}>
      <link href={FONT_LINK} rel="stylesheet" />
      <div style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,107,53,0.06) 0%, transparent 70%)", top: -200, right: -150, pointerEvents: "none" }} />
      <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(29,78,216,0.04) 0%, transparent 70%)", bottom: -100, left: -100, pointerEvents: "none" }} />

      <div style={{ width: 480, padding: "40px 36px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 24, backdropFilter: "blur(20px)", position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <img src="/logo.png" alt="Handball Connection" style={{ width: 64, height: 64, borderRadius: 16, objectFit: "cover", marginBottom: 12 }}/>
          <h1 style={{ fontSize: 28, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 4, color: "#fff", margin: "0 0 4px" }}>SOUTENIR <span style={{ color: "#FF6B35" }}>HANDBALL CONNECTION</span></h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", margin: 0, lineHeight: 1.6, maxWidth: 360, marginLeft: "auto", marginRight: "auto" }}>
            Handball Connection est gratuit pour tous. Votre don nous aide à maintenir et améliorer la plateforme pour le handball amateur français.
          </p>
        </div>

        {/* Montants prédéfinis */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", display: "block", marginBottom: 10 }}>Choisir un montant</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
            {AMOUNTS.map((a) => (
              <button key={a} onClick={() => { setSelected(a); setIsCustom(false); setCustom(""); }}
                style={{
                  padding: "16px 0", borderRadius: 14, cursor: "pointer", transition: "all 0.2s",
                  border: `1px solid ${!isCustom && selected === a ? "rgba(255,107,53,0.5)" : "rgba(255,255,255,0.08)"}`,
                  background: !isCustom && selected === a ? "rgba(255,107,53,0.1)" : "rgba(255,255,255,0.02)",
                  color: !isCustom && selected === a ? "#FF6B35" : "rgba(255,255,255,0.6)",
                  fontSize: 20, fontWeight: 800, fontFamily: "'Bebas Neue', sans-serif",
                }}
                onMouseEnter={(e) => { if (isCustom || selected !== a) e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; }}
                onMouseLeave={(e) => { if (isCustom || selected !== a) e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
              >
                {a}€
              </button>
            ))}
          </div>
        </div>

        {/* Montant libre */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", display: "block", marginBottom: 8 }}>Ou montant libre</label>
          <div style={{ position: "relative" }}>
            <input
              type="number"
              value={custom}
              onChange={(e) => { setCustom(e.target.value); setIsCustom(true); setSelected(null); }}
              onFocus={() => { setIsCustom(true); setSelected(null); }}
              placeholder="Votre montant"
              min="1"
              style={{
                width: "100%", padding: "14px 40px 14px 16px", borderRadius: 14,
                border: `1px solid ${isCustom && custom ? "rgba(255,107,53,0.5)" : "rgba(255,255,255,0.1)"}`,
                background: isCustom && custom ? "rgba(255,107,53,0.06)" : "rgba(255,255,255,0.04)",
                color: "#fff", fontSize: 16, outline: "none",
                fontFamily: "'DM Sans', sans-serif", boxSizing: "border-box",
              }}
            />
            <span style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.3)", fontSize: 16, fontWeight: 700 }}>€</span>
          </div>
        </div>

        {/* Récap + bouton */}
        {amount > 0 && (
          <div style={{ padding: "16px 20px", background: "rgba(255,107,53,0.06)", border: "1px solid rgba(255,107,53,0.15)", borderRadius: 14, marginBottom: 20, textAlign: "center" }}>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Votre don</span>
            <div style={{ fontSize: 36, fontWeight: 800, color: "#FF6B35", fontFamily: "'Bebas Neue', sans-serif", marginTop: 4 }}>{amount}€</div>
          </div>
        )}

        <button
          onClick={handleDonate}
          disabled={amount < 1}
          style={{
            width: "100%", padding: "16px 0", borderRadius: 14, border: "none",
            background: amount < 1 ? "rgba(255,255,255,0.06)" : "linear-gradient(135deg, #FF6B35, #C13C00)",
            color: amount < 1 ? "rgba(255,255,255,0.2)" : "#fff",
            fontSize: 15, fontWeight: 700, cursor: amount < 1 ? "not-allowed" : "pointer",
            fontFamily: "'DM Sans', sans-serif", letterSpacing: 1,
            boxShadow: amount < 1 ? "none" : "0 6px 24px rgba(255,107,53,0.3)",
            transition: "all 0.3s",
          }}
        >
          {amount > 0 ? ` Donner ${amount}€` : "Choisissez un montant"}
        </button>

        {/* Info */}
        <div style={{ marginTop: 20, padding: "14px 16px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12 }}>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", lineHeight: 1.7, margin: 0, textAlign: "center" }}>
            Paiement sécurisé par Stripe. Votre don est unique (pas d'abonnement). 
            Handball Connection est une SASU française — votre soutien finance directement le développement de la plateforme.
          </p>
        </div>

        {/* Retour */}
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <Link href="/dashboard" style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>← Retour au dashboard</Link>
        </div>

        <p style={{ textAlign: "center", fontSize: 10, color: "rgba(255,255,255,0.1)", marginTop: 16, marginBottom: 0 }}>Handball Connection © {new Date().getFullYear()}</p>
      </div>
    </div>
  );
}
