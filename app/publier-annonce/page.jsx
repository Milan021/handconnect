"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabase";
import AnnonceForm from "../../components/AnnonceForm";

const C = {
  primary: "#1D4ED8",
  primaryLight: "#3B82F6",
  primaryDark: "#1E3A8A",
  accent: "#DC2626",
  bg: "#0B1120",
  surface: "#111827",
  bgCard: "rgba(255,255,255,0.04)",
  border: "rgba(255,255,255,0.08)",
  text: "#F1F5F9",
  muted: "rgba(255,255,255,0.5)",
  dim: "rgba(255,255,255,0.3)",
  green: "#10B981",
};

const DIVISIONS = [
  { v: "", l: "— Choisir —" },
  { v: "departemental", l: "Départemental" },
  { v: "regional", l: "Régional" },
  { v: "pre_nationale", l: "Pré-Nationale" },
  { v: "n3", l: "Nationale 3" },
  { v: "n2", l: "Nationale 2" },
  { v: "n1", l: "Nationale 1" },
  { v: "proligue", l: "Proligue" },
  { v: "starligue", l: "Starligue" },
  { v: "d2f", l: "D2 Féminine" },
  { v: "d1f", l: "D1 Féminine" },
];

const inpStyle = {
  width: "100%",
  padding: "12px 14px",
  background: "rgba(255,255,255,0.04)",
  border: `1px solid ${C.border}`,
  borderRadius: 12,
  color: C.text,
  fontSize: 14,
  fontFamily: "inherit",
  outline: "none",
  boxSizing: "border-box",
};

const lblStyle = {
  fontSize: 10,
  color: C.dim,
  textTransform: "uppercase",
  letterSpacing: 1.5,
  fontWeight: 600,
  marginBottom: 6,
  display: "block",
};

function Toast({ msg, onClose }) {
  if (!msg) return null;
  const isErr = msg.startsWith("❌");
  return (
    <div
      style={{
        position: "fixed",
        top: 24,
        right: 24,
        padding: "14px 22px",
        borderRadius: 14,
        zIndex: 9999,
        background: isErr ? "rgba(239,68,68,0.15)" : "rgba(16,185,129,0.15)",
        backdropFilter: "blur(20px)",
        border: `1px solid ${isErr ? "rgba(239,68,68,0.3)" : "rgba(16,185,129,0.3)"}`,
        color: isErr ? "#FCA5A5" : "#6EE7B7",
        fontSize: 13,
        fontWeight: 600,
        boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      {msg}
      <span onClick={onClose} style={{ cursor: "pointer", opacity: 0.5, fontSize: 16, marginLeft: 8 }}>
        ✕
      </span>
    </div>
  );
}

function ClubSetupForm({ user, profile, onCreated, onError }) {
  const [form, setForm] = useState({
    name: "",
    short_name: "",
    city: profile?.city || "",
    division: profile?.current_level || "",
    phone: profile?.phone || "",
    email: user?.email || "",
  });
  const [saving, setSaving] = useState(false);

  const upd = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const canSubmit =
    form.name.trim().length >= 2 && form.city.trim().length > 0 && form.division;

  const submit = async (e) => {
    e?.preventDefault();
    if (!canSubmit || saving) return;
    setSaving(true);
    const { data, error } = await supabase
      .from("clubs")
      .insert({
        owner_id: user.id,
        name: form.name.trim(),
        short_name: form.short_name.trim() || null,
        city: form.city.trim(),
        division: form.division,
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        plan: "free",
      })
      .select()
      .single();
    setSaving(false);
    if (error) {
      onError?.(error.message);
      return;
    }
    onCreated?.(data);
  };

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, margin: 0 }}>
        Avant de publier votre première annonce, complétez les informations de votre club.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14 }}>
        <div>
          <label style={lblStyle}>Nom du club *</label>
          <input
            value={form.name}
            onChange={(e) => upd("name", e.target.value)}
            placeholder="Handball Club de Lyon"
            style={inpStyle}
          />
        </div>
        <div>
          <label style={lblStyle}>Sigle</label>
          <input
            value={form.short_name}
            onChange={(e) => upd("short_name", e.target.value)}
            placeholder="HBCL"
            maxLength={6}
            style={inpStyle}
          />
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div>
          <label style={lblStyle}>Ville *</label>
          <input
            value={form.city}
            onChange={(e) => upd("city", e.target.value)}
            placeholder="Lyon"
            style={inpStyle}
          />
        </div>
        <div>
          <label style={lblStyle}>Division *</label>
          <select
            value={form.division}
            onChange={(e) => upd("division", e.target.value)}
            style={{ ...inpStyle, cursor: "pointer" }}
          >
            {DIVISIONS.map((d) => (
              <option key={d.v} value={d.v}>
                {d.l}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div>
          <label style={lblStyle}>Téléphone</label>
          <input
            value={form.phone}
            onChange={(e) => upd("phone", e.target.value)}
            placeholder="06 12 34 56 78"
            style={inpStyle}
          />
        </div>
        <div>
          <label style={lblStyle}>Email contact</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => upd("email", e.target.value)}
            placeholder="contact@club.fr"
            style={inpStyle}
          />
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          type="submit"
          disabled={!canSubmit || saving}
          style={{
            padding: "12px 28px",
            border: "none",
            borderRadius: 12,
            background:
              canSubmit && !saving
                ? `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`
                : "rgba(29,78,216,0.2)",
            color: canSubmit && !saving ? "#fff" : "rgba(255,255,255,0.4)",
            fontSize: 13,
            fontWeight: 700,
            cursor: canSubmit && !saving ? "pointer" : "not-allowed",
            boxShadow: canSubmit && !saving ? `0 6px 20px ${C.primary}30` : "none",
          }}
        >
          {saving ? "Création..." : "Créer mon club"}
        </button>
      </div>
    </form>
  );
}

export default function PublierAnnoncePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [club, setClub] = useState(null);
  const [toast, setToast] = useState("");

  const flash = (m) => {
    setToast(m);
    setTimeout(() => setToast(""), 3500);
  };

  useEffect(() => {
    const init = async () => {
      const {
        data: { user: u },
      } = await supabase.auth.getUser();
      if (!u) {
        router.replace("/login");
        return;
      }
      setUser(u);
      const { data: p } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", u.id)
        .single();
      setProfile(p);
      const { data: c } = await supabase
        .from("clubs")
        .select("*")
        .eq("owner_id", u.id)
        .maybeSingle();
      setClub(c || null);
      setLoading(false);
    };
    init();
  }, [router]);

  const isClub = profile?.user_type === "club";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        color: C.text,
        fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap"
        rel="stylesheet"
      />
      <style>{`*{box-sizing:border-box}input:focus,select:focus,textarea:focus{border-color:${C.primary}!important;box-shadow:0 0 0 3px ${C.primary}15!important}`}</style>

      <div
        style={{
          position: "fixed",
          top: -300,
          right: -200,
          width: 700,
          height: 700,
          borderRadius: "50%",
          background: `radial-gradient(circle,${C.primary}08,transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      <Toast msg={toast} onClose={() => setToast("")} />

      {/* Header */}
      <header
        style={{
          background: `${C.bg}ee`,
          backdropFilter: "blur(20px)",
          borderBottom: `1px solid ${C.border}`,
          padding: "0 20px",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            maxWidth: 800,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 60,
          }}
        >
          <Link
            href="/"
            style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: `linear-gradient(135deg,${C.primary},${C.accent})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
              }}
            >
              🤾
            </div>
            <h1
              style={{
                fontSize: 20,
                fontFamily: "'Bebas Neue', sans-serif",
                letterSpacing: 3,
                color: "#fff",
                lineHeight: 1,
                margin: 0,
              }}
            >
              HAND<span style={{ color: C.primary }}>CONNECT</span>
            </h1>
          </Link>
          <Link
            href="/"
            style={{
              padding: "7px 14px",
              borderRadius: 8,
              background: "rgba(255,255,255,0.04)",
              border: `1px solid ${C.border}`,
              color: C.muted,
              fontSize: 12,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            ← Retour
          </Link>
        </div>
      </header>

      <main style={{ maxWidth: 800, margin: "0 auto", padding: "32px 20px 60px" }}>
        <h2
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 32,
            letterSpacing: 3,
            color: C.text,
            margin: "0 0 6px",
          }}
        >
          PUBLIER UNE <span style={{ color: C.primary }}>ANNONCE</span>
        </h2>
        <p style={{ fontSize: 13, color: C.muted, marginBottom: 28 }}>
          Trouvez votre prochain joueur ou entraîneur en quelques clics.
        </p>

        {loading && (
          <div style={{ textAlign: "center", padding: 60, color: C.dim }}>
            Chargement...
          </div>
        )}

        {!loading && !isClub && (
          <div
            style={{
              background: C.bgCard,
              border: `1px solid ${C.border}`,
              borderRadius: 18,
              padding: 32,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 12 }}>🚫</div>
            <h3 style={{ fontSize: 18, color: C.text, fontWeight: 700, margin: "0 0 8px" }}>
              Accès réservé aux clubs
            </h3>
            <p style={{ fontSize: 13, color: C.muted, margin: "0 0 18px", lineHeight: 1.6 }}>
              Seuls les comptes de type <strong>Club</strong> peuvent publier des annonces.
              <br />
              Votre compte actuel est de type{" "}
              <strong>{profile?.user_type || "non défini"}</strong>.
            </p>
            <Link
              href="/dashboard"
              style={{
                display: "inline-block",
                padding: "10px 24px",
                borderRadius: 10,
                background: `linear-gradient(135deg,${C.primary},${C.primaryDark})`,
                color: "#fff",
                fontSize: 13,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Aller au tableau de bord
            </Link>
          </div>
        )}

        {!loading && isClub && !club && (
          <div
            style={{
              background: C.bgCard,
              border: `1px solid ${C.border}`,
              borderRadius: 18,
              padding: 28,
            }}
          >
            <h3
              style={{
                fontSize: 16,
                color: C.primary,
                fontFamily: "'Bebas Neue', sans-serif",
                letterSpacing: 2,
                margin: "0 0 14px",
              }}
            >
              🏟️ CRÉER VOTRE FICHE CLUB
            </h3>
            <ClubSetupForm
              user={user}
              profile={profile}
              onCreated={(c) => {
                setClub(c);
                flash("✅ Club créé, vous pouvez publier votre annonce");
              }}
              onError={(m) => flash("❌ " + m)}
            />
          </div>
        )}

        {!loading && isClub && club && (
          <div
            style={{
              background: C.bgCard,
              border: `1px solid ${C.border}`,
              borderRadius: 18,
              padding: 28,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 22,
                paddingBottom: 16,
                borderBottom: `1px solid ${C.border}`,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: `linear-gradient(135deg,${C.primary},${C.primaryDark})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontWeight: 800,
                  fontFamily: "'Bebas Neue', sans-serif",
                  letterSpacing: 1,
                  fontSize: 13,
                }}
              >
                {(club.short_name || club.name || "?").slice(0, 4).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: 14, color: C.text, fontWeight: 700 }}>{club.name}</div>
                <div style={{ fontSize: 11, color: C.dim }}>
                  {club.city} · {club.division}
                </div>
              </div>
            </div>
            <AnnonceForm
              user={user}
              club={club}
              onPublished={() => {
                flash("✅ Annonce publiée !");
                setTimeout(() => router.push("/"), 800);
              }}
              onError={(m) => flash("❌ " + m)}
            />
          </div>
        )}
      </main>
    </div>
  );
}
