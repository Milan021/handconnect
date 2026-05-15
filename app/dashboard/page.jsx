"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";
import { getCenterById, CENTER_TYPE_META, SECTION_SPORTIVE_META } from "../../lib/training-centers";
import { REGIONS, getRegionLabel } from "../../lib/regions";
import ChatWidget from "../../components/ChatWidget";

const C = { primary:"#1D4ED8", primaryLight:"#3B82F6", primaryDark:"#1E3A8A", accent:"#DC2626", accentLight:"#F87171", bg:"#0B1120", bgCard:"rgba(255,255,255,0.04)", bgHover:"rgba(255,255,255,0.07)", surface:"#111827", border:"rgba(255,255,255,0.08)", borderBlue:"rgba(29,78,216,0.4)", text:"#F1F5F9", muted:"rgba(255,255,255,0.5)", dim:"rgba(255,255,255,0.3)", green:"#10B981", greenBg:"rgba(16,185,129,0.12)", gold:"#FBBF24" };

const POS = { gardien:"Gardien", ailier_gauche:"Ailier G.", ailier_droit:"Ailier D.", arriere_gauche:"Arrière G.", arriere_droit:"Arrière D.", demi_centre:"Demi-centre", pivot:"Pivot" };
// Ordre tactique handball (du gardien aux ailiers, par lignes)
const POS_ORDER = { gardien:0, arriere_gauche:1, demi_centre:2, arriere_droit:3, ailier_gauche:4, ailier_droit:5, pivot:6 };
const LEVELS = [ {v:"",l:"—"},{v:"departemental",l:"Départemental"},{v:"regional",l:"Régional"},{v:"pre_nationale",l:"Pré-Nationale"},{v:"n3",l:"Nationale 3"},{v:"n2",l:"Nationale 2"},{v:"n1",l:"Nationale 1"},{v:"proligue",l:"Proligue"},{v:"starligue",l:"Starligue"},{v:"d2f",l:"D2F"},{v:"d1f",l:"D1F"} ];
const BEN_ICO = { prime:"•", logement:"•", job:"•", formation:"•" };
const PRICING = [
  { key:"free",     label:"Club Free",     price:25,  per:"/an", desc:"Pour démarrer",          feats:["2 annonces / an","20 profils consultables / mois","10 candidatures consultables / mois","Messagerie de base"], color:C.dim },
  { key:"standard", label:"Club Standard", price:100, per:"/an", desc:"Pour les clubs actifs", feats:["10 annonces / an","Profils consultables illimités","100 candidatures consultables / mois","Messagerie illimitée","Alertes candidats"], color:C.primary, pop:true },
  { key:"premium",  label:"Club Premium",  price:250, per:"/an", desc:"Pour les ambitieux",    feats:["Annonces illimitées","Profils & candidatures illimités","Annonces mises en avant","Statistiques avancées","Support prioritaire"], color:C.gold },
];

/* ═══════ MICRO COMPONENTS ═══════ */
function Bdg({children,color=C.primary,filled}){return <span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"3px 10px",background:filled?color:`${color}18`,color:filled?"#fff":color,borderRadius:6,fontSize:10,fontWeight:700,border:`1px solid ${color}30`,letterSpacing:.8,textTransform:"uppercase",whiteSpace:"nowrap"}}>{children}</span>}
function Dot(){return <div style={{display:"inline-flex",alignItems:"center",gap:5,padding:"3px 10px",background:C.greenBg,borderRadius:20,border:`1px solid ${C.green}30`}}><div style={{width:6,height:6,borderRadius:"50%",background:C.green,boxShadow:`0 0 8px ${C.green}60`}}/><span style={{color:C.green,fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:1.5}}>Disponible</span></div>}
function Stars({r}){const rating=Number(r)||0;return <span style={{display:"inline-flex",alignItems:"center",gap:1}}>{[1,2,3,4,5].map(i=><span key={i} style={{color:i<=Math.round(rating)?C.gold:"rgba(255,255,255,0.1)",fontSize:12}}>•</span>)}</span>}
function Toast({msg,onClose}){if(!msg)return null;const isErr=msg.startsWith("❌");return <div style={{position:"fixed",top:24,right:24,padding:"14px 22px",borderRadius:14,zIndex:9999,background:isErr?"rgba(239,68,68,0.15)":"rgba(16,185,129,0.15)",backdropFilter:"blur(20px)",border:`1px solid ${isErr?"rgba(239,68,68,0.3)":"rgba(16,185,129,0.3)"}`,color:isErr?"#FCA5A5":"#6EE7B7",fontSize:13,fontWeight:600,boxShadow:"0 8px 32px rgba(0,0,0,0.3)",animation:"slideDown .4s cubic-bezier(0.16,1,0.3,1)",display:"flex",alignItems:"center",gap:10}}>{msg}<span onClick={onClose} style={{cursor:"pointer",opacity:.5,fontSize:16,marginLeft:8}}>✕</span></div>}

/* ═══════ CONNECT BUTTON ═══════ */
function ConnectButton({otherId,user,fullWidth=true,labelConnect="Demander à se connecter",labelChat="Discuter"}){
  const [status,setStatus]=useState("loading");
  const [connId,setConnId]=useState(null);

  useEffect(()=>{
    if(!user||!otherId||user.id===otherId){ setStatus("hidden"); return; }
    setStatus("loading");
    const a=user.id<otherId?user.id:otherId;
    const b=user.id<otherId?otherId:user.id;
    supabase.from("connections").select("*").eq("participant_a",a).eq("participant_b",b).maybeSingle().then(({data})=>{
      if(!data){ setStatus("none"); return; }
      setConnId(data.id);
      if(data.status==="accepted") setStatus("accepted");
      else if(data.status==="rejected") setStatus(data.requester_id===user.id?"rejected-mine":"none");
      else setStatus(data.requester_id===user.id?"pending-mine":"pending-theirs");
    });
  },[user,otherId]);

  if(status==="hidden") return null;
  const baseBtn={width:fullWidth?"100%":"auto",padding:"12px 18px",border:"none",borderRadius:12,fontSize:13,fontWeight:700,cursor:"pointer"};

  const request=async()=>{
    setStatus("loading");
    const{error}=await supabase.rpc("request_connection",{other_user_id:otherId});
    setStatus(error?"none":"pending-mine");
  };
  const accept=async()=>{
    if(!connId)return; setStatus("loading");
    const{error}=await supabase.from("connections").update({status:"accepted",responded_at:new Date().toISOString()}).eq("id",connId);
    setStatus(error?"pending-theirs":"accepted");
  };
  const reject=async()=>{
    if(!connId)return; setStatus("loading");
    const{error}=await supabase.from("connections").update({status:"rejected",responded_at:new Date().toISOString()}).eq("id",connId);
    if(!error) setStatus("hidden");
  };
  const openChat=()=>window.dispatchEvent(new CustomEvent("hc-open-chat",{detail:{otherUserId:otherId}}));

  if(status==="loading") return <button disabled style={{...baseBtn,background:"rgba(255,255,255,0.06)",color:C.dim}}>Chargement…</button>;
  if(status==="accepted") return <button onClick={openChat} style={{...baseBtn,background:`linear-gradient(135deg,${C.primary},${C.primaryDark})`,color:"#fff",boxShadow:`0 6px 20px ${C.primary}30`}}>{labelChat}</button>;
  if(status==="pending-mine") return <button disabled style={{...baseBtn,background:`${C.gold}10`,color:C.gold,border:`1px solid ${C.gold}40`,cursor:"default"}}>Demande envoyée</button>;
  if(status==="rejected-mine") return <button disabled style={{...baseBtn,background:"rgba(255,255,255,0.04)",color:C.dim,border:`1px solid ${C.border}`,cursor:"default"}}>Demande refusée</button>;
  if(status==="pending-theirs") return <div style={{display:"flex",gap:8}}>
    <button onClick={accept} style={{...baseBtn,flex:1,background:`linear-gradient(135deg,${C.green},#059669)`,color:"#fff"}}>Accepter la demande</button>
    <button onClick={reject} style={{...baseBtn,flex:1,background:`${C.accent}10`,color:C.accent,border:`1px solid ${C.accent}30`}}>Refuser</button>
  </div>;
  return <button onClick={request} style={{...baseBtn,background:`linear-gradient(135deg,${C.primary},${C.primaryDark})`,color:"#fff",boxShadow:`0 6px 20px ${C.primary}30`}}>{labelConnect}</button>;
}

/* ═══════ PLAYER CARD ═══════ */
function PlayerCard({p,onClick,i}){
  const center=getCenterById(p.training_center);
  const centerMeta=center?CENTER_TYPE_META[center.type]:null;
  const isSection=!center&&p.is_section_sportive;
  const isMinor=p.age&&p.age<18;
  const accent=center?centerMeta.color:(isSection?SECTION_SPORTIVE_META.color:C.primary);
  const accentDark=center?centerMeta.color:(isSection?SECTION_SPORTIVE_META.color:C.primaryDark);
  const badgeColor=center?centerMeta.color:(isSection?SECTION_SPORTIVE_META.color:null);
  const badgeIcon=center?centerMeta.icon:(isSection?SECTION_SPORTIVE_META.icon:null);
  const badgeLabel=center?centerMeta.label:(isSection?SECTION_SPORTIVE_META.label:null);
  return <div onClick={()=>onClick(p)} style={{background:C.bgCard,borderRadius:18,overflow:"hidden",cursor:"pointer",border:`1px solid ${badgeColor?`${badgeColor}30`:C.border}`,transition:"all .35s cubic-bezier(0.16,1,0.3,1)",position:"relative",animation:`fadeUp .5s ease ${i*.05}s both`}} onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-5px)";e.currentTarget.style.borderColor=badgeColor||C.borderBlue;e.currentTarget.style.boxShadow=`0 16px 48px ${accent}15`}} onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.borderColor=badgeColor?`${badgeColor}30`:C.border;e.currentTarget.style.boxShadow=""}}>
    {p.is_available&&<div style={{position:"absolute",top:12,left:12,zIndex:2}}><Dot/></div>}
    {badgeColor&&<div style={{position:"absolute",top:12,right:12,zIndex:2,background:"rgba(0,0,0,0.55)",backdropFilter:"blur(6px)",padding:"3px 8px",borderRadius:6,fontSize:10,fontWeight:700,color:badgeColor,border:`1px solid ${badgeColor}50`}}>{badgeIcon} {badgeLabel}</div>}
    {!badgeColor&&isMinor&&<div style={{position:"absolute",top:12,right:12,zIndex:2,background:"rgba(0,0,0,0.55)",backdropFilter:"blur(6px)",padding:"3px 8px",borderRadius:6,fontSize:10,fontWeight:700,color:"#FBBF24",border:"1px solid rgba(251,191,36,0.4)"}}>-18</div>}
    {!badgeColor&&!isMinor&&p.formation_origin&&<div style={{position:"absolute",top:12,right:12,zIndex:2,background:"rgba(0,0,0,0.55)",backdropFilter:"blur(6px)",padding:"3px 8px",borderRadius:6,fontSize:10,fontWeight:700,color:C.gold,border:`1px solid ${C.gold}40`}}>{p.formation_origin==="pole_espoirs"?"Pole Espoirs":"Centre de formation"}</div>}
    <div style={{height:80,background:`linear-gradient(135deg,${accent},${accentDark})`,position:"relative"}}><div style={{width:56,height:56,borderRadius:"50%",background:C.bg,border:`3px solid ${accent}50`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:800,color:accent,fontFamily:"'Bebas Neue',sans-serif",position:"absolute",bottom:-24,left:"50%",transform:"translateX(-50%)",boxShadow:"0 6px 20px rgba(0,0,0,0.4)"}}></div></div>
    <div style={{padding:"30px 16px 16px",textAlign:"center"}}>
      <h3 style={{margin:0,fontSize:14,fontWeight:700,color:C.text}}>{POS[p.position]||"Non défini"}</h3>
      <p style={{fontSize:10,color:C.dim,margin:"4px 0"}}>{p.city||"—"}{p.region?` · ${getRegionLabel(p.region)}`:""}</p>
      {p.mobile_other_regions&&<p style={{fontSize:9,color:C.green,margin:"2px 0 0",fontWeight:600}}>Mobile</p>}
      <div style={{display:"flex",justifyContent:"center",gap:16,paddingTop:10,marginTop:10,borderTop:`1px solid ${C.border}`}}>
        {[["Taille",p.height_cm?`${p.height_cm}cm`:"—"],["Niveau",LEVELS.find(l=>l.v===p.current_level)?.l||"—"]].map(([l,v])=><div key={l} style={{textAlign:"center"}}><div style={{fontSize:15,fontWeight:800,color:C.text,fontFamily:"'Bebas Neue',sans-serif"}}>{v}</div><div style={{fontSize:8,color:C.dim,textTransform:"uppercase",letterSpacing:1.5,fontWeight:600}}>{l}</div></div>)}
      </div>
    </div>
  </div>
}

/* ═══════ PLAYER MODAL ═══════ */
function PlayerModal({player:p,onClose,user}){
  if(!p)return null;
  const center=getCenterById(p.training_center);
  const centerMeta=center?CENTER_TYPE_META[center.type]:null;
  const isSection=!center&&p.is_section_sportive;
  const headerColor=center?centerMeta.color:(isSection?SECTION_SPORTIVE_META.color:C.primary);
  const headerDark=center?centerMeta.color:(isSection?SECTION_SPORTIVE_META.color:C.primaryDark);
  const badgeIcon=center?centerMeta.icon:(isSection?SECTION_SPORTIVE_META.icon:null);
  const badgeLabel=center?centerMeta.label:(isSection?SECTION_SPORTIVE_META.label:null);
  return <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",backdropFilter:"blur(12px)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20,animation:"fadeIn .2s ease"}}><div onClick={e=>e.stopPropagation()} style={{background:`linear-gradient(180deg,${C.surface},${C.bg})`,borderRadius:24,maxWidth:500,width:"100%",overflow:"hidden",maxHeight:"90vh",overflowY:"auto",border:`1px solid ${C.border}`,animation:"modalUp .4s cubic-bezier(0.16,1,0.3,1)"}}>
    <div style={{height:120,background:`linear-gradient(135deg,${headerColor},${headerDark})`,position:"relative"}}>
      <button onClick={onClose} style={{position:"absolute",top:12,right:12,background:"rgba(255,255,255,0.15)",border:"none",color:"#fff",width:32,height:32,borderRadius:"50%",cursor:"pointer",fontSize:16}}>✕</button>
      {badgeLabel&&<div style={{position:"absolute",top:12,left:12,background:"rgba(0,0,0,0.4)",backdropFilter:"blur(8px)",padding:"5px 12px",borderRadius:8,fontSize:11,fontWeight:700,color:"#fff",border:`1px solid ${headerColor}80`}}>{badgeIcon} {badgeLabel}</div>}
      <div style={{width:76,height:76,borderRadius:"50%",background:C.bg,border:`4px solid ${headerColor}40`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:800,color:headerColor,fontFamily:"'Bebas Neue',sans-serif",position:"absolute",bottom:-34,left:"50%",transform:"translateX(-50%)",boxShadow:"0 10px 30px rgba(0,0,0,0.4)"}}></div>
    </div>
    <div style={{padding:"44px 28px 0",textAlign:"center"}}>
      <h2 style={{fontSize:22,fontWeight:700,margin:0,color:C.text}}>{POS[p.position]||"Joueur"}</h2>
      <p style={{color:C.dim,fontSize:12,margin:"6px 0 0"}}>{p.city||"—"} {p.height_cm?`· ${p.height_cm}cm`:""}</p>
      {(p.region||p.mobile_other_regions)&&<div style={{marginTop:8,display:"flex",justifyContent:"center",gap:8,flexWrap:"wrap"}}>
        {p.region&&<span style={{fontSize:11,padding:"4px 10px",background:"rgba(255,255,255,0.05)",color:C.muted,borderRadius:6,fontWeight:600,border:`1px solid ${C.border}`}}>{getRegionLabel(p.region)}</span>}
        {p.mobile_other_regions&&<span style={{fontSize:11,padding:"4px 10px",background:C.greenBg,color:C.green,borderRadius:6,fontWeight:700,border:`1px solid ${C.green}30`}}>Mobile vers d&apos;autres régions</span>}
      </div>}
    </div>
    <div style={{padding:"16px 28px 28px"}}>
      <div style={{display:"flex",justifyContent:"space-around",background:`${C.primary}10`,borderRadius:14,padding:16,border:`1px solid ${C.primary}20`,marginBottom:16}}>
        {[["Niveau",LEVELS.find(l=>l.v===p.current_level)?.l||"—"],["Taille",p.height_cm?`${p.height_cm}cm`:"—"],["Main",p.hand_side||"—"]].map(([l,v])=><div key={l} style={{textAlign:"center"}}><div style={{fontSize:16,fontWeight:800,color:C.primary,fontFamily:"'Bebas Neue',sans-serif"}}>{v}</div><div style={{fontSize:9,color:C.muted,textTransform:"uppercase",fontWeight:600}}>{l}</div></div>)}
      </div>
      {p.bio&&<p style={{fontSize:13,color:C.muted,lineHeight:1.7,margin:"0 0 14px"}}>{p.bio}</p>}
      {p.is_available&&<div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",background:C.greenBg,borderRadius:10,border:`1px solid ${C.green}30`,marginBottom:14}}><div style={{width:8,height:8,borderRadius:"50%",background:C.green}}/><span style={{fontSize:12,color:C.green,fontWeight:600}}>Disponible pour un transfert</span></div>}
      <div style={{background:C.bgCard,borderRadius:12,padding:14,border:`1px solid ${C.border}`,marginBottom:14,textAlign:"center"}}>
        <p style={{fontSize:12,color:C.muted,margin:0}}>Les coordonnées sont accessibles après mise en relation</p>
      </div>
      <p style={{fontSize:10,color:C.dim,textAlign:"center",margin:"0 0 14px",padding:"8px 12px",background:`${C.primary}08`,borderRadius:8,border:`1px solid ${C.primary}10`,lineHeight:1.6}}>Handball Connect est une plateforme de mise en relation. Le contrat est conclu directement entre les parties.</p>
      {user?<ConnectButton otherId={p.id} user={user}/>:<Link href="/login" style={{display:"block",width:"100%",padding:"13px 0",borderRadius:12,background:`linear-gradient(135deg,${C.primary},${C.primaryDark})`,color:"#fff",fontSize:13,fontWeight:700,textAlign:"center",textDecoration:"none",boxShadow:`0 6px 20px ${C.primary}30`}}>Connectez-vous pour contacter</Link>}
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
          <Bdg color={ac}>{isTr?"Coach":"Joueur"}</Bdg>
          {isTr&&a.titre_required&&<Bdg color={a.titre_required==="titre5"?C.accent:C.green}>{a.titre_required==="titre5"?"Titre V":"Titre IV"}</Bdg>}
          {a.is_urgent&&<Bdg color={C.accent} filled>Urgent</Bdg>}
        </div>
        <h3 style={{margin:"0 0 3px",fontSize:15,fontWeight:700,color:C.text}}>{a.title}</h3>
        <p style={{margin:0,fontSize:12,color:ac,fontWeight:600,fontFamily:"monospace"}}>{a.club_name} · {a.division} · {a.city}</p>
      </div>
      <span style={{fontSize:11,color:C.dim,background:C.bgCard,padding:"4px 10px",borderRadius:20,whiteSpace:"nowrap",border:`1px solid ${C.border}`}}>{a.candidatures_count||0} cand.</span>
    </div>
    <p style={{fontSize:13,color:C.muted,margin:"8px 0 10px",lineHeight:1.6}}>{a.description}</p>
    {isTr&&a.salary_range&&<p style={{fontSize:12,color:C.accent,fontWeight:600,margin:"0 0 8px",fontFamily:"monospace"}}>{a.salary_range}</p>}
    {bens.length>0&&<div style={{display:"flex",gap:6,paddingTop:8,borderTop:`1px solid ${C.border}`}}>{bens.map(b=><span key={b} style={{fontSize:10,padding:"3px 8px",background:`${ac}10`,color:ac,borderRadius:6,fontWeight:600,border:`1px solid ${ac}18`}}>{BEN_ICO[b]||"•"} {b}</span>)}</div>}
  </div>
}

/* ═══════ ANNONCE MODAL ═══════ */
function AnnonceModal({annonce:a,onClose,user,profile,onApplied}){
  const [view,setView]=useState("details"); // "details" | "apply" | "done"
  const [hasApplied,setHasApplied]=useState(false);
  const [appLoading,setAppLoading]=useState(false);
  const [message,setMessage]=useState("");
  const [useProfileCv,setUseProfileCv]=useState(true);
  const [customCv,setCustomCv]=useState(null);
  const [submitting,setSubmitting]=useState(false);
  const [errMsg,setErrMsg]=useState("");

  useEffect(()=>{
    if(!a){ setView("details"); setHasApplied(false); setMessage(""); setCustomCv(null); setErrMsg(""); return; }
    if(!user) return;
    setAppLoading(true);
    supabase.from("applications").select("id").eq("annonce_id",a.id).eq("applicant_id",user.id).maybeSingle().then(({data})=>{ setHasApplied(!!data); setAppLoading(false); });
  },[a,user]);

  if(!a)return null;
  const isTr=a.type==="trainer";const ac=isTr?C.accent:C.primary;
  const bens=Array.isArray(a.benefits)?a.benefits:[];

  const submit=async()=>{
    setErrMsg("");
    setSubmitting(true);
    let cv_url=null,cv_filename=null;
    if(useProfileCv&&profile?.cv_url){ cv_url=profile.cv_url; cv_filename=profile.cv_filename||"cv.pdf"; }
    else if(customCv){
      if(customCv.type!=="application/pdf"){ setErrMsg("PDF uniquement"); setSubmitting(false); return; }
      if(customCv.size>5*1024*1024){ setErrMsg("Max 5 Mo"); setSubmitting(false); return; }
      const path=`${user.id}/apply-${a.id}-${Date.now()}.pdf`;
      const{error:upErr}=await supabase.storage.from("cvs").upload(path,customCv,{contentType:"application/pdf",upsert:false});
      if(upErr){ setErrMsg("Upload : "+upErr.message); setSubmitting(false); return; }
      const{data:pub}=supabase.storage.from("cvs").getPublicUrl(path);
      cv_url=pub?.publicUrl; cv_filename=customCv.name;
    }
    const{error:dbErr}=await supabase.from("applications").insert({
      annonce_id:a.id, applicant_id:user.id,
      message:message.trim()||null, cv_url, cv_filename,
    });
    if(dbErr){ setErrMsg(dbErr.message); setSubmitting(false); return; }
    setHasApplied(true); setView("done");
    onApplied&&onApplied(a.id);
    setSubmitting(false);
  };

  return <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",backdropFilter:"blur(12px)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20,animation:"fadeIn .2s ease"}}><div onClick={e=>e.stopPropagation()} style={{background:`linear-gradient(180deg,${C.surface},${C.bg})`,borderRadius:24,maxWidth:520,width:"100%",maxHeight:"90vh",overflowY:"auto",border:`1px solid ${C.border}`,animation:"modalUp .4s cubic-bezier(0.16,1,0.3,1)"}}>
    <div style={{padding:"24px 28px",background:`${ac}10`,borderBottom:`1px solid ${ac}20`,position:"relative"}}>
      <button onClick={onClose} style={{position:"absolute",top:16,right:16,background:"rgba(255,255,255,0.06)",border:"none",color:C.dim,width:32,height:32,borderRadius:"50%",cursor:"pointer",fontSize:16}}>✕</button>
      {view==="apply"&&<button onClick={()=>setView("details")} style={{position:"absolute",top:16,left:16,background:"rgba(255,255,255,0.06)",border:"none",color:C.dim,padding:"6px 12px",borderRadius:8,cursor:"pointer",fontSize:11,fontWeight:600}}>← Retour</button>}
      <div style={{paddingLeft:view==="apply"?70:0,transition:"padding .2s"}}>
        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8,flexWrap:"wrap"}}>
          <Bdg color={ac}>{isTr?"Coach":"Joueur"}</Bdg>
          {!isTr&&a.position&&<Bdg color={C.primary}>{POS[a.position]||a.position}</Bdg>}
          {a.is_urgent&&<Bdg color={C.accent} filled>Urgent</Bdg>}
        </div>
        <h2 style={{margin:"0 0 4px",fontSize:20,fontWeight:700,color:C.text}}>{a.title}</h2>
        <p style={{margin:0,fontSize:13,color:ac,fontWeight:600}}>{a.club_name} · {a.division} · {a.city}</p>
      </div>
    </div>

    {/* ── VIEW DETAILS ── */}
    {view==="details"&&<div style={{padding:28}}>
      <p style={{fontSize:14,color:C.muted,lineHeight:1.7,margin:"0 0 20px"}}>{a.description}</p>
      {isTr&&a.salary_range&&<div style={{background:`${C.accent}08`,borderRadius:12,padding:14,border:`1px solid ${C.accent}15`,marginBottom:18,textAlign:"center"}}><span style={{fontSize:11,color:C.dim,textTransform:"uppercase",letterSpacing:1.5}}>Rémunération</span><div style={{fontSize:20,color:C.accent,fontWeight:800,fontFamily:"'Bebas Neue',sans-serif",marginTop:4}}>{a.salary_range}</div></div>}
      {bens.length>0&&<div style={{marginBottom:20}}><p style={{fontSize:10,color:C.dim,textTransform:"uppercase",letterSpacing:2,marginBottom:8,fontWeight:600}}>Avantages</p><div style={{display:"flex",flexWrap:"wrap",gap:8}}>{bens.map(b=><span key={b} style={{padding:"6px 14px",background:`${ac}10`,color:ac,borderRadius:10,fontSize:12,fontWeight:600,border:`1px solid ${ac}18`}}>{BEN_ICO[b]||"•"} {b.charAt(0).toUpperCase()+b.slice(1)}</span>)}</div></div>}
      <p style={{fontSize:10,color:C.dim,textAlign:"center",margin:"0 0 16px",padding:"8px 12px",background:`${C.primary}08`,borderRadius:8,border:`1px solid ${C.primary}10`,lineHeight:1.6}}>Handball Connect est une plateforme de mise en relation. Le contrat est conclu directement entre les parties.</p>
      {!user&&<Link href="/login" style={{display:"block",width:"100%",padding:"14px 0",borderRadius:12,background:`linear-gradient(135deg,${ac},${isTr?"#991B1B":C.primaryDark})`,color:"#fff",fontSize:13,fontWeight:700,textAlign:"center",textDecoration:"none",boxShadow:`0 6px 20px ${ac}30`}}>Connectez-vous pour postuler</Link>}
      {user&&appLoading&&<div style={{textAlign:"center",padding:14,color:C.dim,fontSize:12}}>Chargement…</div>}
      {user&&!appLoading&&hasApplied&&<div style={{padding:"14px 16px",background:`${C.green}10`,border:`1px solid ${C.green}30`,borderRadius:12,textAlign:"center",color:C.green,fontSize:13,fontWeight:600,marginBottom:10}}>✓ Vous avez déjà postulé à cette annonce</div>}
      {user&&!appLoading&&!hasApplied&&<button onClick={()=>setView("apply")} style={{width:"100%",padding:"14px 0",border:"none",borderRadius:12,background:`linear-gradient(135deg,${ac},${isTr?"#991B1B":C.primaryDark})`,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",boxShadow:`0 6px 20px ${ac}30`,marginBottom:10}}>Postuler à cette annonce</button>}
      {user&&a.author_id&&user.id!==a.author_id&&<ConnectButton otherId={a.author_id} user={user} labelConnect="Contacter le club" labelChat="Discuter avec le club"/>}
    </div>}

    {/* ── VIEW APPLY (formulaire) ── */}
    {view==="apply"&&<div style={{padding:28}}>
      <h3 style={{margin:"0 0 4px",fontSize:16,fontWeight:700,color:C.text}}>Votre candidature</h3>
      <p style={{fontSize:12,color:C.dim,marginBottom:20}}>Le club recevra votre message, votre CV et un lien vers votre profil.</p>

      {/* Message */}
      <div style={{marginBottom:18}}>
        <label style={{fontSize:10,color:C.dim,textTransform:"uppercase",letterSpacing:1.5,fontWeight:600,marginBottom:6,display:"block"}}>Message au club (optionnel)</label>
        <textarea value={message} onChange={e=>setMessage(e.target.value)} placeholder={isTr?"Présentez votre parcours d'entraîneur, vos diplômes, votre approche…":"Présentez-vous, expliquez votre motivation, votre disponibilité…"} rows={5} maxLength={1000} style={{width:"100%",padding:"12px 14px",background:"rgba(255,255,255,0.04)",border:`1px solid ${C.border}`,borderRadius:10,color:C.text,fontSize:13,outline:"none",resize:"vertical",fontFamily:"inherit",lineHeight:1.6,boxSizing:"border-box"}}/>
        <div style={{textAlign:"right",fontSize:10,color:C.dim,marginTop:4}}>{message.length}/1000</div>
      </div>

      {/* CV */}
      <div style={{marginBottom:18}}>
        <label style={{fontSize:10,color:C.dim,textTransform:"uppercase",letterSpacing:1.5,fontWeight:600,marginBottom:6,display:"block"}}>CV joint</label>
        {profile?.cv_url&&<label style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",background:useProfileCv?`${C.primary}10`:"rgba(255,255,255,0.02)",border:`1px solid ${useProfileCv?C.primary+"40":C.border}`,borderRadius:10,cursor:"pointer",marginBottom:8,transition:"all .2s"}}>
          <input type="radio" checked={useProfileCv} onChange={()=>{setUseProfileCv(true);setCustomCv(null);}} style={{accentColor:C.primary}}/>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:12,color:C.text,fontWeight:600}}>Mon CV enregistré</div>
            <div style={{fontSize:10,color:C.dim,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{profile.cv_filename||"cv.pdf"}</div>
          </div>
        </label>}
        <label style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",background:!useProfileCv?`${C.primary}10`:"rgba(255,255,255,0.02)",border:`1px solid ${!useProfileCv?C.primary+"40":C.border}`,borderRadius:10,cursor:"pointer",transition:"all .2s"}}>
          {profile?.cv_url&&<input type="radio" checked={!useProfileCv} onChange={()=>setUseProfileCv(false)} style={{accentColor:C.primary}}/>}
          <div style={{flex:1}}>
            <div style={{fontSize:12,color:C.text,fontWeight:600}}>{profile?.cv_url?"Utiliser un autre CV (PDF)":"Joindre un CV (PDF, max 5 Mo)"}</div>
            {!useProfileCv&&customCv&&<div style={{fontSize:10,color:C.green,marginTop:2}}>✓ {customCv.name}</div>}
          </div>
          {!useProfileCv&&<span style={{padding:"6px 12px",background:`${C.primary}20`,color:C.primaryLight,borderRadius:6,fontSize:11,fontWeight:600,border:`1px solid ${C.primary}30`}}>Choisir</span>}
          <input type="file" accept="application/pdf" onChange={e=>{const f=e.target.files?.[0];if(f){setCustomCv(f);setUseProfileCv(false);}}} style={{display:"none"}}/>
        </label>
        {!profile?.cv_url&&!customCv&&<p style={{fontSize:11,color:C.dim,marginTop:8,lineHeight:1.5}}>Astuce : enregistrez un CV sur votre profil pour le pré-remplir automatiquement à chaque candidature.</p>}
      </div>

      {errMsg&&<div style={{padding:"10px 14px",background:`${C.accent}10`,border:`1px solid ${C.accent}30`,borderRadius:10,color:C.accent,fontSize:12,marginBottom:14}}>{errMsg}</div>}

      <button onClick={submit} disabled={submitting||(!useProfileCv&&customCv&&customCv.size>5*1024*1024)} style={{width:"100%",padding:"14px 0",border:"none",borderRadius:12,background:submitting?"rgba(255,255,255,0.08)":`linear-gradient(135deg,${ac},${isTr?"#991B1B":C.primaryDark})`,color:"#fff",fontSize:13,fontWeight:700,cursor:submitting?"wait":"pointer",boxShadow:submitting?"none":`0 6px 20px ${ac}30`,opacity:submitting?0.6:1}}>{submitting?"Envoi…":"Envoyer ma candidature"}</button>
    </div>}

    {/* ── VIEW DONE (confirmation) ── */}
    {view==="done"&&<div style={{padding:"40px 28px",textAlign:"center"}}>
      <div style={{fontSize:40,marginBottom:14}}>Candidature envoyée</div>
      <h3 style={{margin:"0 0 8px",fontSize:18,fontWeight:700,color:C.text}}>Candidature envoyée !</h3>
      <p style={{fontSize:13,color:C.muted,lineHeight:1.6,margin:"0 0 24px"}}>{a.club_name} recevra votre candidature et pourra la consulter dans son espace. Bonne chance !</p>
      <button onClick={onClose} style={{padding:"12px 28px",border:`1px solid ${C.border}`,borderRadius:10,background:"transparent",color:C.text,fontSize:13,fontWeight:600,cursor:"pointer"}}>Fermer</button>
    </div>}
  </div></div>
}

/* ═══════ CLUB CARD ═══════ */
function ClubCard({c,i,onClick}){
  const seeking=Array.isArray(c.seeking_positions)?c.seeking_positions:[];
  return <div onClick={()=>onClick&&onClick(c)} style={{background:C.bgCard,borderRadius:16,padding:20,border:`1px solid ${C.border}`,animation:`fadeUp .5s ease ${i*.05}s both`,transition:"all .25s",cursor:onClick?"pointer":"default"}} onMouseEnter={e=>{e.currentTarget.style.borderColor=C.borderBlue;if(onClick)e.currentTarget.style.transform="translateY(-2px)";}} onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.transform="";}}>
    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
      <div style={{width:46,height:46,borderRadius:12,background:`linear-gradient(135deg,${C.primary},${C.primaryDark})`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:14,fontFamily:"'Bebas Neue',sans-serif",letterSpacing:1}}>{(c.short_name||c.name||"?").slice(0,4)}</div>
      <div style={{flex:1}}>
        <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}><h3 style={{margin:0,fontSize:15,fontWeight:700,color:C.text}}>{c.name}</h3>{c.plan==="premium"&&<Bdg color={C.gold}></Bdg>}</div>
        <p style={{margin:"2px 0 0",fontSize:12,color:C.dim}}>{c.city} · {c.division}</p>
        {(c.founded_year||c.member_count)&&<p style={{margin:"2px 0 0",fontSize:10,color:C.muted,fontWeight:600}}>{c.founded_year&&<>Depuis {c.founded_year}</>}{c.founded_year&&c.member_count&&" · "}{c.member_count&&<>{c.member_count} licenciés</>}</p>}
      </div>
    </div>
    {seeking.length>0&&<div style={{marginBottom:12}}><p style={{fontSize:9,color:C.dim,textTransform:"uppercase",letterSpacing:1.5,marginBottom:6,fontWeight:600}}>Postes recherchés</p><div style={{display:"flex",flexWrap:"wrap",gap:6}}>{seeking.map(p=><Bdg key={p} color={C.primary}>{POS[p]||p}</Bdg>)}</div></div>}
    {c.motivation&&<p style={{fontSize:12,color:C.muted,lineHeight:1.5,margin:"0 0 10px",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{c.motivation}</p>}
    {(c.phone||c.email)&&<div style={{background:"rgba(0,0,0,0.15)",borderRadius:10,padding:10}}><div style={{fontSize:12,color:C.muted,display:"flex",flexDirection:"column",gap:4}}>{c.phone&&<span><span style={{fontFamily:"monospace"}}>{c.phone}</span></span>}{c.email&&<span><span style={{fontFamily:"monospace"}}>{c.email}</span></span>}</div></div>}
  </div>
}

/* ═══════ CLUB MODAL ═══════ */
function ClubModal({club:c,onClose,user}){
  if(!c)return null;
  const seeking=Array.isArray(c.seeking_positions)?c.seeking_positions:[];
  return <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",backdropFilter:"blur(12px)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20,animation:"fadeIn .2s ease"}}><div onClick={e=>e.stopPropagation()} style={{background:`linear-gradient(180deg,${C.surface},${C.bg})`,borderRadius:24,maxWidth:540,width:"100%",maxHeight:"90vh",overflowY:"auto",border:`1px solid ${C.border}`,animation:"modalUp .4s cubic-bezier(0.16,1,0.3,1)"}}>
    <div style={{padding:"24px 28px",background:`${C.primary}10`,borderBottom:`1px solid ${C.primary}20`,position:"relative"}}>
      <button onClick={onClose} style={{position:"absolute",top:16,right:16,background:"rgba(255,255,255,0.06)",border:"none",color:C.dim,width:32,height:32,borderRadius:"50%",cursor:"pointer",fontSize:16}}>✕</button>
      <div style={{display:"flex",alignItems:"center",gap:14}}>
        <div style={{width:56,height:56,borderRadius:14,background:`linear-gradient(135deg,${C.primary},${C.primaryDark})`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:18,fontFamily:"'Bebas Neue',sans-serif",letterSpacing:1,flexShrink:0}}>{(c.short_name||c.name||"?").slice(0,4)}</div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}><h2 style={{margin:0,fontSize:20,fontWeight:700,color:C.text}}>{c.name}</h2>{c.plan==="premium"&&<Bdg color={C.gold}></Bdg>}</div>
          <p style={{margin:"4px 0 0",fontSize:13,color:C.primaryLight,fontWeight:600}}>{c.city} · {c.division}</p>
        </div>
      </div>
    </div>
    <div style={{padding:28}}>
      {(c.founded_year||c.member_count)&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:18}}>
        {c.founded_year&&<div style={{padding:"14px 16px",background:"rgba(255,255,255,0.03)",borderRadius:12,border:`1px solid ${C.border}`,textAlign:"center"}}><div style={{fontSize:22,fontWeight:800,color:C.primary,fontFamily:"'Bebas Neue',sans-serif"}}>{c.founded_year}</div><div style={{fontSize:10,color:C.dim,textTransform:"uppercase",letterSpacing:1.5,fontWeight:600,marginTop:2}}>Année de création</div></div>}
        {c.member_count&&<div style={{padding:"14px 16px",background:"rgba(255,255,255,0.03)",borderRadius:12,border:`1px solid ${C.border}`,textAlign:"center"}}><div style={{fontSize:22,fontWeight:800,color:C.primary,fontFamily:"'Bebas Neue',sans-serif"}}>{c.member_count}</div><div style={{fontSize:10,color:C.dim,textTransform:"uppercase",letterSpacing:1.5,fontWeight:600,marginTop:2}}>Licenciés</div></div>}
      </div>}
      {c.goals&&<div style={{marginBottom:14,padding:"14px 16px",background:"rgba(255,255,255,0.02)",borderRadius:12,border:`1px solid ${C.border}`}}>
        <div style={{fontSize:10,color:C.dim,textTransform:"uppercase",letterSpacing:1.5,fontWeight:600,marginBottom:6}}>Objectifs du club</div>
        <p style={{fontSize:13,color:C.text,lineHeight:1.7,margin:0,whiteSpace:"pre-wrap"}}>{c.goals}</p>
      </div>}
      {c.motivation&&<div style={{marginBottom:14,padding:"14px 16px",background:`${C.primary}08`,borderRadius:12,border:`1px solid ${C.primary}20`}}>
        <div style={{fontSize:10,color:C.primaryLight,textTransform:"uppercase",letterSpacing:1.5,fontWeight:600,marginBottom:6}}>Pourquoi nous rejoindre</div>
        <p style={{fontSize:13,color:C.text,lineHeight:1.7,margin:0,whiteSpace:"pre-wrap"}}>{c.motivation}</p>
      </div>}
      {seeking.length>0&&<div style={{marginBottom:14}}>
        <p style={{fontSize:10,color:C.dim,textTransform:"uppercase",letterSpacing:2,marginBottom:8,fontWeight:600}}>Postes recherchés</p>
        <div style={{display:"flex",flexWrap:"wrap",gap:6}}>{seeking.map(p=><span key={p} style={{padding:"6px 14px",background:`${C.primary}15`,color:C.primaryLight,borderRadius:10,fontSize:12,fontWeight:600,border:`1px solid ${C.primary}30`}}>{POS[p]||p}</span>)}</div>
      </div>}
      {(c.phone||c.email)&&<div style={{padding:14,background:C.bgCard,borderRadius:12,border:`1px solid ${C.border}`,marginBottom:14}}>
        <div style={{fontSize:10,color:C.dim,textTransform:"uppercase",letterSpacing:1.5,fontWeight:600,marginBottom:8}}>Contact direct</div>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {c.phone&&<div style={{display:"flex",alignItems:"center",gap:10,fontSize:13}}><span style={{color:C.text,fontFamily:"monospace"}}>{c.phone}</span></div>}
          {c.email&&<div style={{display:"flex",alignItems:"center",gap:10,fontSize:13}}><span style={{color:C.text,fontFamily:"monospace"}}>{c.email}</span></div>}
        </div>
      </div>}
      {user&&c.owner_id&&user.id!==c.owner_id&&<ConnectButton otherId={c.owner_id} user={user} labelConnect="Contacter le club" labelChat="Discuter avec le club"/>}
      {!user&&<Link href="/login" style={{display:"block",width:"100%",padding:"13px 0",borderRadius:12,background:`linear-gradient(135deg,${C.primary},${C.primaryDark})`,color:"#fff",fontSize:13,fontWeight:700,textAlign:"center",textDecoration:"none",boxShadow:`0 6px 20px ${C.primary}30`}}>Connectez-vous pour contacter</Link>}
    </div>
  </div></div>
}

/* ═══════ JOB CARD ═══════ */
const CONTRACT_COLORS = { CDI:"#10B981", CDD:"#3B82F6", alternance:"#8B5CF6", stage:"#F59E0B", interim:"#EF4444", "mi-temps":"#06B6D4", "temps-partiel":"#06B6D4" };
const SECTOR_ICO = { sport:"", commerce:"", btp:"", restauration:"", securite:"", logistique:"", informatique:"", sante:"", education:"", industrie:"", transport:"", autre:"" };

function JobCard({j,i,onClick}){
  const ctColor=CONTRACT_COLORS[j.contract_type?.toLowerCase()]||C.primary;
  const sectorIcon=SECTOR_ICO[j.sector?.toLowerCase()]||"";
  return <div onClick={()=>onClick(j)} style={{background:C.bgCard,borderRadius:16,padding:20,border:`1px solid ${C.border}`,borderLeft:`3px solid ${ctColor}`,cursor:"pointer",transition:"all .25s ease",animation:`fadeUp .5s ease ${i*.05}s both`}} onMouseEnter={e=>{e.currentTarget.style.background=C.bgHover;e.currentTarget.style.transform="translateX(4px)"}} onMouseLeave={e=>{e.currentTarget.style.background=C.bgCard;e.currentTarget.style.transform=""}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12,marginBottom:8}}>
      <div style={{flex:1}}>
        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6,flexWrap:"wrap"}}>
          <Bdg color={ctColor}>{j.contract_type||"Contrat"}</Bdg>
          {j.sector&&<Bdg color={C.muted}>{sectorIcon} {j.sector}</Bdg>}
          {j.handball_compatible&&<Bdg color={C.green} filled>Compatible handball</Bdg>}
        </div>
        <h3 style={{margin:"0 0 3px",fontSize:15,fontWeight:700,color:C.text}}>{j.title}</h3>
        <p style={{margin:0,fontSize:12,color:ctColor,fontWeight:600,fontFamily:"monospace"}}>{j.company} · {j.city}</p>
      </div>
    </div>
    {j.description&&<p style={{fontSize:13,color:C.muted,margin:"8px 0 0",lineHeight:1.6,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{j.description}</p>}
    {j.club_name&&<p style={{fontSize:10,color:C.dim,margin:"8px 0 0",fontWeight:600}}>Proposé par {j.club_name}</p>}
    {j.schedule_info&&<p style={{fontSize:10,color:C.green,margin:"4px 0 0",fontWeight:600}}>{j.schedule_info}</p>}
  </div>
}

/* ═══════ JOB MODAL ═══════ */
function JobModal({job:j,onClose,user,onUpdate,onDelete}){
  const [mode,setMode]=useState("view"); // view | edit | confirm-delete | confirm-close
  const [editing,setEditing]=useState({});
  const [saving,setSaving]=useState(false);
  const [err,setErr]=useState("");

  useEffect(()=>{if(j){setMode("view");setEditing({...j});setErr("")}},[j]);

  if(!j)return null;
  const ctColor=CONTRACT_COLORS[j.contract_type?.toLowerCase()]||C.primary;
  const sectorIcon=SECTOR_ICO[j.sector?.toLowerCase()]||"";
  const isOwner=user&&j.author_id===user.id;

  const inpS={width:"100%",padding:"11px 14px",borderRadius:10,border:`1px solid ${C.border}`,background:"rgba(255,255,255,0.04)",color:"#fff",fontSize:13,outline:"none",fontFamily:"inherit",boxSizing:"border-box"};
  const lblS={fontSize:10,color:C.dim,textTransform:"uppercase",letterSpacing:1.5,fontWeight:600,marginBottom:4,display:"block"};

  const saveEdit=async()=>{
    setErr("");
    if(!editing.title?.trim()){setErr("Intitulé requis");return}
    if(!editing.company?.trim()){setErr("Entreprise requise");return}
    if(!editing.city?.trim()){setErr("Ville requise");return}
    setSaving(true);
    const{error}=await supabase.from("jobs").update({
      title:editing.title.trim(),company:editing.company.trim(),city:editing.city.trim(),
      contract_type:editing.contract_type,sector:editing.sector||null,
      salary_range:editing.salary_range?.trim()||null,description:editing.description?.trim()||null,
      handball_compatible:editing.handball_compatible||false,
      schedule_info:editing.schedule_info?.trim()||null,
      contact_email:editing.contact_email?.trim()||null,
    }).eq("id",j.id);
    setSaving(false);
    if(error){setErr(error.message);return}
    onUpdate&&onUpdate({...j,...editing});
    setMode("view");
  };

  const deleteJob=async()=>{
    setSaving(true);
    const{error}=await supabase.from("jobs").delete().eq("id",j.id);
    setSaving(false);
    if(error){setErr(error.message);return}
    onDelete&&onDelete(j.id);
    onClose();
  };

  const closeJob=async()=>{
    setSaving(true);
    // Mark as inactive
    const{error}=await supabase.from("jobs").update({is_active:false}).eq("id",j.id);
    setSaving(false);
    if(error){setErr(error.message);return}
    // Notify by email via API
    try{await fetch("/api/notify-job-closed",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({job_id:j.id,job_title:j.title,company:j.company})})}catch(e){}
    onDelete&&onDelete(j.id);
    onClose();
  };

  return <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",backdropFilter:"blur(12px)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20,animation:"fadeIn .2s ease"}}><div onClick={e=>e.stopPropagation()} style={{background:`linear-gradient(180deg,${C.surface},${C.bg})`,borderRadius:24,maxWidth:520,width:"100%",maxHeight:"90vh",overflowY:"auto",border:`1px solid ${C.border}`,animation:"modalUp .4s cubic-bezier(0.16,1,0.3,1)"}}>
    <div style={{padding:"24px 28px",background:`${ctColor}10`,borderBottom:`1px solid ${ctColor}20`,position:"relative"}}>
      <button onClick={onClose} style={{position:"absolute",top:16,right:16,background:"rgba(255,255,255,0.06)",border:"none",color:C.dim,width:32,height:32,borderRadius:"50%",cursor:"pointer",fontSize:16}}>✕</button>
      {mode==="edit"&&<button onClick={()=>setMode("view")} style={{position:"absolute",top:16,left:16,background:"rgba(255,255,255,0.06)",border:"none",color:C.dim,padding:"6px 12px",borderRadius:8,cursor:"pointer",fontSize:11,fontWeight:600}}>← Retour</button>}
      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8,flexWrap:"wrap"}}>
        <Bdg color={ctColor}>{j.contract_type||"Contrat"}</Bdg>
        {j.sector&&<Bdg color={C.muted}>{sectorIcon} {j.sector}</Bdg>}
        {j.handball_compatible&&<Bdg color={C.green} filled>Compatible handball</Bdg>}
      </div>
      <h2 style={{margin:"0 0 4px",fontSize:20,fontWeight:700,color:C.text}}>{mode==="edit"?"Modifier l'offre":j.title}</h2>
      <p style={{margin:0,fontSize:13,color:ctColor,fontWeight:600}}>{j.company} · {j.city}</p>
    </div>

    {/* ── VIEW MODE ── */}
    {mode==="view"&&<div style={{padding:28}}>
      {j.description&&<p style={{fontSize:14,color:C.muted,lineHeight:1.7,margin:"0 0 20px"}}>{j.description}</p>}
      {j.handball_compatible&&<div style={{display:"flex",alignItems:"center",gap:8,padding:"12px 16px",background:C.greenBg,borderRadius:12,border:`1px solid ${C.green}30`,marginBottom:16}}>
        
        <div>
          <div style={{fontSize:12,color:C.green,fontWeight:700}}>Compatible avec la pratique du handball</div>
          {j.schedule_info&&<div style={{fontSize:11,color:C.green,marginTop:2,opacity:.8}}>{j.schedule_info}</div>}
        </div>
      </div>}
      {j.salary_range&&<div style={{background:`${ctColor}08`,borderRadius:12,padding:14,border:`1px solid ${ctColor}15`,marginBottom:16,textAlign:"center"}}>
        <span style={{fontSize:11,color:C.dim,textTransform:"uppercase",letterSpacing:1.5}}>Rémunération</span>
        <div style={{fontSize:20,color:ctColor,fontWeight:800,fontFamily:"'Bebas Neue',sans-serif",marginTop:4}}>{j.salary_range}</div>
      </div>}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
        <div style={{padding:"12px 14px",background:"rgba(255,255,255,0.03)",borderRadius:10,border:`1px solid ${C.border}`}}>
          <div style={{fontSize:9,color:C.dim,textTransform:"uppercase",letterSpacing:1.5,fontWeight:600,marginBottom:4}}>Localisation</div>
          <div style={{fontSize:13,color:C.text,fontWeight:600}}>{j.city||"—"}</div>
        </div>
        <div style={{padding:"12px 14px",background:"rgba(255,255,255,0.03)",borderRadius:10,border:`1px solid ${C.border}`}}>
          <div style={{fontSize:9,color:C.dim,textTransform:"uppercase",letterSpacing:1.5,fontWeight:600,marginBottom:4}}>Contrat</div>
          <div style={{fontSize:13,color:ctColor,fontWeight:600}}>{j.contract_type||"—"}</div>
        </div>
      </div>
      {j.club_name&&<div style={{padding:"12px 16px",background:`${C.primary}08`,borderRadius:10,border:`1px solid ${C.primary}15`,marginBottom:16,display:"flex",alignItems:"center",gap:10}}>
        <span style={{fontSize:16}}></span>
        <div>
          <div style={{fontSize:10,color:C.dim,textTransform:"uppercase",letterSpacing:1,fontWeight:600}}>Proposé par le club</div>
          <div style={{fontSize:13,color:C.primaryLight,fontWeight:700}}>{j.club_name}</div>
        </div>
      </div>}
      <p style={{fontSize:10,color:C.dim,textAlign:"center",margin:"0 0 16px",padding:"8px 12px",background:`${C.primary}08`,borderRadius:8,border:`1px solid ${C.primary}10`,lineHeight:1.6}}>Handball Connect est une plateforme de mise en relation. Le contrat de travail est conclu directement entre le candidat et l'entreprise.</p>

      {/* Actions pour le propriétaire */}
      {isOwner&&<div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:16,padding:"16px",background:"rgba(255,255,255,0.02)",borderRadius:14,border:`1px solid ${C.border}`}}>
        <div style={{fontSize:10,color:C.dim,textTransform:"uppercase",letterSpacing:1.5,fontWeight:600,marginBottom:4}}>Gérer cette offre</div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>setMode("edit")} style={{flex:1,padding:"10px 0",border:`1px solid ${C.primary}30`,borderRadius:10,background:`${C.primary}10`,color:C.primaryLight,fontSize:12,fontWeight:600,cursor:"pointer"}}>Modifier</button>
          <button onClick={()=>setMode("confirm-close")} style={{flex:1,padding:"10px 0",border:`1px solid ${C.gold}30`,borderRadius:10,background:`${C.gold}10`,color:C.gold,fontSize:12,fontWeight:600,cursor:"pointer"}}>Clôturer</button>
          <button onClick={()=>setMode("confirm-delete")} style={{flex:1,padding:"10px 0",border:`1px solid ${C.accent}30`,borderRadius:10,background:`${C.accent}10`,color:C.accent,fontSize:12,fontWeight:600,cursor:"pointer"}}>Supprimer</button>
        </div>
      </div>}

      {/* Actions pour les candidats */}
      {!isOwner&&j.contact_email&&user&&<a href={`mailto:${j.contact_email}?subject=Candidature : ${j.title}`} style={{display:"block",width:"100%",padding:"14px 0",borderRadius:12,background:`linear-gradient(135deg,${ctColor},${ctColor}CC)`,color:"#fff",fontSize:13,fontWeight:700,textAlign:"center",textDecoration:"none",boxShadow:`0 6px 20px ${ctColor}30`,boxSizing:"border-box"}}>Postuler par email</a>}
      {!isOwner&&!j.contact_email&&user&&j.author_id&&<ConnectButton otherId={j.author_id} user={user} labelConnect="Contacter le club" labelChat="Discuter"/>}
      {!user&&<Link href="/login" style={{display:"block",width:"100%",padding:"13px 0",borderRadius:12,background:`linear-gradient(135deg,${ctColor},${ctColor}CC)`,color:"#fff",fontSize:13,fontWeight:700,textAlign:"center",textDecoration:"none",boxShadow:`0 6px 20px ${ctColor}30`}}>Connectez-vous pour postuler</Link>}
    </div>}

    {/* ── EDIT MODE ── */}
    {mode==="edit"&&<div style={{padding:28,display:"flex",flexDirection:"column",gap:14}}>
      <div><label style={lblS}>Intitulé du poste</label><input value={editing.title||""} onChange={e=>setEditing(p=>({...p,title:e.target.value}))} style={inpS}/></div>
      <div style={{display:"flex",gap:10}}>
        <div style={{flex:1}}><label style={lblS}>Entreprise</label><input value={editing.company||""} onChange={e=>setEditing(p=>({...p,company:e.target.value}))} style={inpS}/></div>
        <div style={{flex:1}}><label style={lblS}>Ville</label><input value={editing.city||""} onChange={e=>setEditing(p=>({...p,city:e.target.value}))} style={inpS}/></div>
      </div>
      <div style={{display:"flex",gap:10}}>
        <div style={{flex:1}}><label style={lblS}>Contrat</label><select value={editing.contract_type||"CDI"} onChange={e=>setEditing(p=>({...p,contract_type:e.target.value}))} style={{...inpS,cursor:"pointer"}}>{["CDI","CDD","alternance","stage","interim","mi-temps","temps-partiel"].map(v=><option key={v} value={v}>{v}</option>)}</select></div>
        <div style={{flex:1}}><label style={lblS}>Secteur</label><select value={editing.sector||""} onChange={e=>setEditing(p=>({...p,sector:e.target.value}))} style={{...inpS,cursor:"pointer"}}><option value="">—</option>{["sport","commerce","btp","restauration","securite","logistique","informatique","sante","education","industrie","transport","autre"].map(v=><option key={v} value={v}>{v}</option>)}</select></div>
      </div>
      <div><label style={lblS}>Rémunération</label><input value={editing.salary_range||""} onChange={e=>setEditing(p=>({...p,salary_range:e.target.value}))} placeholder="Ex: 1800€ - 2200€ brut/mois" style={inpS}/></div>
      <div><label style={lblS}>Description</label><textarea value={editing.description||""} onChange={e=>setEditing(p=>({...p,description:e.target.value}))} rows={4} style={{...inpS,resize:"vertical",lineHeight:1.6}}/></div>
      <div onClick={()=>setEditing(p=>({...p,handball_compatible:!p.handball_compatible}))} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:editing.handball_compatible?C.greenBg:"rgba(255,255,255,0.02)",border:`1px solid ${editing.handball_compatible?`${C.green}30`:C.border}`,borderRadius:10,cursor:"pointer"}}>
        <div style={{width:36,height:20,borderRadius:10,background:editing.handball_compatible?C.green:"rgba(255,255,255,0.1)",position:"relative"}}><div style={{width:16,height:16,borderRadius:"50%",background:"#fff",position:"absolute",top:2,left:editing.handball_compatible?18:2,transition:"left .2s"}}/></div>
        <span style={{fontSize:12,color:editing.handball_compatible?C.green:C.dim,fontWeight:600}}>Compatible handball</span>
      </div>
      {editing.handball_compatible&&<div><label style={lblS}>Précisions horaires</label><input value={editing.schedule_info||""} onChange={e=>setEditing(p=>({...p,schedule_info:e.target.value}))} placeholder="Ex: Mi-temps, libre le soir" style={inpS}/></div>}
      <div><label style={lblS}>Email de contact</label><input value={editing.contact_email||""} onChange={e=>setEditing(p=>({...p,contact_email:e.target.value}))} placeholder="rh@entreprise.fr" style={inpS}/></div>
      {err&&<div style={{padding:"8px 12px",borderRadius:8,background:`${C.accent}10`,border:`1px solid ${C.accent}30`,color:C.accent,fontSize:12}}> {err}</div>}
      <button onClick={saveEdit} disabled={saving} style={{padding:"13px 0",border:"none",borderRadius:12,background:saving?"rgba(255,255,255,0.06)":`linear-gradient(135deg,${C.primary},${C.primaryDark})`,color:"#fff",fontSize:13,fontWeight:700,cursor:saving?"wait":"pointer",opacity:saving?.6:1}}>{saving?"Enregistrement...":"Enregistrer les modifications"}</button>
    </div>}

    {/* ── CONFIRM DELETE ── */}
    {mode==="confirm-delete"&&<div style={{padding:"40px 28px",textAlign:"center"}}>
      <div style={{fontSize:20,marginBottom:14}}>Suppression</div>
      <h3 style={{margin:"0 0 8px",fontSize:18,fontWeight:700,color:C.text}}>Supprimer cette offre ?</h3>
      <p style={{fontSize:13,color:C.muted,lineHeight:1.6,margin:"0 0 24px"}}>Cette action est irréversible. L'offre sera définitivement supprimée.</p>
      {err&&<div style={{padding:"8px 12px",borderRadius:8,background:`${C.accent}10`,border:`1px solid ${C.accent}30`,color:C.accent,fontSize:12,marginBottom:14}}> {err}</div>}
      <div style={{display:"flex",gap:10}}>
        <button onClick={()=>setMode("view")} style={{flex:1,padding:"12px 0",border:`1px solid ${C.border}`,borderRadius:10,background:"transparent",color:C.text,fontSize:13,fontWeight:600,cursor:"pointer"}}>Annuler</button>
        <button onClick={deleteJob} disabled={saving} style={{flex:1,padding:"12px 0",border:"none",borderRadius:10,background:`linear-gradient(135deg,${C.accent},#991B1B)`,color:"#fff",fontSize:13,fontWeight:700,cursor:saving?"wait":"pointer",opacity:saving?.6:1}}>{saving?"Suppression...":"Confirmer la suppression"}</button>
      </div>
    </div>}

    {/* ── CONFIRM CLOSE (poste pourvu) ── */}
    {mode==="confirm-close"&&<div style={{padding:"40px 28px",textAlign:"center"}}>
      <div style={{fontSize:20,marginBottom:14}}>Clôture</div>
      <h3 style={{margin:"0 0 8px",fontSize:18,fontWeight:700,color:C.text}}>Clôturer cette offre ?</h3>
      <p style={{fontSize:13,color:C.muted,lineHeight:1.6,margin:"0 0 24px"}}>L'offre ne sera plus visible. Les candidats qui ont postulé seront notifiés que le poste n'est plus disponible.</p>
      {err&&<div style={{padding:"8px 12px",borderRadius:8,background:`${C.accent}10`,border:`1px solid ${C.accent}30`,color:C.accent,fontSize:12,marginBottom:14}}> {err}</div>}
      <div style={{display:"flex",gap:10}}>
        <button onClick={()=>setMode("view")} style={{flex:1,padding:"12px 0",border:`1px solid ${C.border}`,borderRadius:10,background:"transparent",color:C.text,fontSize:13,fontWeight:600,cursor:"pointer"}}>Annuler</button>
        <button onClick={closeJob} disabled={saving} style={{flex:1,padding:"12px 0",border:"none",borderRadius:10,background:`linear-gradient(135deg,${C.gold},#B45309)`,color:"#fff",fontSize:13,fontWeight:700,cursor:saving?"wait":"pointer",opacity:saving?.6:1}}>{saving?"Clôture...":"Confirmer la clôture"}</button>
      </div>
    </div>}
  </div></div>
}

/* ═══════ COACH CARD ═══════ */
function CoachCard({c,i,onClick}){
  const diploma=c.coach_diploma||"Non renseigné";
  const diplomaColor=diploma.includes("5")||diploma.includes("V")?C.accent:diploma.includes("4")||diploma.includes("IV")?C.green:C.primary;
  return <div onClick={()=>onClick(c)} style={{background:C.bgCard,borderRadius:18,overflow:"hidden",cursor:"pointer",border:`1px solid ${C.border}`,transition:"all .35s cubic-bezier(0.16,1,0.3,1)",position:"relative",animation:`fadeUp .5s ease ${i*.05}s both`}} onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-5px)";e.currentTarget.style.borderColor=`${C.accent}40`;e.currentTarget.style.boxShadow=`0 16px 48px ${C.accent}15`}} onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.borderColor=C.border;e.currentTarget.style.boxShadow=""}}>
    {c.is_available&&<div style={{position:"absolute",top:12,left:12,zIndex:2}}><Dot/></div>}
    <div style={{height:80,background:`linear-gradient(135deg,${C.accent},#991B1B)`,position:"relative"}}><div style={{width:56,height:56,borderRadius:"50%",background:C.bg,border:`3px solid ${C.accent}50`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,position:"absolute",bottom:-24,left:"50%",transform:"translateX(-50%)",boxShadow:"0 6px 20px rgba(0,0,0,0.4)"}}></div></div>
    <div style={{padding:"30px 16px 16px",textAlign:"center"}}>
      <h3 style={{margin:0,fontSize:14,fontWeight:700,color:C.text}}>Entraîneur</h3>
      <div style={{margin:"6px 0",display:"inline-flex",padding:"3px 10px",background:`${diplomaColor}15`,borderRadius:6,border:`1px solid ${diplomaColor}30`}}><span style={{fontSize:10,fontWeight:700,color:diplomaColor,textTransform:"uppercase",letterSpacing:.8}}>{diploma}</span></div>
      <p style={{fontSize:10,color:C.dim,margin:"4px 0"}}>{c.city||"—"}{c.region?` · ${getRegionLabel(c.region)}`:""}</p>
      {c.coach_experience&&<p style={{fontSize:10,color:C.muted,margin:"4px 0",lineHeight:1.4,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{c.coach_experience}</p>}
      {c.coach_results&&<p style={{fontSize:10,color:C.gold,margin:"4px 0",lineHeight:1.4,display:"-webkit-box",WebkitLineClamp:1,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{c.coach_results}</p>}
      <div style={{display:"flex",justifyContent:"center",gap:16,paddingTop:10,marginTop:10,borderTop:`1px solid ${C.border}`}}>
        {[["Diplôme",diploma],["Ville",c.city||"—"]].map(([l,v])=><div key={l} style={{textAlign:"center"}}><div style={{fontSize:13,fontWeight:800,color:C.text,fontFamily:"'Bebas Neue',sans-serif"}}>{v}</div><div style={{fontSize:8,color:C.dim,textTransform:"uppercase",letterSpacing:1.5,fontWeight:600}}>{l}</div></div>)}
      </div>
    </div>
  </div>
}

/* ═══════ COACH MODAL ═══════ */
function CoachModal({coach:c,onClose,user}){
  if(!c)return null;
  const diploma=c.coach_diploma||"Non renseigné";
  const diplomaColor=diploma.includes("5")||diploma.includes("V")?C.accent:diploma.includes("4")||diploma.includes("IV")?C.green:C.primary;
  return <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",backdropFilter:"blur(12px)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20,animation:"fadeIn .2s ease"}}><div onClick={e=>e.stopPropagation()} style={{background:`linear-gradient(180deg,${C.surface},${C.bg})`,borderRadius:24,maxWidth:500,width:"100%",overflow:"hidden",maxHeight:"90vh",overflowY:"auto",border:`1px solid ${C.border}`,animation:"modalUp .4s cubic-bezier(0.16,1,0.3,1)"}}>
    <div style={{height:120,background:`linear-gradient(135deg,${C.accent},#991B1B)`,position:"relative"}}>
      <button onClick={onClose} style={{position:"absolute",top:12,right:12,background:"rgba(255,255,255,0.15)",border:"none",color:"#fff",width:32,height:32,borderRadius:"50%",cursor:"pointer",fontSize:16}}>✕</button>
      <div style={{width:76,height:76,borderRadius:"50%",background:C.bg,border:`4px solid ${C.accent}40`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,position:"absolute",bottom:-34,left:"50%",transform:"translateX(-50%)",boxShadow:"0 10px 30px rgba(0,0,0,0.4)"}}></div>
    </div>
    <div style={{padding:"44px 28px 0",textAlign:"center"}}>
      <h2 style={{fontSize:22,fontWeight:700,margin:0,color:C.text}}>Entraîneur</h2>
      <div style={{margin:"8px 0",display:"inline-flex",padding:"4px 14px",background:`${diplomaColor}15`,borderRadius:8,border:`1px solid ${diplomaColor}30`}}><span style={{fontSize:12,fontWeight:700,color:diplomaColor,textTransform:"uppercase",letterSpacing:1}}>{diploma}</span></div>
      <p style={{color:C.dim,fontSize:12,margin:"6px 0 0"}}>{c.city||"—"}{c.region?` · ${getRegionLabel(c.region)}`:""}</p>
      {c.mobile_other_regions&&<div style={{marginTop:6}}><span style={{fontSize:11,padding:"4px 10px",background:C.greenBg,color:C.green,borderRadius:6,fontWeight:700,border:`1px solid ${C.green}30`}}>Mobile vers d&apos;autres régions</span></div>}
    </div>
    <div style={{padding:"16px 28px 28px"}}>
      {c.coach_experience&&<div style={{marginBottom:14,padding:"14px 16px",background:"rgba(255,255,255,0.02)",borderRadius:12,border:`1px solid ${C.border}`}}>
        <div style={{fontSize:10,color:C.dim,textTransform:"uppercase",letterSpacing:1.5,fontWeight:600,marginBottom:6}}>Expérience</div>
        <p style={{fontSize:13,color:C.text,lineHeight:1.7,margin:0,whiteSpace:"pre-wrap"}}>{c.coach_experience}</p>
      </div>}
      {c.coach_results&&<div style={{marginBottom:14,padding:"14px 16px",background:`${C.gold}08`,borderRadius:12,border:`1px solid ${C.gold}20`}}>
        <div style={{fontSize:10,color:C.gold,textTransform:"uppercase",letterSpacing:1.5,fontWeight:600,marginBottom:6}}>Résultats & Palmarès</div>
        <p style={{fontSize:13,color:C.text,lineHeight:1.7,margin:0,whiteSpace:"pre-wrap"}}>{c.coach_results}</p>
      </div>}
      {c.coach_specialty&&<div style={{marginBottom:14,padding:"14px 16px",background:`${C.accent}08`,borderRadius:12,border:`1px solid ${C.accent}20`}}>
        <div style={{fontSize:10,color:C.accentLight,textTransform:"uppercase",letterSpacing:1.5,fontWeight:600,marginBottom:6}}>Spécialité</div>
        <p style={{fontSize:13,color:C.text,lineHeight:1.7,margin:0}}>{c.coach_specialty}</p>
      </div>}
      {c.bio&&<p style={{fontSize:13,color:C.muted,lineHeight:1.7,margin:"0 0 14px"}}>{c.bio}</p>}
      {c.is_available&&<div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",background:C.greenBg,borderRadius:10,border:`1px solid ${C.green}30`,marginBottom:14}}><div style={{width:8,height:8,borderRadius:"50%",background:C.green}}/><span style={{fontSize:12,color:C.green,fontWeight:600}}>Disponible pour un poste</span></div>}
      <div style={{background:C.bgCard,borderRadius:12,padding:14,border:`1px solid ${C.border}`,marginBottom:14,textAlign:"center"}}>
        <p style={{fontSize:12,color:C.muted,margin:0}}>Les coordonnées sont accessibles après mise en relation</p>
      </div>
      <p style={{fontSize:10,color:C.dim,textAlign:"center",margin:"0 0 14px",padding:"8px 12px",background:`${C.primary}08`,borderRadius:8,border:`1px solid ${C.primary}10`,lineHeight:1.6}}>Handball Connect est une plateforme de mise en relation. Le contrat est conclu directement entre les parties.</p>
      {user?<ConnectButton otherId={c.id} user={user} labelConnect="Contacter l'entraîneur" labelChat="Discuter"/>:<Link href="/login" style={{display:"block",width:"100%",padding:"13px 0",borderRadius:12,background:`linear-gradient(135deg,${C.accent},#991B1B)`,color:"#fff",fontSize:13,fontWeight:700,textAlign:"center",textDecoration:"none",boxShadow:`0 6px 20px ${C.accent}30`}}>Connectez-vous pour contacter</Link>}
    </div>
  </div></div>
}

/* ═══════ PROFILE EDITOR ═══════ */
function ProfileEditor({profile,user,onSave,onToast}){
  const [form,setForm]=useState(profile||{});
  const [saving,setSaving]=useState(false);
  const upd=(k,v)=>setForm(p=>({...p,[k]:v}));
  const inpS={width:"100%",padding:"12px 16px",background:"rgba(255,255,255,0.04)",border:`1px solid ${C.border}`,borderRadius:12,color:C.text,fontSize:14,fontFamily:"inherit",outline:"none",boxSizing:"border-box",transition:"border-color .2s"};
  const lblS={fontSize:10,color:C.dim,textTransform:"uppercase",letterSpacing:1.5,fontWeight:600,marginBottom:6,display:"block"};

  const isClub=profile?.user_type==="club";
  const isCoach=profile?.user_type==="entraineur";

  const save=async()=>{
    setSaving(true);
    const fields={
      first_name:form.first_name,last_name:form.last_name,
      city:form.city||null,phone:form.phone||null,bio:form.bio||null,
      is_available:form.is_available||false,
    };
    if(isClub){
      fields.club_name=form.club_name||null;
      fields.club_website=form.club_website||null;
      fields.member_count=form.member_count?parseInt(form.member_count):null;
      fields.division=form.division||null;
      fields.goals=form.goals||null;
      fields.motivation=form.motivation||null;
    } else {
      fields.height_cm=form.height_cm?parseInt(form.height_cm):null;
      fields.weight_kg=form.weight_kg?parseInt(form.weight_kg):null;
      fields.age=form.age?parseInt(form.age):null;
      fields.position=form.position||null;
      fields.hand_side=form.hand_side||null;
      fields.best_level=form.best_level||null;
      fields.current_level=form.current_level||null;
      fields.current_club=form.current_club||null;
      fields.formation_origin=form.formation_origin||null;
      fields.searching_club=form.searching_club||false;
      fields.search_description=form.search_description||null;
      fields.search_region=form.search_region||null;
    }
    const {error}=await supabase.from("profiles").update(fields).eq("id",user.id);
    if(error){onToast(""+error.message)}else{onSave({...profile,...form});onToast("Profil mis a jour !")}
    setSaving(false);
  };

  const completionFields=isClub
    ?["first_name","last_name","club_name","city","division","member_count","goals","motivation"]
    :["first_name","last_name","height_cm","weight_kg","age","position","hand_side","best_level","current_level","city"];
  const completion=(()=>{const filled=completionFields.filter(f=>form[f]&&form[f]!=="").length;return Math.round((filled/completionFields.length)*100)})();

  return <div>
    {/* Completion */}
    <div style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:14,padding:"14px 20px",marginBottom:20,display:"flex",alignItems:"center",gap:16}}>
      <div style={{flex:1}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontSize:12,color:C.muted,fontWeight:600}}>Completion du profil</span><span style={{fontSize:12,color:completion===100?C.green:C.primary,fontWeight:700}}>{completion}%</span></div>
        <div style={{height:6,background:"rgba(255,255,255,0.06)",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:`${completion}%`,background:completion===100?C.green:`linear-gradient(90deg,${C.primary},${C.accent})`,borderRadius:3,transition:"width .6s ease"}}/></div>
      </div>
    </div>

    {/* Identity — commun a tous */}
    <h4 style={{fontSize:11,color:C.dim,textTransform:"uppercase",letterSpacing:2,marginBottom:12,fontWeight:600,borderBottom:`1px solid ${C.border}`,paddingBottom:8}}>Identite</h4>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:20}}>
      <div><label style={lblS}>Prenom</label><input value={form.first_name||""} onChange={e=>upd("first_name",e.target.value)} style={inpS} placeholder="Votre prenom"/></div>
      <div><label style={lblS}>Nom</label><input value={form.last_name||""} onChange={e=>upd("last_name",e.target.value)} style={inpS} placeholder="Votre nom"/></div>
      <div><label style={lblS}>Telephone</label><input value={form.phone||""} onChange={e=>upd("phone",e.target.value)} style={inpS} placeholder="06 12 34 56 78"/></div>
      <div><label style={lblS}>Ville</label><input value={form.city||""} onChange={e=>upd("city",e.target.value)} style={inpS} placeholder="Lyon"/></div>
    </div>

    {/* ═══ CLUB SPECIFIC ═══ */}
    {isClub&&<>
      <h4 style={{fontSize:11,color:C.dim,textTransform:"uppercase",letterSpacing:2,marginBottom:12,fontWeight:600,borderBottom:`1px solid ${C.border}`,paddingBottom:8}}>Informations du club</h4>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:20}}>
        <div><label style={lblS}>Nom du club</label><input value={form.club_name||""} onChange={e=>upd("club_name",e.target.value)} style={inpS} placeholder="Handball Club de Lyon"/></div>
        <div><label style={lblS}>Site web</label><input value={form.club_website||""} onChange={e=>upd("club_website",e.target.value)} style={inpS} placeholder="https://www.monclub.fr"/></div>
        <div><label style={lblS}>Division</label><select value={form.division||""} onChange={e=>upd("division",e.target.value)} style={{...inpS,cursor:"pointer"}}><option value="">-- Choisir --</option>{LEVELS.filter(l=>l.v).map(l=><option key={l.v} value={l.v}>{l.l}</option>)}</select></div>
        <div><label style={lblS}>Nombre de licencies</label><input type="number" value={form.member_count||""} onChange={e=>upd("member_count",e.target.value)} style={inpS} placeholder="150" min="1"/></div>
      </div>

      <h4 style={{fontSize:11,color:C.dim,textTransform:"uppercase",letterSpacing:2,marginBottom:12,fontWeight:600,borderBottom:`1px solid ${C.border}`,paddingBottom:8}}>Objectifs et motivation</h4>
      <div style={{display:"flex",flexDirection:"column",gap:14,marginBottom:20}}>
        <div><label style={lblS}>Objectifs du club</label><textarea value={form.goals||""} onChange={e=>upd("goals",e.target.value)} placeholder="Quels sont les objectifs sportifs de votre club cette saison ?" rows={3} style={{...inpS,resize:"vertical",lineHeight:1.6}}/></div>
        <div><label style={lblS}>Pourquoi rejoindre votre club</label><textarea value={form.motivation||""} onChange={e=>upd("motivation",e.target.value)} placeholder="Qu'est-ce qui rend votre club attractif pour un joueur ou entraineur ?" rows={3} style={{...inpS,resize:"vertical",lineHeight:1.6}}/></div>
      </div>
    </>}

    {/* ═══ JOUEUR SPECIFIC ═══ */}
    {!isClub&&!isCoach&&<>
      <h4 style={{fontSize:11,color:C.dim,textTransform:"uppercase",letterSpacing:2,marginBottom:12,fontWeight:600,borderBottom:`1px solid ${C.border}`,paddingBottom:8}}>Formation</h4>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:20}}>
        <div><label style={lblS}>Origine formation</label><select value={form.formation_origin||""} onChange={e=>upd("formation_origin",e.target.value)} style={{...inpS,cursor:"pointer"}}><option value="">Aucune / Classique</option><option value="pole_espoirs">Pole Espoirs</option><option value="centre_formation">Centre de formation pro</option><option value="section_sportive">Section sportive</option></select></div>
        <div><label style={lblS}>Club actuel</label><input value={form.current_club||""} onChange={e=>upd("current_club",e.target.value)} style={inpS} placeholder="AS Bondy"/></div>
      </div>

      <h4 style={{fontSize:11,color:C.dim,textTransform:"uppercase",letterSpacing:2,marginBottom:12,fontWeight:600,borderBottom:`1px solid ${C.border}`,paddingBottom:8}}>Caracteristiques</h4>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,marginBottom:20}}>
        <div><label style={lblS}>Taille (cm)</label><input type="number" value={form.height_cm||""} onChange={e=>upd("height_cm",e.target.value)} style={inpS} placeholder="185"/></div>
        <div><label style={lblS}>Poids (kg)</label><input type="number" value={form.weight_kg||""} onChange={e=>upd("weight_kg",e.target.value)} style={inpS} placeholder="82"/></div>
        <div><label style={lblS}>Main forte</label><select value={form.hand_side||""} onChange={e=>upd("hand_side",e.target.value)} style={{...inpS,cursor:"pointer"}}><option value="">-- Choisir --</option><option value="droitier">Droitier</option><option value="gaucher">Gaucher</option><option value="ambidextre">Ambidextre</option></select></div>
      </div>

      <h4 style={{fontSize:11,color:C.dim,textTransform:"uppercase",letterSpacing:2,marginBottom:12,fontWeight:600,borderBottom:`1px solid ${C.border}`,paddingBottom:8}}>Handball</h4>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,marginBottom:20}}>
        <div><label style={lblS}>Poste</label><select value={form.position||""} onChange={e=>upd("position",e.target.value)} style={{...inpS,cursor:"pointer"}}><option value="">-- Choisir --</option>{Object.entries(POS).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></div>
        <div><label style={lblS}>Meilleur niveau</label><select value={form.best_level||""} onChange={e=>upd("best_level",e.target.value)} style={{...inpS,cursor:"pointer"}}>{LEVELS.map(l=><option key={l.v} value={l.v}>{l.l}</option>)}</select></div>
        <div><label style={lblS}>Niveau actuel</label><select value={form.current_level||""} onChange={e=>upd("current_level",e.target.value)} style={{...inpS,cursor:"pointer"}}>{LEVELS.map(l=><option key={l.v} value={l.v}>{l.l}</option>)}</select></div>
      </div>
      <div style={{marginBottom:20}}>
        <label style={lblS}>Age</label><input type="number" value={form.age||""} onChange={e=>upd("age",e.target.value)} style={{...inpS,maxWidth:120}} placeholder="25" min="14" max="60"/>
      </div>

      <h4 style={{fontSize:11,color:C.dim,textTransform:"uppercase",letterSpacing:2,marginBottom:12,fontWeight:600,borderBottom:`1px solid ${C.border}`,paddingBottom:8}}>Recherche de club</h4>
      <div onClick={()=>upd("searching_club",!form.searching_club)} style={{display:"flex",alignItems:"center",gap:12,padding:"14px 18px",background:form.searching_club?"rgba(16,185,129,0.08)":"rgba(255,255,255,0.02)",border:`1px solid ${form.searching_club?"rgba(16,185,129,0.3)":C.border}`,borderRadius:12,cursor:"pointer",transition:"all .25s",marginBottom:14}}>
        <div style={{width:40,height:22,borderRadius:11,background:form.searching_club?C.green:"rgba(255,255,255,0.1)",position:"relative",transition:"background .25s"}}><div style={{width:18,height:18,borderRadius:"50%",background:"#fff",position:"absolute",top:2,left:form.searching_club?20:2,transition:"left .25s",boxShadow:"0 2px 4px rgba(0,0,0,0.2)"}}/></div>
        <div><div style={{fontSize:13,color:C.text,fontWeight:600}}>Je recherche un club</div><div style={{fontSize:11,color:C.muted,marginTop:2}}>{form.searching_club?"Visible dans les recherches de club":"Non visible"}</div></div>
      </div>
      {form.searching_club&&<div style={{display:"flex",flexDirection:"column",gap:14,marginBottom:20}}>
        <div><label style={lblS}>Description de votre recherche</label><textarea value={form.search_description||""} onChange={e=>upd("search_description",e.target.value)} placeholder="Decrivez ce que vous recherchez : type de club, niveau, ambitions..." rows={3} style={{...inpS,resize:"vertical",lineHeight:1.6}}/></div>
        <div><label style={lblS}>Region recherchee</label><select value={form.search_region||""} onChange={e=>upd("search_region",e.target.value)} style={{...inpS,cursor:"pointer"}}><option value="">Toutes regions</option>{REGIONS.map(r=><option key={r.id} value={r.id}>{r.label}</option>)}</select></div>
      </div>}
    </>}

    {/* ═══ COACH SPECIFIC ═══ */}
    {isCoach&&<>
      <h4 style={{fontSize:11,color:C.dim,textTransform:"uppercase",letterSpacing:2,marginBottom:12,fontWeight:600,borderBottom:`1px solid ${C.border}`,paddingBottom:8}}>Parcours entraineur</h4>
      <div style={{display:"flex",flexDirection:"column",gap:14,marginBottom:20}}>
        <div><label style={lblS}>Diplome</label><select value={form.coach_diploma||""} onChange={e=>upd("coach_diploma",e.target.value)} style={{...inpS,cursor:"pointer"}}><option value="">-- Choisir --</option><option value="Titre IV">Titre IV</option><option value="Titre V">Titre V</option><option value="BEF">BEF</option><option value="DEJEPS">DEJEPS</option><option value="DESJEPS">DESJEPS</option><option value="Autre">Autre</option></select></div>
        <div><label style={lblS}>Experience</label><textarea value={form.coach_experience||""} onChange={e=>upd("coach_experience",e.target.value)} placeholder="Decrivez votre parcours, les equipes entrainees..." rows={3} style={{...inpS,resize:"vertical",lineHeight:1.6}}/></div>
        <div><label style={lblS}>Resultats et palmares</label><textarea value={form.coach_results||""} onChange={e=>upd("coach_results",e.target.value)} placeholder="Montees, titres, performances notables..." rows={3} style={{...inpS,resize:"vertical",lineHeight:1.6}}/></div>
        <div><label style={lblS}>Specialite</label><input value={form.coach_specialty||""} onChange={e=>upd("coach_specialty",e.target.value)} style={inpS} placeholder="Ex: Formation des gardiens, preparation physique..."/></div>
      </div>
    </>}

    {/* Availability — commun */}
    <h4 style={{fontSize:11,color:C.dim,textTransform:"uppercase",letterSpacing:2,marginBottom:12,fontWeight:600,borderBottom:`1px solid ${C.border}`,paddingBottom:8}}>Disponibilite</h4>
    <div onClick={()=>upd("is_available",!form.is_available)} style={{display:"flex",alignItems:"center",gap:12,padding:"14px 18px",background:form.is_available?"rgba(16,185,129,0.08)":"rgba(255,255,255,0.02)",border:`1px solid ${form.is_available?"rgba(16,185,129,0.3)":C.border}`,borderRadius:12,cursor:"pointer",transition:"all .25s",marginBottom:20}}>
      <div style={{width:40,height:22,borderRadius:11,background:form.is_available?C.green:"rgba(255,255,255,0.1)",position:"relative",transition:"background .25s"}}><div style={{width:18,height:18,borderRadius:"50%",background:"#fff",position:"absolute",top:2,left:form.is_available?20:2,transition:"left .25s",boxShadow:"0 2px 4px rgba(0,0,0,0.2)"}}/></div>
      <div><div style={{fontSize:13,color:C.text,fontWeight:600}}>{isClub?"Nous recherchons activement des joueurs":"Je suis disponible pour un transfert"}</div><div style={{fontSize:11,color:C.muted,marginTop:2}}>{form.is_available?"Visible dans les recherches":"Non visible"}</div></div>
    </div>

    {/* Bio — commun */}
    <h4 style={{fontSize:11,color:C.dim,textTransform:"uppercase",letterSpacing:2,marginBottom:12,fontWeight:600,borderBottom:`1px solid ${C.border}`,paddingBottom:8}}>Presentation</h4>
    <textarea value={form.bio||""} onChange={e=>upd("bio",e.target.value)} placeholder={isClub?"Presentez votre club...":"Decrivez votre profil..."} rows={4} style={{...inpS,resize:"vertical",lineHeight:1.6,marginBottom:20}}/>

    {/* Save */}
    <div style={{display:"flex",justifyContent:"flex-end"}}>
      <button onClick={save} disabled={saving} style={{padding:"12px 32px",border:"none",borderRadius:12,background:`linear-gradient(135deg,${C.primary},${C.primaryDark})`,color:"#fff",fontSize:13,fontWeight:700,cursor:saving?"wait":"pointer",boxShadow:`0 6px 20px ${C.primary}30`,opacity:saving?.7:1}}>{saving?"Enregistrement...":"Enregistrer"}</button>
    </div>
  </div>
}

/* ═══════ PRICING TAB ═══════ */
function PricingTab(){
  return <div>
    <div style={{textAlign:"center",marginBottom:28}}><h2 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:36,letterSpacing:3,color:C.text,margin:"0 0 6px"}}>NOS <span style={{color:C.primary}}>OFFRES</span></h2><p style={{color:C.muted,fontSize:13}}>Tarifs annuels · Sans commission de transfert · Sans engagement</p></div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:16,marginBottom:24}}>
      {PRICING.map((p,i)=><div key={p.key} style={{background:p.pop?`${C.primary}08`:C.bgCard,borderRadius:20,padding:24,border:`1px solid ${p.pop?`${C.primary}30`:C.border}`,position:"relative",animation:`fadeUp .5s ease ${i*.08}s both`,transition:"all .25s"}} onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-4px)"}} onMouseLeave={e=>{e.currentTarget.style.transform=""}}>
        {p.pop&&<div style={{position:"absolute",top:-10,left:"50%",transform:"translateX(-50%)",background:`linear-gradient(135deg,${C.primary},${C.primaryDark})`,color:"#fff",fontSize:9,fontWeight:800,padding:"4px 14px",borderRadius:12,letterSpacing:1.5,textTransform:"uppercase"}}>Populaire</div>}
        <h3 style={{margin:"0 0 4px",fontSize:16,color:p.color,fontWeight:700,fontFamily:"'Bebas Neue',sans-serif",letterSpacing:2}}>{p.label.toUpperCase()}</h3>
        <p style={{margin:0,fontSize:12,color:C.dim}}>{p.desc}</p>
        <div style={{margin:"18px 0",display:"flex",alignItems:"baseline",gap:4}}><span style={{fontSize:42,fontWeight:800,color:C.text,fontFamily:"'Bebas Neue',sans-serif",lineHeight:1}}>{p.price}€</span><span style={{fontSize:13,color:C.dim}}>{p.per}</span></div>
        <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:18,minHeight:120}}>{p.feats.map(f=><div key={f} style={{display:"flex",alignItems:"flex-start",gap:8,fontSize:12}}><span style={{color:p.color||C.green,fontSize:12,marginTop:1}}>✓</span><span style={{color:C.muted}}>{f}</span></div>)}</div>
        <button style={{width:"100%",padding:"12px 0",border:"none",borderRadius:12,background:p.pop?`linear-gradient(135deg,${C.primary},${C.primaryDark})`:C.bgHover,color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer"}}>{p.price===0?"Commencer":"Choisir →"}</button>
      </div>)}
    </div>
    <p style={{fontSize:10,color:C.dim,textAlign:"center",padding:"12px 16px",background:`${C.primary}06`,borderRadius:10,border:`1px solid ${C.primary}10`,lineHeight:1.7}}>Handball Connect est une plateforme de mise en relation. Aucune commission sur les recrutements.</p>
  </div>
}

/* ═══════════════════════════════════════════════════════════ */
/* ═══════════════════════ MAIN APP ═════════════════════════ */
/* ═══════════════════════════════════════════════════════════ */
export default function HandballConnect(){
  const [tab,setTab]=useState("home");
  const [search,setSearch]=useState("");
  const [posF,setPosF]=useState("");
  const [regionF,setRegionF]=useState("");
  const [availF,setAvailF]=useState(false);
  const [aType,setAType]=useState("all");
  const [joueursView,setJoueursView]=useState("profils"); // profils | recherches
  const [selPlayer,setSelPlayer]=useState(null);
  const [selAnnonce,setSelAnnonce]=useState(null);
  const [selClub,setSelClub]=useState(null);
  const [selCoach,setSelCoach]=useState(null);
  const [selJob,setSelJob]=useState(null);
  const [toast,setToast]=useState("");
  const [user,setUser]=useState(null);
  const [profile,setProfile]=useState(null);
  const [authLoading,setAuthLoading]=useState(true);

  // Data from Supabase
  const [players,setPlayers]=useState([]);
  const [coaches,setCoaches]=useState([]);
  const [clubs,setClubs]=useState([]);
  const [jobs,setJobs]=useState([]);
  const [annonces,setAnnonces]=useState([]);
  const [dataLoading,setDataLoading]=useState(true);
  const [notifs,setNotifs]=useState([]);
  const [showNotifs,setShowNotifs]=useState(false);

  const flash=(m)=>{setToast(m);setTimeout(()=>setToast(""),3500)};

  // Fetch notifications (pending connections + unread messages)
  const loadNotifs=useCallback(async(uid)=>{
    if(!uid)return;
    const items=[];
    // Pending connection requests received
    const{data:conns}=await supabase.from("connections").select("*").eq("status","pending").or(`participant_a.eq.${uid},participant_b.eq.${uid}`).neq("requester_id",uid);
    if(conns){
      const otherIds=conns.map(c=>c.participant_a===uid?c.participant_b:c.participant_a);
      let profMap={};
      if(otherIds.length>0){
        const{data:profs}=await supabase.from("profiles").select("id,first_name,last_name,user_type").in("id",otherIds);
        if(profs) profs.forEach(p=>{profMap[p.id]=p});
      }
      conns.forEach(c=>{
        const otherId=c.participant_a===uid?c.participant_b:c.participant_a;
        const p=profMap[otherId]||{};
        items.push({type:"connection",id:c.id,connId:c.id,otherId,name:`${p.first_name||""} ${p.last_name||""}`.trim()||"Utilisateur",userType:p.user_type,created:c.created_at});
      });
    }
    // Unread conversations
    const{data:convs}=await supabase.from("conversations").select("*").or(`participant_a.eq.${uid},participant_b.eq.${uid}`);
    if(convs){
      convs.forEach(c=>{
        const unread=c.participant_a===uid?c.unread_a:c.unread_b;
        if(unread>0){
          const otherId=c.participant_a===uid?c.participant_b:c.participant_a;
          items.push({type:"message",id:c.id,otherId,unread,lastMsg:c.last_message,created:c.last_message_at});
        }
      });
    }
    // Applications received (for clubs)
    const{data:prof}=await supabase.from("profiles").select("user_type").eq("id",uid).single();
    if(prof?.user_type==="club"){
      const{data:myAnnonces}=await supabase.from("annonces").select("id,title").eq("author_id",uid);
      if(myAnnonces&&myAnnonces.length>0){
        const annonceIds=myAnnonces.map(a=>a.id);
        const{data:apps}=await supabase.from("applications").select("id,annonce_id,created_at").in("annonce_id",annonceIds).order("created_at",{ascending:false}).limit(10);
        if(apps){
          const titleMap={};myAnnonces.forEach(a=>{titleMap[a.id]=a.title});
          apps.forEach(a=>{
            items.push({type:"application",id:a.id,annonceTitle:titleMap[a.annonce_id]||"Annonce",created:a.created_at});
          });
        }
      }
    }
    items.sort((a,b)=>new Date(b.created)-new Date(a.created));
    setNotifs(items);
  },[]);

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

  // Load notifications when user is available
  useEffect(()=>{
    if(user){loadNotifs(user.id);const iv=setInterval(()=>loadNotifs(user.id),20000);return()=>clearInterval(iv)}
  },[user,loadNotifs]);

  // Fetch data
  useEffect(()=>{
    const fetchAll=async()=>{
      const[{data:pl},{data:co},{data:cl},{data:an},{data:jo}]=await Promise.all([
        supabase.from("profiles").select("*").eq("user_type","joueur"),
        supabase.from("profiles").select("*").eq("user_type","entraineur"),
        supabase.from("clubs").select("*"),
        supabase.from("annonces").select("*").order("created_at",{ascending:false}),
        supabase.from("jobs").select("*").order("created_at",{ascending:false}),
      ]);
      setPlayers(pl||[]);
      setCoaches(co||[]);
      setClubs(cl||[]);
      setJobs(jo||[]);
      setAnnonces(an||[]);
      setDataLoading(false);
    };
    fetchAll();
  },[]);

  const handleLogout=async()=>{await supabase.auth.signOut();window.location.href="/login"};

  // Filters
  const fPlayers=useMemo(()=>players.filter(p=>{
    if(posF&&p.position!==posF)return false;
    if(availF&&!p.is_available)return false;
    // Filtre région : inclut les joueurs de la région OU les joueurs mobiles vers d'autres régions
    if(regionF&&p.region!==regionF&&!p.mobile_other_regions)return false;
    if(search)return`${p.first_name||""} ${p.last_name||""} ${p.city||""} ${p.current_club||""}`.toLowerCase().includes(search.toLowerCase());
    return true;
  }).sort((a,b)=>(POS_ORDER[a.position]??99)-(POS_ORDER[b.position]??99)),[players,search,posF,availF,regionF]);

  // Découpage joueurs en sections
  const playerSections=useMemo(()=>{
    const formation=[],center=[],young=[],senior=[],searching=[];
    for(const p of fPlayers){
      if(p.searching_club) searching.push(p);
      if(p.formation_origin==="pole_espoirs"||p.formation_origin==="centre_formation") formation.push(p);
      else if(p.training_center||p.is_section_sportive) center.push(p);
      else if(p.age&&p.age<18) young.push(p);
      else senior.push(p);
    }
    return {formation,center,young,senior,searching};
  },[fPlayers]);

  const fAnnonces=useMemo(()=>annonces.filter(a=>{
    if(aType!=="all"&&a.type!==aType)return false;
    if(search)return`${a.title} ${a.club_name||""} ${a.city||""}`.toLowerCase().includes(search.toLowerCase());
    return true;
  }),[annonces,search,aType]);

  const fClubs=useMemo(()=>clubs.filter(c=>search?`${c.name} ${c.city||""}`.toLowerCase().includes(search.toLowerCase()):true),[clubs,search]);

  const fJobs=useMemo(()=>jobs.filter(j=>{
    if(search)return`${j.title||""} ${j.company||""} ${j.city||""} ${j.sector||""} ${j.contract_type||""}`.toLowerCase().includes(search.toLowerCase());
    return true;
  }),[jobs,search]);

  const fCoaches=useMemo(()=>coaches.filter(c=>{
    if(search)return`${c.city||""} ${c.coach_diploma||""} ${c.coach_experience||""} ${c.coach_results||""}`.toLowerCase().includes(search.toLowerCase());
    return true;
  }),[coaches,search]);

  const tabs=[
    {k:"annonces",l:"Annonces",i:""},
    {k:"joueurs",l:"Joueurs",i:""},
    {k:"coachs",l:"Coachs",i:""},
    {k:"emploi",l:"Emploi",i:""},
  ];

  const inpS={padding:"11px 14px",background:"rgba(255,255,255,0.04)",border:`1px solid ${C.border}`,borderRadius:10,color:C.text,fontSize:13,outline:"none",transition:"all .2s",width:"100%",boxSizing:"border-box"};

  const css=`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');*{box-sizing:border-box;margin:0;padding:0}@keyframes slideDown{from{opacity:0;transform:translateY(-12px)}to{opacity:1;transform:translateY(0)}}@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}@keyframes modalUp{from{opacity:0;transform:translateY(24px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}@keyframes pulse{0%,100%{box-shadow:0 4px 14px rgba(255,107,53,0.3)}50%{box-shadow:0 4px 24px rgba(255,107,53,0.6)}}input:focus,select:focus,textarea:focus{border-color:${C.primary}!important;box-shadow:0 0 0 3px ${C.primary}15!important}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:4px}`;

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
            <img src="/logo.png" alt="Handball Connect" style={{width:36,height:36,borderRadius:8,objectFit:"cover"}}/>
            <h1 style={{fontSize:20,fontFamily:"'Bebas Neue',sans-serif",letterSpacing:3,color:"#fff",lineHeight:1,cursor:"pointer"}} onClick={()=>{setTab("home");setSearch("")}}>HANDBALL <span style={{color:C.primary}}>CONNECT</span></h1>
            <span style={{fontSize:8,color:C.dim,background:C.bgCard,padding:"2px 7px",borderRadius:5,fontWeight:600,letterSpacing:1,border:`1px solid ${C.border}`}}>BETA</span>
          </div>
          <nav style={{display:"flex",gap:2}}>{tabs.map(t=><button key={t.k} onClick={()=>{setTab(t.k);setSearch("");setPosF("");setRegionF("");setAType("all")}} style={{padding:"7px 12px",border:"none",borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:600,transition:"all .2s",background:tab===t.k?`${C.primary}18`:"transparent",color:tab===t.k?C.primaryLight:C.dim,whiteSpace:"nowrap"}}>{t.l}</button>)}</nav>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            {user?(
              <>
                <a href="/soutenir" style={{padding:"6px 14px",border:"none",borderRadius:8,background:"linear-gradient(135deg,#FF6B35,#C13C00)",color:"#fff",fontSize:11,fontWeight:700,textDecoration:"none",display:"flex",alignItems:"center",gap:5,boxShadow:"0 4px 14px rgba(255,107,53,0.3)",animation:"pulse 3s infinite",whiteSpace:"nowrap"}}>Soutenir le projet</a>
                <div style={{position:"relative"}}>
                  <button onClick={()=>setShowNotifs(!showNotifs)} style={{padding:"6px 12px",border:`1px solid ${notifs.length>0?`${C.accent}40`:C.border}`,borderRadius:8,background:showNotifs?`${C.primary}18`:notifs.length>0?`${C.accent}08`:"rgba(255,255,255,0.04)",color:showNotifs?C.primaryLight:notifs.length>0?C.accent:C.muted,fontSize:11,fontWeight:600,cursor:"pointer",position:"relative",transition:"all .2s"}}>
                    Notifications{notifs.length>0&&<span style={{marginLeft:6,display:"inline-flex",alignItems:"center",justifyContent:"center",width:18,height:18,borderRadius:"50%",background:C.accent,color:"#fff",fontSize:10,fontWeight:800}}>{notifs.length>9?"9+":notifs.length}</span>}
                  </button>
                  {showNotifs&&<div style={{position:"absolute",top:"100%",right:0,marginTop:8,width:360,maxHeight:440,overflowY:"auto",background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,boxShadow:"0 20px 60px rgba(0,0,0,0.5)",zIndex:200,animation:"modalUp .2s ease"}}>
                    <div style={{padding:"14px 18px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <span style={{fontSize:14,fontWeight:700,color:C.text}}>Notifications</span>
                      <span style={{fontSize:11,color:C.dim}}>{notifs.length} nouvelle{notifs.length>1?"s":""}</span>
                    </div>
                    {notifs.length===0&&<div style={{padding:"30px 18px",textAlign:"center",color:C.dim,fontSize:12}}>Aucune notification</div>}
                    {notifs.map(n=>(
                      <div key={`${n.type}-${n.id}`} style={{padding:"12px 18px",borderBottom:`1px solid ${C.border}`,transition:"background .15s",cursor:n.type==="message"?"pointer":"default"}}
                        onMouseEnter={e=>{e.currentTarget.style.background=C.bgHover}}
                        onMouseLeave={e=>{e.currentTarget.style.background="transparent"}}
                        onClick={()=>{if(n.type==="message"){window.dispatchEvent(new CustomEvent("hc-open-chat",{detail:{otherUserId:n.otherId}}));setShowNotifs(false)}}}
                      >
                        {n.type==="connection"&&<div>
                          <div style={{fontSize:12,color:C.text,fontWeight:600,marginBottom:4}}>{n.name} souhaite se connecter</div>
                          <div style={{fontSize:10,color:C.dim,marginBottom:8}}>{n.userType==="club"?"Club":n.userType==="entraineur"?"Entraineur":"Joueur"} — {new Date(n.created).toLocaleDateString("fr-FR")}</div>
                          <div style={{display:"flex",gap:6}}>
                            <button onClick={async(e)=>{e.stopPropagation();await supabase.from("connections").update({status:"accepted",responded_at:new Date().toISOString()}).eq("id",n.connId);loadNotifs(user.id);flash("Connexion acceptee")}} style={{flex:1,padding:"7px 0",border:"none",borderRadius:8,background:`linear-gradient(135deg,${C.green},#059669)`,color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer"}}>Accepter</button>
                            <button onClick={async(e)=>{e.stopPropagation();await supabase.from("connections").update({status:"rejected",responded_at:new Date().toISOString()}).eq("id",n.connId);loadNotifs(user.id)}} style={{flex:1,padding:"7px 0",border:`1px solid ${C.accent}30`,borderRadius:8,background:`${C.accent}10`,color:C.accent,fontSize:11,fontWeight:600,cursor:"pointer"}}>Refuser</button>
                          </div>
                        </div>}
                        {n.type==="message"&&<div>
                          <div style={{fontSize:12,color:C.text,fontWeight:600,marginBottom:2}}>Nouveau message ({n.unread})</div>
                          <div style={{fontSize:11,color:C.muted,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{n.lastMsg||"..."}</div>
                        </div>}
                        {n.type==="application"&&<div>
                          <div style={{fontSize:12,color:C.text,fontWeight:600,marginBottom:2}}>Nouvelle candidature</div>
                          <div style={{fontSize:11,color:C.muted}}>Pour : {n.annonceTitle}</div>
                          <div style={{fontSize:10,color:C.dim,marginTop:2}}>{new Date(n.created).toLocaleDateString("fr-FR")}</div>
                        </div>}
                      </div>
                    ))}
                  </div>}
                </div>
                <button onClick={()=>{setTab("profil");setSearch("")}} style={{padding:"6px 14px",border:`1px solid ${tab==="profil"?`${C.primary}50`:C.border}`,borderRadius:8,background:tab==="profil"?`${C.primary}18`:"rgba(255,255,255,0.04)",color:tab==="profil"?C.primaryLight:C.muted,fontSize:11,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:6,transition:"all .2s"}}>{profile?.first_name||"Mon profil"}</button>
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

        {/* Home — 4 blocs */}
        {tab==="home"&&(
          <div style={{animation:"fadeUp .4s ease"}}>
            <div style={{textAlign:"center",marginBottom:36,paddingTop:20}}>
              <img src="/logo.png" alt="Handball Connect" style={{width:80,height:80,borderRadius:16,objectFit:"cover",marginBottom:16,boxShadow:"0 12px 40px rgba(255,107,53,0.15)"}}/>
              <h2 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:32,letterSpacing:4,color:C.text,margin:"0 0 8px"}}>HANDBALL <span style={{color:C.primary}}>CONNECT</span></h2>
              <p style={{fontSize:13,color:C.muted,maxWidth:400,margin:"0 auto",lineHeight:1.6}}>Connectons le handball amateur avec le monde professionnel</p>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(2, 1fr)",gap:16,maxWidth:700,margin:"0 auto"}}>
              {[
                {k:"annonces",title:"Annonces",desc:"Consultez les offres de recrutement des clubs et postulez directement.",color:C.primary,count:annonces.length,label:"annonces actives"},
                {k:"joueurs",title:"Joueurs",desc:"Parcourez les profils de joueurs disponibles pour un transfert.",color:C.primaryLight,count:players.length,label:"joueurs inscrits"},
                {k:"coachs",title:"Coachs",desc:"Trouvez un entraineur qualifie ou proposez vos services.",color:C.accent,count:coaches.length,label:"entraineurs inscrits"},
                {k:"emploi",title:"Emploi",desc:"Decouvrez les offres d'emploi partenaires proposees par les clubs.",color:C.green,count:jobs.length,label:"offres disponibles"},
              ].map((item,i)=>(
                <div key={item.k} onClick={()=>{setTab(item.k);setSearch("")}} style={{
                  background:C.bgCard,borderRadius:18,padding:"28px 24px",border:`1px solid ${C.border}`,
                  cursor:"pointer",transition:"all .3s cubic-bezier(0.16,1,0.3,1)",
                  animation:`fadeUp .5s ease ${i*.08}s both`,position:"relative",overflow:"hidden",
                }}
                  onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-6px)";e.currentTarget.style.borderColor=`${item.color}40`;e.currentTarget.style.boxShadow=`0 16px 48px ${item.color}12`}}
                  onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.borderColor=C.border;e.currentTarget.style.boxShadow=""}}
                >
                  <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:`linear-gradient(90deg,${item.color},transparent)`,borderRadius:"18px 18px 0 0"}}/>
                  <h3 style={{margin:"0 0 8px",fontSize:18,fontWeight:700,color:C.text,fontFamily:"'Bebas Neue',sans-serif",letterSpacing:2}}>{item.title}</h3>
                  <p style={{margin:"0 0 16px",fontSize:12,color:C.muted,lineHeight:1.6}}>{item.desc}</p>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <span style={{fontSize:11,color:item.color,fontWeight:600}}>{item.count} {item.label}</span>
                    <span style={{fontSize:12,color:item.color,fontWeight:700}}>Voir →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        {tab!=="tarifs"&&tab!=="profil"&&tab!=="home"&&(
          <div style={{marginBottom:18,animation:"fadeUp .3s ease"}}>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher..." style={{...inpS,flex:"1 1 200px",width:"auto"}}/>
              {tab==="joueurs"&&<select value={posF} onChange={e=>setPosF(e.target.value)} style={{...inpS,minWidth:140,width:"auto"}}><option value="">Tous postes</option>{Object.entries(POS).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select>}
              {tab==="joueurs"&&<select value={regionF} onChange={e=>setRegionF(e.target.value)} style={{...inpS,minWidth:170,width:"auto"}} title="Inclut les joueurs mobiles vers d'autres régions"><option value="">Toutes régions</option>{REGIONS.map(r=><option key={r.id} value={r.id}>{r.label}</option>)}</select>}
              {tab==="joueurs"&&<button onClick={()=>setAvailF(!availF)} style={{padding:"11px 14px",border:`1px solid ${availF?`${C.green}40`:C.border}`,borderRadius:10,fontSize:12,fontWeight:600,cursor:"pointer",background:availF?C.greenBg:"transparent",color:availF?C.green:C.dim}}>Disponibles</button>}
              {tab==="annonces"&&profile?.user_type==="club"&&<Link href="/publier-annonce" style={{padding:"11px 18px",borderRadius:10,background:`linear-gradient(135deg,${C.green},#047857)`,color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer",textDecoration:"none",boxShadow:`0 4px 14px ${C.green}35`,whiteSpace:"nowrap",display:"inline-flex",alignItems:"center",gap:6,border:"none"}}>Publier une annonce</Link>}
              {tab==="emploi"&&profile?.user_type==="club"&&<Link href="/publier-emploi" style={{padding:"11px 18px",borderRadius:10,background:`linear-gradient(135deg,${C.green},#047857)`,color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer",textDecoration:"none",boxShadow:`0 4px 14px ${C.green}35`,whiteSpace:"nowrap",display:"inline-flex",alignItems:"center",gap:6,border:"none"}}>Publier une offre d&apos;emploi</Link>}
            </div>
            {tab==="annonces"&&<div style={{display:"flex",gap:6,marginTop:10}}>{[["all","Toutes"],["player","Joueurs"],["trainer","Coachs"]].map(([k,l])=><button key={k} onClick={()=>setAType(k)} style={{padding:"6px 12px",border:`1px solid ${aType===k?`${C.primary}40`:C.border}`,borderRadius:8,fontSize:11,fontWeight:600,cursor:"pointer",background:aType===k?`${C.primary}15`:"transparent",color:aType===k?C.primaryLight:C.dim}}>{l}</button>)}</div>}
            {tab==="joueurs"&&<div style={{display:"flex",gap:6,marginTop:10}}>{[["profils","Profils joueurs"],["recherches","Recherches de club"]].map(([k,l])=><button key={k} onClick={()=>setJoueursView(k)} style={{padding:"6px 12px",border:`1px solid ${joueursView===k?`${C.primary}40`:C.border}`,borderRadius:8,fontSize:11,fontWeight:600,cursor:"pointer",background:joueursView===k?`${C.primary}15`:"transparent",color:joueursView===k?C.primaryLight:C.dim}}>{l}{k==="recherches"&&playerSections.searching.length>0&&<span style={{marginLeft:6,padding:"1px 6px",borderRadius:10,background:`${C.accent}20`,color:C.accent,fontSize:10,fontWeight:700}}>{playerSections.searching.length}</span>}</button>)}</div>}
          </div>
        )}

        {/* Loading */}
        {dataLoading&&tab!=="profil"&&tab!=="tarifs"&&tab!=="home"&&<div style={{textAlign:"center",padding:60,color:C.dim}}>Chargement des données...</div>}

        {/* Annonces */}
        {tab==="annonces"&&!dataLoading&&(
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {fAnnonces.length>0?fAnnonces.map((a,i)=><AnnonceCard key={a.id} a={a} i={i} onClick={setSelAnnonce}/>):<div style={{textAlign:"center",padding:50,color:C.dim}}><p>Aucune annonce pour le moment</p>{user&&<p style={{fontSize:12,color:C.primary,marginTop:8}}>Vous pouvez publier la premiere !</p>}</div>}
          </div>
        )}

        {/* Joueurs */}
        {tab==="joueurs"&&!dataLoading&&joueursView==="profils"&&(()=>{
          const sectionHeader=(title,subtitle,color,count)=><div style={{display:"flex",alignItems:"baseline",gap:12,marginBottom:14,padding:"0 4px"}}>
            <h2 style={{margin:0,fontFamily:"'Bebas Neue',sans-serif",fontSize:24,letterSpacing:3,color:C.text}}><span style={{color}}>{title}</span></h2>
            <span style={{fontSize:11,color:C.dim,fontWeight:600}}>· {count} {count>1?"joueurs":"joueur"}</span>
            <span style={{fontSize:11,color:C.muted,fontStyle:"italic",marginLeft:"auto"}}>{subtitle}</span>
          </div>;
          const emptyAll=playerSections.formation.length===0&&playerSections.center.length===0&&playerSections.young.length===0&&playerSections.senior.length===0;
          if(emptyAll) return <div style={{textAlign:"center",padding:50,color:C.dim}}><p>Aucun joueur inscrit pour le moment</p>{!user&&<p style={{fontSize:12,color:C.primary,marginTop:8}}><Link href="/register" style={{color:C.primaryLight,textDecoration:"underline"}}>Inscrivez-vous</Link> pour etre le premier !</p>}</div>;
          return <div style={{display:"flex",flexDirection:"column",gap:36}}>
            {playerSections.formation.length>0&&<section>
              {sectionHeader("SORTIE CENTRE / POLE","Pole Espoirs · Centre de formation pro",C.gold,playerSections.formation.length)}
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(210px,1fr))",gap:14}}>{playerSections.formation.map((p,i)=><PlayerCard key={p.id} p={p} i={i} onClick={setSelPlayer}/>)}</div>
            </section>}
            {playerSections.center.length>0&&<section>
              {sectionHeader("SECTIONS SPORTIVES","Sections scolaires et sportives",C.primaryLight,playerSections.center.length)}
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(210px,1fr))",gap:14}}>{playerSections.center.map((p,i)=><PlayerCard key={p.id} p={p} i={i} onClick={setSelPlayer}/>)}</div>
            </section>}
            {playerSections.young.length>0&&<section>
              {sectionHeader("-18 ANS","Cadets · Juniors · Espoirs",C.accent,playerSections.young.length)}
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(210px,1fr))",gap:14}}>{playerSections.young.map((p,i)=><PlayerCard key={p.id} p={p} i={i} onClick={setSelPlayer}/>)}</div>
            </section>}
            {playerSections.senior.length>0&&<section>
              {sectionHeader("JOUEURS","Tous les profils seniors",C.primary,playerSections.senior.length)}
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(210px,1fr))",gap:14}}>{playerSections.senior.map((p,i)=><PlayerCard key={p.id} p={p} i={i} onClick={setSelPlayer}/>)}</div>
            </section>}
          </div>;
        })()}

        {/* Joueurs — Recherches de club */}
        {tab==="joueurs"&&!dataLoading&&joueursView==="recherches"&&(
          <div>
            {playerSections.searching.length>0?<div style={{display:"flex",flexDirection:"column",gap:12}}>
              {playerSections.searching.map((p,i)=><div key={p.id} onClick={()=>setSelPlayer(p)} style={{background:C.bgCard,borderRadius:16,padding:20,border:`1px solid ${C.border}`,borderLeft:`3px solid ${C.green}`,cursor:"pointer",transition:"all .25s ease",animation:`fadeUp .5s ease ${i*.05}s both`}} onMouseEnter={e=>{e.currentTarget.style.background=C.bgHover;e.currentTarget.style.transform="translateX(4px)"}} onMouseLeave={e=>{e.currentTarget.style.background=C.bgCard;e.currentTarget.style.transform=""}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12,marginBottom:6}}>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6,flexWrap:"wrap"}}>
                      <Bdg color={C.green}>Recherche club</Bdg>
                      {p.position&&<Bdg color={C.primary}>{POS[p.position]||p.position}</Bdg>}
                      {p.current_level&&<Bdg color={C.muted}>{LEVELS.find(l=>l.v===p.current_level)?.l||p.current_level}</Bdg>}
                      {p.formation_origin&&<Bdg color={C.gold}>{p.formation_origin==="pole_espoirs"?"Pole Espoirs":"Centre de formation"}</Bdg>}
                    </div>
                    <p style={{margin:0,fontSize:12,color:C.primaryLight,fontWeight:600}}>{p.city||"Non precise"}{p.region?` · ${getRegionLabel(p.region)}`:""}</p>
                  </div>
                </div>
                {p.search_description&&<p style={{fontSize:13,color:C.muted,margin:"8px 0 0",lineHeight:1.6}}>{p.search_description}</p>}
                {p.search_region&&<p style={{fontSize:11,color:C.green,margin:"6px 0 0",fontWeight:600}}>Recherche en : {getRegionLabel(p.search_region)}</p>}
              </div>)}
            </div>:<div style={{textAlign:"center",padding:50,color:C.dim}}>
              <p>Aucune recherche de club pour le moment</p>
              {profile?.user_type==="joueur"&&<p style={{fontSize:12,color:C.green,marginTop:8}}>Activez la recherche de club dans votre profil pour apparaitre ici.</p>}
            </div>}
          </div>
        )}

        {/* Emploi */}
        {tab==="emploi"&&!dataLoading&&(
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {fJobs.length>0?fJobs.map((j,i)=><JobCard key={j.id} j={j} i={i} onClick={setSelJob}/>):<div style={{textAlign:"center",padding:50,color:C.dim}}><p style={{marginBottom:10}}>Aucune offre d&apos;emploi pour le moment</p>{profile?.user_type==="club"&&<p style={{fontSize:12,color:C.green,marginTop:8}}>Publiez des offres d&apos;emploi partenaires pour attirer des joueurs !</p>}</div>}
          </div>
        )}

        {/* Coachs */}
        {tab==="coachs"&&!dataLoading&&(
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(210px,1fr))",gap:14}}>
            {fCoaches.length>0?fCoaches.map((c,i)=><CoachCard key={c.id} c={c} i={i} onClick={setSelCoach}/>):<div style={{gridColumn:"1/-1",textAlign:"center",padding:50,color:C.dim}}><p>Aucun entraineur inscrit pour le moment</p></div>}
          </div>
        )}

        {/* Profil */}
        {tab==="profil"&&user&&(
          <div style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:18,padding:28}}>
            <h3 style={{fontSize:18,fontFamily:"'Bebas Neue',sans-serif",letterSpacing:2,color:C.primary,margin:"0 0 20px"}}>MON PROFIL</h3>
            <ProfileEditor profile={profile} user={user} onSave={(p)=>{setProfile(p);setPlayers(prev=>prev.map(pl=>pl.id===p.id?{...pl,...p}:pl))}} onToast={flash}/>

            {/* Soutenir Handball Connect */}
            <div style={{marginTop:28,padding:"24px 20px",background:"linear-gradient(135deg,rgba(255,107,53,0.06),rgba(29,78,216,0.06))",border:`1px solid rgba(255,107,53,0.15)`,borderRadius:16,textAlign:"center"}}>
              <h4 style={{margin:"0 0 6px",fontSize:16,fontWeight:700,color:C.text,fontFamily:"'Bebas Neue',sans-serif",letterSpacing:2}}>SOUTENIR LE PROJET</h4>
              <p style={{fontSize:12,color:C.muted,lineHeight:1.6,margin:"0 0 16px",maxWidth:400,marginLeft:"auto",marginRight:"auto"}}>Handball Connect est 100% gratuit. Si la plateforme vous a ete utile, vous pouvez contribuer librement au developpement du projet.</p>
              <a href="/soutenir" style={{display:"inline-flex",alignItems:"center",gap:8,padding:"12px 28px",borderRadius:12,background:"linear-gradient(135deg,#FF6B35,#C13C00)",color:"#fff",fontSize:13,fontWeight:700,textDecoration:"none",boxShadow:"0 6px 20px rgba(255,107,53,0.3)",transition:"transform .2s"}} onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)"}} onMouseLeave={e=>{e.currentTarget.style.transform=""}}>Soutenir le projet</a>
            </div>
          </div>
        )}
        {tab==="profil"&&!user&&(
          <div style={{textAlign:"center",padding:60}}>
            <div style={{fontSize:20,marginBottom:16}}>Accès restreint</div>
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
      <PlayerModal player={selPlayer} onClose={()=>setSelPlayer(null)} user={user}/>
      <AnnonceModal annonce={selAnnonce} onClose={()=>setSelAnnonce(null)} user={user} profile={profile} onApplied={id=>setAnnonces(prev=>prev.map(x=>x.id===id?{...x,candidatures_count:(x.candidatures_count||0)+1}:x))}/>
      <ClubModal club={selClub} onClose={()=>setSelClub(null)} user={user}/>
      <CoachModal coach={selCoach} onClose={()=>setSelCoach(null)} user={user}/>
      <JobModal job={selJob} onClose={()=>setSelJob(null)} user={user} onUpdate={updated=>{ setJobs(prev=>prev.map(x=>x.id===updated.id?{...x,...updated}:x)); setSelJob({...selJob,...updated}); }} onDelete={id=>{ setJobs(prev=>prev.filter(x=>x.id!==id)); }}/>
      {user&&<ChatWidget user={user}/>}
    </div>
  </>
}
