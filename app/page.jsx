"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "../lib/supabase";

const C = { primary:"#1D4ED8", primaryLight:"#3B82F6", primaryDark:"#1E3A8A", accent:"#DC2626", accentLight:"#F87171", bg:"#0B1120", bgCard:"rgba(255,255,255,0.04)", bgHover:"rgba(255,255,255,0.07)", surface:"#111827", border:"rgba(255,255,255,0.08)", borderBlue:"rgba(29,78,216,0.4)", text:"#F1F5F9", muted:"rgba(255,255,255,0.5)", dim:"rgba(255,255,255,0.3)", green:"#10B981", greenBg:"rgba(16,185,129,0.12)", gold:"#FBBF24" };

const POS = { gardien:"Gardien", ailier_gauche:"Ailier G.", ailier_droit:"Ailier D.", arriere_gauche:"Arrière G.", arriere_droit:"Arrière D.", demi_centre:"Demi-centre", pivot:"Pivot" };
const LEVELS = [ {v:"",l:"—"},{v:"departemental",l:"Départemental"},{v:"regional",l:"Régional"},{v:"pre_nationale",l:"Pré-Nationale"},{v:"n3",l:"Nationale 3"},{v:"n2",l:"Nationale 2"},{v:"n1",l:"Nationale 1"},{v:"proligue",l:"Proligue"},{v:"starligue",l:"Starligue"},{v:"d2f",l:"D2F"},{v:"d1f",l:"D1F"} ];
const BEN_ICO = { prime:"💰", logement:"🏠", job:"💼", formation:"🎓" };
const PRICING = [
  { key:"free", label:"Club Free", price:0, per:"", desc:"Pour découvrir", feats:["1 annonce active","10 profils visibles","Messagerie limitée"], color:C.dim },
  { key:"standard", label:"Club Standard", price:19, per:"/mois", desc:"Pour les clubs actifs", feats:["Annonces illimitées","Tous les profils","Messagerie illimitée","Alertes candidats"], color:C.primary, pop:true },
  { key:"premium", label:"Club Premium", price:49, per:"/mois", desc:"Pour les ambitieux", feats:["Tout Standard +","Annonces en avant","Stats avancées","Support prioritaire"], color:C.gold },
];

/* ═══════ MICRO COMPONENTS ═══════ */
function Bdg({children,color=C.primary,filled}){return <span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"3px 10px",background:filled?color:`${color}18`,color:filled?"#fff":color,borderRadius:6,fontSize:10,fontWeight:700,border:`1px solid ${color}30`,letterSpacing:.8,textTransform:"uppercase",whiteSpace:"nowrap"}}>{children}</span>}
function Dot(){return <div style={{display:"inline-flex",alignItems:"center",gap:5,padding:"3px 10px",background:C.greenBg,borderRadius:20,border:`1px solid ${C.green}30`}}><div style={{width:6,height:6,borderRadius:"50%",background:C.green,boxShadow:`0 0 8px ${C.green}60`}}/><span style={{color:C.green,fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:1.5}}>Dispo</span></div>}
function Stars({r}){const rating=Number(r)||0;return <span style={{display:"inline-flex",alignItems:"center",gap:1}}>{[1,2,3,4,5].map(i=><span key={i} style={{color:i<=Math.round(rating)?C.gold:"rgba(255,255,255,0.1)",fontSize:12}}>★</span>)}</span>}
function Toast({msg,onClose}){if(!msg)return null;const isErr=msg.startsWith("❌");return <div style={{position:"fixed",top:24,right:24,padding:"14px 22px",borderRadius:14,zIndex:9999,background:isErr?"rgba(239,68,68,0.15)":"rgba(16,185,129,0.15)",backdropFilter:"blur(20px)",border:`1px solid ${isErr?"rgba(239,68,68,0.3)":"rgba(16,185,129,0.3)"}`,color:isErr?"#FCA5A5":"#6EE7B7",fontSize:13,fontWeight:600,boxShadow:"0 8px 32px rgba(0,0,0,0.3)",animation:"slideDown .4s cubic-bezier(0.16,1,0.3,1)",display:"flex",alignItems:"center",gap:10}}>{msg}<span onClick={onClose} style={{cursor:"pointer",opacity:.5,fontSize:16,marginLeft:8}}>✕</span></div>}

/* ═══════ PLAYER CARD ═══════ */
function PlayerCard({p,onClick,i}){
  return <div onClick={()=>onClick(p)} style={{background:C.bgCard,borderRadius:18,overflow:"hidden",cursor:"pointer",border:`1px solid ${C.border}`,transition:"all .35s cubic-bezier(0.16,1,0.3,1)",position:"relative",animation:`fadeUp .5s ease ${i*.05}s both`}} onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-5px)";e.currentTarget.style.borderColor=C.borderBlue;e.currentTarget.style.boxShadow=`0 16px 48px ${C.primary}15`}} onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.borderColor=C.border;e.currentTarget.style.boxShadow=""}}>
    {p.is_available&&<div style={{position:"absolute",top:12,left:12,zIndex:2}}><Dot/></div>}
    <div style={{height:80,background:`linear-gradient(135deg,${C.primary},${C.primaryDark})`,position:"relative"}}><div style={{width:56,height:56,borderRadius:"50%",background:C.bg,border:`3px solid ${C.primary}50`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,fontWeight:800,color:C.primaryLight,fontFamily:"'Bebas Neue',sans-serif",position:"absolute",bottom:-24,left:"50%",transform:"translateX(-50%)",boxShadow:"0 6px 20px rgba(0,0,0,0.4)"}}>{(p.first_name||"?")[0]}{(p.last_name||"?")[0]}</div></div>
    <div style={{padding:"30px 16px 16px",textAlign:"center"}}>
      <h3 style={{margin:0,fontSize:15,fontWeight:700,color:C.text}}>{p.first_name} {p.last_name}</h3>
      <p style={{margin:"2px 0",fontSize:10,color:C.primary,fontWeight:700,fontFamily:"monospace",textTransform:"uppercase",letterSpacing:1.5}}>{POS[p.position]||"Non défini"}</p>
      <p style={{fontSize:10,color:C.dim}}>{p.current_club||"Sans club"} · {p.city||"—"}</p>
      <div style={{display:"flex",justifyContent:"center",gap:16,paddingTop:10,marginTop:10,borderTop:`1px solid ${C.border}`}}>
        {[["Âge",p.age?`${p.age}a`:"—"],["Taille",p.height_cm?`${p.height_cm}cm`:"—"],["Niveau",LEVELS.find(l=>l.v===p.current_level)?.l||"—"]].map(([l,v])=><div key={l} style={{textAlign:"center"}}><div style={{fontSize:15,fontWeight:800,color:C.text,fontFamily:"'Bebas Neue',sans-serif"}}>{v}</div><div style={{fontSize:8,color:C.dim,textTransform:"uppercase",letterSpacing:1.5,fontWeight:600}}>{l}</div></div>)}
      </div>
    </div>
  </div>
}

/* ═══════ PLAYER MODAL ═══════ */
function PlayerModal({player:p,onClose}){
  if(!p)return null;
  return <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",backdropFilter:"blur(12px)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20,animation:"fadeIn .2s ease"}}><div onClick={e=>e.stopPropagation()} style={{background:`linear-gradient(180deg,${C.surface},${C.bg})`,borderRadius:24,maxWidth:500,width:"100%",overflow:"hidden",maxHeight:"90vh",overflowY:"auto",border:`1px solid ${C.border}`,animation:"modalUp .4s cubic-bezier(0.16,1,0.3,1)"}}>
    <div style={{height:120,background:`linear-gradient(135deg,${C.primary},${C.primaryDark})`,position:"relative"}}>
      <button onClick={onClose} style={{position:"absolute",top:12,right:12,background:"rgba(255,255,255,0.15)",border:"none",color:"#fff",width:32,height:32,borderRadius:"50%",cursor:"pointer",fontSize:16}}>✕</button>
      <div style={{width:76,height:76,borderRadius:"50%",background:C.bg,border:`4px solid ${C.primary}40`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,fontWeight:800,color:C.primaryLight,fontFamily:"'Bebas Neue',sans-serif",position:"absolute",bottom:-34,left:"50%",transform:"translateX(-50%)",boxShadow:"0 10px 30px rgba(0,0,0,0.4)"}}>{(p.first_name||"?")[0]}{(p.last_name||"?")[0]}</div>
    </div>
    <div style={{padding:"44px 28px 0",textAlign:"center"}}>
      <h2 style={{fontSize:22,fontWeight:700,margin:0,color:C.text}}>{p.first_name} {p.last_name}</h2>
      <p style={{color:C.primary,fontWeight:700,fontSize:11,fontFamily:"monospace",margin:"4px 0",textTransform:"uppercase",letterSpacing:2}}>{POS[p.position]||"Non défini"}</p>
      <p style={{color:C.dim,fontSize:12,margin:0}}>{p.current_club||"Sans club"} · {p.city||"—"} · {p.age?`${p.age} ans`:""} {p.height_cm?`· ${p.height_cm}cm`:""}</p>
    </div>
    <div style={{padding:"16px 28px 28px"}}>
      <div style={{display:"flex",justifyContent:"space-around",background:`${C.primary}10`,borderRadius:14,padding:16,border:`1px solid ${C.primary}20`,marginBottom:16}}>
        {[["Niveau",LEVELS.find(l=>l.v===p.current_level)?.l||"—"],["Meilleur",LEVELS.find(l=>l.v===p.best_level)?.l||"—"],["Main",p.hand_side||"—"]].map(([l,v])=><div key={l} style={{textAlign:"center"}}><div style={{fontSize:16,fontWeight:800,color:C.primary,fontFamily:"'Bebas Neue',sans-serif"}}>{v}</div><div style={{fontSize:9,color:C.muted,textTransform:"uppercase",fontWeight:600}}>{l}</div></div>)}
      </div>
      {p.bio&&<p style={{fontSize:13,color:C.muted,lineHeight:1.7,margin:"0 0 14px"}}>{p.bio}</p>}
      {p.is_available&&<div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",background:C.greenBg,borderRadius:10,border:`1px solid ${C.green}30`,marginBottom:14}}><div style={{width:8,height:8,borderRadius:"50%",background:C.green}}/><span style={{fontSize:12,color:C.green,fontWeight:600}}>Disponible pour un transfert</span></div>}
      <div style={{background:C.bgCard,borderRadius:12,padding:14,border:`1px solid ${C.border}`,marginBottom:14}}>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {p.phone&&<div style={{display:"flex",alignItems:"center",gap:10,fontSize:13}}>📱 <span style={{color:C.text,fontFamily:"monospace"}}>{p.phone}</span></div>}
          <div style={{display:"flex",alignItems:"center",gap:10,fontSize:13}}>✉️ <span style={{color:C.text,fontFamily:"monospace"}}>{p.email}</span></div>
        </div>
      </div>
      <p style={{fontSize:10,color:C.dim,textAlign:"center",margin:"0 0 14px",padding:"8px 12px",background:`${C.primary}08`,borderRadius:8,border:`1px solid ${C.primary}10`,lineHeight:1.6}}>ℹ️ HandConnect est une plateforme de mise en relation. Le contrat est conclu directement entre les parties.</p>
      <button style={{width:"100%",padding:"13px 0",border:"none",borderRadius:12,background:`linear-gradient(135deg,${C.primary},${C.primaryDark})`,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",boxShadow:`0 6px 20px ${C.primary}30`}}>💬 Contacter</button>
    </div>
  </div></div>
}

/* ═══════ ANNONCE CARD ═══════ */
function AnnonceCard({a,i,onClick}){
  const isTr=a.type==="trainer";const ac=isTr?C.accent:C.primary;
  const bens=Array.isArray(a.benefits)?a.benefits:[];
  return <div onClick={()=>onClick(a)} style={{background:C.bgCard,borderRadius:16,padding:20,border:`1px solid ${C.border}`,borderLeft:`3px solid ${a.is_urgent?C.accent:ac}`,cursor:"pointer",transition:"all .25s ease",animation:`fadeUp .5s ease ${i*.05}s both`}} onMouseEnter={e=>{e.currentTarget.style.background=C.bgHover;e.currentTarget.style.transform="translateX(4px)"}} onMouseLeave={e=>{e.currentTarget.style.background=C.bgCard;e.currentTarget.style.transform=""}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12,marginBottom:6}}>
      <div style={{flex:1}}>
        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6,flexWrap:"wrap"}}>
          <Bdg color={ac}>{isTr?"🎯 Coach":"🤾 Joueur"}</Bdg>
          {isTr&&a.titre_required&&<Bdg color={a.titre_required==="titre5"?C.accent:C.green}>{a.titre_required==="titre5"?"Titre V":"Titre IV"}</Bdg>}
          {a.is_urgent&&<Bdg color={C.accent} filled>Urgent</Bdg>}
        </div>
        <h3 style={{margin:"0 0 3px",fontSize:15,fontWeight:700,color:C.text}}>{a.title}</h3>
        <p style={{margin:0,fontSize:12,color:ac,fontWeight:600,fontFamily:"monospace"}}>{a.club_name} · {a.division} · {a.city}</p>
      </div>
      <span style={{fontSize:11,color:C.dim,background:C.bgCard,padding:"4px 10px",borderRadius:20,whiteSpace:"nowrap",border:`1px solid ${C.border}`}}>{a.candidatures_count||0} cand.</span>
    </div>
    <p style={{fontSize:13,color:C.muted,margin:"8px 0 10px",lineHeight:1.6}}>{a.description}</p>
    {isTr&&a.salary_range&&<p style={{fontSize:12,color:C.accent,fontWeight:600,margin:"0 0 8px",fontFamily:"monospace"}}>💶 {a.salary_range}</p>}
    {bens.length>0&&<div style={{display:"flex",gap:6,paddingTop:8,borderTop:`1px solid ${C.border}`}}>{bens.map(b=><span key={b} style={{fontSize:10,padding:"3px 8px",background:`${ac}10`,color:ac,borderRadius:6,fontWeight:600,border:`1px solid ${ac}18`}}>{BEN_ICO[b]||"•"} {b}</span>)}</div>}
  </div>
}

/* ═══════ ANNONCE MODAL ═══════ */
function AnnonceModal({annonce:a,onClose}){
  if(!a)return null;const isTr=a.type==="trainer";const ac=isTr?C.accent:C.primary;
  const bens=Array.isArray(a.benefits)?a.benefits:[];
  return <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",backdropFilter:"blur(12px)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20,animation:"fadeIn .2s ease"}}><div onClick={e=>e.stopPropagation()} style={{background:`linear-gradient(180deg,${C.surface},${C.bg})`,borderRadius:24,maxWidth:520,width:"100%",maxHeight:"90vh",overflowY:"auto",border:`1px solid ${C.border}`,animation:"modalUp .4s cubic-bezier(0.16,1,0.3,1)"}}>
    <div style={{padding:"24px 28px",background:`${ac}10`,borderBottom:`1px solid ${ac}20`,position:"relative"}}>
      <button onClick={onClose} style={{position:"absolute",top:16,right:16,background:"rgba(255,255,255,0.06)",border:"none",color:C.dim,width:32,height:32,borderRadius:"50%",cursor:"pointer",fontSize:16}}>✕</button>
      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8,flexWrap:"wrap"}}>
        <Bdg color={ac}>{isTr?"🎯 Coach":"🤾 Joueur"}</Bdg>
        {!isTr&&a.position&&<Bdg color={C.primary}>{POS[a.position]||a.position}</Bdg>}
        {a.is_urgent&&<Bdg color={C.accent} filled>Urgent</Bdg>}
      </div>
      <h2 style={{margin:"0 0 4px",fontSize:20,fontWeight:700,color:C.text}}>{a.title}</h2>
      <p style={{margin:0,fontSize:13,color:ac,fontWeight:600}}>{a.club_name} · {a.division} · {a.city}</p>
    </div>
    <div style={{padding:28}}>
      <p style={{fontSize:14,color:C.muted,lineHeight:1.7,margin:"0 0 20px"}}>{a.description}</p>
      {isTr&&a.salary_range&&<div style={{background:`${C.accent}08`,borderRadius:12,padding:14,border:`1px solid ${C.accent}15`,marginBottom:18,textAlign:"center"}}><span style={{fontSize:11,color:C.dim,textTransform:"uppercase",letterSpacing:1.5}}>Rémunération</span><div style={{fontSize:20,color:C.accent,fontWeight:800,fontFamily:"'Bebas Neue',sans-serif",marginTop:4}}>{a.salary_range}</div></div>}
      {bens.length>0&&<div style={{marginBottom:20}}><p style={{fontSize:10,color:C.dim,textTransform:"uppercase",letterSpacing:2,marginBottom:8,fontWeight:600}}>Avantages</p><div style={{display:"flex",flexWrap:"wrap",gap:8}}>{bens.map(b=><span key={b} style={{padding:"6px 14px",background:`${ac}10`,color:ac,borderRadius:10,fontSize:12,fontWeight:600,border:`1px solid ${ac}18`}}>{BEN_ICO[b]||"•"} {b.charAt(0).toUpperCase()+b.slice(1)}</span>)}</div></div>}
      <p style={{fontSize:10,color:C.dim,textAlign:"center",margin:"0 0 16px",padding:"8px 12px",background:`${C.primary}08`,borderRadius:8,border:`1px solid ${C.primary}10`,lineHeight:1.6}}>ℹ️ HandConnect est une plateforme de mise en relation. Le contrat est conclu directement entre les parties.</p>
      <button style={{width:"100%",padding:"14px 0",border:"none",borderRadius:12,background:`linear-gradient(135deg,${ac},${isTr?"#991B1B":C.primaryDark})`,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",boxShadow:`0 6px 20px ${ac}30`}}>✉️ Postuler</button>
    </div>
  </div></div>
}

/* ═══════ CLUB CARD ═══════ */
function ClubCard({c,i}){
  const seeking=Array.isArray(c.seeking_positions)?c.seeking_positions:[];
  return <div style={{background:C.bgCard,borderRadius:16,padding:20,border:`1px solid ${C.border}`,animation:`fadeUp .5s ease ${i*.05}s both`,transition:"all .25s"}} onMouseEnter={e=>{e.currentTarget.style.borderColor=C.borderBlue}} onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border}}>
    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
      <div style={{width:46,height:46,borderRadius:12,background:`linear-gradient(135deg,${C.primary},${C.primaryDark})`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:14,fontFamily:"'Bebas Neue',sans-serif",letterSpacing:1}}>{(c.short_name||c.name||"?").slice(0,4)}</div>
      <div style={{flex:1}}>
        <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}><h3 style={{margin:0,fontSize:15,fontWeight:700,color:C.text}}>{c.name}</h3>{c.plan==="premium"&&<Bdg color={C.gold}>👑</Bdg>}</div>
        <p style={{margin:"2px 0 0",fontSize:12,color:C.dim}}>{c.city} · {c.division}</p>
      </div>
    </div>
    {seeking.length>0&&<div style={{marginBottom:12}}><p style={{fontSize:9,color:C.dim,textTransform:"uppercase",letterSpacing:1.5,marginBottom:6,fontWeight:600}}>Postes recherchés</p><div style={{display:"flex",flexWrap:"wrap",gap:6}}>{seeking.map(p=><Bdg key={p} color={C.primary}>{POS[p]||p}</Bdg>)}</div></div>}
    {(c.phone||c.email)&&<div style={{background:"rgba(0,0,0,0.15)",borderRadius:10,padding:10}}><div style={{fontSize:12,color:C.muted,display:"flex",flexDirection:"column",gap:4}}>{c.phone&&<span>📱 <span style={{fontFamily:"monospace"}}>{c.phone}</span></span>}{c.email&&<span>✉️ <span style={{fontFamily:"monospace"}}>{c.email}</span></span>}</div></div>}
  </div>
}

/* ═══════ PROFILE EDITOR ═══════ */
function ProfileEditor({profile,user,onSave,onToast}){
  const [form,setForm]=useState(profile||{});
  const [saving,setSaving]=useState(false);
  const upd=(k,v)=>setForm(p=>({...p,[k]:v}));
  const inpS={width:"100%",padding:"12px 16px",background:"rgba(255,255,255,0.04)",border:`1px solid ${C.border}`,borderRadius:12,color:C.text,fontSize:14,fontFamily:"inherit",outline:"none",boxSizing:"border-box",transition:"border-color .2s"};
  const lblS={fontSize:10,color:C.dim,textTransform:"uppercase",letterSpacing:1.5,fontWeight:600,marginBottom:6,display:"block"};

  const save=async()=>{
    setSaving(true);
    const {error}=await supabase.from("profiles").update({
      first_name:form.first_name,last_name:form.last_name,
      height_cm:form.height_cm?parseInt(form.height_cm):null,
      weight_kg:form.weight_kg?parseInt(form.weight_kg):null,
      age:form.age?parseInt(form.age):null,
      position:form.position||null,hand_side:form.hand_side||null,
      best_level:form.best_level||null,current_level:form.current_level||null,
      current_club:form.current_club||null,city:form.city||null,
      phone:form.phone||null,bio:form.bio||null,
      is_available:form.is_available||false,
    }).eq("id",user.id);
    if(error){onToast("❌ "+error.message)}else{onSave({...profile,...form});onToast("✅ Profil mis à jour !")}
    setSaving(false);
  };

  const completion=(()=>{const fs=["first_name","last_name","height_cm","weight_kg","age","position","hand_side","best_level","current_level","city"];const filled=fs.filter(f=>form[f]&&form[f]!=="").length;return Math.round((filled/fs.length)*100)})();

  return <div>
    {/* Completion */}
    <div style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:14,padding:"14px 20px",marginBottom:20,display:"flex",alignItems:"center",gap:16}}>
      <div style={{flex:1}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontSize:12,color:C.muted,fontWeight:600}}>Complétion du profil</span><span style={{fontSize:12,color:completion===100?C.green:C.primary,fontWeight:700}}>{completion}%</span></div>
        <div style={{height:6,background:"rgba(255,255,255,0.06)",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:`${completion}%`,background:completion===100?C.green:`linear-gradient(90deg,${C.primary},${C.accent})`,borderRadius:3,transition:"width .6s ease"}}/></div>
      </div>
    </div>

    {/* Identity */}
    <h4 style={{fontSize:11,color:C.dim,textTransform:"uppercase",letterSpacing:2,marginBottom:12,fontWeight:600,borderBottom:`1px solid ${C.border}`,paddingBottom:8}}>👤 Identité</h4>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:20}}>
      <div><label style={lblS}>Prénom</label><input value={form.first_name||""} onChange={e=>upd("first_name",e.target.value)} style={inpS} placeholder="Votre prénom"/></div>
      <div><label style={lblS}>Nom</label><input value={form.last_name||""} onChange={e=>upd("last_name",e.target.value)} style={inpS} placeholder="Votre nom"/></div>
      <div><label style={lblS}>Âge</label><input type="number" value={form.age||""} onChange={e=>upd("age",e.target.value)} style={inpS} placeholder="25" min="14" max="60"/></div>
      <div><label style={lblS}>Téléphone</label><input value={form.phone||""} onChange={e=>upd("phone",e.target.value)} style={inpS} placeholder="06 12 34 56 78"/></div>
      <div><label style={lblS}>Ville</label><input value={form.city||""} onChange={e=>upd("city",e.target.value)} style={inpS} placeholder="Lyon"/></div>
      <div><label style={lblS}>Club actuel</label><input value={form.current_club||""} onChange={e=>upd("current_club",e.target.value)} style={inpS} placeholder="AS Bondy"/></div>
    </div>

    {/* Physical */}
    <h4 style={{fontSize:11,color:C.dim,textTransform:"uppercase",letterSpacing:2,marginBottom:12,fontWeight:600,borderBottom:`1px solid ${C.border}`,paddingBottom:8}}>📏 Caractéristiques</h4>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,marginBottom:20}}>
      <div><label style={lblS}>Taille (cm)</label><input type="number" value={form.height_cm||""} onChange={e=>upd("height_cm",e.target.value)} style={inpS} placeholder="185"/></div>
      <div><label style={lblS}>Poids (kg)</label><input type="number" value={form.weight_kg||""} onChange={e=>upd("weight_kg",e.target.value)} style={inpS} placeholder="82"/></div>
      <div><label style={lblS}>Main forte</label><select value={form.hand_side||""} onChange={e=>upd("hand_side",e.target.value)} style={{...inpS,cursor:"pointer"}}><option value="">— Choisir —</option><option value="droitier">Droitier</option><option value="gaucher">Gaucher</option><option value="ambidextre">Ambidextre</option></select></div>
    </div>

    {/* Handball */}
    <h4 style={{fontSize:11,color:C.dim,textTransform:"uppercase",letterSpacing:2,marginBottom:12,fontWeight:600,borderBottom:`1px solid ${C.border}`,paddingBottom:8}}>🤾 Handball</h4>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,marginBottom:20}}>
      <div><label style={lblS}>Poste</label><select value={form.position||""} onChange={e=>upd("position",e.target.value)} style={{...inpS,cursor:"pointer"}}><option value="">— Choisir —</option>{Object.entries(POS).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></div>
      <div><label style={lblS}>Meilleur niveau</label><select value={form.best_level||""} onChange={e=>upd("best_level",e.target.value)} style={{...inpS,cursor:"pointer"}}>{LEVELS.map(l=><option key={l.v} value={l.v}>{l.l}</option>)}</select></div>
      <div><label style={lblS}>Niveau actuel</label><select value={form.current_level||""} onChange={e=>upd("current_level",e.target.value)} style={{...inpS,cursor:"pointer"}}>{LEVELS.map(l=><option key={l.v} value={l.v}>{l.l}</option>)}</select></div>
    </div>

    {/* Availability */}
    <h4 style={{fontSize:11,color:C.dim,textTransform:"uppercase",letterSpacing:2,marginBottom:12,fontWeight:600,borderBottom:`1px solid ${C.border}`,paddingBottom:8}}>📡 Disponibilité</h4>
    <div onClick={()=>upd("is_available",!form.is_available)} style={{display:"flex",alignItems:"center",gap:12,padding:"14px 18px",background:form.is_available?"rgba(16,185,129,0.08)":"rgba(255,255,255,0.02)",border:`1px solid ${form.is_available?"rgba(16,185,129,0.3)":C.border}`,borderRadius:12,cursor:"pointer",transition:"all .25s",marginBottom:20}}>
      <div style={{width:40,height:22,borderRadius:11,background:form.is_available?C.green:"rgba(255,255,255,0.1)",position:"relative",transition:"background .25s"}}><div style={{width:18,height:18,borderRadius:"50%",background:"#fff",position:"absolute",top:2,left:form.is_available?20:2,transition:"left .25s",boxShadow:"0 2px 4px rgba(0,0,0,0.2)"}}/></div>
      <div><div style={{fontSize:13,color:C.text,fontWeight:600}}>Je suis disponible pour un transfert</div><div style={{fontSize:11,color:C.muted,marginTop:2}}>{form.is_available?"Visible dans les recherches":"Non visible"}</div></div>
    </div>

    {/* Bio */}
    <h4 style={{fontSize:11,color:C.dim,textTransform:"uppercase",letterSpacing:2,marginBottom:12,fontWeight:600,borderBottom:`1px solid ${C.border}`,paddingBottom:8}}>✍️ Présentation</h4>
    <textarea value={form.bio||""} onChange={e=>upd("bio",e.target.value)} placeholder="Décrivez votre profil..." rows={4} style={{...inpS,resize:"vertical",lineHeight:1.6,marginBottom:20}}/>

    {/* Save */}
    <div style={{display:"flex",justifyContent:"flex-end"}}>
      <button onClick={save} disabled={saving} style={{padding:"12px 32px",border:"none",borderRadius:12,background:`linear-gradient(135deg,${C.primary},${C.primaryDark})`,color:"#fff",fontSize:13,fontWeight:700,cursor:saving?"wait":"pointer",boxShadow:`0 6px 20px ${C.primary}30`,opacity:saving?.7:1}}>{saving?"Enregistrement...":"💾 Enregistrer"}</button>
    </div>
  </div>
}

/* ═══════ PRICING TAB ═══════ */
function PricingTab(){
  return <div>
    <div style={{textAlign:"center",marginBottom:28}}><h2 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:36,letterSpacing:3,color:C.text,margin:"0 0 6px"}}>NOS <span style={{color:C.primary}}>OFFRES</span></h2><p style={{color:C.muted,fontSize:13}}>Sans commission · Sans engagement</p></div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:16,marginBottom:24}}>
      {PRICING.map((p,i)=><div key={p.key} style={{background:p.pop?`${C.primary}08`:C.bgCard,borderRadius:20,padding:24,border:`1px solid ${p.pop?`${C.primary}30`:C.border}`,position:"relative",animation:`fadeUp .5s ease ${i*.08}s both`,transition:"all .25s"}} onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-4px)"}} onMouseLeave={e=>{e.currentTarget.style.transform=""}}>
        {p.pop&&<div style={{position:"absolute",top:-10,left:"50%",transform:"translateX(-50%)",background:`linear-gradient(135deg,${C.primary},${C.primaryDark})`,color:"#fff",fontSize:9,fontWeight:800,padding:"4px 14px",borderRadius:12,letterSpacing:1.5,textTransform:"uppercase"}}>★ Populaire</div>}
        <h3 style={{margin:"0 0 4px",fontSize:16,color:p.color,fontWeight:700,fontFamily:"'Bebas Neue',sans-serif",letterSpacing:2}}>{p.label.toUpperCase()}</h3>
        <p style={{margin:0,fontSize:12,color:C.dim}}>{p.desc}</p>
        <div style={{margin:"18px 0",display:"flex",alignItems:"baseline",gap:4}}><span style={{fontSize:42,fontWeight:800,color:C.text,fontFamily:"'Bebas Neue',sans-serif",lineHeight:1}}>{p.price}€</span><span style={{fontSize:13,color:C.dim}}>{p.per}</span></div>
        <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:18,minHeight:120}}>{p.feats.map(f=><div key={f} style={{display:"flex",alignItems:"flex-start",gap:8,fontSize:12}}><span style={{color:p.color||C.green,fontSize:12,marginTop:1}}>✓</span><span style={{color:C.muted}}>{f}</span></div>)}</div>
        <button style={{width:"100%",padding:"12px 0",border:"none",borderRadius:12,background:p.pop?`linear-gradient(135deg,${C.primary},${C.primaryDark})`:C.bgHover,color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer"}}>{p.price===0?"Commencer":"Choisir →"}</button>
      </div>)}
    </div>
    <p style={{fontSize:10,color:C.dim,textAlign:"center",padding:"12px 16px",background:`${C.primary}06`,borderRadius:10,border:`1px solid ${C.primary}10`,lineHeight:1.7}}>ℹ️ HandConnect est une plateforme de mise en relation. Aucune commission sur les recrutements.</p>
  </div>
}

/* ═══════════════════════════════════════════════════════════ */
/* ═══════════════════════ MAIN APP ═════════════════════════ */
/* ═══════════════════════════════════════════════════════════ */
export default function HandConnect(){
  const [tab,setTab]=useState("annonces");
  const [search,setSearch]=useState("");
  const [posF,setPosF]=useState("");
  const [availF,setAvailF]=useState(false);
  const [aType,setAType]=useState("all");
  const [selPlayer,setSelPlayer]=useState(null);
  const [selAnnonce,setSelAnnonce]=useState(null);
  const [toast,setToast]=useState("");
  const [user,setUser]=useState(null);
  const [profile,setProfile]=useState(null);
  const [authLoading,setAuthLoading]=useState(true);

  // Data from Supabase
  const [players,setPlayers]=useState([]);
  const [clubs,setClubs]=useState([]);
  const [annonces,setAnnonces]=useState([]);
  const [dataLoading,setDataLoading]=useState(true);

  const flash=(m)=>{setToast(m);setTimeout(()=>setToast(""),3500)};

  // Auth check
  useEffect(()=>{
    const check=async()=>{
      const{data:{user:u}}=await supabase.auth.getUser();
      if(u){
        setUser(u);
        const{data:p}=await supabase.from("profiles").select("*").eq("id",u.id).single();
        setProfile(p);
      }
      setAuthLoading(false);
    };
    check();
    const{data:{subscription}}=supabase.auth.onAuthStateChange((ev,session)=>{
      if(ev==="SIGNED_OUT"){setUser(null);setProfile(null)}
      if(ev==="SIGNED_IN"&&session?.user){setUser(session.user)}
    });
    return ()=>subscription.unsubscribe();
  },[]);

  // Fetch data
  useEffect(()=>{
    const fetchAll=async()=>{
      const[{data:pl},{data:cl},{data:an}]=await Promise.all([
        supabase.from("profiles").select("*").eq("user_type","joueur"),
        supabase.from("clubs").select("*"),
        supabase.from("annonces").select("*").order("created_at",{ascending:false}),
      ]);
      setPlayers(pl||[]);
      setClubs(cl||[]);
      setAnnonces(an||[]);
      setDataLoading(false);
    };
    fetchAll();
  },[]);

  const handleLogout=async()=>{await supabase.auth.signOut();window.location.href="/"};

  // Filters
  const fPlayers=useMemo(()=>players.filter(p=>{
    if(posF&&p.position!==posF)return false;
    if(availF&&!p.is_available)return false;
    if(search)return`${p.first_name||""} ${p.last_name||""} ${p.city||""} ${p.current_club||""}`.toLowerCase().includes(search.toLowerCase());
    return true;
  }),[players,search,posF,availF]);

  const fAnnonces=useMemo(()=>annonces.filter(a=>{
    if(aType!=="all"&&a.type!==aType)return false;
    if(search)return`${a.title} ${a.club_name||""} ${a.city||""}`.toLowerCase().includes(search.toLowerCase());
    return true;
  }),[annonces,search,aType]);

  const fClubs=useMemo(()=>clubs.filter(c=>search?`${c.name} ${c.city||""}`.toLowerCase().includes(search.toLowerCase()):true),[clubs,search]);

  const tabs=[
    {k:"annonces",l:"Annonces",i:"📢"},
    {k:"joueurs",l:"Joueurs",i:"🤾"},
    {k:"clubs",l:"Clubs",i:"🏟️"},
    ...(user?[{k:"profil",l:"Mon profil",i:"👤"}]:[]),
    {k:"tarifs",l:"Tarifs",i:"💎"},
  ];

  const inpS={padding:"11px 14px",background:"rgba(255,255,255,0.04)",border:`1px solid ${C.border}`,borderRadius:10,color:C.text,fontSize:13,outline:"none",transition:"all .2s",width:"100%",boxSizing:"border-box"};

  const css=`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');*{box-sizing:border-box;margin:0;padding:0}@keyframes slideDown{from{opacity:0;transform:translateY(-12px)}to{opacity:1;transform:translateY(0)}}@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}@keyframes modalUp{from{opacity:0;transform:translateY(24px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}input:focus,select:focus,textarea:focus{border-color:${C.primary}!important;box-shadow:0 0 0 3px ${C.primary}15!important}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:4px}`;

  return <>
    <style>{css}</style>
    <div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",position:"relative",overflow:"hidden"}}>
      <div style={{position:"fixed",top:-300,right:-200,width:700,height:700,borderRadius:"50%",background:`radial-gradient(circle,${C.primary}08,transparent 70%)`,pointerEvents:"none"}}/>
      <div style={{position:"fixed",bottom:-300,left:-200,width:600,height:600,borderRadius:"50%",background:`radial-gradient(circle,${C.accent}05,transparent 70%)`,pointerEvents:"none"}}/>

      <Toast msg={toast} onClose={()=>setToast("")}/>

      {/* Header */}
      <header style={{background:`${C.bg}ee`,backdropFilter:"blur(20px)",borderBottom:`1px solid ${C.border}`,padding:"0 20px",position:"sticky",top:0,zIndex:100}}>
        <div style={{maxWidth:1100,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",height:60}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:36,height:36,borderRadius:10,background:`linear-gradient(135deg,${C.primary},${C.accent})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,boxShadow:`0 4px 14px ${C.primary}30`}}>🤾</div>
            <h1 style={{fontSize:20,fontFamily:"'Bebas Neue',sans-serif",letterSpacing:3,color:"#fff",lineHeight:1,cursor:"pointer"}} onClick={()=>{setTab("annonces");setSearch("")}}>HAND<span style={{color:C.primary}}>CONNECT</span></h1>
            <span style={{fontSize:8,color:C.dim,background:C.bgCard,padding:"2px 7px",borderRadius:5,fontWeight:600,letterSpacing:1,border:`1px solid ${C.border}`}}>BETA</span>
          </div>
          <nav style={{display:"flex",gap:2}}>{tabs.map(t=><button key={t.k} onClick={()=>{setTab(t.k);setSearch("");setPosF("");setAType("all")}} style={{padding:"7px 12px",border:"none",borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:600,transition:"all .2s",background:tab===t.k?`${C.primary}18`:"transparent",color:tab===t.k?C.primaryLight:C.dim,whiteSpace:"nowrap"}}><span style={{marginRight:4,fontSize:12}}>{t.i}</span>{t.l}</button>)}</nav>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            {user?(
              <>
                <span style={{fontSize:12,color:C.muted}}>{profile?.first_name||"User"}</span>
                <button onClick={handleLogout} style={{padding:"6px 12px",border:`1px solid rgba(239,68,68,0.2)`,borderRadius:8,background:"rgba(239,68,68,0.08)",color:"#EF4444",fontSize:11,fontWeight:600,cursor:"pointer"}}>Déconnexion</button>
              </>
            ):(
              <>
                <a href="/login" style={{padding:"6px 14px",border:`1px solid ${C.primary}30`,borderRadius:8,background:`${C.primary}10`,color:C.primaryLight,fontSize:11,fontWeight:600,textDecoration:"none"}}>Connexion</a>
                <a href="/register" style={{padding:"6px 14px",border:"none",borderRadius:8,background:`linear-gradient(135deg,${C.primary},${C.primaryDark})`,color:"#fff",fontSize:11,fontWeight:600,textDecoration:"none",boxShadow:`0 4px 12px ${C.primary}25`}}>Inscription</a>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main */}
      <main style={{maxWidth:1100,margin:"0 auto",padding:"20px 20px 60px"}}>
        {/* Filters */}
        {tab!=="tarifs"&&tab!=="profil"&&(
          <div style={{marginBottom:18,animation:"fadeUp .3s ease"}}>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher..." style={{...inpS,flex:"1 1 200px",width:"auto"}}/>
              {tab==="joueurs"&&<select value={posF} onChange={e=>setPosF(e.target.value)} style={{...inpS,minWidth:140,width:"auto"}}><option value="">Tous postes</option>{Object.entries(POS).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select>}
              {tab==="joueurs"&&<button onClick={()=>setAvailF(!availF)} style={{padding:"11px 14px",border:`1px solid ${availF?`${C.green}40`:C.border}`,borderRadius:10,fontSize:12,fontWeight:600,cursor:"pointer",background:availF?C.greenBg:"transparent",color:availF?C.green:C.dim}}>🟢 Dispos</button>}
            </div>
            {tab==="annonces"&&<div style={{display:"flex",gap:6,marginTop:10}}>{[["all","Toutes"],["player","🤾 Joueurs"],["trainer","🎯 Coachs"]].map(([k,l])=><button key={k} onClick={()=>setAType(k)} style={{padding:"6px 12px",border:`1px solid ${aType===k?`${C.primary}40`:C.border}`,borderRadius:8,fontSize:11,fontWeight:600,cursor:"pointer",background:aType===k?`${C.primary}15`:"transparent",color:aType===k?C.primaryLight:C.dim}}>{l}</button>)}</div>}
          </div>
        )}

        {/* Loading */}
        {dataLoading&&tab!=="profil"&&tab!=="tarifs"&&<div style={{textAlign:"center",padding:60,color:C.dim}}>Chargement des données...</div>}

        {/* Annonces */}
        {tab==="annonces"&&!dataLoading&&(
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {fAnnonces.length>0?fAnnonces.map((a,i)=><AnnonceCard key={a.id} a={a} i={i} onClick={setSelAnnonce}/>):<div style={{textAlign:"center",padding:50,color:C.dim}}><div style={{fontSize:40,marginBottom:10}}>📭</div><p>Aucune annonce pour le moment</p>{user&&<p style={{fontSize:12,color:C.primary,marginTop:8}}>Vous pouvez publier la première !</p>}</div>}
          </div>
        )}

        {/* Joueurs */}
        {tab==="joueurs"&&!dataLoading&&(
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(210px,1fr))",gap:14}}>
            {fPlayers.length>0?fPlayers.map((p,i)=><PlayerCard key={p.id} p={p} i={i} onClick={setSelPlayer}/>):<div style={{gridColumn:"1/-1",textAlign:"center",padding:50,color:C.dim}}><div style={{fontSize:40,marginBottom:10}}>🤾</div><p>Aucun joueur inscrit pour le moment</p>{!user&&<p style={{fontSize:12,color:C.primary,marginTop:8}}><a href="/register" style={{color:C.primaryLight,textDecoration:"underline"}}>Inscrivez-vous</a> pour être le premier !</p>}</div>}
          </div>
        )}

        {/* Clubs */}
        {tab==="clubs"&&!dataLoading&&(
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:14}}>
            {fClubs.length>0?fClubs.map((c,i)=><ClubCard key={c.id} c={c} i={i}/>):<div style={{gridColumn:"1/-1",textAlign:"center",padding:50,color:C.dim}}><div style={{fontSize:40,marginBottom:10}}>🏟️</div><p>Aucun club inscrit pour le moment</p></div>}
          </div>
        )}

        {/* Profil */}
        {tab==="profil"&&user&&(
          <div style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:18,padding:28}}>
            <h3 style={{fontSize:18,fontFamily:"'Bebas Neue',sans-serif",letterSpacing:2,color:C.primary,margin:"0 0 20px"}}>📋 MON PROFIL</h3>
            <ProfileEditor profile={profile} user={user} onSave={(p)=>{setProfile(p);setPlayers(prev=>prev.map(pl=>pl.id===p.id?{...pl,...p}:pl))}} onToast={flash}/>
          </div>
        )}
        {tab==="profil"&&!user&&(
          <div style={{textAlign:"center",padding:60}}>
            <div style={{fontSize:48,marginBottom:16}}>🔐</div>
            <h3 style={{color:C.text,fontSize:18,fontWeight:700,marginBottom:8}}>Connectez-vous pour accéder à votre profil</h3>
            <div style={{display:"flex",gap:12,justifyContent:"center",marginTop:16}}>
              <a href="/login" style={{padding:"10px 24px",border:`1px solid ${C.primary}30`,borderRadius:10,background:`${C.primary}10`,color:C.primaryLight,fontSize:13,fontWeight:600,textDecoration:"none"}}>Connexion</a>
              <a href="/register" style={{padding:"10px 24px",border:"none",borderRadius:10,background:`linear-gradient(135deg,${C.primary},${C.primaryDark})`,color:"#fff",fontSize:13,fontWeight:600,textDecoration:"none"}}>Inscription</a>
            </div>
          </div>
        )}

        {/* Tarifs */}
        {tab==="tarifs"&&<PricingTab/>}
      </main>

      {/* Modals */}
      <PlayerModal player={selPlayer} onClose={()=>setSelPlayer(null)}/>
      <AnnonceModal annonce={selAnnonce} onClose={()=>setSelAnnonce(null)}/>
    </div>
  </>
}
