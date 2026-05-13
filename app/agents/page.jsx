"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { supabase } from "../../lib/supabase";

const C = { primary:"#1D4ED8", primaryLight:"#3B82F6", primaryDark:"#1E3A8A", accent:"#DC2626", accentLight:"#F87171", bg:"#0B1120", bgCard:"rgba(255,255,255,0.04)", bgHover:"rgba(255,255,255,0.07)", surface:"#111827", border:"rgba(255,255,255,0.08)", text:"#F1F5F9", muted:"rgba(255,255,255,0.5)", dim:"rgba(255,255,255,0.3)", green:"#10B981", gold:"#FBBF24", purple:"#8B5CF6" };

const HC = `HandballConnect: plateforme SaaS mise en relation handball amateur français. 100% abonnement, 0 commission. Stack: Next.js+Supabase+Vercel+Stripe. Cibles: clubs amateurs, joueurs, entraîneurs Titre IV/V, sponsors. Pricing: Club Free 0€, Standard 19€/m, Premium 49€/m. Lancement ARA. Fondateur: ex-pro, SASU, budget 2000€ an 1. Tables Supabase: profiles, clubs, annonces, agent_messages.`;

const AGENTS = {
  cto: { name:"CTO", icon:"⚙️", color:C.primary, title:"Directeur Technique",
    prompt:`Tu es le CTO de HandballConnect. ${HC}\nArchitecture, choix techniques, scalabilité, sécurité. Tu connais Next.js, Supabase, Vercel, Stripe. Concis, technique, code quand nécessaire. MVP first. Jamais over-engineered.\nTu vois les messages des autres agents et tu coordonnes les décisions techniques.\nSi on te montre une image, analyse-la techniquement.` },
  ba: { name:"BA", icon:"📋", color:C.green, title:"Business Analyst",
    prompt:`Tu es le BA de HandballConnect. ${HC}\nSpecs fonctionnelles, user stories, critères d'acceptation, parcours utilisateur. Tu connais le handball amateur français.\nTu vois les messages des autres agents. Tu traduis les besoins métier en specs pour le DEV. Tu valides avec le CTO.\nSi on te montre une image, analyse l'UX.` },
  dev: { name:"DEV", icon:"💻", color:C.purple, title:"Développeur Multi-Modes",
    prompt:`Tu es le DEV de HandballConnect. ${HC}
Stack: Next.js 16 App Router, React, Supabase, Vercel, Stripe.

Tu travailles dans 5 MODES selon la demande. Détecte le mode et adapte ta réponse :

🏗️ MODE ARCHITECTE : si on parle de "structure", "organisation", "architecture", "découpage" → tu proposes des découpages de modules, patterns, conventions, organisation des dossiers.

👨‍💼 MODE LEAD TECH : si on parle de "stratégie", "priorisation", "roadmap", "dette technique", "review" → tu priorises, arbitres, rédiges des specs techniques, fais des revues de code.

🎨 MODE FRONTEND : si on parle de "page", "composant", "UI", "responsive", "CSS" → tu écris du React/Next.js, gères les états, l'accessibilité, mobile-first.

⚙️ MODE BACKEND : si on parle de "API", "Supabase", "auth", "RLS", "route", "endpoint" → tu écris les routes API, requêtes Supabase, policies RLS, sécurité serveur.

🧪 MODE QA/RECETTE : si on parle de "test", "validation", "recette", "scénario" → tu écris scénarios de test, checklists de recette, valides le code livré.

On peut t'imposer un mode avec "@dev mode backend" ou "@dev en architecte". Tu peux cumuler les modes.

Règles :
- Tu vois les messages des autres agents et tu en tiens compte
- Code propre, commenté, prêt à coller
- Toujours donner le chemin du fichier
- Signale tes choix : "[MODE X]" en début de réponse
- Si on te montre un bug en image, propose le fix avec le code exact` },
  qa: { name:"QA", icon:"🔍", color:C.gold, title:"Testeur / QA",
    prompt:`Tu es le QA de HandballConnect. ${HC}\nTests, bugs, scénarios, qualité, edge cases. Tu penses comme un président de club pressé ou un joueur sur mobile.\nTu vois les messages des autres agents.\nSi on te montre une image, identifie TOUS les bugs visuels et classe-les par sévérité.` },
  commercial: { name:"COMMERCIAL", icon:"🤝", color:C.accent, title:"Responsable Commercial",
    prompt:`Tu es le COMMERCIAL de HandballConnect. ${HC}\nProspection clubs, sponsors, pitch, go-to-market. Tu connais le handball amateur: ligues, comités, FFHB.\nTu vois les messages des autres agents.\nPriorité région ARA. Emails, scripts, argumentaires.` },
  data: { name:"DATA", icon:"🗄️", color:"#06B6D4", title:"Data Engineer",
    prompt:`Tu es le Data Engineer de HandballConnect. ${HC}\nArchitecture base de données Supabase, modélisation, requêtes SQL, optimisation, RGPD, exports.\nTu connais PostgreSQL, Supabase, RLS, indexes.\nTu vois les messages des autres agents. Tu travailles avec le CTO sur l'architecture et avec le DEV sur les requêtes.\nTu garantis que la donnée est propre, performante, conforme RGPD.` },
  design: { name:"DESIGN", icon:"🎨", color:"#EC4899", title:"UX/UI Designer",
    prompt:`Tu es le Designer UX/UI de HandballConnect. ${HC}\nErgonomie, parcours utilisateur, maquettes, design system, accessibilité, mobile-first.\nTu connais les principes UX (Hick, Fitts), les patterns SaaS.\nTu vois les messages des autres agents.\nTu penses au président de club bénévole pressé sur mobile.\nSi on te montre une interface, propose des améliorations concrètes.` },
  marketing: { name:"MARKETING", icon:"📣", color:"#F59E0B", title:"Marketing Manager",
    prompt:`Tu es le Marketing Manager de HandballConnect. ${HC}\nStratégie de contenu, réseaux sociaux (Instagram, LinkedIn, TikTok), SEO, branding.\nTon authentique terrain, jamais corporate.\nTu vois les messages des autres agents. Tu travailles avec COMMERCIAL sur les supports, DESIGN sur les visuels.\nTu proposes calendriers éditoriaux, posts prêts-à-publier, idées vidéos, partenariats influenceurs hand.\nPriorité ARA puis national.` },
  juridique: { name:"JURIDIQUE", icon:"⚖️", color:"#8B5CF6", title:"Conseil Juridique",
    prompt:`Tu es le conseil juridique de HandballConnect. ${HC}\nCGU, CGV, RGPD, conformité Code du sport, statut agent sportif (L222-7).\nPOINT CRITIQUE : HandballConnect doit RESTER plateforme de mise en relation et JAMAIS basculer en agent sportif (2 ans prison + 30k€ amende sans licence FFHB).\nTu vois les messages des autres agents. Tu alertes IMMÉDIATEMENT si une feature ou un discours commercial fait basculer le projet dans la zone agent sportif.\nTu rédiges mentions légales, clauses, disclaimers.\nTes conseils ne remplacent pas un avocat.` },
  devops: { name:"DEVOPS", icon:"🚀", color:"#10B981", title:"DevOps / Infrastructure",
    prompt:`Tu es le DevOps de HandballConnect. ${HC}\nDéploiement Vercel, monitoring, performances, sauvegardes, sécurité infra, CI/CD.\nTu connais Vercel, GitHub Actions, Sentry, Cloudflare.\nTu vois les messages des autres agents.\nTu garantis app en ligne, rapide, sécurisée. Tu alertes sur les coûts. Free-tier tant que possible.` },
};

const AGENT_LIST = Object.entries(AGENTS).map(([id,a])=>({id,...a}));

function fileToBase64(file){return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result.split(",")[1]);r.onerror=rej;r.readAsDataURL(file)})}

export default function AgentsTeam(){
  const [adminOk,setAdminOk]=useState(false);
  const [pin,setPin]=useState("");
  const [messages,setMessages]=useState([]);
  const [input,setInput]=useState("");
  const [loading,setLoading]=useState(false);
  const [loadingAgent,setLoadingAgent]=useState(null);
  const [pastedImage,setPastedImage]=useState(null);
  const [user,setUser]=useState(null);
  const [historyLoaded,setHistoryLoaded]=useState(false);
  const messagesEnd=useRef(null);
  const inputRef=useRef(null);

  useEffect(()=>{supabase.auth.getUser().then(({data:{user:u}})=>{if(u)setUser(u)})},[]);

  useEffect(()=>{
    if(!adminOk||!user||historyLoaded)return;
    const load=async()=>{
      const{data}=await supabase.from("agent_messages").select("*").eq("user_id",user.id).order("created_at",{ascending:true}).limit(200);
      if(data&&data.length>0)setMessages(data.map(m=>({role:m.role,agent:m.agent,content:m.content,id:m.id})));
      setHistoryLoaded(true);
    };
    load();
  },[adminOk,user,historyLoaded]);

  useEffect(()=>{messagesEnd.current?.scrollIntoView({behavior:"smooth"})},[messages]);
  useEffect(()=>{if(adminOk)inputRef.current?.focus()},[adminOk]);

  const handlePaste=useCallback(async(e)=>{
    const items=e.clipboardData?.items;if(!items)return;
    for(const item of items){if(item.type.startsWith("image/")){
      e.preventDefault();const file=item.getAsFile();if(!file)return;
      const base64=await fileToBase64(file);
      setPastedImage({base64,mediaType:item.type,preview:URL.createObjectURL(file)});return;
    }}
  },[]);

  const removeImage=()=>{if(pastedImage?.preview)URL.revokeObjectURL(pastedImage.preview);setPastedImage(null)};

  const parseMentions=(text)=>{
    const mentioned=[];
    for(const[id,a]of Object.entries(AGENTS)){
      const patterns=[`@${id}`,`@${a.name}`,`@${a.name.toLowerCase()}`];
      if(patterns.some(p=>text.toLowerCase().includes(p.toLowerCase())))mentioned.push(id);
    }
    if(mentioned.length===0){
      if(/\b(tous|all|équipe|team|ensemble)\b/i.test(text)||!text.includes("@")){
        return Object.keys(AGENTS);
      }
    }
    return mentioned;
  };

  const saveMsg=async(role,agent,content)=>{
    if(!user)return;
    await supabase.from("agent_messages").insert({user_id:user.id,role,agent:agent||null,content});
  };

  const buildContext=(agentId,userText,img)=>{
    const recent=messages.slice(-30);
    const ctxMessages=recent.map(m=>{
      if(m.role==="user")return{role:"user",content:m.content||"."};
      return{role:"assistant",content:`[${(AGENTS[m.agent]?.name||"AGENT")}]: ${m.content}`};
    });
    const userContent=[];
    if(img){userContent.push({type:"image",source:{type:"base64",media_type:img.mediaType,data:img.base64}})}
    userContent.push({type:"text",text:userText||"Analyse cette image."});
    ctxMessages.push({role:"user",content:userContent.length===1&&!img?userContent[0].text:userContent});
    return ctxMessages;
  };

  const sendMessage=async()=>{
    if((!input.trim()&&!pastedImage)||loading)return;
    const userText=input.trim();setInput("");
    const mentioned=parseMentions(userText);
    const userMsg={role:"user",content:userText,image:pastedImage?.preview||null};
    setMessages(prev=>[...prev,userMsg]);
    await saveMsg("user",null,userText);
    const img=pastedImage;
    setPastedImage(null);
    setLoading(true);

    for(const agentId of mentioned){
      const agent=AGENTS[agentId];
      setLoadingAgent(agentId);
      try{
        const ctxMessages=buildContext(agentId,userText,img);
        const response=await fetch("/api/chat",{
          method:"POST",headers:{"Content-Type":"application/json"},
          body:JSON.stringify({system:agent.prompt,messages:ctxMessages}),
        });
        const data=await response.json();
        const reply=data.content?.map(b=>b.text||"").filter(Boolean).join("\n")||"Erreur de réponse.";
        const agentMsg={role:"assistant",agent:agentId,content:reply};
        setMessages(prev=>[...prev,agentMsg]);
        await saveMsg("assistant",agentId,reply);
      }catch(err){
        const errMsg={role:"assistant",agent:agentId,content:"❌ Erreur de connexion."};
        setMessages(prev=>[...prev,errMsg]);
      }
    }
    setLoading(false);setLoadingAgent(null);
  };

  const handleKeyDown=(e)=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMessage()}};

  const clearHistory=async()=>{
    if(!user)return;
    if(!confirm("Effacer tout l'historique ?"))return;
    await supabase.from("agent_messages").delete().eq("user_id",user.id);
    setMessages([]);
  };

  const css=`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');*{box-sizing:border-box;margin:0;padding:0}@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes pulse{0%,100%{opacity:.3;transform:scale(1)}50%{opacity:.8;transform:scale(1.2)}}@keyframes slideDown{from{opacity:0;transform:translateY(-12px)}to{opacity:1;transform:translateY(0)}}textarea:focus{border-color:${C.primary}!important;box-shadow:0 0 0 3px ${C.primary}15!important}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:4px}`;

  if(!adminOk){
    return <><style>{css}</style>
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{textAlign:"center",animation:"fadeUp .5s ease"}}>
        <div style={{fontSize:48,marginBottom:16}}>🔐</div>
        <h2 style={{color:C.text,fontSize:22,marginBottom:6,fontFamily:"'Bebas Neue',sans-serif",letterSpacing:3}}>ACCÈS ADMIN</h2>
        <p style={{color:C.muted,fontSize:12,marginBottom:20}}>Espace réservé au fondateur</p>
        <input type="password" value={pin} onChange={e=>setPin(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&pin==="handball2026")setAdminOk(true)}} placeholder="Code d'accès" style={{padding:"12px 16px",background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:10,color:C.text,fontSize:14,outline:"none",textAlign:"center",width:220}} autoFocus/>
        <br/>
        <button onClick={()=>{if(pin==="handball2026")setAdminOk(true)}} style={{marginTop:12,padding:"10px 28px",border:"none",borderRadius:10,background:`linear-gradient(135deg,${C.primary},${C.primaryDark})`,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",boxShadow:`0 4px 14px ${C.primary}30`}}>Entrer</button>
        {pin&&pin!=="handball2026"&&pin.length>3&&<p style={{color:C.accentLight,fontSize:11,marginTop:10}}>Code incorrect</p>}
      </div>
    </div></>;
  }

  return <><style>{css}</style>
  <div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",display:"flex",flexDirection:"column"}}>

    <header style={{background:`${C.bg}ee`,backdropFilter:"blur(20px)",borderBottom:`1px solid ${C.border}`,padding:"0 20px",position:"sticky",top:0,zIndex:100}}>
      <div style={{maxWidth:1100,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",height:60}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:36,height:36,borderRadius:10,background:`linear-gradient(135deg,${C.primary},${C.accent})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>🤾</div>
          <h1 style={{fontSize:20,fontFamily:"'Bebas Neue',sans-serif",letterSpacing:3,color:"#fff",lineHeight:1}}>HANDBALL<span style={{color:C.primary}}>CONNECT</span></h1>
          <span style={{fontSize:10,color:C.muted,background:`${C.primary}15`,padding:"3px 10px",borderRadius:6,fontWeight:600,border:`1px solid ${C.primary}30`,marginLeft:8}}>🧠 ÉQUIPE IA · 10 AGENTS</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <button onClick={clearHistory} style={{padding:"6px 12px",border:`1px solid ${C.border}`,borderRadius:8,background:"transparent",color:C.dim,fontSize:11,fontWeight:600,cursor:"pointer"}}>🗑️ Effacer</button>
          <a href="/" style={{padding:"6px 14px",border:`1px solid ${C.border}`,borderRadius:8,color:C.muted,fontSize:11,textDecoration:"none"}}>← Retour</a>
        </div>
      </div>
    </header>

    <div style={{padding:"10px 20px",borderBottom:`1px solid ${C.border}`,background:C.surface}}>
      <div style={{maxWidth:1100,margin:"0 auto",display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
        <span style={{fontSize:11,color:C.dim,marginRight:4}}>Équipe :</span>
        {AGENT_LIST.map(a=><div key={a.id} style={{display:"flex",alignItems:"center",gap:6,padding:"4px 10px",borderRadius:8,background:`${a.color}10`,border:`1px solid ${a.color}20`,cursor:"default"}}>
          <span style={{fontSize:13}}>{a.icon}</span>
          <span style={{fontSize:10,color:a.color,fontWeight:600}}>{a.name}</span>
          <span style={{fontSize:8,color:C.dim}}>@{a.id}</span>
          {loadingAgent===a.id&&<div style={{display:"flex",gap:2,marginLeft:4}}>{[0,1,2].map(j=><div key={j} style={{width:4,height:4,borderRadius:"50%",background:a.color,opacity:.5,animation:`pulse 1s ease ${j*.15}s infinite`}}/>)}</div>}
        </div>)}
      </div>
    </div>

    <div style={{flex:1,overflowY:"auto",padding:20}}>
      <div style={{maxWidth:900,margin:"0 auto"}}>
        {messages.length===0&&(
          <div style={{textAlign:"center",padding:"60px 20px"}}>
            <div style={{fontSize:48,marginBottom:16}}>🧠</div>
            <h3 style={{color:C.text,fontSize:20,fontWeight:700,margin:"0 0 8px",fontFamily:"'Bebas Neue',sans-serif",letterSpacing:2}}>SALLE DE RÉUNION IA</h3>
            <p style={{color:C.muted,fontSize:13,margin:"0 0 8px",lineHeight:1.6,maxWidth:550,marginLeft:"auto",marginRight:"auto"}}>10 agents spécialisés. Le DEV a 5 modes (archi/lead/front/back/QA). Taguez avec <strong style={{color:C.primaryLight}}>@agent</strong>. Sans @ = toute l'équipe.</p>
            <p style={{color:C.dim,fontSize:11,margin:"0 0 24px",padding:"6px 14px",background:`${C.primary}08`,borderRadius:8,display:"inline-block",border:`1px solid ${C.primary}12`}}>📋 Ctrl+V pour images · Historique sauvegardé</p>
            <div style={{display:"flex",flexDirection:"column",gap:8,maxWidth:520,margin:"0 auto"}}>
              {[
                "@dev mode architecte, organise le dossier components",
                "@dev en lead tech, quelle est la dette technique prioritaire ?",
                "@dev mode frontend, code la page de candidature",
                "@dev mode backend, écris l'API de création d'annonce",
                "@dev mode recette, checklist de validation page profil",
                "@cto Quelle est la prochaine priorité technique ?",
                "@ba User story pour publier une annonce",
                "@commercial Email de prospection club N3 ARA",
                "@juridique Vérifie le statut plateforme dans les CGU",
                "Équipe, faisons le point sur l'avancement",
              ].map(s=><button key={s} onClick={()=>{setInput(s);inputRef.current?.focus()}} style={{padding:"10px 16px",background:`${C.primary}08`,border:`1px solid ${C.primary}15`,borderRadius:10,color:C.primaryLight,fontSize:12,fontWeight:500,cursor:"pointer",textAlign:"left",transition:"all .2s"}} onMouseEnter={e=>{e.currentTarget.style.background=`${C.primary}15`}} onMouseLeave={e=>{e.currentTarget.style.background=`${C.primary}08`}}>💬 {s}</button>)}
            </div>
          </div>
        )}

        {messages.map((m,i)=>{
          if(m.role==="user"){
            return <div key={i} style={{display:"flex",justifyContent:"flex-end",marginBottom:14,animation:"fadeUp .3s ease"}}>
              <div style={{maxWidth:"70%",padding:"12px 16px",borderRadius:"16px 16px 4px 16px",background:`linear-gradient(135deg,${C.primary},${C.primaryDark})`,color:C.text,fontSize:13,lineHeight:1.7,whiteSpace:"pre-wrap",wordBreak:"break-word"}}>
                {m.image&&<img src={m.image} alt="" style={{maxWidth:"100%",borderRadius:10,marginBottom:8,border:"1px solid rgba(255,255,255,0.1)"}}/>}
                {m.content}
              </div>
            </div>;
          }
          const agent=AGENTS[m.agent]||{name:"?",icon:"?",color:C.dim};
          return <div key={i} style={{display:"flex",justifyContent:"flex-start",marginBottom:14,animation:"fadeUp .3s ease"}}>
            <div style={{maxWidth:"75%"}}>
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                <span style={{fontSize:16}}>{agent.icon}</span>
                <span style={{fontSize:11,color:agent.color,fontWeight:700,textTransform:"uppercase",letterSpacing:1}}>{agent.name}</span>
                <span style={{fontSize:9,color:C.dim}}>{agent.title}</span>
              </div>
              <div style={{padding:"12px 16px",borderRadius:"4px 16px 16px 16px",background:C.bgCard,border:`1px solid ${agent.color}20`,color:C.text,fontSize:13,lineHeight:1.7,whiteSpace:"pre-wrap",wordBreak:"break-word"}}>{m.content}</div>
            </div>
          </div>;
        })}

        {loading&&loadingAgent&&(
          <div style={{display:"flex",justifyContent:"flex-start",marginBottom:14}}>
            <div style={{padding:"12px 20px",borderRadius:"4px 16px 16px 16px",background:C.bgCard,border:`1px solid ${AGENTS[loadingAgent]?.color||C.primary}20`,display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:16}}>{AGENTS[loadingAgent]?.icon}</span>
              <span style={{fontSize:11,color:AGENTS[loadingAgent]?.color,fontWeight:700}}>{AGENTS[loadingAgent]?.name}</span>
              <div style={{display:"flex",gap:3,marginLeft:4}}>{[0,1,2].map(j=><div key={j} style={{width:5,height:5,borderRadius:"50%",background:AGENTS[loadingAgent]?.color,opacity:.4,animation:`pulse 1.2s ease ${j*.2}s infinite`}}/>)}</div>
            </div>
          </div>
        )}
        <div ref={messagesEnd}/>
      </div>
    </div>

    {pastedImage&&<div style={{padding:"10px 20px",borderTop:`1px solid ${C.border}`,background:`${C.primary}06`,display:"flex",alignItems:"center",gap:12}}>
      <img src={pastedImage.preview} alt="" style={{height:60,borderRadius:8,border:`1px solid ${C.border}`}}/>
      <div style={{flex:1}}><p style={{margin:0,fontSize:12,color:C.text,fontWeight:600}}>📷 Image collée</p><p style={{margin:"2px 0 0",fontSize:11,color:C.muted}}>Sera envoyée avec votre message</p></div>
      <button onClick={removeImage} style={{background:`${C.accent}15`,border:`1px solid ${C.accent}30`,color:C.accentLight,width:30,height:30,borderRadius:8,cursor:"pointer",fontSize:14}}>✕</button>
    </div>}

    <div style={{padding:"16px 20px",borderTop:`1px solid ${C.border}`,background:C.surface}}>
      <div style={{display:"flex",gap:10,maxWidth:900,margin:"0 auto"}}>
        <textarea ref={inputRef} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={handleKeyDown} onPaste={handlePaste} placeholder="Écrivez à l'équipe... (@agent ou sans @ pour tous)" rows={2} style={{flex:1,padding:"12px 16px",background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:12,color:C.text,fontSize:13,outline:"none",resize:"none",fontFamily:"inherit",lineHeight:1.5,transition:"border-color .2s"}} onFocus={e=>{e.target.style.borderColor=C.primary}} onBlur={e=>{e.target.style.borderColor=C.border}}/>
        <button onClick={sendMessage} disabled={(!input.trim()&&!pastedImage)||loading} style={{padding:"12px 20px",border:"none",borderRadius:12,background:(input.trim()||pastedImage)&&!loading?`linear-gradient(135deg,${C.primary},${C.primaryDark})`:C.bgCard,color:(input.trim()||pastedImage)&&!loading?"#fff":C.dim,fontSize:14,fontWeight:700,cursor:(input.trim()||pastedImage)&&!loading?"pointer":"default",transition:"all .2s",boxShadow:(input.trim()||pastedImage)&&!loading?`0 4px 14px ${C.primary}30`:"none",alignSelf:"flex-end"}}>{loading?"...":"→"}</button>
      </div>
      <p style={{textAlign:"center",fontSize:10,color:C.dim,marginTop:8,maxWidth:900,margin:"8px auto 0"}}>Entrée = envoyer · Shift+Entrée = saut de ligne · <strong style={{color:C.primaryLight}}>Ctrl+V = image</strong> · Sans @ = toute l'équipe</p>
    </div>
  </div></>;
}
