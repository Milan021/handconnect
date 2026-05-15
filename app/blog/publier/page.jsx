"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import Link from "next/link";

const FONT_LINK = "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap";

const CATEGORIES = ["Transferts","Resultats","Interviews","Analyse","Clubs","Formation","Arbitrage","Equipe de France","Autre"];

const C = {
  primary:"#1D4ED8",primaryDark:"#1E3A8A",green:"#10B981",accent:"#DC2626",
  bg:"#0A0E1A",text:"#F1F5F9",muted:"rgba(255,255,255,0.5)",dim:"rgba(255,255,255,0.3)",border:"rgba(255,255,255,0.08)",
};

export default function BlogPublierPage() {
  const [user,setUser]=useState(null);
  const [profile,setProfile]=useState(null);
  const [loading,setLoading]=useState(true);
  const [submitting,setSubmitting]=useState(false);
  const [success,setSuccess]=useState(false);
  const [error,setError]=useState("");

  const [title,setTitle]=useState("");
  const [content,setContent]=useState("");
  const [category,setCategory]=useState("");
  const [tagsInput,setTagsInput]=useState("");
  const [coverUrl,setCoverUrl]=useState("");

  useEffect(()=>{
    const check=async()=>{
      const{data:{user:u}}=await supabase.auth.getUser();
      if(!u){window.location.href="/login";return}
      setUser(u);
      const{data:p}=await supabase.from("profiles").select("*").eq("id",u.id).single();
      setProfile(p);
      if(p?.role!=="admin"){window.location.href="/dashboard";return}
      setLoading(false);
    };
    check();
  },[]);

  const handleSubmit=async()=>{
    setError("");
    if(!title.trim()){setError("Le titre est requis");return}
    if(!content.trim()){setError("Le contenu est requis");return}
    setSubmitting(true);

    const slug=title.trim().toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
    const tags=tagsInput.split(",").map(t=>t.trim()).filter(t=>t);

    const{error:dbErr}=await supabase.from("blog_posts").insert({
      author_id:user.id,
      title:title.trim(),
      content:content.trim(),
      category:category||null,
      tags:tags.length>0?tags:null,
      cover_image_url:coverUrl.trim()||null,
      slug,
    });

    if(dbErr){setError(dbErr.message);setSubmitting(false);return}
    setSuccess(true);
    setSubmitting(false);
  };

  const inpS={
    width:"100%",padding:"13px 16px",borderRadius:12,
    border:`1px solid ${C.border}`,background:"rgba(255,255,255,0.04)",
    color:"#fff",fontSize:14,outline:"none",fontFamily:"'DM Sans',sans-serif",boxSizing:"border-box",
  };
  const lblS={fontSize:11,color:C.dim,fontWeight:600,letterSpacing:0.5,display:"block",marginBottom:6,textTransform:"uppercase"};

  if(loading) return <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",color:C.dim,fontFamily:"'DM Sans',sans-serif"}}><link href={FONT_LINK} rel="stylesheet"/>Chargement...</div>;

  if(success) return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'DM Sans',sans-serif",padding:20}}>
      <link href={FONT_LINK} rel="stylesheet"/>
      <div style={{width:440,padding:40,background:"rgba(255,255,255,0.03)",border:`1px solid ${C.border}`,borderRadius:24,backdropFilter:"blur(20px)",textAlign:"center"}}>
        <h1 style={{fontSize:24,fontFamily:"'Bebas Neue',sans-serif",letterSpacing:3,color:"#fff",margin:"0 0 8px"}}>ARTICLE PUBLIE</h1>
        <p style={{fontSize:13,color:C.muted,lineHeight:1.6,margin:"0 0 24px"}}>Votre article est maintenant visible dans l'onglet Blog.</p>
        <div style={{display:"flex",gap:10}}>
          <Link href="/dashboard" style={{flex:1,padding:"13px 0",borderRadius:12,border:`1px solid ${C.border}`,background:"transparent",color:C.text,fontSize:13,fontWeight:600,textDecoration:"none",textAlign:"center"}}>Dashboard</Link>
          <button onClick={()=>{setSuccess(false);setTitle("");setContent("");setCategory("");setTagsInput("");setCoverUrl("")}} style={{flex:1,padding:"13px 0",borderRadius:12,border:"none",background:`linear-gradient(135deg,${C.green},#047857)`,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer"}}>Publier un autre</button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'DM Sans',sans-serif",position:"relative",overflow:"hidden",padding:20}}>
      <link href={FONT_LINK} rel="stylesheet"/>
      <div style={{position:"absolute",width:500,height:500,borderRadius:"50%",background:"radial-gradient(circle,rgba(139,92,246,0.06) 0%,transparent 70%)",top:-150,right:-100,pointerEvents:"none"}}/>

      <div style={{width:560,padding:"36px 32px",background:"rgba(255,255,255,0.03)",border:`1px solid ${C.border}`,borderRadius:24,backdropFilter:"blur(20px)",position:"relative",zIndex:1}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <h1 style={{fontSize:24,fontFamily:"'Bebas Neue',sans-serif",letterSpacing:3,color:"#fff",margin:"0 0 4px"}}>PUBLIER UN <span style={{color:"#8B5CF6"}}>ARTICLE</span></h1>
          <p style={{fontSize:12,color:C.dim,margin:0}}>Partagez l'actualite du handball amateur</p>
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <div>
            <label style={lblS}>TITRE *</label>
            <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Ex: Resultats de la 12e journee de Nationale 2" style={inpS}/>
          </div>

          <div style={{display:"flex",gap:10}}>
            <div style={{flex:1}}>
              <label style={lblS}>CATEGORIE</label>
              <select value={category} onChange={e=>setCategory(e.target.value)} style={{...inpS,cursor:"pointer"}}>
                <option value="">-- Choisir --</option>
                {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={{flex:1}}>
              <label style={lblS}>TAGS (separes par des virgules)</label>
              <input value={tagsInput} onChange={e=>setTagsInput(e.target.value)} placeholder="N2, Resultats, Lyon" style={inpS}/>
            </div>
          </div>

          <div>
            <label style={lblS}>IMAGE DE COUVERTURE (URL)</label>
            <input value={coverUrl} onChange={e=>setCoverUrl(e.target.value)} placeholder="https://exemple.com/image.jpg" style={inpS}/>
            <p style={{fontSize:10,color:C.dim,marginTop:4}}>Collez l'URL d'une image hebergee (Imgur, Unsplash, etc.)</p>
          </div>

          <div>
            <label style={lblS}>CONTENU *</label>
            <textarea value={content} onChange={e=>setContent(e.target.value)} placeholder="Redigez votre article ici..." rows={12} maxLength={10000} style={{...inpS,resize:"vertical",lineHeight:1.7}}/>
            <div style={{textAlign:"right",fontSize:10,color:C.dim,marginTop:4}}>{content.length}/10000</div>
          </div>

          {error&&<div style={{padding:"10px 14px",borderRadius:10,background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.2)",color:"#EF4444",fontSize:12,fontWeight:500}}>{error}</div>}

          <div style={{display:"flex",gap:10,marginTop:4}}>
            <Link href="/dashboard" style={{flex:1,padding:"14px 0",borderRadius:12,border:`1px solid ${C.border}`,background:"transparent",color:C.dim,fontSize:13,fontWeight:600,textDecoration:"none",textAlign:"center"}}>Annuler</Link>
            <button onClick={handleSubmit} disabled={submitting} style={{flex:2,padding:"14px 0",borderRadius:12,border:"none",background:submitting?"rgba(255,255,255,0.08)":"linear-gradient(135deg,#8B5CF6,#6D28D9)",color:"#fff",fontSize:14,fontWeight:700,cursor:submitting?"not-allowed":"pointer",fontFamily:"'DM Sans',sans-serif",letterSpacing:1,boxShadow:submitting?"none":"0 4px 20px rgba(139,92,246,0.3)",opacity:submitting?0.6:1}}>{submitting?"Publication...":"PUBLIER L'ARTICLE"}</button>
          </div>
        </div>

        <p style={{textAlign:"center",fontSize:10,color:"rgba(255,255,255,0.1)",marginTop:20,marginBottom:0}}>Handball Connect — Joker Team SAS © {new Date().getFullYear()}</p>
      </div>
    </div>
  );
}
