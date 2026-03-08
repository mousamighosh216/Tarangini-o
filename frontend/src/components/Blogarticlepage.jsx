import { useState, useEffect, useRef } from "react";

const G = {
  cream:"#FDF8F3", peach:"#F9EDE4", terra:"#E8856A", terraDeep:"#C4603E",
  terraLight:"#F4A58A", warmBrown:"#3D2016", midBrown:"#7A3F28", muted:"#9A6B58", border:"#F0D8CC",
};

// ── Article content ────────────────────────────────────────────
const ARTICLE = {
  tag:"Explainer", emoji:"🧬", readTime:"5 min read", date:"February 14, 2025",
  likes:284, saves:91,
  title:"What actually IS PCOS? A plain-language guide",
  subtitle:"No jargon, no fear. Here's how we explain polycystic ovary syndrome — starting with a group-chat analogy that actually makes sense.",
  toc:[
    { id:"s1", label:"The group chat analogy" },
    { id:"s2", label:"What's happening in your ovaries" },
    { id:"s3", label:"The three criteria" },
    { id:"s4", label:"Why diagnosis takes so long" },
    { id:"s5", label:"What this means for you" },
    { id:"s6", label:"Your next step" },
  ],
  content:[
    { type:"lead", text:"If you've just heard the words 'polycystic ovary syndrome' from a doctor and nodded along while internally thinking 'wait, what?' — this is for you. I was in that chair two years ago. Nobody explained it like a normal person would. So let me do that." },

    { type:"section", id:"s1", heading:"The group chat analogy" },
    { type:"para", text:"Your body runs on hormones. Think of them as a group chat between your brain, your ovaries, and a dozen other organs. Everyone's supposed to get the messages, respond at the right time, and keep things running smoothly." },
    { type:"para", text:"With PCOS, a few members of that group chat start talking over everyone else. Specifically, the androgens — sometimes called 'male hormones' even though every woman has them — start sending too many messages. The ovaries can't read the right signals anymore." },
    { type:"callout", emoji:"💡", text:"The result? Eggs don't always mature and release properly. The chat goes chaotic. Your whole hormonal system starts responding to the noise instead of the signal." },
    { type:"para", text:"This is why PCOS has such a wide range of symptoms — because hormones affect everything from your skin to your metabolism to your mood. It's not one thing going wrong. It's one disruption cascading through many systems." },

    { type:"section", id:"s2", heading:"What's actually happening in your ovaries" },
    { type:"para", text:"Each month, your ovaries are supposed to develop a follicle — a tiny fluid-filled sac containing an egg — and release it at ovulation. With PCOS, that process gets interrupted." },
    { type:"para", text:"The follicles start developing but don't fully mature. They stick around as small cysts on the ovaries instead of releasing an egg. Hence 'polycystic' — many cysts. But here's the twist: you can have PCOS without visible cysts. The name is genuinely misleading." },
    { type:"stats", items:[
      { n:"1 in 5", label:"women have PCOS", icon:"👩" },
      { n:"70%", label:"go undiagnosed", icon:"🔍" },
      { n:"2 years", label:"average diagnosis wait", icon:"⏰" },
      { n:"Manageable", label:"with the right support", icon:"💪" },
    ]},
    { type:"para", text:"What you might notice instead: irregular periods (or none at all), because without ovulation, the normal cycle doesn't complete. This is why period irregularity is the most common first sign." },

    { type:"section", id:"s3", heading:"The three criteria (Rotterdam Criteria)" },
    { type:"para", text:"Doctors diagnose PCOS using the Rotterdam Criteria — a shorthand that says you need 2 of these 3 things:" },
    { type:"criteria", items:[
      { icon:"📅", title:"Irregular ovulation", desc:"Irregular or absent periods, indicating ovulation isn't happening normally or predictably." },
      { icon:"🧬", title:"Signs of hyperandrogenism", desc:"Either clinical signs (acne, hair loss, facial hair) or elevated androgen levels on a blood test." },
      { icon:"🔬", title:"Polycystic ovaries on ultrasound", desc:"12+ follicles visible on one ovary, or an ovary with increased volume." },
    ]},
    { type:"callout", emoji:"🌸", text:"You only need 2 of 3. Many women with PCOS have clear ultrasounds. You are not a fraud if your scan is clear. The name of this condition is genuinely bad marketing." },

    { type:"section", id:"s4", heading:"Why diagnosis takes so long" },
    { type:"para", text:"The average time between first symptoms and PCOS diagnosis is 1.9 years. In India, it can be longer. This happens because:" },
    { type:"list", items:[
      "Symptoms like irregular periods and acne are often dismissed as 'normal' or stress-related",
      "There's no single test — PCOS is diagnosed by combining evidence and ruling things out",
      "Many doctors aren't trained to connect the dots across seemingly unrelated symptoms",
      "Women are told to 'just lose weight' without investigating why weight management is harder for them",
      "Period stigma means many women don't report irregularities, or aren't taken seriously when they do",
    ]},
    { type:"quote", text:"I spent two years being told it was stress. When I finally got the diagnosis, my first reaction was relief — because at least the monster had a name.", author:"Community member, Tarangini Forum" },

    { type:"section", id:"s5", heading:"What this means for you" },
    { type:"para", text:"PCOS is a chronic condition — which means it doesn't go away, but it can be managed extremely well. Many women with PCOS live completely normal lives. The earlier you understand it, the better your tools." },
    { type:"para", text:"What actually helps: lifestyle changes that support insulin sensitivity (low glycaemic index foods, regular movement), medications when needed (metformin, birth control for symptom management), and regular monitoring." },
    { type:"callout", emoji:"💛", text:"PCOS is not your fault. It is not a character flaw. It is a hormonal condition with a genetic component, and it deserves real medical attention — not dismissal." },

    { type:"section", id:"s6", heading:"Your next step" },
    { type:"para", text:"If you've just been diagnosed, the most useful thing you can do is understand your specific presentation. Not everyone with PCOS has the same symptoms or the same underlying causes." },
    { type:"para", text:"Talk to Meera — she can help you understand your risk profile, find a specialist, and connect you with women who've been exactly where you are. You don't have to piece this together alone." },
  ],
};

const RELATED = [
  { tag:"Lifestyle", emoji:"🥗", title:"The low GI approach to PCOS — what actually works", read:"7 min", likes:156 },
  { tag:"Mental health", emoji:"💛", title:"PCOS and anxiety: the hormonal connection nobody talks about", read:"6 min", likes:112 },
  { tag:"Medical", emoji:"🩺", title:"What to actually say at your first PCOS appointment", read:"4 min", likes:203 },
];

const TAG_COLORS = {
  "Explainer":{ c:"#5B7BE8", bg:"#F0F4FF" },
  "Lifestyle":{ c:"#3A7D5E", bg:"#F0FBF4" },
  "Mental health":{ c:"#8B5CF6", bg:"#F5F0FF" },
  "Medical":{ c:G.terraDeep, bg:G.peach },
};

// ── Styles ─────────────────────────────────────────────────────
const STYLE = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400;1,600&family=DM+Sans:wght@300;400;500;600&display=swap');
@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes blobAnim{0%,100%{border-radius:60% 40% 55% 45%/50% 60% 40% 50%}50%{border-radius:40% 60% 45% 55%/60% 40% 55% 45%}}
@keyframes popStar{0%{transform:scale(1)}50%{transform:scale(1.3)}100%{transform:scale(1)}}
.blog-wrap{min-height:100vh;background:#FDF8F3;font-family:'DM Sans',sans-serif;color:#3D2016}
.toc-btn{display:block;width:100%;text-align:left;font-size:13.5px;color:#9A6B58;padding:7px 13px;border-radius:8px;border:none;border-left:2px solid transparent;cursor:pointer;transition:all .15s;font-family:'DM Sans',sans-serif;background:none}
.toc-btn:hover,.toc-btn.on{color:#C4603E;background:#F9EDE4;border-left-color:#E8856A}
.share-btn{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:20px;border:1.5px solid #F0D8CC;background:#fff;cursor:pointer;font-size:13px;font-weight:500;color:#7A3F28;transition:all .15s;font-family:'DM Sans',sans-serif}
.share-btn:hover{border-color:#E8856A;color:#C4603E;background:#F9EDE4}
.share-btn.on{border-color:#E8856A;color:#C4603E;background:#F9EDE4}
.related-card{background:#fff;border-radius:18px;border:1.5px solid #F0D8CC;overflow:hidden;cursor:pointer;transition:all .25s}
.related-card:hover{transform:translateY(-4px);box-shadow:0 14px 36px rgba(200,80,60,.1);border-color:#F4A58A}
::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#F4A58A;border-radius:4px}
`;

// ── Reading progress ───────────────────────────────────────────
function ProgressBar() {
  const [pct, setPct] = useState(0);
  useEffect(()=>{
    const h=()=>{ const el=document.documentElement; setPct(Math.min(100,(el.scrollTop/(el.scrollHeight-el.clientHeight))*100)); };
    window.addEventListener("scroll",h); return()=>window.removeEventListener("scroll",h);
  },[]);
  return (
    <div style={{ position:"fixed", top:0, left:0, right:0, height:3, background:`${G.border}66`, zIndex:500 }}>
      <div style={{ height:"100%", width:`${pct}%`, background:`linear-gradient(90deg,${G.terraLight},${G.terraDeep})`, transition:"width .1s linear", borderRadius:"0 3px 3px 0" }} />
    </div>
  );
}

// ── Table of contents ──────────────────────────────────────────
function TOC({ items, activeId, onJump }) {
  return (
    <div style={{ background:"#fff", borderRadius:18, border:`1.5px solid ${G.border}`, padding:"18px 14px" }}>
      <p style={{ fontSize:10.5, fontWeight:700, letterSpacing:1.8, textTransform:"uppercase", color:G.terra, marginBottom:11 }}>In this article</p>
      <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
        {items.map(item=>(
          <button key={item.id} className={`toc-btn${activeId===item.id?" on":""}`} onClick={()=>onJump(item.id)}>
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Stat cards ─────────────────────────────────────────────────
function StatCards({ items }) {
  return (
    <div style={{ background:"#fff", border:`1.5px solid ${G.border}`, borderRadius:20, padding:"22px", margin:"28px 0" }}>
      <p style={{ fontSize:10.5, fontWeight:700, letterSpacing:1.8, textTransform:"uppercase", color:G.terra, marginBottom:18 }}>By the numbers</p>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:14 }}>
        {items.map((s,i)=>(
          <div key={i} style={{ textAlign:"center", padding:"16px 12px", background:G.cream, borderRadius:14, border:`1px solid ${G.border}`, animation:`fadeUp .4s ease ${i*.08}s both` }}>
            <div style={{ fontSize:24, marginBottom:8 }}>{s.icon}</div>
            <div style={{ fontFamily:"'Fraunces',serif", fontSize:22, fontWeight:700, color:G.terraDeep, marginBottom:5 }}>{s.n}</div>
            <div style={{ fontSize:12, color:G.muted, lineHeight:1.45 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Criteria cards ─────────────────────────────────────────────
function CriteriaCards({ items }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:11, margin:"22px 0" }}>
      {items.map((item,i)=>(
        <div key={i} style={{ background:"#fff", border:`1.5px solid ${G.border}`, borderRadius:16, padding:"17px 20px", display:"flex", gap:14, alignItems:"flex-start", animation:`fadeUp .4s ease ${i*.1}s both` }}>
          <div style={{ width:46, height:46, borderRadius:14, background:`linear-gradient(135deg,${G.peach},${G.terraLight}44)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>{item.icon}</div>
          <div style={{ flex:1 }}>
            <p style={{ fontFamily:"'Fraunces',serif", fontSize:16, fontWeight:600, color:G.warmBrown, marginBottom:5 }}>{item.title}</p>
            <p style={{ fontSize:14, color:G.midBrown, lineHeight:1.7 }}>{item.desc}</p>
          </div>
          <div style={{ width:28, height:28, borderRadius:"50%", background:`linear-gradient(135deg,${G.terraLight},${G.terraDeep})`, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:13, fontWeight:700, flexShrink:0 }}>{i+1}</div>
        </div>
      ))}
    </div>
  );
}

// ── Callout box ────────────────────────────────────────────────
function Callout({ emoji, text }) {
  return (
    <div style={{ background:`linear-gradient(135deg,${G.peach},${G.cream})`, borderLeft:`4px solid ${G.terra}`, borderRadius:"0 16px 16px 0", padding:"20px 24px", margin:"26px 0" }}>
      <div style={{ fontSize:22, marginBottom:10 }}>{emoji}</div>
      <p style={{ fontFamily:"'Fraunces',serif", fontSize:"clamp(16px,2.2vw,19px)", fontStyle:"italic", color:G.warmBrown, lineHeight:1.65 }}>{text}</p>
    </div>
  );
}

// ── Pull quote ─────────────────────────────────────────────────
function PullQuote({ text, author }) {
  return (
    <div style={{ margin:"32px 0", padding:"26px 30px", background:`linear-gradient(135deg,${G.peach},${G.cream})`, borderRadius:20, border:`1.5px solid ${G.border}` }}>
      <div style={{ fontFamily:"'Fraunces',serif", fontSize:48, color:`${G.terra}44`, lineHeight:.8, marginBottom:12 }}>"</div>
      <p style={{ fontFamily:"'Fraunces',serif", fontSize:"clamp(16px,2.3vw,20px)", fontStyle:"italic", color:G.warmBrown, lineHeight:1.65, marginBottom:14 }}>{text}</p>
      <p style={{ fontSize:12.5, color:G.muted, fontWeight:500 }}>— {author}</p>
    </div>
  );
}

// ── Like / save bar ────────────────────────────────────────────
function ArticleActions({ likes, saves, variant="default" }) {
  const [liked,    setLiked]    = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [lCount,   setLCount]   = useState(likes);
  const [sCount,   setSCount]   = useState(saves);
  const [copied,   setCopied]   = useState(false);
  return (
    <div style={{ display:"flex", gap:9, flexWrap:"wrap" }}>
      <button className={`share-btn${liked?" on":""}`} onClick={()=>{ setLiked(l=>!l); setLCount(c=>liked?c-1:c+1); }}>
        <span style={{ fontSize:16, animation:liked?"popStar .3s ease":"none" }}>{liked?"❤️":"🤍"}</span> {lCount} helpful
      </button>
      <button className={`share-btn${saved?" on":""}`} onClick={()=>{ setSaved(s=>!s); setSCount(c=>saved?c-1:c+1); }}>
        <span style={{ fontSize:16 }}>{saved?"🔖":"📌"}</span> {sCount} saves
      </button>
      <button className="share-btn" onClick={()=>{ setCopied(true); setTimeout(()=>setCopied(false),2000); }}>
        <span style={{ fontSize:16 }}>{copied?"✅":"🔗"}</span> {copied?"Copied!":"Share"}
      </button>
    </div>
  );
}

// ── Related articles ───────────────────────────────────────────
function RelatedArticles({ articles }) {
  return (
    <div style={{ marginTop:52 }}>
      <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:"clamp(22px,3vw,28px)", fontWeight:600, color:G.warmBrown, marginBottom:20 }}>Keep reading</h2>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:16 }}>
        {articles.map((a,i)=>{
          const tc = TAG_COLORS[a.tag]||TAG_COLORS["Explainer"];
          return (
            <div key={i} className="related-card" style={{ animation:`fadeUp .4s ease ${i*.1}s both` }}>
              <div style={{ background:`linear-gradient(135deg,${G.peach},${G.cream})`, padding:"26px 22px 18px" }}>
                <div style={{ fontSize:30, marginBottom:10 }}>{a.emoji}</div>
                <span style={{ display:"inline-flex", padding:"3px 10px", borderRadius:20, fontSize:11.5, fontWeight:600, background:tc.bg, color:tc.c, border:`1px solid ${tc.c}33` }}>{a.tag}</span>
              </div>
              <div style={{ padding:"16px 18px 20px" }}>
                <h3 style={{ fontFamily:"'Fraunces',serif", fontSize:15.5, fontWeight:600, color:G.warmBrown, lineHeight:1.45, marginBottom:12 }}>{a.title}</h3>
                <div style={{ display:"flex", gap:12 }}>
                  <span style={{ fontSize:12, color:G.muted }}>⏱ {a.read}</span>
                  <span style={{ fontSize:12, color:G.muted }}>❤️ {a.likes}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── CTA ────────────────────────────────────────────────────────
function ArticleCTA() {
  return (
    <div style={{ background:`linear-gradient(135deg,${G.terraDeep},#9B3A28)`, borderRadius:24, padding:"42px 34px", marginTop:44, color:"#fff", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", top:-28, right:-28, width:140, height:140, borderRadius:"50%", background:"rgba(255,255,255,.08)", pointerEvents:"none" }} />
      <div style={{ position:"relative" }}>
        <div style={{ fontSize:34, marginBottom:12 }}>🌸</div>
        <h3 style={{ fontFamily:"'Fraunces',serif", fontSize:"clamp(19px,3vw,26px)", marginBottom:10, lineHeight:1.3 }}>Want to know your own risk?</h3>
        <p style={{ fontSize:14.5, opacity:.88, lineHeight:1.78, maxWidth:440, marginBottom:22 }}>
          Meera walks you through 8 questions — no forms, no jargon, just a conversation. 2 minutes and you'll have a real picture.
        </p>
        <div style={{ display:"flex", gap:11, flexWrap:"wrap" }}>
          <button style={{ background:"#fff", color:G.terraDeep, border:"none", borderRadius:50, padding:"11px 24px", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Talk to Meera 💛</button>
          <button style={{ background:"rgba(255,255,255,.15)", color:"#fff", border:"2px solid rgba(255,255,255,.35)", borderRadius:50, padding:"11px 24px", fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Check my risk →</button>
        </div>
      </div>
    </div>
  );
}

// ── Content renderer ───────────────────────────────────────────
function renderBlock(block, i) {
  switch(block.type) {
    case "lead": return (
      <p key={i} style={{ fontFamily:"'Fraunces',serif", fontSize:"clamp(16px,2.4vw,19px)", lineHeight:1.78, color:G.midBrown, marginBottom:26, fontStyle:"italic" }}>{block.text}</p>
    );
    case "section": return (
      <h2 key={i} id={block.id} style={{ fontFamily:"'Fraunces',serif", fontSize:"clamp(20px,3vw,26px)", fontWeight:600, color:G.warmBrown, margin:"42px 0 15px", scrollMarginTop:80 }}>{block.heading}</h2>
    );
    case "para": return (
      <p key={i} style={{ fontSize:16, lineHeight:1.88, color:G.midBrown, marginBottom:17 }}>{block.text}</p>
    );
    case "callout": return <Callout key={i} emoji={block.emoji} text={block.text} />;
    case "stats":   return <StatCards key={i} items={block.items} />;
    case "criteria":return <CriteriaCards key={i} items={block.items} />;
    case "quote":   return <PullQuote key={i} text={block.text} author={block.author} />;
    case "list":    return (
      <ul key={i} style={{ paddingLeft:20, marginBottom:20 }}>
        {block.items.map((item,j)=>(
          <li key={j} style={{ fontSize:15.5, lineHeight:1.8, color:G.midBrown, marginBottom:7 }}>{item}</li>
        ))}
      </ul>
    );
    default: return null;
  }
}

// ── MAIN ──────────────────────────────────────────────────────
export default function BlogArticlePage() {
  const [activeId, setActiveId] = useState("");

  useEffect(()=>{ const el=document.createElement("style"); el.textContent=STYLE; document.head.appendChild(el); return()=>document.head.removeChild(el); },[]);

  useEffect(()=>{
    const ob = new IntersectionObserver(
      entries=>entries.forEach(e=>{ if(e.isIntersecting) setActiveId(e.target.id); }),
      { rootMargin:"-20% 0px -70% 0px" }
    );
    ARTICLE.toc.forEach(item=>{ const el=document.getElementById(item.id); if(el) ob.observe(el); });
    return()=>ob.disconnect();
  },[]);

  const jumpTo = id => document.getElementById(id)?.scrollIntoView({ behavior:"smooth", block:"start" });
  const tc = TAG_COLORS[ARTICLE.tag]||TAG_COLORS["Explainer"];

  return (
    <div className="blog-wrap">
      <ProgressBar />

      {/* Hero */}
      <div style={{ background:"linear-gradient(160deg,#FFF0EB 0%,#FDF8F3 60%,#FFF5F0 100%)", padding:"72px 24px 52px", borderBottom:`1px solid ${G.border}`, position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", width:300, height:300, background:`linear-gradient(135deg,${G.terraLight}33,${G.peach})`, top:-70, right:-30, animation:"blobAnim 8s ease-in-out infinite", borderRadius:"60% 40% 55% 45%/50% 60% 40% 50%", pointerEvents:"none" }} />
        <div style={{ maxWidth:760, margin:"0 auto", position:"relative" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:18, flexWrap:"wrap" }}>
            <span style={{ display:"inline-flex", padding:"4px 12px", borderRadius:20, fontSize:11.5, fontWeight:600, background:tc.bg, color:tc.c, border:`1px solid ${tc.c}33` }}>{ARTICLE.tag}</span>
            <span style={{ fontSize:12.5, color:G.muted }}>⏱ {ARTICLE.readTime}</span>
            <span style={{ fontSize:12.5, color:G.muted }}>·</span>
            <span style={{ fontSize:12.5, color:G.muted }}>{ARTICLE.date}</span>
          </div>
          <h1 style={{ fontFamily:"'Fraunces',serif", fontSize:"clamp(26px,5vw,46px)", fontWeight:700, color:G.warmBrown, lineHeight:1.12, marginBottom:17, animation:"fadeUp .5s ease" }}>
            {ARTICLE.title}
          </h1>
          <p style={{ fontFamily:"'Fraunces',serif", fontSize:"clamp(15px,2.2vw,18px)", fontStyle:"italic", color:G.midBrown, lineHeight:1.68, marginBottom:26, animation:"fadeUp .5s ease .1s both" }}>
            {ARTICLE.subtitle}
          </p>
          <div style={{ display:"flex", alignItems:"center", gap:14, flexWrap:"wrap", marginBottom:22 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:38, height:38, borderRadius:"50%", background:`linear-gradient(135deg,${G.terraLight},${G.terraDeep})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, border:"2px solid #fff", boxShadow:"0 2px 8px rgba(200,80,60,.2)" }}>🌸</div>
              <div>
                <p style={{ fontSize:13.5, fontWeight:600, color:G.warmBrown }}>Meera & the Tarangini team</p>
                <p style={{ fontSize:11.5, color:G.muted }}>Tarangini Journal</p>
              </div>
            </div>
            <div style={{ height:22, width:1, background:G.border }} />
            <ArticleActions likes={ARTICLE.likes} saves={ARTICLE.saves} />
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth:1060, margin:"0 auto", padding:"38px 20px 76px", display:"grid", gridTemplateColumns:"1fr 230px", gap:44, alignItems:"start" }}>
        {/* Article */}
        <article style={{ minWidth:0 }}>
          <div style={{ background:"#fff", borderRadius:22, border:`1.5px solid ${G.border}`, padding:"clamp(22px,4vw,46px)", marginBottom:28 }}>
            {ARTICLE.content.map((block,i)=>renderBlock(block,i))}
          </div>
          <div style={{ background:"#fff", borderRadius:18, border:`1.5px solid ${G.border}`, padding:"18px 22px", marginBottom:28 }}>
            <p style={{ fontSize:13, fontWeight:600, color:G.muted, marginBottom:11 }}>Was this article helpful?</p>
            <ArticleActions likes={ARTICLE.likes} saves={ARTICLE.saves} />
          </div>
          <ArticleCTA />
          <RelatedArticles articles={RELATED} />
        </article>

        {/* Sticky sidebar */}
        <aside style={{ position:"sticky", top:76, display:"flex", flexDirection:"column", gap:13 }}>
          <TOC items={ARTICLE.toc} activeId={activeId} onJump={jumpTo} />

          {/* At a glance */}
          <div style={{ background:"#fff", borderRadius:18, border:`1.5px solid ${G.border}`, padding:"16px 14px" }}>
            <p style={{ fontSize:10.5, fontWeight:700, letterSpacing:1.8, textTransform:"uppercase", color:G.terra, marginBottom:13 }}>At a glance</p>
            {[["⏱",ARTICLE.readTime],["❤️",`${ARTICLE.likes} found this helpful`],["🔖",`${ARTICLE.saves} saves`],["⚠️","Not medical advice"]].map(([ic,lb],i)=>(
              <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:8, marginBottom:9, fontSize:12.5, color:G.midBrown }}>
                <span style={{ fontSize:14, flexShrink:0 }}>{ic}</span>{lb}
              </div>
            ))}
          </div>

          {/* Mini CTA */}
          <div style={{ background:`linear-gradient(135deg,${G.terraLight},${G.terraDeep})`, borderRadius:18, padding:"19px 16px", color:"#fff", textAlign:"center" }}>
            <div style={{ fontSize:26, marginBottom:9 }}>🌸</div>
            <p style={{ fontFamily:"'Fraunces',serif", fontSize:14.5, fontWeight:600, marginBottom:7 }}>Check your risk</p>
            <p style={{ fontSize:11.5, opacity:.88, lineHeight:1.6, marginBottom:13 }}>2 minutes with Meera. No forms. Just a conversation.</p>
            <button style={{ background:"#fff", color:G.terraDeep, border:"none", borderRadius:20, padding:"9px 16px", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", width:"100%" }}>Talk to Meera →</button>
          </div>

          {/* Topic tags */}
          <div style={{ background:"#fff", borderRadius:18, border:`1.5px solid ${G.border}`, padding:"15px 14px" }}>
            <p style={{ fontSize:10.5, fontWeight:700, letterSpacing:1.8, textTransform:"uppercase", color:G.terra, marginBottom:11 }}>Topics</p>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
              {["PCOS basics","Hormones","Diagnosis","Symptoms","Rotterdam criteria","Androgens"].map(t=>(
                <span key={t} style={{ display:"inline-flex", padding:"4px 10px", borderRadius:20, fontSize:11.5, fontWeight:600, background:G.peach, color:G.terraDeep, border:`1px solid ${G.border}`, cursor:"pointer" }}>{t}</span>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}