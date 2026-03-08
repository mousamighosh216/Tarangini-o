import React, { useState, useEffect, useRef, useCallback } from "react";

// ─────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────
const PHASES = {
  GREETING:"greeting", COLLECTING:"collecting", PROCESSING:"processing",
  RESULT:"result", EMOTIONAL:"emotional", FREEFORM:"freeform",
};

const INTAKE_QUESTIONS = [
  { field:"age", ask:"Just so I can understand your situation — roughly how old are you?", chips:["Under 18","18–24","25–32","33–40","40+"],
    ack:{"Under 18":"Got it 💛 PCOS can show up early — you're really smart for paying attention now.","18–24":"Same age I was when I first noticed things were off. You're in the right place 🌸","25–32":"That's when a lot of women start connecting the dots. I'm glad you're here.","33–40":"It's never too late to understand what's going on — knowing is such a relief.","40+":"Hormonal patterns shift a lot over time. Let's figure this out together 💛"}},
  { field:"cycleRegularity", ask:"How have your periods been lately — regular and predictable, or kind of all over the place?", chips:["Very regular","Mostly regular","Somewhat irregular","Very irregular","I barely get them"],
    ack:{"Very regular":"That's actually reassuring 🌸","Mostly regular":"A little variation is normal. Let's look at the full picture.","Somewhat irregular":"I remember that exact feeling — not knowing when it would come. So stressful.","Very irregular":"That unpredictability is exhausting — and it's one of the most common PCOS signs.","I barely get them":"That's definitely something worth looking into. I'm glad you're here 💛"}},
  { field:"cycleLength", ask:"When your period does come, how many days apart are they usually?", chips:["Less than 21 days","21–35 days (normal)","35–60 days","More than 60 days","Not sure"],
    ack:{"Less than 21 days":"Short cycles can signal hormonal imbalances — good to flag.","21–35 days (normal)":"That's in the standard range, great info to have.","35–60 days":"Longer cycles are actually one of the classic PCOS patterns.","More than 60 days":"That's on the longer side — your body is trying to tell you something.","Not sure":"Totally okay — the cycle tracker here can help you start mapping this 💛"}},
  { field:"weightChanges", ask:"Has your weight felt harder to manage lately — even without big changes to what you eat?", chips:["Yes, gaining without reason","Some changes, not sure why","Weight's been stable","Actually lost weight","I haven't noticed"],
    ack:{"Yes, gaining without reason":"Ugh, this frustrated me SO much. It's not laziness — it's insulin resistance. Real thing.","Some changes, not sure why":"Even subtle shifts can matter. Your body's signals are worth listening to.","Weight's been stable":"Good to know — useful context for the bigger picture.","Actually lost weight":"Unexpected weight loss can also be hormonal. Worth noting.","I haven't noticed":"No worries — just one piece of the puzzle 🌸"}},
  { field:"acne", ask:"What about your skin — any more breakouts than usual, especially around your jaw or chin?", chips:["Yes, a lot more","Some, around jaw/chin","Occasional breakouts","My skin's been clear","Had acne, it's improved"],
    ack:{"Yes, a lot more":"Jawline acne is really linked to androgens — that hormone imbalance.","Some, around jaw/chin":"That specific location is a classic hormonal pattern. Really useful.","Occasional breakouts":"Normal fluctuation differs from hormonal patterns — let's keep looking.","My skin's been clear":"That's a helpful data point 🌸","Had acne, it's improved":"Good to know the pattern — timing matters a lot."}},
  { field:"hairChanges", ask:"Any changes with your hair — more falling out, or noticing hair in new places?", chips:["More hair falling out","Hair in new places","Both","No hair changes","Not sure"],
    ack:{"More hair falling out":"That one hit me hard too. It's scary but very treatable 💛","Hair in new places":"That's hirsutism — caused by elevated androgens, common with PCOS.","Both":"Both together are really strong hormonal signals.","No hair changes":"Good — that's a useful baseline.","Not sure":"Hair changes can be gradual and easy to miss 🌸"}},
  { field:"fatigue", ask:"Do you often feel tired or foggy even after a full night's sleep?", chips:["Yes, constantly","Often, especially afternoons","Sometimes","Rarely","No, energy's fine"],
    ack:{"Yes, constantly":"That bone-deep tiredness is real — insulin resistance affects your energy at a cellular level.","Often, especially afternoons":"The afternoon crash is so classic with blood sugar issues. You're not imagining it.","Sometimes":"Occasional fatigue is normal but consistent patterns matter.","Rarely":"Good to know — energy levels tell us a lot about what's happening hormonally.","No, energy's fine":"That's actually a positive sign 💛"}},
  { field:"familyHistory", ask:"One last thing — does anyone in your family have PCOS, irregular periods, or hormonal issues?", chips:["Yes, definitely","Maybe, not sure","No family history","I don't know","I'm adopted / no info"],
    ack:{"Yes, definitely":"PCOS has a strong genetic component — this is really important context.","Maybe, not sure":"It's often undiagnosed in older generations who didn't have the language for it.","No family history":"Family history helps but isn't required — PCOS can show up without it.","I don't know":"That's totally fine — we have enough from everything you've shared 💛","I'm adopted / no info":"No worries at all — your own symptoms tell us a lot 🌸"}},
];

const RISK_WEIGHTS = {
  cycleRegularity:{"Very regular":0,"Mostly regular":1,"Somewhat irregular":2,"Very irregular":3,"I barely get them":4},
  cycleLength:{"Less than 21 days":1,"21–35 days (normal)":0,"35–60 days":2,"More than 60 days":3,"Not sure":1},
  weightChanges:{"Yes, gaining without reason":3,"Some changes, not sure why":1,"Weight's been stable":0,"Actually lost weight":1,"I haven't noticed":0},
  acne:{"Yes, a lot more":3,"Some, around jaw/chin":2,"Occasional breakouts":1,"My skin's been clear":0,"Had acne, it's improved":1},
  hairChanges:{"More hair falling out":2,"Hair in new places":3,"Both":4,"No hair changes":0,"Not sure":0},
  fatigue:{"Yes, constantly":2,"Often, especially afternoons":1,"Sometimes":1,"Rarely":0,"No, energy's fine":0},
  familyHistory:{"Yes, definitely":2,"Maybe, not sure":1,"No family history":0,"I don't know":0,"I'm adopted / no info":0},
};

function calculateRisk(data) {
  let score=0, max=0;
  Object.entries(RISK_WEIGHTS).forEach(([field,map])=>{
    const val=data[field]; if(val&&map[val]!==undefined) score+=map[val];
    max+=Math.max(...Object.values(map));
  });
  const pct=Math.round((score/max)*100);
  if(pct<=25) return{level:"low",pct,label:"Low Indicators",color:"#4CAF7D",bg:"#F0FBF4",desc:"Your answers show relatively few PCOS-associated patterns right now."};
  if(pct<=55) return{level:"moderate",pct,label:"Moderate Indicators",color:"#F0A830",bg:"#FFF8ED",desc:"Some patterns worth discussing with a doctor — nothing to panic about."};
  return{level:"high",pct,label:"Strong Indicators",color:"#E8856A",bg:"#FFF0EB",desc:"Several patterns commonly associated with PCOS. A doctor visit is a good next step."};
}

const FORUM_POSTS={
  scared:[{tag:"Just diagnosed",emoji:"🌸",text:"I cried for 2 hours after my diagnosis. Then I found this forum and realized I wasn't alone. That changed everything.",likes:89,replies:24},{tag:"First steps",emoji:"💛",text:"Scared is valid. I was terrified. Three months in — I understand my body better than I ever have. It gets better.",likes:64,replies:19},{tag:"Support",emoji:"🤗",text:"For anyone reading this feeling overwhelmed — you found the right place. We've all been that person. Welcome 💛",likes:112,replies:41}],
  relieved:[{tag:"Finally answers",emoji:"✨",text:"Two years of confusing symptoms and finally a name for it. Honestly felt like relief more than anything.",likes:78,replies:15},{tag:"Moving forward",emoji:"💪",text:"Knowing is POWER. I went from confused to informed in 3 weeks. Now I know exactly what questions to ask my doctor.",likes:55,replies:12},{tag:"Lifestyle wins",emoji:"🌿",text:"Six months of low GI eating and my cycles are actually getting regular. Small changes, real results.",likes:143,replies:38}],
  overwhelmed:[{tag:"One step at a time",emoji:"🌸",text:"When I felt most overwhelmed I focused on just one thing: booking the appointment. That's enough for today.",likes:97,replies:28},{tag:"Be gentle",emoji:"💛",text:"Nobody figures PCOS out in a week. Be gentle with yourself. The community is here for the messy middle parts.",likes:88,replies:22},{tag:"What helped",emoji:"🌿",text:"I started a symptom journal — not to obsess, just to notice. Made my first doctor visit SO much more productive.",likes:61,replies:17}],
  ready:[{tag:"Next steps",emoji:"💪",text:"What actually helped: finding a gynaecologist who specialises in PCOS. Game changer vs a general GP.",likes:74,replies:19},{tag:"Lifestyle",emoji:"🌿",text:"Three things that moved the needle: walking daily, cutting sugar, magnesium. Talk to your doctor first.",likes:120,replies:33},{tag:"Tracking",emoji:"📅",text:"The cycle tracker here helped me spot patterns I never noticed. When I showed my doctor the data, she was impressed.",likes:58,replies:14}],
};

const EMOTIONAL_RESPONSES={
  "Honestly a bit scared 😔":{key:"scared",reply:"That makes complete sense — it means you actually care about yourself, which is beautiful 💛 Let me show you what women who felt exactly this way wrote when they first came here."},
  "Relieved to have some clarity ✨":{key:"relieved",reply:"I love that for you 🌸 Knowledge really is power. Let me show you conversations from women who turned that clarity into real action."},
  "Overwhelmed, not sure what to do 😮‍💨":{key:"overwhelmed",reply:"Hey — one step at a time, okay? You don't have to figure everything out today. Let me show you what helped others when they felt exactly this overwhelmed 💛"},
  "I'm okay, ready for next steps 💪":{key:"ready",reply:"I love that energy 💪 Let me point you to the most useful conversations from women who went from 'what now' to 'I've got this'."},
};

const MEERA_PROMPT=`You are Meera, a 25-year-old woman diagnosed with PCOS two years ago. Warm big sister energy — never clinical.
- 3-4 sentences max like texting a friend
- Always validate feelings before giving info
- Simple analogies, zero medical jargon
- End with one gentle next step
- Light emojis: 💛 🌸 💪
- NEVER say you're an AI. Never diagnose.`;

// ─────────────────────────────────────────────────────────────
// CSS
// ─────────────────────────────────────────────────────────────
const css=`
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,500;0,700;1,400;1,600&family=DM+Sans:wght@300;400;500;600&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
:root{
  --cream:#FDF8F3;--peach:#F9EDE4;--terra:#E8856A;--terra-deep:#C4603E;
  --terra-light:#F4A58A;--warm-brown:#3D2016;--mid-brown:#7A3F28;
  --text:#2C1810;--muted:#9A6B58;--border:#F0D8CC;--white:#fff;
}
html{scroll-behavior:smooth}
body{background:var(--cream);color:var(--text);font-family:'DM Sans',sans-serif;overflow-x:hidden}
::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:var(--peach)}::-webkit-scrollbar-thumb{background:var(--terra-light);border-radius:4px}

@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
@keyframes bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-5px)}}
@keyframes blob{0%,100%{border-radius:60% 40% 55% 45%/50% 60% 40% 50%}33%{border-radius:40% 60% 45% 55%/60% 40% 55% 45%}66%{border-radius:55% 45% 60% 40%/45% 55% 50% 60%}}
@keyframes slideRight{from{opacity:0;transform:translateX(24px)}to{opacity:1;transform:translateX(0)}}
@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}

.fade-up{animation:fadeUp 0.6s ease both}
.display-font{font-family:'Fraunces',serif}
.section-label{font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--terra);margin-bottom:12px}

/* Nav */
.nav-link{color:var(--mid-brown);font-size:14px;font-weight:500;text-decoration:none;transition:color 0.2s;white-space:nowrap}
.nav-link:hover{color:var(--terra-deep)}

/* Buttons */
.btn-primary{background:linear-gradient(135deg,var(--terra-light),var(--terra-deep));color:#fff;border:none;border-radius:50px;padding:13px 26px;font-size:14px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.25s;box-shadow:0 4px 14px rgba(200,80,60,.28);white-space:nowrap}
.btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 22px rgba(200,80,60,.36)}
.btn-outline{background:transparent;color:var(--terra-deep);border:2px solid var(--terra-light);border-radius:50px;padding:11px 24px;font-size:14px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.25s;white-space:nowrap}
.btn-outline:hover{background:var(--peach);border-color:var(--terra-deep);transform:translateY(-2px)}
.btn-ghost{background:transparent;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.2s}

/* Cards */
.feature-card{background:#fff;border-radius:22px;padding:28px;border:1.5px solid var(--border);transition:all 0.3s;cursor:pointer;position:relative;overflow:hidden}
.feature-card::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,var(--peach),transparent);opacity:0;transition:opacity 0.3s}
.feature-card:hover{transform:translateY(-5px);box-shadow:0 18px 45px rgba(200,80,60,.11);border-color:var(--terra-light)}
.feature-card:hover::before{opacity:1}
.stat-card{background:linear-gradient(135deg,#fff,var(--peach));border-radius:18px;padding:24px 20px;border:1.5px solid var(--border);text-align:center}
.forum-card{background:#fff;border-radius:18px;padding:18px 20px;border:1.5px solid var(--border);transition:all 0.2s}
.forum-card:hover{border-color:var(--terra-light);box-shadow:0 6px 20px rgba(200,80,60,.08)}

/* Tags */
.tag{display:inline-block;background:var(--peach);color:var(--terra-deep);font-size:11px;font-weight:600;padding:3px 10px;border-radius:20px;border:1px solid var(--border)}

/* Chat */
.bubble-m{background:var(--peach);border-radius:18px 18px 18px 4px;padding:11px 15px;max-width:84%;font-size:14px;line-height:1.65;color:var(--warm-brown);box-shadow:0 2px 8px rgba(200,80,60,.07)}
.bubble-u{background:linear-gradient(135deg,var(--terra-light),var(--terra-deep));border-radius:18px 18px 4px 18px;padding:11px 15px;max-width:84%;font-size:14px;line-height:1.65;color:#fff;box-shadow:0 3px 10px rgba(200,80,60,.25);margin-left:auto}
.dot{width:8px;height:8px;border-radius:50%;background:var(--terra);animation:bounce 1.2s infinite}
.chip{background:transparent;border:1.5px solid var(--terra-light);border-radius:20px;padding:7px 13px;font-size:13px;color:var(--terra-deep);cursor:pointer;font-family:'DM Sans',sans-serif;font-weight:500;transition:all 0.15s;white-space:nowrap}
.chip:hover{background:var(--peach);border-color:var(--terra-deep);transform:translateY(-1px)}
.chip:active{transform:scale(0.97)}

/* Blob */
.blob{position:absolute;border-radius:60% 40% 55% 45%/50% 60% 40% 50%;animation:blob 8s ease-in-out infinite;pointer-events:none}

/* Page content */
.page-section{padding:72px 24px;max-width:900px;margin:0 auto}
.prose p{font-size:15px;line-height:1.8;color:var(--mid-brown);margin-bottom:16px}
.prose h2{font-family:'Fraunces',serif;font-size:26px;color:var(--warm-brown);margin:36px 0 12px}
.prose h3{font-size:17px;font-weight:600;color:var(--warm-brown);margin:24px 0 8px}

/* Mobile nav */
.mobile-menu{display:none;flex-direction:column;gap:4px;cursor:pointer;padding:4px}
.mobile-menu span{display:block;width:22px;height:2px;background:var(--terra-deep);border-radius:2px;transition:all 0.3s}

/* Responsive */
@media(max-width:900px){
  .hero-grid{grid-template-columns:1fr!important}
  .phone-mockup{display:none!important}
  .features-grid{grid-template-columns:1fr!important}
  .stats-grid{grid-template-columns:repeat(2,1fr)!important}
  .community-grid{grid-template-columns:1fr!important}
  .footer-grid{grid-template-columns:1fr 1fr!important}
  .footer-brand{grid-column:1/-1!important}
  .nav-links{display:none!important}
  .nav-cta{display:none!important}
  .mobile-menu{display:flex!important}
  .cta-buttons{flex-direction:column!important;align-items:center!important}
  .meera-layout{flex-direction:column!important}
  .side-panel{display:none!important}
  .meera-chat{max-width:100%!important;width:100%!important}
  .page-section{padding:56px 16px!important}
  .faq-grid{grid-template-columns:1fr!important}
  .blog-grid{grid-template-columns:1fr!important}
  .team-grid{grid-template-columns:repeat(2,1fr)!important}
}
@media(max-width:600px){
  .stats-grid{grid-template-columns:repeat(2,1fr)!important}
  .hero-h1{font-size:36px!important}
  .footer-grid{grid-template-columns:1fr!important}
  .team-grid{grid-template-columns:1fr!important}
  .cta-box{padding:48px 24px!important}
}
input,textarea{font-family:'DM Sans',sans-serif}
textarea:focus,input:focus{outline:none}
`;

// ─────────────────────────────────────────────────────────────
// SHARED COMPONENTS
// ─────────────────────────────────────────────────────────────
function Avatar({size=38}){
  return <div style={{width:size,height:size,borderRadius:"50%",background:"linear-gradient(135deg,#F4A58A,#E8856A)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.44,flexShrink:0,boxShadow:"0 3px 12px rgba(232,133,106,.35)",border:"2px solid #fff"}}>🌸</div>;
}
function Typing(){
  return(
    <div style={{display:"flex",alignItems:"flex-end",gap:8}}>
      <Avatar size={28}/>
      <div style={{background:"#FFF0EB",borderRadius:"18px 18px 18px 4px",padding:"10px 14px",display:"flex",gap:5}}>
        {[0,1,2].map(i=><div key={i} className="dot" style={{animationDelay:`${i*0.2}s`}}/>)}
      </div>
    </div>
  );
}
function useInView(t=0.1){
  const ref=useRef(null);const[v,setV]=useState(false);
  useEffect(()=>{const ob=new IntersectionObserver(([e])=>{if(e.isIntersecting)setV(true)},{threshold:t});if(ref.current)ob.observe(ref.current);return()=>ob.disconnect();},[]);
  return[ref,v];
}

// ─────────────────────────────────────────────────────────────
// RESULT CARD
// ─────────────────────────────────────────────────────────────
function ResultCard({data,risk}){
  const bars=[
    {label:"Hormonal patterns",score:(RISK_WEIGHTS.acne[data.acne]||0)+(RISK_WEIGHTS.hairChanges[data.hairChanges]||0),max:7},
    {label:"Cycle regularity",score:(RISK_WEIGHTS.cycleRegularity[data.cycleRegularity]||0)+(RISK_WEIGHTS.cycleLength[data.cycleLength]||0),max:7},
    {label:"Physical symptoms",score:(RISK_WEIGHTS.weightChanges[data.weightChanges]||0)+(RISK_WEIGHTS.fatigue[data.fatigue]||0),max:5},
  ];
  return(
    <div style={{background:risk.bg,border:`1.5px solid ${risk.color}55`,borderRadius:20,padding:"16px 18px",maxWidth:"88%",animation:"fadeUp 0.5s ease"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
        <div style={{width:40,height:40,borderRadius:"50%",background:risk.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>
          {risk.level==="low"?"🌿":risk.level==="moderate"?"🌸":"💛"}
        </div>
        <div>
          <div style={{fontFamily:"'Fraunces',serif",fontSize:14,fontWeight:700,color:risk.color}}>{risk.label}</div>
          <div style={{fontSize:11,color:"#9A6B58",marginTop:1}}>Your PCOS Risk Profile</div>
        </div>
        <div style={{marginLeft:"auto",fontFamily:"'Fraunces',serif",fontSize:26,fontWeight:700,color:risk.color}}>{risk.pct}%</div>
      </div>
      {bars.map((b,i)=>{
        const pct=Math.min(100,Math.round((b.score/b.max)*100));
        return(
          <div key={i} style={{marginBottom:9}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:11.5,color:"#7A3F28",fontWeight:500,marginBottom:4}}>
              <span>{b.label}</span><span>{pct}%</span>
            </div>
            <div style={{height:5,background:"rgba(255,255,255,0.7)",borderRadius:8,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${risk.color}77,${risk.color})`,borderRadius:8,transition:"width 1.2s ease 0.3s"}}/>
            </div>
          </div>
        );
      })}
      <div style={{marginTop:10,fontSize:12,color:"#7A3F28",lineHeight:1.55,background:"rgba(255,255,255,0.5)",borderRadius:8,padding:"7px 10px"}}>
        ⚠️ {risk.desc} Not a medical diagnosis.
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// FORUM PANEL
// ─────────────────────────────────────────────────────────────
function ForumPanel({emotionKey,onClose}){
  const posts=FORUM_POSTS[emotionKey]||FORUM_POSTS.scared;
  return(
    <div style={{background:"#fff",borderRadius:20,border:"1.5px solid var(--border)",overflow:"hidden",maxWidth:"92%",boxShadow:"0 8px 28px rgba(200,80,60,.1)",animation:"fadeUp 0.4s ease"}}>
      <div style={{background:"linear-gradient(135deg,#FFF0EB,#FDF8F3)",padding:"12px 16px",borderBottom:"1px solid var(--border)",display:"flex",alignItems:"center",gap:10}}>
        <span style={{fontSize:17}}>💬</span>
        <div>
          <div style={{fontFamily:"'Fraunces',serif",fontSize:13,fontWeight:700,color:"var(--warm-brown)"}}>From the community</div>
          <div style={{fontSize:10.5,color:"var(--muted)"}}>Anonymous · No judgement · Real stories</div>
        </div>
        <button onClick={onClose} style={{marginLeft:"auto",background:"none",border:"none",cursor:"pointer",color:"var(--muted)",fontSize:18,lineHeight:1}}>×</button>
      </div>
      <div style={{padding:"10px 12px",display:"flex",flexDirection:"column",gap:9}}>
        {posts.map((p,i)=>(
          <div key={i} style={{background:"var(--cream)",borderRadius:12,padding:"11px 13px",border:"1px solid var(--border)",animation:`fadeUp 0.4s ease ${i*0.1}s both`}}>
            <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:6}}>
              <span style={{fontSize:14}}>{p.emoji}</span>
              <span className="tag">{p.tag}</span>
              <span style={{fontSize:10.5,color:"var(--muted)",marginLeft:"auto"}}>Anonymous</span>
            </div>
            <p style={{fontSize:12.5,lineHeight:1.65,color:"var(--mid-brown)"}}>{p.text}</p>
            <div style={{display:"flex",gap:11,marginTop:7}}>
              <span style={{fontSize:11.5,color:"var(--muted)"}}>❤️ {p.likes}</span>
              <span style={{fontSize:11.5,color:"var(--muted)"}}>💬 {p.replies}</span>
            </div>
          </div>
        ))}
        <button className="btn-primary" style={{fontSize:13,padding:"10px 18px",marginTop:2}}>Join the full conversation →</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// NAVBAR
// ─────────────────────────────────────────────────────────────
function Navbar({page,setPage}){
  const[scrolled,setScrolled]=useState(false);
  const[menuOpen,setMenuOpen]=useState(false);
  useEffect(()=>{const h=()=>setScrolled(window.scrollY>30);window.addEventListener("scroll",h);return()=>window.removeEventListener("scroll",h);},[]);
  useEffect(()=>setMenuOpen(false),[page]);
  const links=[["Home","home"],["About","about"],["Blog","blog"],["Contact","contact"]];
  return(
    <>
      <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:200,transition:"all 0.3s",background:scrolled||menuOpen?"rgba(253,248,243,0.96)":"transparent",backdropFilter:scrolled||menuOpen?"blur(14px)":"none",borderBottom:scrolled||menuOpen?"1px solid rgba(240,216,204,0.7)":"none",padding:scrolled?"10px 0":"18px 0"}}>
        <div style={{maxWidth:1100,margin:"0 auto",padding:"0 24px",display:"flex",alignItems:"center",gap:24}}>
          <div className="display-font" style={{fontSize:20,fontWeight:700,color:"var(--terra-deep)",cursor:"pointer",flexShrink:0}} onClick={()=>setPage("home")}>🌸 Tarangini</div>
          <div className="nav-links" style={{display:"flex",gap:24,marginLeft:8}}>
            {links.map(([l,p])=>(
              <button key={p} className="nav-link btn-ghost" style={{color:page===p?"var(--terra-deep)":"var(--mid-brown)",fontWeight:page===p?600:500}} onClick={()=>setPage(p)}>{l}</button>
            ))}
          </div>
          <div className="nav-cta" style={{marginLeft:"auto",display:"flex",gap:10}}>
            <button className="btn-outline" style={{padding:"8px 18px",fontSize:13}} onClick={()=>setPage("meera")}>Talk to Meera 💛</button>
            <button className="btn-primary" style={{padding:"8px 18px",fontSize:13}} onClick={()=>setPage("meera")}>Check my risk →</button>
          </div>
          <div className="mobile-menu" style={{marginLeft:"auto"}} onClick={()=>setMenuOpen(o=>!o)}>
            <span style={{transform:menuOpen?"rotate(45deg) translate(4px,4px)":"none"}}/>
            <span style={{opacity:menuOpen?0:1}}/>
            <span style={{transform:menuOpen?"rotate(-45deg) translate(4px,-4px)":"none"}}/>
          </div>
        </div>
        {menuOpen&&(
          <div style={{background:"rgba(253,248,243,0.98)",borderTop:"1px solid var(--border)",padding:"16px 24px",display:"flex",flexDirection:"column",gap:4}}>
            {links.map(([l,p])=>(
              <button key={p} className="btn-ghost" style={{textAlign:"left",padding:"12px 8px",fontSize:16,fontWeight:600,color:page===p?"var(--terra-deep)":"var(--warm-brown)",borderBottom:"1px solid var(--border)"}} onClick={()=>setPage(p)}>{l}</button>
            ))}
            <div style={{display:"flex",flexDirection:"column",gap:10,marginTop:12}}>
              <button className="btn-outline" style={{width:"100%"}} onClick={()=>setPage("meera")}>Talk to Meera 💛</button>
              <button className="btn-primary" style={{width:"100%"}} onClick={()=>setPage("meera")}>Check my risk →</button>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// MEERA PAGE
// ─────────────────────────────────────────────────────────────
function MeeraPage({setPage}){
  const[msgs,setMsgs]=useState([]);
  const[chips,setChips]=useState([]);
  const[inputText,setInputText]=useState("");
  const[typing,setTyping]=useState(false);
  const[phase,setPhase]=useState(PHASES.GREETING);
  const[qIndex,setQIndex]=useState(0);
  const[collectedData,setCollectedData]=useState({});
  const[riskResult,setRiskResult]=useState(null);
  const[showResult,setShowResult]=useState(false);
  const[showForum,setShowForum]=useState(false);
  const[emotionKey,setEmotionKey]=useState(null);
  const histRef=useRef([]);const endRef=useRef(null);

  useEffect(()=>{endRef.current?.scrollIntoView({behavior:"smooth"});},[msgs,typing,showResult,showForum]);

  const addMsg=(role,content)=>setMsgs(p=>[...p,{role,content}]);
  const meeraSay=useCallback(async(text,delay=1200)=>{
    setTyping(true);await new Promise(r=>setTimeout(r,delay+Math.random()*300));
    setTyping(false);addMsg("meera",text);histRef.current.push({role:"assistant",content:text});
  },[]);

  useEffect(()=>{
    const boot=async()=>{
      await meeraSay("Hey, I'm Meera 🌸 I remember exactly how it feels to land somewhere like this — something feels off and you're not sure where to start. I've been there. What's going on?",700);
      setChips(["Something feels off with my body","My doctor mentioned PCOS","I want to check my risk","Just exploring for now"]);
    };boot();
  },[]);

  const send=async(text)=>{
    if(!text.trim()||typing)return;
    addMsg("user",text);histRef.current.push({role:"user",content:text});
    setChips([]);setInputText("");

    if(phase===PHASES.GREETING){
      const g={"Something feels off with my body":"I hear you — and that feeling that something's not right? Trust it. Let me ask you a few things so I can actually help. No wrong answers 💛","My doctor mentioned PCOS":"Oh I remember sitting in that exact chair, nodding while internally panicking 😄 First thing — it sounds scarier than it is. Let me walk you through it?","I want to check my risk":"Love that you're being proactive 💪 It's a conversation, not a cold form. Eight questions and you'll have a real picture. Ready?","Just exploring for now":"Totally okay 🌸 No pressure. Let's just talk — I'll ask a few gentle questions and you'll come away with much more clarity."};
      await meeraSay(g[text]||g["Just exploring for now"],1000);
      await meeraSay(INTAKE_QUESTIONS[0].ask,700);
      setChips(INTAKE_QUESTIONS[0].chips);setQIndex(0);setPhase(PHASES.COLLECTING);return;
    }

    if(phase===PHASES.COLLECTING){
      const q=INTAKE_QUESTIONS[qIndex];
      const newData={...collectedData,[q.field]:text};setCollectedData(newData);
      await meeraSay(q.ack[text]||"Got it, thank you for sharing 💛",900);
      const next=qIndex+1;
      if(next<INTAKE_QUESTIONS.length){await meeraSay(INTAKE_QUESTIONS[next].ask,700);setChips(INTAKE_QUESTIONS[next].chips);setQIndex(next);}
      else{
        setPhase(PHASES.PROCESSING);
        await meeraSay("Okay — I have everything I need 💛 Give me just a second...",600);
        setTyping(true);await new Promise(r=>setTimeout(r,2200));setTyping(false);
        const risk=calculateRisk(newData);setRiskResult(risk);
        const intros={low:"Here's what I see 🌿 Your patterns look relatively calm right now, which is genuinely good news.",moderate:"Here's the picture 🌸 Some patterns worth a closer look — nothing to panic about, but worth knowing.",high:"I want to be honest with you the way I'd want someone to be 💛 Your answers show some patterns commonly linked with PCOS."};
        await meeraSay(intros[risk.level],800);setShowResult(true);setPhase(PHASES.RESULT);
        await new Promise(r=>setTimeout(r,500));
        const fu={low:"This doesn't mean you can ignore symptoms — keeping an eye on your cycle is always smart. How are you feeling seeing this?",moderate:"This is NOT a diagnosis — it means the conversation with a doctor is worth having. You have real data to walk in with. How are you feeling?",high:"This is not a diagnosis. But it IS worth talking to a doctor, and now you know exactly what to tell them. How are you feeling right now?"};
        await meeraSay(fu[risk.level],1200);
        setChips(["Honestly a bit scared 😔","Relieved to have some clarity ✨","Overwhelmed, not sure what to do 😮‍💨","I'm okay, ready for next steps 💪"]);
        setPhase(PHASES.EMOTIONAL);
      }return;
    }

    if(phase===PHASES.EMOTIONAL){
      const resp=EMOTIONAL_RESPONSES[text];const key=resp?.key||"scared";setEmotionKey(key);
      await meeraSay(resp?.reply||"That makes complete sense 💛 Let me show you what helped others.",1000);
      setShowForum(true);
      await new Promise(r=>setTimeout(r,600));
      await meeraSay("The cycle tracker here can help you map patterns for your doctor, and I can help you find a specialist near you. What feels like the right next step?",1400);
      setChips(["Help me find a doctor 👩‍⚕️","Show me the cycle tracker 📅","I want to learn more about PCOS","Just keep talking with Meera 💛"]);
      setPhase(PHASES.FREEFORM);return;
    }

    const quick={"Help me find a doctor 👩‍⚕️":"The Consultants section has verified gynaecologists you can filter by location 🌸 Look for ones who list PCOS as a speciality — they're so much more helpful than a general GP.","Show me the cycle tracker 📅":"The cycle tracker is right here on Tarangini 💛 Log your period dates and it starts predicting your window. Super useful to show a doctor after a few cycles."};
    if(quick[text]){await new Promise(r=>setTimeout(r,900));setTyping(false);addMsg("meera",quick[text]);histRef.current.push({role:"assistant",content:quick[text]});return;}

    setTyping(true);
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,system:MEERA_PROMPT,messages:histRef.current.slice(-14)})});
      const data=await res.json();
      const reply=data.content?.map(b=>b.text||"").join("")||"I'm here 💛 Tell me more?";
      setTyping(false);addMsg("meera",reply);histRef.current.push({role:"assistant",content:reply});
    }catch{setTyping(false);addMsg("meera","Got disconnected 😅 Can you say that again?");}
  };

  const progress=phase===PHASES.COLLECTING?qIndex/INTAKE_QUESTIONS.length:[PHASES.RESULT,PHASES.EMOTIONAL,PHASES.FREEFORM,PHASES.PROCESSING].includes(phase)?1:0;
  const showInput=[PHASES.FREEFORM].includes(phase);

  return(
    <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#FFF0EB 0%,#FDF6F0 50%,#FFF8F5 100%)",paddingTop:72}}>
      <div className="meera-layout" style={{display:"flex",gap:0,minHeight:"calc(100vh - 72px)"}}>
        {/* Chat column */}
        <div style={{flex:1,display:"flex",justifyContent:"center",alignItems:"flex-start",padding:"20px 16px"}}>
          <div className="meera-chat" style={{width:"100%",maxWidth:500,height:"calc(100vh - 112px)",minHeight:520,background:"#fff",borderRadius:26,overflow:"hidden",boxShadow:"0 20px 60px rgba(180,80,60,.13)",display:"flex",flexDirection:"column",border:"1.5px solid var(--border)"}}>
            {/* Header */}
            <div style={{background:"linear-gradient(135deg,#F4A58A,#E8856A)",padding:"14px 18px 12px",flexShrink:0,position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:-16,right:-16,width:80,height:80,borderRadius:"50%",background:"rgba(255,255,255,.1)"}}/>
              <div style={{display:"flex",alignItems:"center",gap:11,position:"relative"}}>
                <Avatar size={42}/>
                <div>
                  <div style={{color:"#fff",fontWeight:700,fontSize:16,fontFamily:"'Fraunces',serif"}}>Meera</div>
                  <div style={{color:"rgba(255,255,255,.82)",fontSize:11.5}}>💛 Your PCOS companion · Tarangini</div>
                </div>
                <button onClick={()=>setPage("home")} style={{marginLeft:"auto",background:"rgba(255,255,255,.18)",border:"none",borderRadius:20,padding:"4px 12px",color:"#fff",fontSize:11.5,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:600}}>← Home</button>
              </div>
              {phase===PHASES.COLLECTING&&(
                <div style={{marginTop:11}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                    <span style={{color:"rgba(255,255,255,.8)",fontSize:10.5}}>Getting to know you</span>
                    <span style={{color:"rgba(255,255,255,.8)",fontSize:10.5}}>{qIndex} of {INTAKE_QUESTIONS.length}</span>
                  </div>
                  <div style={{height:3,background:"rgba(255,255,255,.25)",borderRadius:4,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${progress*100}%`,background:"#fff",borderRadius:4,transition:"width 0.5s ease"}}/>
                  </div>
                </div>
              )}
              {[PHASES.RESULT,PHASES.EMOTIONAL,PHASES.FREEFORM,PHASES.PROCESSING].includes(phase)&&(
                <div style={{marginTop:9,height:3,background:"rgba(255,255,255,.25)",borderRadius:4,overflow:"hidden"}}>
                  <div style={{height:"100%",width:"100%",background:"rgba(255,255,255,.8)",borderRadius:4}}/>
                </div>
              )}
            </div>
            {/* Messages */}
            <div style={{flex:1,overflowY:"auto",padding:"16px 14px 8px",display:"flex",flexDirection:"column",gap:11}}>
              {msgs.map((m,i)=>(
                <div key={i} style={{display:"flex",alignItems:"flex-end",gap:8,justifyContent:m.role==="user"?"flex-end":"flex-start",animation:"fadeUp 0.3s ease"}}>
                  {m.role==="meera"&&<Avatar size={26}/>}
                  <div className={m.role==="meera"?"bubble-m":"bubble-u"}>{m.content}</div>
                </div>
              ))}
              {showResult&&riskResult&&<ResultCard data={collectedData} risk={riskResult}/>}
              {showForum&&emotionKey&&<ForumPanel emotionKey={emotionKey} onClose={()=>setShowForum(false)}/>}
              {typing&&<Typing/>}
              <div ref={endRef}/>
            </div>
            {/* Chips */}
            {chips.length>0&&!typing&&(
              <div style={{padding:"7px 12px",display:"flex",flexWrap:"wrap",gap:6,flexShrink:0,borderTop:"1px solid #FFF0EB",background:"#FFFAF8",animation:"fadeUp 0.3s ease"}}>
                {chips.map(c=><button key={c} className="chip" onClick={()=>send(c)}>{c}</button>)}
              </div>
            )}
            {/* Input */}
            {showInput&&(
              <div style={{padding:"9px 12px 13px",borderTop:"1px solid var(--border)",display:"flex",gap:9,alignItems:"flex-end",flexShrink:0}}>
                <textarea value={inputText} onChange={e=>setInputText(e.target.value)}
                  onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send(inputText);}}}
                  placeholder="Ask Meera anything..." rows={1}
                  style={{flex:1,border:"1.5px solid var(--border)",borderRadius:20,padding:"9px 15px",fontSize:14,resize:"none",background:"#FFFAF8",color:"var(--text)",lineHeight:1.5,transition:"border-color 0.2s"}}
                  onFocus={e=>e.target.style.borderColor="var(--terra)"}
                  onBlur={e=>e.target.style.borderColor="var(--border)"}/>
                <button onClick={()=>send(inputText)} disabled={!inputText.trim()||typing}
                  style={{width:38,height:38,borderRadius:"50%",background:inputText.trim()?"linear-gradient(135deg,#F4A58A,#E8856A)":"var(--border)",border:"none",cursor:inputText.trim()?"pointer":"default",fontSize:15,color:"#fff",transition:"all 0.2s",flexShrink:0}}>➤</button>
              </div>
            )}
          </div>
        </div>
        {/* Side panel */}
        {[PHASES.RESULT,PHASES.EMOTIONAL,PHASES.FREEFORM].includes(phase)&&(
          <div className="side-panel" style={{width:240,padding:"20px 16px 20px 0",display:"flex",flexDirection:"column",gap:11,animation:"slideRight 0.4s ease",flexShrink:0}}>
            <div style={{background:"#fff",borderRadius:18,border:"1.5px solid var(--border)",padding:"16px",boxShadow:"0 4px 14px rgba(200,80,60,.06)"}}>
              <div style={{fontFamily:"'Fraunces',serif",fontSize:13,fontWeight:700,color:"var(--warm-brown)",marginBottom:12}}>Your next steps</div>
              {[{icon:"👩‍⚕️",label:"Find a specialist",sub:"PCOS-trained doctors near you",color:"#FFF0EB"},{icon:"📅",label:"Track your cycle",sub:"Start mapping patterns",color:"#F0FBF4"},{icon:"💬",label:"Join the forum",sub:"Anonymous community",color:"#F0F4FF"},{icon:"📋",label:"Download report",sub:"Share with your doctor",color:"#FFF8ED"}].map((item,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:9,padding:"8px 10px",borderRadius:11,background:item.color,marginBottom:6,cursor:"pointer",transition:"transform 0.15s",border:"1px solid rgba(200,80,60,.07)"}}
                  onMouseOver={e=>e.currentTarget.style.transform="translateX(3px)"}
                  onMouseOut={e=>e.currentTarget.style.transform="translateX(0)"}>
                  <span style={{fontSize:17}}>{item.icon}</span>
                  <div><div style={{fontSize:12,fontWeight:600,color:"var(--warm-brown)"}}>{item.label}</div><div style={{fontSize:10.5,color:"var(--muted)",marginTop:1}}>{item.sub}</div></div>
                </div>
              ))}
            </div>
            {riskResult&&(
              <div style={{background:riskResult.bg,border:`1.5px solid ${riskResult.color}44`,borderRadius:18,padding:"14px 16px"}}>
                <div style={{fontFamily:"'Fraunces',serif",fontSize:12,fontWeight:700,color:riskResult.color,marginBottom:3}}>Your risk score</div>
                <div style={{fontSize:28,fontWeight:700,fontFamily:"'Fraunces',serif",color:riskResult.color}}>{riskResult.pct}%</div>
                <div style={{fontSize:11,color:"var(--muted)",marginTop:3,lineHeight:1.5}}>{riskResult.label}</div>
              </div>
            )}
            <div style={{background:"linear-gradient(135deg,#E8856A,#C4603E)",borderRadius:18,padding:"16px",color:"#fff"}}>
              <div style={{fontSize:20,marginBottom:7}}>💛</div>
              <div style={{fontFamily:"'Fraunces',serif",fontSize:13,fontWeight:600,marginBottom:5}}>You're not alone</div>
              <div style={{fontSize:11.5,opacity:.88,lineHeight:1.6}}>150M+ women live with PCOS. Thousands found clarity right here.</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// HOME PAGE
// ─────────────────────────────────────────────────────────────
function HomePage({setPage}){
  const stats=[{n:"1 in 5",l:"women have PCOS"},{n:"70%",l:"go undiagnosed"},{n:"2 yrs",l:"average diagnosis wait"}];
  const chat=[{r:"meera",t:"Hey 🌸 Something feels off?"},{r:"user",t:"My periods have been irregular..."},{r:"meera",t:"I remember that exactly. Let me ask you a few things 💛"}];
  const[shown,setShown]=useState(1);
  const[featRef,featVis]=useInView();
  const[statRef,statVis]=useInView();
  const[commRef,commVis]=useInView();
  useEffect(()=>{if(shown<chat.length){const t=setTimeout(()=>setShown(s=>s+1),1700);return()=>clearTimeout(t);}},[shown]);

  const features=[
    {icon:"🧠",label:"Conversational Risk Check",color:"#FFF0EB",accent:"#E8856A",desc:"Meera asks you 8 questions through natural conversation — no cold forms. Your answers power a real ML risk model.",tag:"Free · 2 min"},
    {icon:"💬",label:"Talk to Meera",color:"#FFF5F7",accent:"#D4535C",desc:"A friend who's been through PCOS. She validates your feelings, explains in plain language, and guides next steps.",tag:"Always available"},
    {icon:"📅",label:"Cycle Tracker",color:"#F0FBF4",accent:"#4CAF7D",desc:"Log periods, track symptoms, predict your next window. Your patterns visualised — shareable with your doctor.",tag:"Private · Secure"},
    {icon:"📍",label:"Find a Specialist",color:"#F0F4FF",accent:"#5B7BE8",desc:"Discover gynaecologists and PCOS specialists near you. Book appointments without the phone-tag.",tag:"Verified listings"},
  ];
  const posts=[
    {tag:"Just diagnosed",emoji:"🌸",text:"Finally got my diagnosis after 18 months. Cried for an hour but honestly... feels like relief?",likes:47,replies:12},
    {tag:"Lifestyle win",emoji:"💪",text:"30 days of low GI eating and my cycle is more regular than it's been in 3 years 💛",likes:89,replies:31},
    {tag:"Question",emoji:"🤔",text:"Does anyone else have PCOS without cysts? My ultrasound was clear but I have all the hormonal symptoms.",likes:34,replies:18},
  ];

  return(
    <>
      {/* Hero */}
      <section style={{minHeight:"100vh",display:"flex",alignItems:"center",position:"relative",overflow:"hidden",paddingTop:80}}>
        <div className="blob" style={{width:380,height:380,background:"linear-gradient(135deg,#F4A58A,#FADDD2)",top:"8%",right:"-6%",opacity:.5}}/>
        <div className="blob" style={{width:240,height:240,background:"linear-gradient(135deg,#F9EDE4,#F4A58A)",bottom:"12%",left:"-4%",opacity:.5,animationDelay:"3s"}}/>
        <div style={{maxWidth:1100,margin:"0 auto",padding:"80px 24px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:56,alignItems:"center",position:"relative",zIndex:1}} className="hero-grid">
          <div>
            <div className="section-label fade-up">AI · Community · Care</div>
            <h1 className="display-font fade-up hero-h1" style={{fontSize:"clamp(36px,5vw,58px)",lineHeight:1.12,color:"var(--warm-brown)",marginBottom:22,animationDelay:"0.1s"}}>
              Your body<br/><span style={{fontStyle:"italic",color:"var(--terra-deep)"}}>deserves</span> an<br/>honest answer.
            </h1>
            <p className="fade-up" style={{fontSize:16,lineHeight:1.78,color:"var(--mid-brown)",marginBottom:32,maxWidth:420,animationDelay:"0.2s"}}>
              Tarangini helps you understand PCOS — through a friend who's been there, conversational AI screening, and a community that truly gets it.
            </p>
            <div className="fade-up cta-buttons" style={{display:"flex",gap:12,marginBottom:44,animationDelay:"0.3s",flexWrap:"wrap"}}>
              <button className="btn-primary" style={{fontSize:15,padding:"14px 28px"}} onClick={()=>setPage("meera")}>Talk to Meera 🌸</button>
              <button className="btn-outline" style={{fontSize:15,padding:"14px 28px"}} onClick={()=>setPage("meera")}>Check my risk →</button>
            </div>
            <div className="fade-up" style={{display:"flex",gap:28,animationDelay:"0.4s",flexWrap:"wrap"}}>
              {stats.map(({n,l})=>(<div key={l}><div className="display-font" style={{fontSize:26,fontWeight:700,color:"var(--terra-deep)"}}>{n}</div><div style={{fontSize:12,color:"var(--muted)",fontWeight:500,marginTop:2}}>{l}</div></div>))}
            </div>
          </div>
          {/* Phone mockup */}
          <div className="phone-mockup" style={{display:"flex",justifyContent:"center"}}>
            <div style={{width:280,background:"#fff",borderRadius:34,boxShadow:"0 28px 70px rgba(180,70,50,.18)",overflow:"hidden",border:"5px solid #fff",animation:"float 5s ease-in-out infinite"}}>
              <div style={{background:"linear-gradient(135deg,#F4A58A,#E8856A)",padding:"14px 16px 11px",display:"flex",alignItems:"center",gap:9}}>
                <Avatar size={36}/><div><div style={{color:"#fff",fontWeight:600,fontSize:14,fontFamily:"'Fraunces',serif"}}>Meera</div><div style={{color:"rgba(255,255,255,.8)",fontSize:10.5}}>Your PCOS companion 💛</div></div>
              </div>
              <div style={{padding:"13px 11px",display:"flex",flexDirection:"column",gap:9,background:"#FFFAF8",minHeight:180}}>
                {chat.slice(0,shown).map((m,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"flex-end",gap:6,justifyContent:m.r==="user"?"flex-end":"flex-start",animation:"fadeUp 0.3s ease"}}>
                    {m.r==="meera"&&<Avatar size={20}/>}
                    <div className={m.r==="meera"?"bubble-m":"bubble-u"} style={{fontSize:12,padding:"7px 10px"}}>{m.t}</div>
                  </div>
                ))}
                {shown<chat.length&&<div style={{display:"flex",gap:4,paddingLeft:26}}>{[0,1,2].map(i=><div key={i} className="dot" style={{width:6,height:6,animationDelay:`${i*0.2}s`}}/>)}</div>}
              </div>
              <div style={{padding:"9px 11px 13px",borderTop:"1px solid var(--border)"}}>
                <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                  {["Something feels off 😔","Check my risk"].map(c=><button key={c} className="chip" style={{fontSize:11,padding:"4px 9px"}} onClick={()=>setPage("meera")}>{c}</button>)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{padding:"88px 24px",maxWidth:1100,margin:"0 auto"}} ref={featRef}>
        <div style={{textAlign:"center",marginBottom:52}}>
          <div className="section-label">What Tarangini Does</div>
          <h2 className="display-font" style={{fontSize:"clamp(28px,4vw,44px)",color:"var(--warm-brown)",lineHeight:1.2}}>
            Everything you need,<br/><span style={{fontStyle:"italic",color:"var(--terra-deep)"}}>in one place.</span>
          </h2>
        </div>
        <div className="features-grid" style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:18}}>
          {features.map((f,i)=>(
            <div key={f.label} className="feature-card" style={{animation:featVis?`fadeUp 0.5s ease ${i*0.1}s both`:"none"}}>
              <div style={{width:50,height:50,borderRadius:14,background:f.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,marginBottom:16,border:`1.5px solid ${f.accent}22`}}>{f.icon}</div>
              <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:9,flexWrap:"wrap"}}>
                <h3 className="display-font" style={{fontSize:18,fontWeight:600,color:"var(--warm-brown)"}}>{f.label}</h3>
                <span className="tag">{f.tag}</span>
              </div>
              <p style={{fontSize:14,lineHeight:1.72,color:"var(--muted)"}}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section style={{padding:"72px 24px",maxWidth:1100,margin:"0 auto"}} ref={statRef}>
        <div style={{textAlign:"center",marginBottom:44}}>
          <div className="section-label">The Reality</div>
          <h2 className="display-font" style={{fontSize:"clamp(26px,3.5vw,38px)",color:"var(--warm-brown)"}}>Numbers that <span style={{fontStyle:"italic",color:"var(--terra-deep)"}}>shouldn't exist.</span></h2>
        </div>
        <div className="stats-grid" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16}}>
          {[{n:"150M+",l:"women affected globally",icon:"🌍"},{n:"22.5%",l:"prevalence in urban India",icon:"🇮🇳"},{n:"₹15K",l:"average misdiagnosis cost",icon:"💸"},{n:"2 yrs",l:"average time to diagnose",icon:"⏰"}].map((s,i)=>(
            <div key={i} className="stat-card" style={{animation:statVis?`fadeUp 0.5s ease ${i*0.1}s both`:"none"}}>
              <div style={{fontSize:28,marginBottom:9}}>{s.icon}</div>
              <div className="display-font" style={{fontSize:32,fontWeight:700,color:"var(--terra-deep)",marginBottom:6}}>{s.n}</div>
              <div style={{fontSize:12.5,color:"var(--muted)",lineHeight:1.5}}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Community */}
      <section id="community" style={{background:"linear-gradient(180deg,var(--cream),var(--peach))",padding:"88px 24px"}} ref={commRef}>
        <div style={{maxWidth:1100,margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:48}}>
            <div className="section-label">Anonymous Community</div>
            <h2 className="display-font" style={{fontSize:"clamp(26px,4vw,42px)",color:"var(--warm-brown)",lineHeight:1.2}}>
              You don't have to figure<br/><span style={{fontStyle:"italic",color:"var(--terra-deep)"}}>this out alone.</span>
            </h2>
          </div>
          <div className="community-grid" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>
            {posts.map((p,i)=>(
              <div key={i} className="forum-card" style={{animation:commVis?`fadeUp 0.5s ease ${i*0.12}s both`:"none"}}>
                <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:11}}>
                  <div style={{width:32,height:32,borderRadius:"50%",background:["#FFF0EB","#F0FBF4","#FFF8ED"][i],display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>{p.emoji}</div>
                  <span className="tag">{p.tag}</span>
                  <span style={{fontSize:10.5,color:"var(--muted)",marginLeft:"auto"}}>Anonymous</span>
                </div>
                <p style={{fontSize:13.5,lineHeight:1.68,color:"var(--mid-brown)",marginBottom:12}}>{p.text}</p>
                <div style={{display:"flex",gap:12}}><span style={{fontSize:12.5,color:"var(--muted)"}}>❤️ {p.likes}</span><span style={{fontSize:12.5,color:"var(--muted)"}}>💬 {p.replies}</span></div>
              </div>
            ))}
          </div>
          <div style={{textAlign:"center",marginTop:36}}><button className="btn-outline" style={{fontSize:14,padding:"12px 26px"}}>Join the conversation →</button></div>
        </div>
      </section>

      {/* CTA */}
      <section style={{padding:"88px 24px"}}>
        <div style={{maxWidth:680,margin:"0 auto",textAlign:"center",background:"linear-gradient(135deg,#E8856A,#C4603E)",borderRadius:32,position:"relative",overflow:"hidden"}} className="cta-box" style2={{padding:"68px 44px"}}>
          <div style={{padding:"68px 44px",position:"relative"}}>
            <div style={{position:"absolute",top:-36,right:-36,width:180,height:180,borderRadius:"50%",background:"rgba(255,255,255,.1)"}}/>
            <div style={{position:"relative"}}>
              <div style={{fontSize:40,marginBottom:14}}>🌸</div>
              <h2 className="display-font" style={{fontSize:"clamp(24px,4vw,40px)",color:"#fff",lineHeight:1.2,marginBottom:16}}>You deserve answers.<br/><span style={{fontStyle:"italic"}}>Start here.</span></h2>
              <p style={{fontSize:15,color:"rgba(255,255,255,.85)",marginBottom:30,lineHeight:1.75}}>Free, anonymous, and built with care. Tarangini is the first step thousands of women wish they had earlier.</p>
              <div className="cta-buttons" style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
                <button onClick={()=>setPage("meera")} style={{background:"#fff",color:"var(--terra-deep)",border:"none",borderRadius:50,padding:"13px 28px",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",boxShadow:"0 4px 14px rgba(0,0,0,.14)"}}>Talk to Meera 💛</button>
                <button onClick={()=>setPage("meera")} style={{background:"rgba(255,255,255,.15)",color:"#fff",border:"2px solid rgba(255,255,255,.4)",borderRadius:50,padding:"13px 28px",fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Check my risk →</button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// ABOUT PAGE
// ─────────────────────────────────────────────────────────────
function AboutPage({setPage}){
  const team=[
    {name:"Priya Sharma",role:"Founder & ML Engineer",emoji:"👩‍💻",desc:"Built Tarangini after her own PCOS diagnosis took 2 years. CS from IIT Delhi."},
    {name:"Riya Mehta",role:"Full Stack Developer",emoji:"👩‍🔧",desc:"Passionate about health-tech accessibility. Makes sure every feature works for Tier 2 cities too."},
    {name:"Dr. Ananya Gupta",role:"Medical Advisor",emoji:"👩‍⚕️",desc:"Gynaecologist with 12 years of experience. Ensures our content is medically accurate."},
    {name:"Kavya Iyer",role:"UX & Community Lead",emoji:"🎨",desc:"Designed Meera's personality. Believes technology should feel like a friend, not a form."},
  ];
  return(
    <div style={{paddingTop:72}}>
      <div style={{background:"linear-gradient(135deg,#FFF0EB,#FDF8F3)",padding:"72px 24px 56px",textAlign:"center",position:"relative",overflow:"hidden"}}>
        <div className="blob" style={{width:300,height:300,background:"linear-gradient(135deg,#F4A58A,#FADDD2)",top:"-10%",right:"-5%",opacity:.4}}/>
        <div style={{position:"relative",maxWidth:640,margin:"0 auto"}}>
          <div className="section-label">Our Story</div>
          <h1 className="display-font" style={{fontSize:"clamp(32px,5vw,52px)",color:"var(--warm-brown)",lineHeight:1.15,marginBottom:20}}>
            Built by women<br/><span style={{fontStyle:"italic",color:"var(--terra-deep)"}}>who've been there.</span>
          </h1>
          <p style={{fontSize:16,lineHeight:1.8,color:"var(--mid-brown)",marginBottom:28}}>
            Tarangini was born from a frustration every one of our founders shared — spending years confused, scared, and unheard before finally getting a PCOS diagnosis.
          </p>
          <button className="btn-primary" onClick={()=>setPage("meera")}>Try Meera — it's free 🌸</button>
        </div>
      </div>
      <div className="page-section">
        <div className="prose">
          <h2>Why we built this</h2>
          <p>In India, 1 in 5 women has PCOS. Most spend over 2 years and ₹15,000+ on misdiagnosis before getting a clear answer. The information exists — but it's buried in medical jargon, behind paywalls, or in WhatsApp groups where stigma runs high.</p>
          <p>We asked: what if the first point of contact wasn't a cold symptom checker, but a friend who'd been through it? Someone who could explain PCOS in plain language, help you understand your patterns, and walk you to the right next step?</p>
          <p>That's Meera. That's Tarangini.</p>
          <h2>Our mission</h2>
          <p>To make PCOS understanding, screening, and support accessible to every woman in India — regardless of city, income, or how much medical knowledge she starts with.</p>
          <h2>Our values</h2>
          <p><strong>Privacy first.</strong> Your health data is yours. We anonymise everything in the forum, and we never sell data. Ever.</p>
          <p><strong>Warmth over clinical distance.</strong> Every feature is designed to feel like support, not a transaction.</p>
          <p><strong>Accuracy matters.</strong> We work with medical advisors to ensure our content is correct and our ML model is validated.</p>
        </div>
        <h2 className="display-font" style={{fontSize:"clamp(24px,3.5vw,36px)",color:"var(--warm-brown)",margin:"56px 0 32px"}}>The team</h2>
        <div className="team-grid" style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:18}}>
          {team.map((t,i)=>(
            <div key={i} style={{background:"#fff",borderRadius:20,padding:"24px",border:"1.5px solid var(--border)",display:"flex",gap:16,alignItems:"flex-start"}}>
              <div style={{width:52,height:52,borderRadius:16,background:"linear-gradient(135deg,#FFF0EB,#F4A58A)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,flexShrink:0}}>{t.emoji}</div>
              <div>
                <div style={{fontFamily:"'Fraunces',serif",fontSize:16,fontWeight:700,color:"var(--warm-brown)",marginBottom:3}}>{t.name}</div>
                <div style={{fontSize:12,color:"var(--terra-deep)",fontWeight:600,marginBottom:8}}>{t.role}</div>
                <div style={{fontSize:13.5,color:"var(--muted)",lineHeight:1.65}}>{t.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{marginTop:56,background:"linear-gradient(135deg,#FFF0EB,#FDF8F3)",borderRadius:24,padding:"40px 32px",border:"1.5px solid var(--border)",textAlign:"center"}}>
          <div style={{fontSize:36,marginBottom:14}}>🏆</div>
          <h3 className="display-font" style={{fontSize:22,color:"var(--warm-brown)",marginBottom:10}}>Built at a hackathon. Built for real impact.</h3>
          <p style={{fontSize:15,color:"var(--mid-brown)",lineHeight:1.75,maxWidth:520,margin:"0 auto 24px"}}>Tarangini started as a 48-hour hackathon project. We're building it into something that lasts — because the problem is real, and it deserves a real solution.</p>
          <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
            <button className="btn-primary" onClick={()=>setPage("meera")}>Try Tarangini</button>
            <button className="btn-outline" onClick={()=>setPage("contact")}>Get in touch</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// BLOG PAGE
// ─────────────────────────────────────────────────────────────
function BlogPage({setPage}){
  const posts=[
    {tag:"Explainer",emoji:"🧬",title:"What actually IS PCOS? A plain-language guide",excerpt:"No jargon, no fear. Here's how we explain polycystic ovary syndrome to the women who come to Tarangini — starting with a group chat analogy.",read:"5 min",date:"Feb 2025"},
    {tag:"Lifestyle",emoji:"🥗",title:"The low GI approach to PCOS — what actually works",excerpt:"Insulin resistance is behind most PCOS symptoms. Here's how changing what you eat can change how your hormones behave — with real data.",read:"7 min",date:"Jan 2025"},
    {tag:"Mental health",emoji:"💛",title:"PCOS and anxiety: the hormonal connection nobody talks about",excerpt:"3x higher rates of anxiety and depression. We look at why PCOS affects mental health and what actually helps — beyond just 'manage your stress'.",read:"6 min",date:"Jan 2025"},
    {tag:"Medical",emoji:"🩺",title:"What to actually say at your first PCOS doctor's appointment",excerpt:"Most women leave their first appointment more confused than when they arrived. Here's the exact script that gets you real answers and a real plan.",read:"4 min",date:"Dec 2024"},
    {tag:"Community",emoji:"🌸",title:"\"I thought I was lazy\" — 8 women on getting diagnosed",excerpt:"Eight real women share the moment they found out — and what changed after. These stories are why Tarangini exists.",read:"9 min",date:"Dec 2024"},
    {tag:"Research",emoji:"📊",title:"PCOS in India: why 70% of cases are still undiagnosed",excerpt:"We looked at the numbers. Urban vs rural access, symptom stigma, and why the average Indian woman waits 2 years for a diagnosis.",read:"6 min",date:"Nov 2024"},
  ];
  return(
    <div style={{paddingTop:72}}>
      <div style={{background:"linear-gradient(135deg,#FFF0EB,#FDF8F3)",padding:"64px 24px 48px",textAlign:"center"}}>
        <div className="section-label">Tarangini Journal</div>
        <h1 className="display-font" style={{fontSize:"clamp(30px,5vw,48px)",color:"var(--warm-brown)",lineHeight:1.15,marginBottom:14}}>
          Honest writing<br/><span style={{fontStyle:"italic",color:"var(--terra-deep)"}}>about PCOS.</span>
        </h1>
        <p style={{fontSize:15,color:"var(--mid-brown)",maxWidth:480,margin:"0 auto"}}>Plain language. Medical accuracy. Written for women who deserve real answers, not watered-down health content.</p>
      </div>
      <div className="page-section" style={{maxWidth:1000}}>
        <div className="blog-grid" style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:20}}>
          {posts.map((p,i)=>(
            <div key={i} style={{background:"#fff",borderRadius:20,padding:"24px",border:"1.5px solid var(--border)",cursor:"pointer",transition:"all 0.25s"}}
              onMouseOver={e=>{e.currentTarget.style.transform="translateY(-4px)";e.currentTarget.style.boxShadow="0 16px 40px rgba(200,80,60,.1)";e.currentTarget.style.borderColor="var(--terra-light)"}}
              onMouseOut={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="";e.currentTarget.style.borderColor="var(--border)"}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
                <div style={{width:44,height:44,borderRadius:14,background:"var(--peach)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>{p.emoji}</div>
                <span className="tag">{p.tag}</span>
              </div>
              <h3 className="display-font" style={{fontSize:18,fontWeight:600,color:"var(--warm-brown)",lineHeight:1.35,marginBottom:10}}>{p.title}</h3>
              <p style={{fontSize:13.5,color:"var(--muted)",lineHeight:1.7,marginBottom:16}}>{p.excerpt}</p>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <span style={{fontSize:12,color:"var(--muted)"}}>{p.date}</span>
                <span style={{fontSize:12,color:"var(--terra)",fontWeight:600}}>· {p.read} read</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// CONTACT PAGE
// ─────────────────────────────────────────────────────────────
function ContactPage(){
  const[form,setForm]=useState({name:"",email:"",subject:"",message:""});
  const[sent,setSent]=useState(false);
  const submit=()=>{if(form.name&&form.email&&form.message){setSent(true);}};
  const inp={border:"1.5px solid var(--border)",borderRadius:12,padding:"12px 16px",fontSize:14,background:"#FFFAF8",color:"var(--text)",transition:"border-color 0.2s",width:"100%",fontFamily:"'DM Sans',sans-serif"};
  return(
    <div style={{paddingTop:72}}>
      <div style={{background:"linear-gradient(135deg,#FFF0EB,#FDF8F3)",padding:"64px 24px 48px",textAlign:"center"}}>
        <div className="section-label">Get In Touch</div>
        <h1 className="display-font" style={{fontSize:"clamp(30px,5vw,48px)",color:"var(--warm-brown)",lineHeight:1.15,marginBottom:14}}>
          We'd love to<br/><span style={{fontStyle:"italic",color:"var(--terra-deep)"}}>hear from you.</span>
        </h1>
        <p style={{fontSize:15,color:"var(--mid-brown)",maxWidth:440,margin:"0 auto"}}>Whether you're a woman with questions, a clinician interested in partnering, or a journalist covering women's health — we're here.</p>
      </div>
      <div className="page-section" style={{maxWidth:840}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:40,alignItems:"start"}}>
          <div>
            {sent?(
              <div style={{background:"linear-gradient(135deg,#F0FBF4,#FFF8F5)",border:"1.5px solid #4CAF7D44",borderRadius:20,padding:"40px 32px",textAlign:"center"}}>
                <div style={{fontSize:48,marginBottom:16}}>💛</div>
                <h3 className="display-font" style={{fontSize:22,color:"var(--warm-brown)",marginBottom:10}}>Message received!</h3>
                <p style={{fontSize:14,color:"var(--mid-brown)",lineHeight:1.7}}>We'll get back to you within 24 hours. In the meantime, Meera is always there if you need to talk.</p>
              </div>
            ):(
              <div style={{background:"#fff",borderRadius:20,padding:"32px",border:"1.5px solid var(--border)"}}>
                <h3 className="display-font" style={{fontSize:20,color:"var(--warm-brown)",marginBottom:20}}>Send us a message</h3>
                <div style={{display:"flex",flexDirection:"column",gap:14}}>
                  {[["name","Your name","text"],["email","Your email","email"],["subject","Subject","text"]].map(([k,ph,t])=>(
                    <input key={k} type={t} placeholder={ph} value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} style={inp}
                      onFocus={e=>e.target.style.borderColor="var(--terra)"}
                      onBlur={e=>e.target.style.borderColor="var(--border)"}/>
                  ))}
                  <textarea placeholder="Your message..." value={form.message} onChange={e=>setForm(f=>({...f,message:e.target.value}))} rows={5}
                    style={{...inp,resize:"none"}}
                    onFocus={e=>e.target.style.borderColor="var(--terra)"}
                    onBlur={e=>e.target.style.borderColor="var(--border)"}/>
                  <button className="btn-primary" style={{padding:"14px",fontSize:15}} onClick={submit}>Send message →</button>
                </div>
              </div>
            )}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            {[{icon:"📧",label:"Email us",val:"hello@tarangini.health",sub:"We reply within 24 hours"},{icon:"📍",label:"Based in",val:"Jaipur, India",sub:"Building for 1 billion+ women"},{icon:"💼",label:"Partnerships",val:"partner@tarangini.health",sub:"Clinics, hospitals, corporates"},{icon:"📰",label:"Press",val:"press@tarangini.health",sub:"Media and research enquiries"}].map((c,i)=>(
              <div key={i} style={{background:"#fff",borderRadius:16,padding:"18px 20px",border:"1.5px solid var(--border)",display:"flex",alignItems:"flex-start",gap:14}}>
                <div style={{width:42,height:42,borderRadius:12,background:"var(--peach)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{c.icon}</div>
                <div>
                  <div style={{fontSize:13,fontWeight:600,color:"var(--muted)",marginBottom:2}}>{c.label}</div>
                  <div style={{fontSize:14,fontWeight:600,color:"var(--warm-brown)",marginBottom:2}}>{c.val}</div>
                  <div style={{fontSize:12,color:"var(--muted)"}}>{c.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// FAQ PAGE
// ─────────────────────────────────────────────────────────────
function FAQPage({setPage}){
  const[open,setOpen]=useState(null);
  const faqs=[
    {q:"Is Tarangini free to use?",a:"Yes — the core features (Meera chat, risk check, forum, cycle tracker) are completely free. We may introduce premium features in the future, but core access will always be free."},
    {q:"Is my data private and secure?",a:"Absolutely. Your health data is never shared with third parties or advertisers. The forum is fully anonymous — no real names, ever. We use encrypted storage and follow best practices for health data security."},
    {q:"Is Meera a real person?",a:"Meera is an AI companion built on Claude, trained with a specific personality — a 25-year-old woman who's been through PCOS and wants to help. She's not a real person, but she's designed to feel like one. She cannot replace medical advice."},
    {q:"Can I trust the PCOS risk score?",a:"The risk score is based on a machine learning model trained on validated PCOS symptom data. It's designed to give you a useful starting point — not a diagnosis. Always discuss results with a qualified doctor."},
    {q:"What if I get a high risk score?",a:"A high risk score means some of your patterns are commonly associated with PCOS — but it is NOT a diagnosis. It means a doctor's visit is worth it. Tarangini will help you know what to say when you get there."},
    {q:"Is the forum completely anonymous?",a:"Yes. When you post in the forum, no real name or identifying information is attached. We use display names chosen by users (like 'WarmMoon' or 'QuietRose') that change each session."},
    {q:"How accurate is the cycle tracker?",a:"The cycle tracker predicts your next window based on your logged history. After 3 cycles of data, predictions become significantly more accurate. It uses standard menstrual cycle algorithms."},
    {q:"Can I use Tarangini if I'm outside India?",a:"Yes! While we're built with India in mind (Hindi support coming soon), the platform works for any user worldwide. The doctor finder currently covers major Indian cities."},
    {q:"Does Tarangini work on mobile?",a:"Yes — Tarangini is fully responsive and works on all screen sizes. A native mobile app is on our roadmap for later in 2025."},
    {q:"How do I find a doctor through Tarangini?",a:"The Consultants section lets you search by location and filter by speciality. We're building a verified network of PCOS-specialist gynaecologists. Currently we have data for major metro cities."},
  ];
  return(
    <div style={{paddingTop:72}}>
      <div style={{background:"linear-gradient(135deg,#FFF0EB,#FDF8F3)",padding:"64px 24px 48px",textAlign:"center"}}>
        <div className="section-label">Help Center</div>
        <h1 className="display-font" style={{fontSize:"clamp(30px,5vw,48px)",color:"var(--warm-brown)",lineHeight:1.15,marginBottom:14}}>
          Frequently asked<br/><span style={{fontStyle:"italic",color:"var(--terra-deep)"}}>questions.</span>
        </h1>
        <p style={{fontSize:15,color:"var(--mid-brown)",maxWidth:440,margin:"0 auto"}}>Can't find what you're looking for? Meera can help — or reach us directly.</p>
      </div>
      <div className="page-section">
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {faqs.map((f,i)=>(
            <div key={i} style={{background:"#fff",borderRadius:16,border:"1.5px solid var(--border)",overflow:"hidden",transition:"border-color 0.2s"}} >
              <button onClick={()=>setOpen(open===i?null:i)} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"18px 22px",background:"none",border:"none",cursor:"pointer",textAlign:"left",fontFamily:"'DM Sans',sans-serif"}}>
                <span style={{fontSize:15,fontWeight:600,color:"var(--warm-brown)",paddingRight:16}}>{f.q}</span>
                <span style={{fontSize:20,color:"var(--terra)",flexShrink:0,transition:"transform 0.3s",transform:open===i?"rotate(45deg)":"none"}}>+</span>
              </button>
              {open===i&&(
                <div style={{padding:"0 22px 18px",animation:"fadeUp 0.2s ease"}}>
                  <p style={{fontSize:14,lineHeight:1.75,color:"var(--mid-brown)"}}>{f.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
        <div style={{marginTop:48,background:"linear-gradient(135deg,#FFF0EB,#FDF8F3)",borderRadius:20,padding:"32px",border:"1.5px solid var(--border)",textAlign:"center"}}>
          <div style={{fontSize:32,marginBottom:12}}>💬</div>
          <h3 className="display-font" style={{fontSize:20,color:"var(--warm-brown)",marginBottom:8}}>Still have questions?</h3>
          <p style={{fontSize:14,color:"var(--mid-brown)",marginBottom:20}}>Meera can answer most questions about PCOS, or you can reach our team directly.</p>
          <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
            <button className="btn-primary" onClick={()=>setPage("meera")}>Ask Meera 🌸</button>
            <button className="btn-outline" onClick={()=>setPage("contact")}>Contact us →</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PRIVACY PAGE
// ─────────────────────────────────────────────────────────────
function PrivacyPage(){
  const sections=[
    {title:"What we collect",content:"When you use the PCOS risk checker, we collect the symptom data you provide during your conversation with Meera. This data is used only to generate your risk score and is not permanently stored unless you explicitly create an account. Forum posts are anonymous and not linked to any personal identifier. Cycle tracking data is stored locally on your device unless you choose to sync with an account."},
    {title:"What we never do",content:"We never sell your data to advertisers, pharmaceutical companies, or any third party. We never use your health data to target you with ads. We never share identifiable health information with any external party without your explicit written consent."},
    {title:"Forum anonymity",content:"The forum is designed to be genuinely anonymous. Display names are randomly generated each session. IP addresses are hashed and not stored in readable form. Posts cannot be traced back to individual users by any external party."},
    {title:"Cookies and tracking",content:"We use minimal, privacy-respecting analytics (no Google Analytics) to understand how people use Tarangini so we can improve it. We use session cookies for authentication only. No cross-site tracking. No advertising cookies."},
    {title:"Data retention",content:"Symptom assessment data is retained for 30 days to allow you to revisit your results, then deleted. Account data is retained until you delete your account. You can request complete data deletion at any time by emailing privacy@tarangini.health."},
    {title:"Your rights",content:"You have the right to access all data we hold about you, correct inaccurate data, request deletion of your data, export your data in a machine-readable format, and withdraw consent at any time. To exercise these rights, contact privacy@tarangini.health."},
    {title:"Security",content:"All data is encrypted in transit (TLS 1.3) and at rest (AES-256). We conduct regular security audits. We follow OWASP best practices for application security. In the unlikely event of a breach, we will notify affected users within 72 hours."},
  ];
  return(
    <div style={{paddingTop:72}}>
      <div style={{background:"linear-gradient(135deg,#FFF0EB,#FDF8F3)",padding:"64px 24px 48px",textAlign:"center"}}>
        <div className="section-label">Legal</div>
        <h1 className="display-font" style={{fontSize:"clamp(28px,5vw,44px)",color:"var(--warm-brown)",lineHeight:1.15,marginBottom:14}}>
          Privacy Policy
        </h1>
        <p style={{fontSize:15,color:"var(--mid-brown)",maxWidth:440,margin:"0 auto"}}>Last updated: March 2025. We believe privacy is a right, especially for sensitive health data.</p>
      </div>
      <div className="page-section">
        <div style={{background:"linear-gradient(135deg,#FFF0EB,#FDF8F3)",borderRadius:16,padding:"18px 22px",marginBottom:36,border:"1.5px solid var(--border)"}}>
          <p style={{fontSize:14,color:"var(--mid-brown)",lineHeight:1.7}}><strong>TL;DR:</strong> We collect only what we need, we never sell your data, your forum posts are genuinely anonymous, and you can delete everything at any time. Your health is personal. We treat it that way.</p>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {sections.map((s,i)=>(
            <div key={i} style={{background:"#fff",borderRadius:16,padding:"22px 24px",border:"1.5px solid var(--border)"}}>
              <h3 className="display-font" style={{fontSize:18,fontWeight:600,color:"var(--warm-brown)",marginBottom:10}}>{i+1}. {s.title}</h3>
              <p style={{fontSize:14,lineHeight:1.78,color:"var(--mid-brown)"}}>{s.content}</p>
            </div>
          ))}
        </div>
        <div style={{marginTop:32,padding:"20px 24px",background:"var(--peach)",borderRadius:14,border:"1px solid var(--border)"}}>
          <p style={{fontSize:13.5,color:"var(--mid-brown)",lineHeight:1.7}}>Questions about this policy? Email <strong>privacy@tarangini.health</strong>. We respond within 48 hours.</p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// FOOTER
// ─────────────────────────────────────────────────────────────
function Footer({setPage}){
  const cols=[
    {title:"Product",links:[["Risk Check","meera"],["Talk to Meera","meera"],["Cycle Tracker","meera"],["Find a Doctor","meera"]]},
    {title:"Learn",links:[["Blog","blog"],["FAQ","faq"],["About","about"],["Our Story","about"]]},
    {title:"Company",links:[["Contact","contact"],["Privacy","privacy"],["Terms","privacy"],["Careers","contact"]]},
  ];
  return(
    <footer style={{background:"var(--warm-brown)",padding:"52px 24px 28px",color:"rgba(255,255,255,.7)"}}>
      <div style={{maxWidth:1100,margin:"0 auto"}}>
        <div className="footer-grid" style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr",gap:40,marginBottom:40}}>
          <div className="footer-brand">
            <div style={{fontFamily:"'Fraunces',serif",fontSize:20,color:"#fff",marginBottom:11}}>🌸 Tarangini</div>
            <p style={{fontSize:13.5,lineHeight:1.75,maxWidth:240,marginBottom:16}}>AI-powered PCOS support — because every woman deserves clarity about her own body.</p>
            <div style={{display:"flex",gap:8}}>
              {["𝕏","◯","in"].map((s,i)=><div key={i} style={{width:34,height:34,borderRadius:"50%",background:"rgba(255,255,255,.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,cursor:"pointer",transition:"background 0.2s"}} onMouseOver={e=>e.target.style.background="rgba(255,255,255,.2)"} onMouseOut={e=>e.target.style.background="rgba(255,255,255,.1)"}>{s}</div>)}
            </div>
          </div>
          {cols.map(col=>(
            <div key={col.title}>
              <div style={{fontSize:10.5,fontWeight:700,color:"rgba(255,255,255,.42)",letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:14}}>{col.title}</div>
              {col.links.map(([l,p])=><button key={l} className="btn-ghost" style={{display:"block",textAlign:"left",fontSize:13.5,color:"rgba(255,255,255,.7)",marginBottom:9,padding:0,transition:"color 0.2s"}} onClick={()=>setPage(p)} onMouseOver={e=>e.target.style.color="var(--terra-light)"} onMouseOut={e=>e.target.style.color="rgba(255,255,255,.7)"}>{l}</button>)}
            </div>
          ))}
        </div>
        <div style={{borderTop:"1px solid rgba(255,255,255,.1)",paddingTop:20,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
          <div style={{fontSize:12.5}}>© 2025 Tarangini · Built with ❤️ for the health-tech community</div>
          <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
            <button className="btn-ghost" style={{fontSize:12,color:"rgba(255,255,255,.5)"}} onClick={()=>setPage("privacy")}>Privacy</button>
            <button className="btn-ghost" style={{fontSize:12,color:"rgba(255,255,255,.5)"}} onClick={()=>setPage("faq")}>FAQ</button>
            <div style={{fontSize:11.5,background:"rgba(255,255,255,.07)",borderRadius:20,padding:"4px 12px"}}>⚠️ Not a substitute for medical advice</div>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─────────────────────────────────────────────────────────────
// APP SHELL
// ─────────────────────────────────────────────────────────────
export default function App(){
  const[page,setPage]=useState("home");

  useEffect(()=>{
    const el=document.createElement("style");
    el.textContent=css;document.head.appendChild(el);
    return()=>document.head.removeChild(el);
  },[]);

  useEffect(()=>{window.scrollTo(0,0);},[page]);

  const noFooterPages=["meera"];
  const noNavPages=[];

  const renderPage=()=>{
    switch(page){
      case"home":return<HomePage setPage={setPage}/>;
      case"meera":return<MeeraPage setPage={setPage}/>;
      case"about":return<AboutPage setPage={setPage}/>;
      case"blog":return<BlogPage setPage={setPage}/>;
      case"contact":return<ContactPage/>;
      case"faq":return<FAQPage setPage={setPage}/>;
      case"privacy":return<PrivacyPage/>;
      default:return<HomePage setPage={setPage}/>;
    }
  };

  return(
    <div>
      {!noNavPages.includes(page)&&<Navbar page={page} setPage={setPage}/>}
      {renderPage()}
      {!noFooterPages.includes(page)&&<Footer setPage={setPage}/>}
    </div>
  );
}