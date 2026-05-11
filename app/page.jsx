"use client";
import { useState, useMemo } from "react";

const C = { primary: "#1D4ED8", primaryLight: "#3B82F6", primaryDark: "#1E3A8A", accent: "#DC2626", accentLight: "#F87171", bg: "#0B1120", bgCard: "rgba(255,255,255,0.04)", bgHover: "rgba(255,255,255,0.07)", surface: "#111827", border: "rgba(255,255,255,0.08)", borderBlue: "rgba(29,78,216,0.4)", text: "#F1F5F9", muted: "rgba(255,255,255,0.5)", dim: "rgba(255,255,255,0.3)", green: "#10B981", greenBg: "rgba(16,185,129,0.12)", gold: "#FBBF24" };

const PLAYERS = [
  { id:1, first:"Lucas", last:"Moreau", pos:"arriere_gauche", club:"USM Villeparisis", city:"Paris", rating:4.7, height:192, age:26, avail:true, bio:"Arrière puissant, tir à 9m redoutable.", tags:["Tir puissant","Leadership"], phone:"06 12 34 56 78", email:"lucas.moreau@email.com", verified:true, premium:true, div:"N2", goals:89, mj:22, eff:62.7 },
  { id:2, first:"Aminata", last:"Diallo", pos:"ailier_gauche", club:"AS Bondy", city:"Bondy", rating:4.3, height:174, age:24, avail:true, bio:"Ailière explosive, rapide en contre-attaque.", tags:["Vitesse","Contre-attaque"], phone:"06 23 45 67 89", email:"aminata.d@email.com", verified:true, premium:false, div:"N3", goals:67, mj:20, eff:70.5 },
  { id:3, first:"Chloé", last:"Lefèvre", pos:"demi_centre", club:null, city:"Lyon", rating:4.5, height:175, age:27, avail:true, bio:"Meneuse créative, vision exceptionnelle.", tags:["Vision","Passes"], phone:"06 45 67 89 01", email:"chloe.lf@email.com", verified:false, premium:true, div:"N1F", goals:72, mj:26, eff:58.1 },
  { id:4, first:"Karim", last:"Benzarti", pos:"gardien", club:"USAM Nîmes", city:"Nîmes", rating:4.8, height:190, age:32, avail:false, bio:"Gardien haut niveau, réflexes exceptionnels.", tags:["Réflexes","Envergure"], phone:"06 56 78 90 12", email:"karim.bz@email.com", verified:true, premium:false, div:"Starligue", goals:2, mj:22, eff:34.2, isGK:true, saves:198, saveRate:34.2 },
  { id:5, first:"Yassine", last:"Khaldi", pos:"arriere_droit", club:"Créteil", city:"Créteil", rating:4.2, height:188, age:25, avail:true, bio:"Arrière gaucher, tir extérieur décisif.", tags:["Tir extérieur","Gaucher"], phone:"06 78 90 12 34", email:"yassine.k@email.com", verified:true, premium:true, div:"N2", goals:61, mj:19, eff:58.1 },
  { id:6, first:"Emma", last:"Petit", pos:"ailier_droit", club:"Brest BH", city:"Brest", rating:3.9, height:170, age:22, avail:true, bio:"Jeune ailière prometteuse.", tags:["Jeune talent","Rapidité"], phone:"06 67 89 01 23", email:"emma.p@email.com", verified:true, premium:false, div:"D1F", goals:54, mj:18, eff:69.2 },
];

const TRAINERS = [
  { id:101, first:"Marc", last:"Dubois", age:42, city:"Lyon", titre:"titre5", specs:["Défense","Performance"], audience:["Seniors M","U18"], yrs:12, avail:true, club:"Bron Handball", div:"N3", salary:"1500-2200€/mois", bio:"Ancien joueur N1. La défense gagne les matchs.", phone:"06 11 22 33 44", email:"marc.dubois@email.com", premium:true },
  { id:102, first:"Sophie", last:"Renard", age:35, city:"Grenoble", titre:"titre4", specs:["Formation jeunes","Babyhand"], audience:["U11","U13","U15"], yrs:7, avail:true, club:"Grenoble Sud HB", div:"—", salary:"1200-1600€/mois", bio:"J'aime voir les jeunes grandir avec le hand.", phone:"06 22 33 44 55", email:"sophie.renard@email.com", premium:false },
  { id:103, first:"Julien", last:"Martinez", age:38, city:"Saint-Étienne", titre:"titre5", specs:["Prépa physique","Performance"], audience:["Seniors M","Seniors F"], yrs:15, avail:true, club:"Saint-Étienne HB", div:"N2", salary:"1800-2500€/mois", bio:"Coach exigeant. La prépa physique est le socle.", phone:"06 33 44 55 66", email:"julien.martinez@email.com", premium:true },
];

const CLUBS = [
  { id:1, name:"USM Villeparisis", short:"USMV", city:"Villeparisis", div:"Nationale 2", seeking:["pivot","ailier_gauche"], plan:"premium", phone:"01 60 12 34 56", email:"contact@usmv-hand.fr" },
  { id:2, name:"AS Bondy Handball", short:"ASB", city:"Bondy", div:"Nationale 3", seeking:["gardien","demi_centre"], plan:"standard", phone:"01 48 23 45 67", email:"secretariat@asb-hand.fr" },
  { id:3, name:"HBC Nantes Réserve", short:"HBCN", city:"Nantes", div:"Nationale 1", seeking:[], plan:"premium", phone:"02 40 34 56 78", email:"reserve@hbcnantes.com" },
  { id:4, name:"Brest Bretagne HB", short:"BBH", city:"Brest", div:"D1F", seeking:["arriere_gauche"], plan:"standard", phone:"02 98 45 67 89", email:"contact@bbh.fr" },
];

const ANNONCES = [
  { id:1, type:"player", title:"Pivot expérimenté recherché", club:"USM Villeparisis", div:"N2", city:"Villeparisis", pos:"pivot", desc:"Recherchons un pivot solide. Min 3 ans d'expérience.", urgent:true, cands:7, bens:["prime","logement","job"] },
  { id:2, type:"player", title:"Gardien(ne) saison 2026-27", club:"AS Bondy", div:"N3", city:"Bondy", pos:"gardien", desc:"Profil fiable pour la prochaine saison.", urgent:false, cands:12, bens:["prime","formation"] },
  { id:3, type:"player", title:"Ailier gauche rapide", club:"USAM Nîmes", div:"Starligue", city:"Nîmes", pos:"ailier_gauche", desc:"Profil athlétique pour aile gauche.", urgent:true, cands:4, bens:["prime","logement"] },
  { id:4, type:"trainer", title:"Entraîneur Seniors M — N3", club:"AS Bondy", div:"N3", city:"Bondy", titre:"titre5", desc:"Recherchons un entraîneur Titre V pour nos Seniors.", urgent:false, cands:5, bens:["prime"], salary:"1400-1800€/mois" },
  { id:5, type:"trainer", title:"Éducateur jeunes U13-U15", club:"Brest BH", div:"D1F", city:"Brest", titre:"titre4", desc:"Notre école de hand recherche un éducateur Titre IV.", urgent:false, cands:8, bens:["logement","formation"], salary:"900-1300€/mois" },
];

const PRICING = [
  { key:"free", label:"Club Free", price:0, per:"", desc:"Pour découvrir", feats:["1 annonce active","10 profils visibles","Messagerie limitée"], color:C.dim },
  { key:"standard", label:"Club Standard", price:19, per:"/mois", desc:"Pour les clubs actifs", feats:["Annonces illimitées","Tous les profils","Messagerie illimitée","Alertes candidats"], color:C.primary, pop:true },
  { key:"premium", label:"Club Premium", price:49, per:"/mois", desc:"Pour les ambitieux", feats:["Tout Standard +","Annonces en avant","Stats FFHB avancées","Support prioritaire"], color:C.gold },
];

const POS = { gardien:"Gardien", ailier_gauche:"Ailier G.", ailier_droit:"Ailier D.", arriere_gauche:"Arrière G.", arriere_droit:"Arrière D.", demi_centre:"Demi-centre", pivot:"Pivot" };
const BEN_ICO = { prime:"💰", logement:"🏠", job:"💼", formation:"🎓" };

/* ═══════ MICRO COMPONENTS ═══════ */
function Bdg({children,color=C.primary,filled}){return <span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"3px 10px",background:filled?color:`${color}18`,color:filled?"#fff":color,borderRadius:6,fontSize:10,fontWeight:700,border:`1px solid ${color}30`,letterSpacing:.8,textTransform:"uppercase",whiteSpace:"nowrap"}}>{children}</span>}
function Dot(){return <div style={{display:"inline-flex",alignItems:"center",gap:5,padding:"3px 10px",background:C.greenBg,borderRadius:20,border:`1px solid ${C.green}30`}}><div style={{width:6,height:6,borderRadius:"50%",background:C.green,boxShadow:`0 0 8px ${C.green}60`}}/><span style={{color:C.green,fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:1.5}}>Dispo</span></div>}
function Stars({r}){return <span style={{display:"inline-flex",alignItems:"center",gap:1}}>{[1,2,3,4,5].map(i=><span key={i} style={{color:i<=Math.round(r)?C.gold:"rgba(255,255,255,0.1)",fontSize:12}}>★</span>)}<span style={{marginLeft:5,fontSize:11,color:C.dim,fontFamily:"monospace"}}>{Number(r).toFixed(1)}</span></span>}
function Toast({msg,onClose}){if(!msg)return null;return <div style={{position:"fixed",top:24,right:24,padding:"14px 22px",borderRadius:14,zIndex:9999,background:`${C.green}20`,backdropFilter:"blur(20px)",border:`1px solid ${C.green}40`,color:C.green,fontSize:13,fontWeight:600,boxShadow:"0 8px 32px rgba(0,0,0,0.3)",animation:"slideDown .4s cubic-bezier(0.16,1,0.3,1)",display:"flex",alignItems:"center",gap:10}}>{msg}<span onClick={onClose} style={{cursor:"pointer",opacity:.5,fontSize:16,marginLeft:8}}>✕</span></div>}

/* ═══════ MODAL WRAPPER ═══════ */
function Modal({children,onClose}){return <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",backdropFilter:"blur(12px)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20,animation:"fadeIn .2s ease"}}><div onClick={e=>e.stopPropagation()} style={{background:`linear-gradient(180deg,${C.surface},${C.bg})`,borderRadius:24,maxWidth:500,width:"100%",overflow:"hidden",maxHeight:"90vh",overflowY:"auto",border:`1px solid ${C.border}`,animation:"modalUp .4s cubic-bezier(0.16,1,0.3,1)"}}>{children}</div></div>}

function ModalHeader({color,initials,onClose,badges}){return <div style={{height:120,background:`linear-gradient(135deg,${color},${color}cc)`,position:"relative"}}><button onClick={onClose} style={{position:"absolute",top:12,right:12,background:"rgba(255,255,255,0.15)",border:"none",color:"#fff",width:32,height:32,borderRadius:"50%",cursor:"pointer",fontSize:16}}>✕</button>{badges&&<div style={{position:"absolute",top:12,left:12,display:"flex",gap:6}}>{badges}</div>}<div style={{width:76,height:76,borderRadius:"50%",background:C.bg,border:`4px solid ${color}40`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,fontWeight:800,color,fontFamily:"'Bebas Neue',sans-serif",position:"absolute",bottom:-34,left:"50%",transform:"translateX(-50%)",boxShadow:"0 10px 30px rgba(0,0,0,0.4)"}}>{initials}</div></div>}

function ContactBlock({phone,email}){return <div style={{background:C.bgCard,borderRadius:12,padding:14,border:`1px solid ${C.border}`,marginBottom:14}}><div style={{display:"flex",flexDirection:"column",gap:6}}><div style={{display:"flex",alignItems:"center",gap:10,fontSize:13}}>📱 <span style={{color:C.text,fontFamily:"monospace"}}>{phone}</span></div><div style={{display:"flex",alignItems:"center",gap:10,fontSize:13}}>✉️ <span style={{color:C.text,fontFamily:"monospace"}}>{email}</span></div></div></div>}

function Disclaimer(){return <p style={{fontSize:10,color:C.dim,textAlign:"center",margin:"0 0 14px",padding:"8px 12px",background:`${C.primary}08`,borderRadius:8,border:`1px solid ${C.primary}10`,lineHeight:1.6}}>ℹ️ HandConnect est une plateforme de mise en relation. Le contrat est conclu directement entre les parties.</p>}

/* ═══════ PLAYER CARD ═══════ */
function PlayerCard({p,onClick,i,locked}){
  return <div onClick={()=>onClick(p)} style={{background:C.bgCard,borderRadius:18,overflow:"hidden",cursor:"pointer",border:`1px solid ${C.border}`,transition:"all .35s cubic-bezier(0.16,1,0.3,1)",position:"relative",animation:`fadeUp .5s ease ${i*.05}s both`,opacity:locked?.5:1}} onMouseEnter={e=>{if(!locked){e.currentTarget.style.transform="translateY(-5px)";e.currentTarget.style.borderColor=C.borderBlue;e.currentTarget.style.boxShadow=`0 16px 48px ${C.primary}15`}}} onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.borderColor=C.border;e.currentTarget.style.boxShadow=""}}>
    {locked&&<div style={{position:"absolute",inset:0,zIndex:5,background:"rgba(11,17,32,0.65)",backdropFilter:"blur(3px)",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:6}}><span style={{fontSize:24}}>🔒</span><span style={{fontSize:10,color:C.muted,fontWeight:600,textTransform:"uppercase",letterSpacing:1.5}}>Plan Standard requis</span></div>}
    {p.avail&&<div style={{position:"absolute",top:12,left:12,zIndex:2}}><Dot/></div>}
    <div style={{position:"absolute",top:12,right:12,zIndex:2,display:"flex",flexDirection:"column",gap:4,alignItems:"flex-end"}}>{p.verified&&<Bdg color={C.primaryLight}>✓ FFHB</Bdg>}{p.premium&&<Bdg color={C.gold}>⚡ Boost</Bdg>}</div>
    <div style={{height:80,background:`linear-gradient(135deg,${C.primary},${C.primaryDark})`,position:"relative"}}><div style={{width:56,height:56,borderRadius:"50%",background:C.bg,border:`3px solid ${C.primary}50`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,fontWeight:800,color:C.primaryLight,fontFamily:"'Bebas Neue',sans-serif",position:"absolute",bottom:-24,left:"50%",transform:"translateX(-50%)",boxShadow:"0 6px 20px rgba(0,0,0,0.4)"}}>{p.first[0]}{p.last[0]}</div></div>
    <div style={{padding:"30px 16px 16px",textAlign:"center"}}>
      <h3 style={{margin:0,fontSize:15,fontWeight:700,color:C.text}}>{p.first} {p.last}</h3>
      <p style={{margin:"2px 0",fontSize:10,color:C.primary,fontWeight:700,fontFamily:"monospace",textTransform:"uppercase",letterSpacing:1.5}}>{POS[p.pos]}</p>
      <p style={{fontSize:10,color:C.dim}}>{p.club||"Sans club"} · {p.div}</p>
      <div style={{margin:"8px 0 10px"}}><Stars r={p.rating}/></div>
      <div style={{display:"flex",justifyContent:"center",gap:16,paddingTop:10,borderTop:`1px solid ${C.border}`}}>
        {[[p.isGK?"Arrêts":"Buts",p.isGK?p.saves:p.goals],["MJ",p.mj],[p.isGK?"%Arr.":"Eff.",`${p.isGK?p.saveRate:p.eff}%`]].map(([l,v])=><div key={l} style={{textAlign:"center"}}><div style={{fontSize:17,fontWeight:800,color:C.text,fontFamily:"'Bebas Neue',sans-serif"}}>{v}</div><div style={{fontSize:8,color:C.dim,textTransform:"uppercase",letterSpacing:1.5,fontWeight:600}}>{l}</div></div>)}
      </div>
    </div>
  </div>
}

/* ═══════ PLAYER MODAL ═══════ */
function PlayerModal({player:p,onClose}){
  if(!p)return null;
  return <Modal onClose={onClose}>
    <ModalHeader color={C.primary} initials={p.first[0]+p.last[0]} onClose={onClose} badges={p.verified?<Bdg color="#93C5FD">✓ FFHB Vérifié</Bdg>:null}/>
    <div style={{padding:"44px 28px 0",textAlign:"center"}}>
      <h2 style={{fontSize:22,fontWeight:700,margin:0,color:C.text}}>{p.first} {p.last}</h2>
      <p style={{color:C.primary,fontWeight:700,fontSize:11,fontFamily:"monospace",margin:"4px 0",textTransform:"uppercase",letterSpacing:2}}>{POS[p.pos]}</p>
      <p style={{color:C.dim,fontSize:12,margin:0}}>{p.club||"Sans club"} · {p.city} · {p.age} ans · {p.height}cm</p>
      <div style={{margin:"10px 0 16px"}}><Stars r={p.rating}/></div>
    </div>
    <div style={{padding:"0 28px 28px"}}>
      <div style={{display:"flex",justifyContent:"space-around",background:`${C.primary}10`,borderRadius:14,padding:16,border:`1px solid ${C.primary}20`,marginBottom:16}}>
        {(p.isGK?[["Arrêts",p.saves],["%Arr.",`${p.saveRate}%`],["MJ",p.mj]]:[["Buts",p.goals],["Eff.",`${p.eff}%`],["MJ",p.mj]]).map(([l,v])=><div key={l} style={{textAlign:"center"}}><div style={{fontSize:28,fontWeight:800,color:C.primary,fontFamily:"'Bebas Neue',sans-serif"}}>{v}</div><div style={{fontSize:9,color:C.muted,textTransform:"uppercase",fontWeight:600}}>{l}</div></div>)}
      </div>
      <p style={{fontSize:13,color:C.muted,lineHeight:1.7,margin:"0 0 14px"}}>{p.bio}</p>
      <div style={{display:"flex",flexWrap:"wrap",gap:6,justifyContent:"center",marginBottom:16}}>{p.tags.map(t=><span key={t} style={{background:`${C.primary}12`,color:C.primaryLight,fontSize:11,fontWeight:600,padding:"4px 12px",borderRadius:20,border:`1px solid ${C.primary}20`}}>{t}</span>)}</div>
      <ContactBlock phone={p.phone} email={p.email}/>
      <Disclaimer/>
      <button style={{width:"100%",padding:"13px 0",border:"none",borderRadius:12,background:`linear-gradient(135deg,${C.primary},${C.primaryDark})`,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",boxShadow:`0 6px 20px ${C.primary}30`}}>💬 Contacter</button>
    </div>
  </Modal>
}

/* ═══════ TRAINER CARD ═══════ */
function TrainerCard({t,onClick,i,locked}){
  const tc=t.titre==="titre5"?C.accent:C.green;
  const tl=t.titre==="titre5"?"Titre V":"Titre IV";
  return <div onClick={()=>onClick(t)} style={{background:C.bgCard,borderRadius:18,overflow:"hidden",cursor:"pointer",border:`1px solid ${C.border}`,transition:"all .35s cubic-bezier(0.16,1,0.3,1)",position:"relative",animation:`fadeUp .5s ease ${i*.05}s both`,opacity:locked?.5:1}} onMouseEnter={e=>{if(!locked){e.currentTarget.style.transform="translateY(-5px)";e.currentTarget.style.borderColor=`${C.accent}40`;e.currentTarget.style.boxShadow=`0 16px 48px ${C.accent}10`}}} onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.borderColor=C.border;e.currentTarget.style.boxShadow=""}}>
    {locked&&<div style={{position:"absolute",inset:0,zIndex:5,background:"rgba(11,17,32,0.65)",backdropFilter:"blur(3px)",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:6}}><span style={{fontSize:24}}>🔒</span><span style={{fontSize:10,color:C.muted,fontWeight:600,textTransform:"uppercase",letterSpacing:1.5}}>Plan Standard requis</span></div>}
    {t.avail&&<div style={{position:"absolute",top:12,left:12,zIndex:2}}><Dot/></div>}
    <div style={{position:"absolute",top:12,right:12,zIndex:2,display:"flex",flexDirection:"column",gap:4,alignItems:"flex-end"}}><Bdg color={tc}>{tl}</Bdg>{t.premium&&<Bdg color={C.gold}>⚡ Pro</Bdg>}</div>
    <div style={{height:80,background:`linear-gradient(135deg,${C.accent},#991B1B)`,position:"relative"}}><div style={{width:56,height:56,borderRadius:"50%",background:C.bg,border:`3px solid ${C.accent}50`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,fontWeight:800,color:C.accentLight,fontFamily:"'Bebas Neue',sans-serif",position:"absolute",bottom:-24,left:"50%",transform:"translateX(-50%)",boxShadow:"0 6px 20px rgba(0,0,0,0.4)"}}>{t.first[0]}{t.last[0]}</div></div>
    <div style={{padding:"30px 16px 16px",textAlign:"center"}}>
      <h3 style={{margin:0,fontSize:15,fontWeight:700,color:C.text}}>{t.first} {t.last}</h3>
      <p style={{margin:"2px 0",fontSize:10,color:C.accent,fontWeight:700,fontFamily:"monospace",textTransform:"uppercase",letterSpacing:1.5}}>Coach · {t.yrs} ans</p>
      <p style={{fontSize:10,color:C.dim}}>{t.club} · {t.city}</p>
      <div style={{display:"flex",flexWrap:"wrap",gap:4,justifyContent:"center",margin:"10px 0 12px"}}>{t.audience.slice(0,3).map(a=><span key={a} style={{background:`${C.accent}12`,color:C.accentLight,fontSize:9,padding:"2px 8px",borderRadius:6,fontWeight:600,border:`1px solid ${C.accent}18`}}>{a}</span>)}</div>
      <div style={{display:"flex",justifyContent:"center",gap:14,paddingTop:10,borderTop:`1px solid ${C.border}`}}>{[["Exp.",`${t.yrs}a`],["Ville",t.city.slice(0,6)]].map(([l,v])=><div key={l} style={{textAlign:"center"}}><div style={{fontSize:16,fontWeight:800,color:C.text,fontFamily:"'Bebas Neue',sans-serif"}}>{v}</div><div style={{fontSize:8,color:C.dim,textTransform:"uppercase",letterSpacing:1.5,fontWeight:600}}>{l}</div></div>)}</div>
    </div>
  </div>
}

/* ═══════ TRAINER MODAL ═══════ */
function TrainerModal({trainer:t,onClose}){
  if(!t)return null;
  const tc=t.titre==="titre5"?C.accent:C.green;
  return <Modal onClose={onClose}>
    <ModalHeader color={C.accent} initials={t.first[0]+t.last[0]} onClose={onClose} badges={<Bdg color={tc}>{t.titre==="titre5"?"Titre V":"Titre IV"}</Bdg>}/>
    <div style={{padding:"44px 28px 0",textAlign:"center"}}>
      <h2 style={{fontSize:22,fontWeight:700,margin:0,color:C.text}}>{t.first} {t.last}</h2>
      <p style={{color:C.accent,fontWeight:700,fontSize:11,fontFamily:"monospace",margin:"4px 0",textTransform:"uppercase",letterSpacing:2}}>Entraîneur · {t.yrs} ans</p>
      <p style={{color:C.dim,fontSize:12,margin:0}}>{t.city} · {t.age} ans</p>
    </div>
    <div style={{padding:"16px 28px 28px"}}>
      <p style={{fontSize:13,color:C.muted,lineHeight:1.7,textAlign:"center",margin:"0 0 16px"}}>{t.bio}</p>
      <div style={{marginBottom:14}}><p style={{fontSize:10,color:C.dim,textTransform:"uppercase",letterSpacing:2,marginBottom:8,fontWeight:600}}>Spécialités</p><div style={{display:"flex",flexWrap:"wrap",gap:6}}>{t.specs.map(s=><span key={s} style={{background:`${C.accent}12`,color:C.accentLight,fontSize:11,fontWeight:600,padding:"4px 12px",borderRadius:20,border:`1px solid ${C.accent}18`}}>{s}</span>)}</div></div>
      <div style={{marginBottom:14}}><p style={{fontSize:10,color:C.dim,textTransform:"uppercase",letterSpacing:2,marginBottom:8,fontWeight:600}}>Public</p><div style={{display:"flex",flexWrap:"wrap",gap:6}}>{t.audience.map(a=><span key={a} style={{background:`${C.primary}12`,color:C.primaryLight,fontSize:11,fontWeight:600,padding:"4px 12px",borderRadius:20,border:`1px solid ${C.primary}18`}}>{a}</span>)}</div></div>
      <div style={{background:C.bgCard,borderRadius:12,padding:14,border:`1px solid ${C.border}`,marginBottom:14}}>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:6}}><span style={{color:C.muted}}>Prétentions</span><span style={{color:C.accent,fontWeight:700,fontFamily:"monospace"}}>{t.salary}</span></div>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:12}}><span style={{color:C.muted}}>Club actuel</span><span style={{color:C.text}}>{t.club}</span></div>
      </div>
      <ContactBlock phone={t.phone} email={t.email}/>
      <Disclaimer/>
      <button style={{width:"100%",padding:"13px 0",border:"none",borderRadius:12,background:`linear-gradient(135deg,${C.accent},#991B1B)`,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",boxShadow:`0 6px 20px ${C.accent}30`}}>💬 Contacter</button>
    </div>
  </Modal>
}

/* ═══════ ANNONCE CARD ═══════ */
function AnnonceCard({a,i,onClick}){
  const isTr=a.type==="trainer";const ac=isTr?C.accent:C.primary;
  return <div onClick={()=>onClick(a)} style={{background:C.bgCard,borderRadius:16,padding:20,border:`1px solid ${C.border}`,borderLeft:`3px solid ${a.urgent?C.accent:ac}`,cursor:"pointer",transition:"all .25s ease",animation:`fadeUp .5s ease ${i*.05}s both`}} onMouseEnter={e=>{e.currentTarget.style.background=C.bgHover;e.currentTarget.style.transform="translateX(4px)"}} onMouseLeave={e=>{e.currentTarget.style.background=C.bgCard;e.currentTarget.style.transform=""}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12,marginBottom:6}}>
      <div style={{flex:1}}>
        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6,flexWrap:"wrap"}}>
          <Bdg color={ac}>{isTr?"🎯 Coach":"🤾 Joueur"}</Bdg>
          {isTr&&<Bdg color={a.titre==="titre5"?C.accent:C.green}>{a.titre==="titre5"?"Titre V":"Titre IV"}</Bdg>}
          {a.urgent&&<Bdg color={C.accent} filled>Urgent</Bdg>}
        </div>
        <h3 style={{margin:"0 0 3px",fontSize:15,fontWeight:700,color:C.text}}>{a.title}</h3>
        <p style={{margin:0,fontSize:12,color:ac,fontWeight:600,fontFamily:"monospace"}}>{a.club} · {a.div} · {a.city}</p>
      </div>
      <span style={{fontSize:11,color:C.dim,background:C.bgCard,padding:"4px 10px",borderRadius:20,whiteSpace:"nowrap",border:`1px solid ${C.border}`}}>{a.cands} cand.</span>
    </div>
    <p style={{fontSize:13,color:C.muted,margin:"8px 0 10px",lineHeight:1.6}}>{a.desc}</p>
    {isTr&&a.salary&&<p style={{fontSize:12,color:C.accent,fontWeight:600,margin:"0 0 8px",fontFamily:"monospace"}}>💶 {a.salary}</p>}
    {a.bens.length>0&&<div style={{display:"flex",gap:6,paddingTop:8,borderTop:`1px solid ${C.border}`}}>{a.bens.map(b=><span key={b} style={{fontSize:10,padding:"3px 8px",background:`${ac}10`,color:ac,borderRadius:6,fontWeight:600,border:`1px solid ${ac}18`}}>{BEN_ICO[b]} {b}</span>)}</div>}
  </div>
}

/* ═══════ ANNONCE MODAL ═══════ */
function AnnonceModal({annonce:a,onClose}){
  if(!a)return null;const isTr=a.type==="trainer";const ac=isTr?C.accent:C.primary;
  return <Modal onClose={onClose}>
    <div style={{padding:"24px 28px",background:`${ac}10`,borderBottom:`1px solid ${ac}20`,position:"relative"}}>
      <button onClick={onClose} style={{position:"absolute",top:16,right:16,background:"rgba(255,255,255,0.06)",border:"none",color:C.dim,width:32,height:32,borderRadius:"50%",cursor:"pointer",fontSize:16}}>✕</button>
      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8,flexWrap:"wrap"}}>
        <Bdg color={ac}>{isTr?"🎯 Coach":"🤾 Joueur"}</Bdg>
        {isTr&&<Bdg color={a.titre==="titre5"?C.accent:C.green}>{a.titre==="titre5"?"Titre V":"Titre IV"}</Bdg>}
        {!isTr&&<Bdg color={C.primary}>{POS[a.pos]}</Bdg>}
        {a.urgent&&<Bdg color={C.accent} filled>Urgent</Bdg>}
      </div>
      <h2 style={{margin:"0 0 4px",fontSize:20,fontWeight:700,color:C.text}}>{a.title}</h2>
      <p style={{margin:0,fontSize:13,color:ac,fontWeight:600}}>{a.club} · {a.div} · {a.city}</p>
    </div>
    <div style={{padding:28}}>
      <p style={{fontSize:14,color:C.muted,lineHeight:1.7,margin:"0 0 20px"}}>{a.desc}</p>
      {isTr&&a.salary&&<div style={{background:`${C.accent}08`,borderRadius:12,padding:14,border:`1px solid ${C.accent}15`,marginBottom:18,textAlign:"center"}}><span style={{fontSize:11,color:C.dim,textTransform:"uppercase",letterSpacing:1.5}}>Rémunération</span><div style={{fontSize:20,color:C.accent,fontWeight:800,fontFamily:"'Bebas Neue',sans-serif",marginTop:4}}>{a.salary}</div></div>}
      {a.bens.length>0&&<div style={{marginBottom:20}}><p style={{fontSize:10,color:C.dim,textTransform:"uppercase",letterSpacing:2,marginBottom:8,fontWeight:600}}>Avantages</p><div style={{display:"flex",flexWrap:"wrap",gap:8}}>{a.bens.map(b=><span key={b} style={{padding:"6px 14px",background:`${ac}10`,color:ac,borderRadius:10,fontSize:12,fontWeight:600,border:`1px solid ${ac}18`}}>{BEN_ICO[b]} {b.charAt(0).toUpperCase()+b.slice(1)}</span>)}</div></div>}
      <Disclaimer/>
      <button style={{width:"100%",padding:"14px 0",border:"none",borderRadius:12,background:`linear-gradient(135deg,${ac},${isTr?"#991B1B":C.primaryDark})`,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",boxShadow:`0 6px 20px ${ac}30`}}>✉️ Postuler</button>
    </div>
  </Modal>
}

/* ═══════ CLUB CARD ═══════ */
function ClubCard({c,i}){
  return <div style={{background:C.bgCard,borderRadius:16,padding:20,border:`1px solid ${C.border}`,animation:`fadeUp .5s ease ${i*.05}s both`,transition:"all .25s"}} onMouseEnter={e=>{e.currentTarget.style.borderColor=C.borderBlue}} onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border}}>
    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
      <div style={{width:46,height:46,borderRadius:12,background:`linear-gradient(135deg,${C.primary},${C.primaryDark})`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:14,fontFamily:"'Bebas Neue',sans-serif",letterSpacing:1}}>{c.short}</div>
      <div style={{flex:1}}>
        <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}><h3 style={{margin:0,fontSize:15,fontWeight:700,color:C.text}}>{c.name}</h3>{c.plan==="premium"&&<Bdg color={C.gold}>👑</Bdg>}</div>
        <p style={{margin:"2px 0 0",fontSize:12,color:C.dim}}>{c.city} · {c.div}</p>
      </div>
    </div>
    {c.seeking.length>0&&<div style={{marginBottom:12}}><p style={{fontSize:9,color:C.dim,textTransform:"uppercase",letterSpacing:1.5,marginBottom:6,fontWeight:600}}>Postes recherchés</p><div style={{display:"flex",flexWrap:"wrap",gap:6}}>{c.seeking.map(p=><Bdg key={p} color={C.primary}>{POS[p]}</Bdg>)}</div></div>}
    <div style={{background:"rgba(0,0,0,0.15)",borderRadius:10,padding:10}}><div style={{fontSize:12,color:C.muted,display:"flex",flexDirection:"column",gap:4}}><span>📱 <span style={{fontFamily:"monospace"}}>{c.phone}</span></span><span>✉️ <span style={{fontFamily:"monospace"}}>{c.email}</span></span></div></div>
  </div>
}

/* ═══════ PRICING ═══════ */
function PricingTab({plan:cur,onChoose}){
  return <div>
    <div style={{textAlign:"center",marginBottom:28}}>
      <h2 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:36,letterSpacing:3,color:C.text,margin:"0 0 6px"}}>NOS <span style={{color:C.primary}}>OFFRES</span></h2>
      <p style={{color:C.muted,fontSize:13}}>Sans commission · Sans engagement · Paiement sécurisé</p>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:16,marginBottom:24}}>
      {PRICING.map((p,i)=>{const isCur=cur===p.key;return <div key={p.key} style={{background:p.pop?`${C.primary}08`:C.bgCard,borderRadius:20,padding:24,border:`1px solid ${p.pop?`${C.primary}30`:C.border}`,position:"relative",animation:`fadeUp .5s ease ${i*.08}s both`,transition:"all .25s"}} onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-4px)"}} onMouseLeave={e=>{e.currentTarget.style.transform=""}}>
        {p.pop&&<div style={{position:"absolute",top:-10,left:"50%",transform:"translateX(-50%)",background:`linear-gradient(135deg,${C.primary},${C.primaryDark})`,color:"#fff",fontSize:9,fontWeight:800,padding:"4px 14px",borderRadius:12,letterSpacing:1.5,textTransform:"uppercase",boxShadow:`0 4px 12px ${C.primary}30`}}>★ Populaire</div>}
        <h3 style={{margin:"0 0 4px",fontSize:16,color:p.color,fontWeight:700,fontFamily:"'Bebas Neue',sans-serif",letterSpacing:2}}>{p.label.toUpperCase()}</h3>
        <p style={{margin:0,fontSize:12,color:C.dim}}>{p.desc}</p>
        <div style={{margin:"18px 0",display:"flex",alignItems:"baseline",gap:4}}><span style={{fontSize:42,fontWeight:800,color:C.text,fontFamily:"'Bebas Neue',sans-serif",lineHeight:1}}>{p.price}€</span><span style={{fontSize:13,color:C.dim}}>{p.per}</span></div>
        <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:18,minHeight:120}}>{p.feats.map(f=><div key={f} style={{display:"flex",alignItems:"flex-start",gap:8,fontSize:12}}><span style={{color:p.color||C.green,fontSize:12,marginTop:1}}>✓</span><span style={{color:C.muted}}>{f}</span></div>)}</div>
        <button onClick={()=>onChoose(p.key)} disabled={isCur} style={{width:"100%",padding:"12px 0",border:isCur?`1px solid ${p.color}40`:"none",borderRadius:12,background:isCur?`${p.color}15`:(p.pop?`linear-gradient(135deg,${C.primary},${C.primaryDark})`:C.bgHover),color:isCur?p.color:"#fff",fontSize:12,fontWeight:700,cursor:isCur?"default":"pointer",boxShadow:p.pop&&!isCur?`0 6px 20px ${C.primary}25`:"none"}}>{isCur?"✓ Plan actuel":(p.price===0?"Commencer gratuitement":"Choisir ce plan →")}</button>
      </div>})}
    </div>
    <Disclaimer/>
  </div>
}

/* ═══════ UPGRADE MODAL ═══════ */
function UpgradeModal({open,onClose,onUp}){
  if(!open)return null;
  return <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",backdropFilter:"blur(20px)",zIndex:2500,display:"flex",alignItems:"center",justifyContent:"center",padding:20,animation:"fadeIn .2s ease"}}>
    <div onClick={e=>e.stopPropagation()} style={{background:`linear-gradient(180deg,${C.surface},${C.bg})`,borderRadius:24,maxWidth:420,width:"100%",overflow:"hidden",border:`1px solid ${C.primary}30`,boxShadow:`0 40px 100px ${C.primary}15`,animation:"modalUp .4s cubic-bezier(0.16,1,0.3,1)"}}>
      <div style={{padding:"28px 28px 20px",background:`${C.primary}10`,borderBottom:`1px solid ${C.primary}15`,textAlign:"center"}}><div style={{fontSize:36,marginBottom:8}}>🔓</div><h2 style={{margin:0,fontSize:22,fontFamily:"'Bebas Neue',sans-serif",letterSpacing:2,color:C.text}}>PASSER AU STANDARD</h2><p style={{margin:"6px 0 0",fontSize:12,color:C.muted}}>Débloquez tous les profils</p></div>
      <div style={{padding:24}}>
        {["Annonces illimitées","Tous les profils","Messagerie illimitée","Alertes candidats"].map(f=><div key={f} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",fontSize:13}}><span style={{color:C.green,fontSize:14}}>✓</span><span style={{color:C.muted}}>{f}</span></div>)}
        <div style={{background:`${C.primary}08`,borderRadius:12,padding:14,margin:"16px 0",textAlign:"center",border:`1px solid ${C.primary}15`}}><span style={{fontSize:36,fontFamily:"'Bebas Neue',sans-serif",fontWeight:800,color:C.primary}}>19€</span><span style={{fontSize:14,color:C.dim}}>/mois</span><p style={{margin:"4px 0 0",fontSize:11,color:C.dim}}>ou <strong style={{color:C.gold}}>190€/an</strong> (2 mois offerts)</p></div>
        <div style={{display:"flex",gap:10}}><button onClick={onClose} style={{flex:1,padding:"12px 0",border:`1px solid ${C.border}`,borderRadius:12,background:"transparent",color:C.muted,fontSize:13,fontWeight:600,cursor:"pointer"}}>Plus tard</button><button onClick={onUp} style={{flex:2,padding:"12px 0",border:"none",borderRadius:12,background:`linear-gradient(135deg,${C.primary},${C.primaryDark})`,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",boxShadow:`0 6px 20px ${C.primary}30`}}>Passer Standard →</button></div>
      </div>
    </div>
  </div>
}

/* ═══════════════════════ MAIN APP ═══════════════════════ */
export default function HandConnect(){
  const [tab,setTab]=useState("annonces");
  const [search,setSearch]=useState("");
  const [posF,setPosF]=useState("");
  const [availF,setAvailF]=useState(false);
  const [aType,setAType]=useState("all");
  const [selPlayer,setSelPlayer]=useState(null);
  const [selTrainer,setSelTrainer]=useState(null);
  const [selAnnonce,setSelAnnonce]=useState(null);
  const [toast,setToast]=useState("");
  const [showUp,setShowUp]=useState(false);
  const [plan,setPlan]=useState("free");

  const flash=(m)=>{setToast(m);setTimeout(()=>setToast(""),3000)};
  const clickPlayer=(p)=>{if(plan==="free"&&p.id>3){setShowUp(true);return}setSelPlayer(p)};
  const clickTrainer=(t)=>{if(plan==="free"&&t.id>102){setShowUp(true);return}setSelTrainer(t)};
  const doUpgrade=(k)=>{setPlan(k||"standard");setShowUp(false);flash(`✓ Plan ${k||"Standard"} activé`)};

  const fPlayers=useMemo(()=>PLAYERS.filter(p=>{if(posF&&p.pos!==posF)return false;if(availF&&!p.avail)return false;if(search)return`${p.first} ${p.last} ${p.city} ${p.club||""}`.toLowerCase().includes(search.toLowerCase());return true}),[search,posF,availF]);
  const fTrainers=useMemo(()=>TRAINERS.filter(t=>{if(availF&&!t.avail)return false;if(search)return`${t.first} ${t.last} ${t.city}`.toLowerCase().includes(search.toLowerCase());return true}),[search,availF]);
  const fAnnonces=ANNONCES.filter(a=>{if(aType!=="all"&&a.type!==aType)return false;if(search)return`${a.title} ${a.club} ${a.city}`.toLowerCase().includes(search.toLowerCase());return true});
  const fClubs=CLUBS.filter(c=>search?`${c.name} ${c.city}`.toLowerCase().includes(search.toLowerCase()):true);

  const tabs=[{k:"annonces",l:"Annonces",i:"📢"},{k:"joueurs",l:"Joueurs",i:"🤾"},{k:"entraineurs",l:"Entraîneurs",i:"🎯"},{k:"clubs",l:"Clubs",i:"🏟️"},{k:"tarifs",l:"Tarifs",i:"💎"}];
  const inpS={padding:"11px 14px",background:"rgba(255,255,255,0.04)",border:`1px solid ${C.border}`,borderRadius:10,color:C.text,fontSize:13,outline:"none",transition:"all .2s",width:"100%",boxSizing:"border-box"};

  const css=`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');*{box-sizing:border-box;margin:0;padding:0}@keyframes slideDown{from{opacity:0;transform:translateY(-12px)}to{opacity:1;transform:translateY(0)}}@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}@keyframes modalUp{from{opacity:0;transform:translateY(24px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}input:focus,select:focus{border-color:${C.primary}!important;box-shadow:0 0 0 3px ${C.primary}15!important}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:4px}`;

  return <>
    <style>{css}</style>
    <div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",position:"relative",overflow:"hidden"}}>
      <div style={{position:"fixed",top:-300,right:-200,width:700,height:700,borderRadius:"50%",background:`radial-gradient(circle,${C.primary}08,transparent 70%)`,pointerEvents:"none"}}/>
      <div style={{position:"fixed",bottom:-300,left:-200,width:600,height:600,borderRadius:"50%",background:`radial-gradient(circle,${C.accent}05,transparent 70%)`,pointerEvents:"none"}}/>

      <Toast msg={toast} onClose={()=>setToast("")}/>

      <header style={{background:`${C.bg}ee`,backdropFilter:"blur(20px)",borderBottom:`1px solid ${C.border}`,padding:"0 20px",position:"sticky",top:0,zIndex:100}}>
        <div style={{maxWidth:1100,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",height:60}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:36,height:36,borderRadius:10,background:`linear-gradient(135deg,${C.primary},${C.accent})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,boxShadow:`0 4px 14px ${C.primary}30`}}>🤾</div>
            <h1 style={{fontSize:20,fontFamily:"'Bebas Neue',sans-serif",letterSpacing:3,color:"#fff",lineHeight:1}}>HAND<span style={{color:C.primary}}>CONNECT</span></h1>
            <span style={{fontSize:8,color:C.dim,background:C.bgCard,padding:"2px 7px",borderRadius:5,fontWeight:600,letterSpacing:1,border:`1px solid ${C.border}`}}>BETA</span>
          </div>
          <nav style={{display:"flex",gap:2}}>{tabs.map(t=><button key={t.k} onClick={()=>{setTab(t.k);setSearch("");setPosF("");setAType("all")}} style={{padding:"7px 12px",border:"none",borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:600,transition:"all .2s",background:tab===t.k?`${C.primary}18`:"transparent",color:tab===t.k?C.primaryLight:C.dim,whiteSpace:"nowrap"}}><span style={{marginRight:4,fontSize:12}}>{t.i}</span>{t.l}</button>)}</nav>
          <Bdg color={plan==="free"?C.dim:plan==="premium"?C.gold:C.primary}>{plan==="free"?"Free":plan==="premium"?"👑 Premium":"Standard"}</Bdg>
        </div>
      </header>

      <main style={{maxWidth:1100,margin:"0 auto",padding:"20px 20px 60px"}}>
        {tab!=="tarifs"&&<div style={{marginBottom:18,animation:"fadeUp .3s ease"}}>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher..." style={{...inpS,flex:"1 1 200px",width:"auto"}}/>
            {(tab==="joueurs"||(tab==="annonces"&&aType!=="trainer"))&&<select value={posF} onChange={e=>setPosF(e.target.value)} style={{...inpS,minWidth:140,width:"auto"}}><option value="">Tous postes</option>{Object.entries(POS).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select>}
            {(tab==="joueurs"||tab==="entraineurs")&&<button onClick={()=>setAvailF(!availF)} style={{padding:"11px 14px",border:`1px solid ${availF?`${C.green}40`:C.border}`,borderRadius:10,fontSize:12,fontWeight:600,cursor:"pointer",background:availF?C.greenBg:"transparent",color:availF?C.green:C.dim}}>🟢 Dispos</button>}
          </div>
          {tab==="annonces"&&<div style={{display:"flex",gap:6,marginTop:10}}>{[["all","Toutes"],["player","🤾 Joueurs"],["trainer","🎯 Coachs"]].map(([k,l])=><button key={k} onClick={()=>setAType(k)} style={{padding:"6px 12px",border:`1px solid ${aType===k?`${C.primary}40`:C.border}`,borderRadius:8,fontSize:11,fontWeight:600,cursor:"pointer",background:aType===k?`${C.primary}15`:"transparent",color:aType===k?C.primaryLight:C.dim}}>{l}</button>)}</div>}
        </div>}

        {tab==="annonces"&&<div style={{display:"flex",flexDirection:"column",gap:10}}>{fAnnonces.map((a,i)=><AnnonceCard key={a.id} a={a} i={i} onClick={setSelAnnonce}/>)}{fAnnonces.length===0&&<div style={{textAlign:"center",padding:50,color:C.dim}}>📭 Aucune annonce</div>}</div>}

        {tab==="joueurs"&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(210px,1fr))",gap:14}}>{fPlayers.map((p,i)=><PlayerCard key={p.id} p={p} i={i} onClick={clickPlayer} locked={plan==="free"&&p.id>3}/>)}{fPlayers.length===0&&<div style={{gridColumn:"1/-1",textAlign:"center",padding:50,color:C.dim}}>Aucun joueur</div>}</div>}

        {tab==="entraineurs"&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(210px,1fr))",gap:14}}>{fTrainers.map((t,i)=><TrainerCard key={t.id} t={t} i={i} onClick={clickTrainer} locked={plan==="free"&&t.id>102}/>)}{fTrainers.length===0&&<div style={{gridColumn:"1/-1",textAlign:"center",padding:50,color:C.dim}}>Aucun entraîneur</div>}</div>}

        {tab==="clubs"&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:14}}>{fClubs.map((c,i)=><ClubCard key={c.id} c={c} i={i}/>)}</div>}

        {tab==="tarifs"&&<PricingTab plan={plan} onChoose={doUpgrade}/>}
      </main>

      <PlayerModal player={selPlayer} onClose={()=>setSelPlayer(null)}/>
      <TrainerModal trainer={selTrainer} onClose={()=>setSelTrainer(null)}/>
      <AnnonceModal annonce={selAnnonce} onClose={()=>setSelAnnonce(null)}/>
      <UpgradeModal open={showUp} onClose={()=>setShowUp(false)} onUp={()=>doUpgrade("standard")}/>
    </div>
  </>
}
