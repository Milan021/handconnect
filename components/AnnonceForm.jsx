"use client";
import { useState } from "react";
import { supabase } from "../lib/supabase";

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
  greenBg: "rgba(16,185,129,0.12)",
};

const POSITIONS = [
  { v: "", l: "— Tous postes —" },
  { v: "gardien", l: "Gardien" },
  { v: "ailier_gauche", l: "Ailier gauche" },
  { v: "ailier_droit", l: "Ailier droit" },
  { v: "arriere_gauche", l: "Arrière gauche" },
  { v: "arriere_droit", l: "Arrière droit" },
  { v: "demi_centre", l: "Demi-centre" },
  { v: "pivot", l: "Pivot" },
];

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

const BENEFITS = [
  { v: "prime", l: "Prime", icon: "💰" },
  { v: "logement", l: "Logement", icon: "🏠" },
  { v: "job", l: "Emploi à côté", icon: "💼" },
  { v: "formation", l: "Formation", icon: "🎓" },
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
  transition: "border-color .2s",
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

export default function AnnonceForm({ user, club, onPublished, onError }) {
  const [form, setForm] = useState({
    type: "player",
    title: "",
    description: "",
    position: "",
    titre_required: "",
    city: club?.city || "",
    division: club?.division || "",
    salary_range: "",
    is_urgent: false,
    benefits: [],
  });
  const [saving, setSaving] = useState(false);

  const upd = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const toggleBenefit = (b) =>
    setForm((p) => ({
      ...p,
      benefits: p.benefits.includes(b)
        ? p.benefits.filter((x) => x !== b)
        : [...p.benefits, b],
    }));

  const isPlayer = form.type === "player";
  const accent = isPlayer ? C.primary : C.accent;

  const canSubmit =
    form.title.trim().length >= 4 &&
    form.description.trim().length >= 10 &&
    form.city.trim().length > 0 &&
    form.division;

  const submit = async (e) => {
    e?.preventDefault();
    if (!canSubmit || saving) return;
    setSaving(true);
    const payload = {
      club_id: club.id,
      author_id: user.id,
      type: form.type,
      title: form.title.trim(),
      club_name: club.name,
      division: form.division,
      city: form.city.trim(),
      description: form.description.trim(),
      is_urgent: form.is_urgent,
      benefits: form.benefits,
      position: isPlayer ? form.position || null : null,
      titre_required: !isPlayer ? form.titre_required || null : null,
      salary_range: !isPlayer ? form.salary_range.trim() || null : null,
      candidatures_count: 0,
    };
    const { data, error } = await supabase
      .from("annonces")
      .insert(payload)
      .select()
      .single();
    setSaving(false);
    if (error) {
      onError?.(error.message);
      return;
    }
    onPublished?.(data);
  };

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Type */}
      <div>
        <label style={lblStyle}>Type d&apos;annonce</label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[
            { k: "player", l: "🤾 Joueur recherché", c: C.primary },
            { k: "trainer", l: "🎯 Entraîneur recherché", c: C.accent },
          ].map((t) => (
            <button
              key={t.k}
              type="button"
              onClick={() => upd("type", t.k)}
              style={{
                padding: "14px 16px",
                borderRadius: 12,
                border: `1px solid ${form.type === t.k ? `${t.c}60` : C.border}`,
                background: form.type === t.k ? `${t.c}18` : "rgba(255,255,255,0.02)",
                color: form.type === t.k ? "#fff" : C.muted,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all .2s",
              }}
            >
              {t.l}
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div>
        <label style={lblStyle}>Titre de l&apos;annonce *</label>
        <input
          value={form.title}
          onChange={(e) => upd("title", e.target.value)}
          placeholder={isPlayer ? "Ex : Recherche arrière gauche N3" : "Ex : Coach principal saison 2026-2027"}
          maxLength={120}
          style={inpStyle}
        />
      </div>

      {/* Division + City */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div>
          <label style={lblStyle}>Niveau / Division *</label>
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
        <div>
          <label style={lblStyle}>Ville *</label>
          <input
            value={form.city}
            onChange={(e) => upd("city", e.target.value)}
            placeholder="Lyon"
            style={inpStyle}
          />
        </div>
      </div>

      {/* Position (player only) */}
      {isPlayer && (
        <div>
          <label style={lblStyle}>Poste recherché</label>
          <select
            value={form.position}
            onChange={(e) => upd("position", e.target.value)}
            style={{ ...inpStyle, cursor: "pointer" }}
          >
            {POSITIONS.map((p) => (
              <option key={p.v} value={p.v}>
                {p.l}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Trainer specifics */}
      {!isPlayer && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div>
            <label style={lblStyle}>Titre requis</label>
            <select
              value={form.titre_required}
              onChange={(e) => upd("titre_required", e.target.value)}
              style={{ ...inpStyle, cursor: "pointer" }}
            >
              <option value="">— Non spécifié —</option>
              <option value="titre4">Titre IV</option>
              <option value="titre5">Titre V</option>
            </select>
          </div>
          <div>
            <label style={lblStyle}>Rémunération</label>
            <input
              value={form.salary_range}
              onChange={(e) => upd("salary_range", e.target.value)}
              placeholder="1500-2000€ / mois"
              style={inpStyle}
            />
          </div>
        </div>
      )}

      {/* Description */}
      <div>
        <label style={lblStyle}>Description *</label>
        <textarea
          value={form.description}
          onChange={(e) => upd("description", e.target.value)}
          placeholder="Présentez le club, le projet sportif, le profil recherché..."
          rows={5}
          maxLength={1500}
          style={{ ...inpStyle, resize: "vertical", lineHeight: 1.6 }}
        />
        <div style={{ fontSize: 10, color: C.dim, marginTop: 4, textAlign: "right" }}>
          {form.description.length}/1500
        </div>
      </div>

      {/* Benefits */}
      <div>
        <label style={lblStyle}>Avantages proposés</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {BENEFITS.map((b) => {
            const on = form.benefits.includes(b.v);
            return (
              <button
                key={b.v}
                type="button"
                onClick={() => toggleBenefit(b.v)}
                style={{
                  padding: "9px 14px",
                  borderRadius: 10,
                  border: `1px solid ${on ? `${accent}60` : C.border}`,
                  background: on ? `${accent}18` : "rgba(255,255,255,0.02)",
                  color: on ? "#fff" : C.muted,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all .2s",
                }}
              >
                {b.icon} {b.l}
              </button>
            );
          })}
        </div>
      </div>

      {/* Urgent toggle */}
      <div
        onClick={() => upd("is_urgent", !form.is_urgent)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "14px 18px",
          background: form.is_urgent ? "rgba(220,38,38,0.08)" : "rgba(255,255,255,0.02)",
          border: `1px solid ${form.is_urgent ? "rgba(220,38,38,0.3)" : C.border}`,
          borderRadius: 12,
          cursor: "pointer",
          transition: "all .2s",
        }}
      >
        <div
          style={{
            width: 40,
            height: 22,
            borderRadius: 11,
            background: form.is_urgent ? C.accent : "rgba(255,255,255,0.1)",
            position: "relative",
            transition: "background .25s",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: "50%",
              background: "#fff",
              position: "absolute",
              top: 2,
              left: form.is_urgent ? 20 : 2,
              transition: "left .25s",
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
            }}
          />
        </div>
        <div>
          <div style={{ fontSize: 13, color: C.text, fontWeight: 600 }}>Annonce urgente</div>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
            Badge rouge &quot;Urgent&quot; sur la fiche
          </div>
        </div>
      </div>

      {/* Info legal */}
      <p
        style={{
          fontSize: 11,
          color: C.dim,
          margin: 0,
          padding: "10px 14px",
          background: `${C.primary}08`,
          borderRadius: 10,
          border: `1px solid ${C.primary}14`,
          lineHeight: 1.6,
        }}
      >
        ℹ️ HandConnect est une plateforme de mise en relation. Aucune commission n&apos;est perçue sur les
        recrutements. Le contrat est conclu directement entre le club et le candidat.
      </p>

      {/* Submit */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <button
          type="submit"
          disabled={!canSubmit || saving}
          style={{
            padding: "14px 32px",
            border: "none",
            borderRadius: 12,
            background:
              canSubmit && !saving
                ? `linear-gradient(135deg, ${C.green}, #047857)`
                : "rgba(16,185,129,0.2)",
            color: canSubmit && !saving ? "#fff" : "rgba(255,255,255,0.4)",
            fontSize: 14,
            fontWeight: 700,
            cursor: canSubmit && !saving ? "pointer" : "not-allowed",
            boxShadow: canSubmit && !saving ? `0 6px 20px ${C.green}35` : "none",
            transition: "all .2s",
            letterSpacing: 0.5,
          }}
        >
          {saving ? "Publication..." : "📢 Publier l’annonce"}
        </button>
      </div>
    </form>
  );
}
