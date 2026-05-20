"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { supabase } from "../../lib/supabase";

const C = { primary:"#1D4ED8", primaryLight:"#3B82F6", primaryDark:"#1E3A8A", accent:"#DC2626", accentLight:"#F87171", bg:"#0B1120", bgCard:"rgba(255,255,255,0.04)", bgHover:"rgba(255,255,255,0.07)", surface:"#111827", border:"rgba(255,255,255,0.08)", text:"#F1F5F9", muted:"rgba(255,255,255,0.5)", dim:"rgba(255,255,255,0.3)", green:"#10B981", gold:"#FBBF24", purple:"#8B5CF6" };

const HC = `Handball Connect: plateforme gratuite de mise en relation handball amateur francais. Modele contribution libre, 0 commission. Stack: Next.js 16 + Supabase + Vercel. Cibles: clubs amateurs, joueurs, entraineurs. Editeur: Joker Team SAS, Lyon. Fondateur: Milan, ex-pro handball. Tables Supabase: profiles, clubs, annonces, applications, connections, conversations, messages, jobs, blog_posts, blog_votes, agent_messages.`;

const AGENTS = {
  cto: { name:"CTO", icon:"⚙️", color:C.primary, title:"Directeur Technique",
    prompt:`Tu es le CTO de Handball Connect. ${HC}
Tu decides de l'architecture, des choix techniques, de la scalabilite et de la securite.
Tu connais Next.js, Supabase, Vercel. Concis, technique, code quand necessaire. MVP first. Jamais over-engineered.
Tu coordonnes le DEV et le QA. Tu tranches les decisions techniques.
Si on te montre une image, analyse-la techniquement.` },
  dev: { name:"DEV", icon:"💻", color:C.purple, title:"Developpeur Full-Stack",
    prompt:`Tu es le DEV de Handball Connect. ${HC}
Stack: Next.js 16 App Router, React, Supabase, Vercel.

Tu travailles dans 5 MODES selon la demande :

MODE ARCHITECTE : si on parle de "structure", "organisation", "architecture" → tu proposes des decoupages, patterns, conventions.

MODE LEAD TECH : si on parle de "strategie", "priorisation", "roadmap", "review" → tu priorises, arbitres, fais des revues de code.

MODE FRONTEND : si on parle de "page", "composant", "UI", "responsive" → tu ecris du React/Next.js, geres les etats, mobile-first.

MODE BACKEND : si on parle de "API", "Supabase", "auth", "RLS", "route" → tu ecris les routes API, requetes Supabase, policies RLS.

MODE QA/RECETTE : si on parle de "test", "validation", "recette" → tu ecris scenarios de test, checklists.

On peut t'imposer un mode avec "@dev mode backend". Tu peux cumuler les modes.

Regles :
- Code propre, commente, pret a coller
- Toujours donner le chemin du fichier
- Signale tes choix : "[MODE X]" en debut de reponse
- Si on te montre un bug en image, propose le fix avec le code exact` },
  qa: { name:"QA", icon:"🔍", color:C.gold, title:"Testeur / QA",
    prompt:`Tu es le QA de Handball Connect. ${HC}
Tests, bugs, scenarios, qualite, edge cases. Tu penses comme un president de club presse ou un joueur sur mobile.
Tu verifies que tout fonctionne avant deploiement.
Si on te montre une image, identifie TOUS les bugs visuels et classe-les par severite.` },
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
      if(/\b(tous|all|equipe|team|ensemble)\b/i.test(text)||!text.includes("@")){
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
        const reply=data.content?.map(b=>b.text||"").filter(Boolean).join("\n")||"Erreur de reponse.";
        const agentMsg={role:"assistant",agent:agentId,content:reply};
        setMessages(prev=>[...prev,agentMsg]);
        await saveMsg("assistant",agentId,reply);
      }catch(err){
        const errMsg={role:"assistant",agent:agentId,content:"Erreur de connexion."};
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
        <img src="/logo.png" alt="Handball Connect" style={{width:64,height:64,borderRadius:16,objectFit:"cover",marginBottom:16,display:"block",marginLeft:"auto",marginRight:"auto"}}/>
        <h2 style={{color:C.text,fontSize:22,marginBottom:6,fontFamily:"'Bebas Neue',sans-serif",letterSpacing:3}}>ACCES ADMIN</h2>
        <p style={{color:C.muted,fontSize:12,marginBottom:20}}>Espace reserve au fondateur</p>
        <input type="password" value={pin} onChange={e=>setPin(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&pin==="handball2026")setAdminOk(true)}} placeholder="Code d'acces" style={{padding:"12px 16px",background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:10,color:C.text,fontSize:14,outline:"none",textAlign:"center",width:220}} autoFocus/>
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
          <img src="/logo.png" alt="Handball Connect" style={{width:36,height:36,borderRadius:10,objectFit:"cover"}}/>
          <h1 style={{fontSize:20,fontFamily:"'Bebas Neue',sans-serif",letterSpacing:3,color:"#fff",lineHeight:1}}>HANDBALL <span style={{color:C.primary}}>CONNECT</span></h1>
          <span style={{fontSize:10,color:C.muted,background:`${C.primary}15`,padding:"3px 10px",borderRadius:6,fontWeight:600,border:`1px solid ${C.primary}30`,marginLeft:8}}>EQUIPE IA · 3 AGENTS</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <button onClick={clearHistory} style={{padding:"6px 12px",border:`1px solid ${C.border}`,borderRadius:8,background:"transparent",color:C.dim,fontSize:11,fontWeight:600,cursor:"pointer"}}>Effacer</button>
          <a href="/dashboard" style={{padding:"6px 14px",border:`1px solid ${C.border}`,borderRadius:8,color:C.muted,fontSize:11,textDecoration:"none"}}>← Dashboard</a>
        </div>
      </div>
    </header>

    <div style={{padding:"10px 20px",borderBottom:`1px solid ${C.border}`,background:C.surface}}>
      <div style={{maxWidth:1100,margin:"0 auto",display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
        <span style={{fontSize:11,color:C.dim,marginRight:4}}>Equipe :</span>
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
            <img src="/logo.png" alt="" style={{width:48,height:48,borderRadius:12,objectFit:"cover",marginBottom:16,display:"block",marginLeft:"auto",marginRight:"auto"}}/>
            <h3 style={{color:C.text,fontSize:20,fontWeight:700,margin:"0 0 8px",fontFamily:"'Bebas Neue',sans-serif",letterSpacing:2}}>EQUIPE TECHNIQUE</h3>
            <p style={{color:C.muted,fontSize:13,margin:"0 0 8px",lineHeight:1.6,maxWidth:550,marginLeft:"auto",marginRight:"auto"}}>3 agents specialises. Le DEV a 5 modes (archi/lead/front/back/QA). Taguez avec <strong style={{color:C.primaryLight}}>@agent</strong>. Sans @ = toute l'equipe.</p>
            <p style={{color:C.dim,fontSize:11,margin:"0 0 24px",padding:"6px 14px",background:`${C.primary}08`,borderRadius:8,display:"inline-block",border:`1px solid ${C.primary}12`}}>Ctrl+V pour images · Historique sauvegarde</p>
            <div style={{display:"flex",flexDirection:"column",gap:8,maxWidth:520,margin:"0 auto"}}>
              {[
                "@cto Quelle est la prochaine priorite technique ?",
                "@dev mode frontend, code la page de candidature",
                "@dev mode backend, ecris l'API de creation d'annonce",
                "@dev mode architecte, organise le dossier components",
                "@qa checklist de validation avant deploiement",
                "Equipe, faisons le point sur l'avancement",
              ].map(s=><button key={s} onClick={()=>{setInput(s);inputRef.current?.focus()}} style={{padding:"10px 16px",background:`${C.primary}08`,border:`1px solid ${C.primary}15`,borderRadius:10,color:C.primaryLight,fontSize:12,fontWeight:500,cursor:"pointer",textAlign:"left",transition:"all .2s"}} onMouseEnter={e=>{e.currentTarget.style.background=`${C.primary}15`}} onMouseLeave={e=>{e.currentTarget.style.background=`${C.primary}08`}}>{s}</button>)}
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
      <div style={{flex:1}}><p style={{margin:0,fontSize:12,color:C.text,fontWeight:600}}>Image collee</p><p style={{margin:"2px 0 0",fontSize:11,color:C.muted}}>Sera envoyee avec votre message</p></div>
      <button onClick={removeImage} style={{background:`${C.accent}15`,border:`1px solid ${C.accent}30`,color:C.accentLight,width:30,height:30,borderRadius:8,cursor:"pointer",fontSize:14}}>✕</button>
    </div>}

    <div style={{padding:"16px 20px",borderTop:`1px solid ${C.border}`,background:C.surface}}>
      <div style={{display:"flex",gap:10,maxWidth:900,margin:"0 auto"}}>
        <textarea ref={inputRef} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={handleKeyDown} onPaste={handlePaste} placeholder="Ecrivez a l'equipe... (@cto @dev @qa ou sans @ pour tous)" rows={2} style={{flex:1,padding:"12px 16px",background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:12,color:C.text,fontSize:13,outline:"none",resize:"none",fontFamily:"inherit",lineHeight:1.5,transition:"border-color .2s"}} onFocus={e=>{e.target.style.borderColor=C.primary}} onBlur={e=>{e.target.style.borderColor=C.border}}/>
        <button onClick={sendMessage} disabled={(!input.trim()&&!pastedImage)||loading} style={{padding:"12px 20px",border:"none",borderRadius:12,background:(input.trim()||pastedImage)&&!loading?`linear-gradient(135deg,${C.primary},${C.primaryDark})`:C.bgCard,color:(input.trim()||pastedImage)&&!loading?"#fff":C.dim,fontSize:14,fontWeight:700,cursor:(input.trim()||pastedImage)&&!loading?"pointer":"default",transition:"all .2s",boxShadow:(input.trim()||pastedImage)&&!loading?`0 4px 14px ${C.primary}30`:"none",alignSelf:"flex-end"}}>→</button>
      </div>
      <p style={{textAlign:"center",fontSize:10,color:C.dim,marginTop:8,maxWidth:900,margin:"8px auto 0"}}>Entree = envoyer · Shift+Entree = saut de ligne · <strong style={{color:C.primaryLight}}>Ctrl+V = image</strong> · Sans @ = toute l'equipe</p>
    </div>
  </div></>;
}
