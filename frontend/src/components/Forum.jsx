import { useState, useEffect, useRef } from "react";

const G = {
  cream:"#FDF8F3", peach:"#F9EDE4", terra:"#E8856A", terraDeep:"#C4603E",
  terraLight:"#F4A58A", warmBrown:"#3D2016", midBrown:"#7A3F28",
  muted:"#9A6B58", border:"#F0D8CC",
};

const SEED = [
  { id:1, anon:"WarmMoon", emoji:"🌙", tag:"Just diagnosed", time:"2h ago",
    text:"Finally got my diagnosis after 18 months of being told 'it's just stress'. Cried for an hour — then felt this weird relief? Like the monster finally has a name. Anyone else feel that contradictory mix?",
    likes:47, liked:false,
    comments:[
      { id:101, anon:"RisingTide", emoji:"🌊", time:"1h ago",
        text:"YES. I described it to my sister exactly like that — 'the monster has a name'. Once you know what it is, you can fight it.",
        likes:23, liked:false,
        replies:[
          { id:1011, anon:"CalmPetal", emoji:"🌸", time:"45m ago", text:"The monster metaphor is perfect. Saving this.", likes:8, liked:false },
          { id:1012, anon:"WarmMoon", emoji:"🌙", time:"30m ago", text:"Thank you for putting words to it 💛 Means everything.", likes:5, liked:false },
        ]
      },
      { id:102, anon:"SilverFern", emoji:"🌿", time:"55m ago",
        text:"I cried for three days. Then my friend who also has PCOS sent me a meal plan and a voice note. The community side of this is everything.",
        likes:31, liked:false,
        replies:[
          { id:1021, anon:"GoldenHour", emoji:"✨", time:"40m ago", text:"This is exactly why this forum exists 🌸", likes:12, liked:false },
        ]
      },
    ]
  },
  { id:2, anon:"QuietRose", emoji:"🌹", tag:"Lifestyle win", time:"5h ago",
    text:"30 days of low GI eating. The afternoon crash I've had for YEARS? Gone. Not saying it's a cure but I feel like I got my afternoons back. Sharing my meal plan in the comments 💛",
    likes:89, liked:false,
    comments:[
      { id:201, anon:"SunlitPath", emoji:"☀️", time:"4h ago",
        text:"Please share the meal plan! I've been trying to figure this out for weeks. What does a typical day look like?",
        likes:18, liked:false,
        replies:[
          { id:2011, anon:"QuietRose", emoji:"🌹", time:"3h ago", text:"Breakfast: oats + chia + berries. Lunch: dal + brown rice + sabzi. Dinner: 2 roti + lots of veg. Snacks: nuts, Greek yogurt, fruit. No white sugar for 30 days. That's it.", likes:34, liked:false },
          { id:2012, anon:"MorningDew", emoji:"💧", time:"2h ago", text:"This is so doable!! I always thought low GI meant rabbit food 😅 Thank you!", likes:9, liked:false },
        ]
      },
      { id:202, anon:"EveningCalm", emoji:"🌅", time:"3h ago",
        text:"The afternoon crash is SO real. I thought I was just lazy. Turns out insulin resistance was literally making me crash. Wild.",
        likes:44, liked:false, replies:[]
      },
    ]
  },
  { id:3, anon:"BlueSky22", emoji:"💙", tag:"Question", time:"1d ago",
    text:"Does anyone have PCOS without cysts on ultrasound? Scan was clear but I have elevated androgens + irregular cycles. Doctor says I still qualify but I feel like a fraud? PCOS imposter syndrome is apparently a thing 😅",
    likes:34, liked:false,
    comments:[
      { id:301, anon:"MountainStream", emoji:"⛰️", time:"22h ago",
        text:"Rotterdam criteria only needs 2 of 3 — you don't need cysts at all. The name is genuinely misleading. You are absolutely not a fraud.",
        likes:56, liked:false,
        replies:[
          { id:3011, anon:"BlueSky22", emoji:"💙", time:"20h ago", text:"This is so validating, thank you. I've been questioning myself for weeks.", likes:11, liked:false },
          { id:3012, anon:"StarlightHum", emoji:"⭐", time:"18h ago", text:"It's called 'ovulatory PCOS' — very common. Androgens + cycles = enough for diagnosis.", likes:7, liked:false },
        ]
      },
      { id:302, anon:"HarborLight", emoji:"🏮", time:"20h ago",
        text:"Imposter syndrome in your own body!! Made me laugh and cry at the same time. You and your symptoms are 100% valid 💛",
        likes:29, liked:false, replies:[]
      },
    ]
  },
  { id:4, anon:"GentleBreeze", emoji:"🍃", tag:"Mental health", time:"2d ago",
    text:"Nobody told me PCOS and anxiety were connected. I thought I was just an anxious person. Turns out elevated cortisol + hormonal disruption = a brain that never fully relaxes. Has anyone found something that actually helps beyond 'just meditate'?",
    likes:71, liked:false,
    comments:[
      { id:401, anon:"TwilightSong", emoji:"🌙", time:"1d ago",
        text:"Magnesium glycinate before bed genuinely changed my life. Not exaggerating. Talk to your doctor first — but it works with your nervous system, not against it.",
        likes:38, liked:false,
        replies:[
          { id:4011, anon:"GentleBreeze", emoji:"🍃", time:"1d ago", text:"Adding this to my list of things to ask my doctor. Thank you 💛", likes:6, liked:false },
        ]
      },
    ]
  },
];

const TAGS = ["All","Just diagnosed","Lifestyle win","Question","Mental health","Success story","Venting","Support needed"];
const ANON_NAMES = ["WarmStar","CalmRiver","SilentMoon","RisingPetal","GoldenFern","QuietDawn","BlueHorizon","SoftEcho","TenderRoot","BrightMoss","DeepWater","MorningLight"];
const ANON_EMOJIS = ["🌸","💛","🌿","✨","🌊","🍃","🌙","⭐","💙","🌹","🪷","🌻"];
const TAG_COLORS = {
  "Just diagnosed":{ c:"#C4603E", bg:"#FFF0EB" },
  "Lifestyle win":{ c:"#3A7D5E", bg:"#F0FBF4" },
  "Question":{ c:"#5B7BE8", bg:"#F0F4FF" },
  "Mental health":{ c:"#8B5CF6", bg:"#F5F0FF" },
  "Success story":{ c:"#B45309", bg:"#FFF8ED" },
  "Venting":{ c:"#D4535C", bg:"#FFF5F7" },
  "Support needed":{ c:"#9A6B58", bg:"#FDF8F3" },
};
const rndAnon = () => ({
  name: ANON_NAMES[Math.floor(Math.random()*ANON_NAMES.length)],
  emoji: ANON_EMOJIS[Math.floor(Math.random()*ANON_EMOJIS.length)],
});

const STYLE = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes popIn{from{opacity:0;transform:scale(.94)}to{opacity:1;transform:scale(1)}}
@keyframes blobAnim{0%,100%{border-radius:60% 40% 55% 45%/50% 60% 40% 50%}50%{border-radius:40% 60% 45% 55%/60% 40% 55% 45%}}
.f-wrap{min-height:100vh;background:#FDF8F3;font-family:'DM Sans',sans-serif}
.post-card{background:#fff;border-radius:22px;border:1.5px solid #F0D8CC;padding:22px 24px;transition:box-shadow .25s,border-color .25s;animation:fadeUp .4s ease both}
.post-card:hover{box-shadow:0 10px 32px rgba(200,80,60,.09);border-color:#F4A58A}
.cmt-box{background:#F9EDE4;border-radius:16px;border:1.5px solid #F0D8CC;padding:15px 17px}
.rpl-box{background:#fff;border-radius:13px;border:1.5px solid #F0D8CC;padding:12px 15px}
.like-btn{display:inline-flex;align-items:center;gap:5px;padding:5px 11px;border-radius:20px;border:1.5px solid #F0D8CC;background:transparent;cursor:pointer;font-size:12.5px;font-weight:500;color:#9A6B58;transition:all .15s;font-family:'DM Sans',sans-serif}
.like-btn:hover,.like-btn.on{border-color:#E8856A;color:#C4603E;background:#F9EDE4}
.ghost{display:inline-flex;align-items:center;gap:5px;padding:5px 11px;border-radius:20px;border:none;background:transparent;cursor:pointer;font-size:12.5px;font-weight:500;color:#9A6B58;transition:all .15s;font-family:'DM Sans',sans-serif}
.ghost:hover{color:#C4603E;background:#F9EDE4}
.compose{border:1.5px solid #F0D8CC;border-radius:13px;padding:10px 14px;font-size:14px;resize:none;width:100%;background:#F9EDE4;color:#3D2016;font-family:'DM Sans',sans-serif;transition:border-color .2s;line-height:1.6}
.compose:focus{outline:none;border-color:#E8856A;background:#fff}
.post-btn{background:linear-gradient(135deg,#F4A58A,#C4603E);color:#fff;border:none;border-radius:20px;padding:8px 19px;font-size:13px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .2s}
.post-btn:hover{transform:translateY(-1px);box-shadow:0 4px 14px rgba(200,80,60,.28)}
.post-btn:disabled{opacity:.45;cursor:default;transform:none;box-shadow:none}
.ftag{padding:7px 14px;border-radius:20px;border:1.5px solid #F0D8CC;background:#fff;font-size:13px;font-weight:500;cursor:pointer;font-family:'DM Sans',sans-serif;color:#7A3F28;transition:all .15s;white-space:nowrap}
.ftag.on{background:linear-gradient(135deg,#F4A58A,#C4603E);color:#fff;border-color:transparent}
.ftag:hover:not(.on){border-color:#E8856A;color:#C4603E;background:#F9EDE4}
.depth-line{width:2px;border-radius:2px;background:linear-gradient(to bottom,#F4A58A77,#F9EDE433);flex-shrink:0;margin-top:6px}
.av{border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;border:2px solid #fff;box-shadow:0 2px 8px rgba(200,80,60,.18)}
.overlay{position:fixed;inset:0;background:rgba(61,32,22,.5);z-index:300;display:flex;align-items:center;justify-content:center;padding:16px;backdrop-filter:blur(5px);animation:fadeIn .2s ease}
.modal{background:#fff;border-radius:26px;width:100%;max-width:560px;padding:32px;box-shadow:0 24px 64px rgba(61,32,22,.22);animation:popIn .3s ease;max-height:92vh;overflow-y:auto}
::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#F4A58A;border-radius:4px}
`;

function Av({ emoji, size=36 }) {
  return <div className="av" style={{ width:size, height:size, background:`linear-gradient(135deg,${G.peach},${G.terraLight})`, fontSize:size*.44 }}>{emoji}</div>;
}
function LikeBtn({ n, on, toggle }) {
  return <button className={`like-btn${on?" on":""}`} onClick={toggle}><span style={{fontSize:13}}>{on?"❤️":"🤍"}</span>{n}</button>;
}
function TagPill({ tag }) {
  const t = TAG_COLORS[tag]||TAG_COLORS["Support needed"];
  return <span style={{ display:"inline-flex", alignItems:"center", padding:"3px 10px", borderRadius:20, fontSize:11.5, fontWeight:600, background:t.bg, color:t.c, border:`1.5px solid ${t.c}33` }}>{tag}</span>;
}
function Compose({ placeholder, rows=3, autoFocus, onSubmit, onCancel }) {
  const [txt,setTxt] = useState("");
  const ref = useRef(null);
  useEffect(()=>{ if(autoFocus&&ref.current) ref.current.focus(); },[autoFocus]);
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
      <textarea ref={ref} className="compose" rows={rows} placeholder={placeholder} value={txt} onChange={e=>setTxt(e.target.value)} maxLength={600} />
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <span style={{ fontSize:11.5, color:G.muted }}>{txt.length}/600</span>
        <div style={{ display:"flex", gap:8 }}>
          {onCancel && <button onClick={onCancel} style={{ padding:"7px 14px", borderRadius:20, border:`1.5px solid ${G.border}`, background:"transparent", fontSize:13, cursor:"pointer", color:G.muted, fontFamily:"'DM Sans',sans-serif" }}>Cancel</button>}
          <button className="post-btn" disabled={!txt.trim()} onClick={()=>{ if(txt.trim()){ onSubmit(txt.trim()); setTxt(""); } }}>Post →</button>
        </div>
      </div>
    </div>
  );
}

// Depth 2 — Reply (no further nesting)
function ReplyItem({ reply, onLike }) {
  return (
    <div className="rpl-box" style={{ animation:"fadeUp .3s ease" }}>
      <div style={{ display:"flex", gap:9, alignItems:"flex-start" }}>
        <Av emoji={reply.emoji} size={28} />
        <div style={{ flex:1 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5, flexWrap:"wrap" }}>
            <span style={{ fontSize:13, fontWeight:600, color:G.warmBrown }}>{reply.anon}</span>
            <span style={{ fontSize:11, color:G.muted }}>{reply.time}</span>
          </div>
          <p style={{ fontSize:13.5, lineHeight:1.68, color:G.midBrown, marginBottom:8 }}>{reply.text}</p>
          <LikeBtn n={reply.likes} on={reply.liked} toggle={()=>onLike(reply.id)} />
        </div>
      </div>
    </div>
  );
}

// Depth 1 — Comment (can have depth-2 replies)
function CommentItem({ comment, postId, onLike, onReply }) {
  const [replyBox,  setReplyBox]  = useState(false);
  const [showRpls,  setShowRpls]  = useState(true);
  const hasReplies = comment.replies.length > 0;
  return (
    <div style={{ display:"flex", gap:11, animation:"fadeUp .35s ease" }}>
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
        <Av emoji={comment.emoji} size={34} />
        {(hasReplies||replyBox) && <div className="depth-line" style={{ flex:1 }} />}
      </div>
      <div style={{ flex:1, paddingBottom:4 }}>
        <div className="cmt-box" style={{ marginBottom:9 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6, flexWrap:"wrap" }}>
            <span style={{ fontSize:13.5, fontWeight:600, color:G.warmBrown }}>{comment.anon}</span>
            <span style={{ fontSize:11, color:G.muted }}>{comment.time}</span>
          </div>
          <p style={{ fontSize:14, lineHeight:1.7, color:G.midBrown, marginBottom:10 }}>{comment.text}</p>
          <div style={{ display:"flex", alignItems:"center", gap:5, flexWrap:"wrap" }}>
            <LikeBtn n={comment.likes} on={comment.liked} toggle={()=>onLike("comment",comment.id)} />
            <button className="ghost" onClick={()=>setReplyBox(r=>!r)}>💬 Reply</button>
            {hasReplies && <button className="ghost" onClick={()=>setShowRpls(r=>!r)}>{showRpls?"▾":"▸"} {comment.replies.length} {comment.replies.length===1?"reply":"replies"}</button>}
          </div>
        </div>

        {/* Depth-2 replies */}
        {showRpls && hasReplies && (
          <div style={{ display:"flex", flexDirection:"column", gap:8, paddingLeft:6, marginBottom:9 }}>
            {comment.replies.map(r => <ReplyItem key={r.id} reply={r} onLike={id=>onLike("reply",id,comment.id)} />)}
          </div>
        )}

        {/* Reply composer — depth 2 hard cap */}
        {replyBox && (
          <div style={{ paddingLeft:6, marginBottom:8, animation:"fadeUp .22s ease" }}>
            <div style={{ background:G.peach, borderRadius:14, padding:"12px 14px", border:`1px dashed ${G.border}` }}>
              <p style={{ fontSize:11.5, color:G.muted, marginBottom:9 }}>🔒 Replying as Anonymous · threads stop at this level</p>
              <Compose placeholder={`Reply to ${comment.anon}…`} rows={2} autoFocus
                onCancel={()=>setReplyBox(false)}
                onSubmit={txt=>{ onReply(postId,comment.id,txt); setReplyBox(false); setShowRpls(true); }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Depth 0 — Post card
function PostCard({ post, onLike, onComment, onReply }) {
  const [expanded,    setExpanded]    = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  return (
    <div className="post-card">
      <div style={{ display:"flex", alignItems:"flex-start", gap:12, marginBottom:13 }}>
        <Av emoji={post.emoji} size={42} />
        <div style={{ flex:1 }}>
          <div style={{ display:"flex", alignItems:"center", gap:9, flexWrap:"wrap", marginBottom:3 }}>
            <span style={{ fontSize:14, fontWeight:600, color:G.warmBrown }}>{post.anon}</span>
            <TagPill tag={post.tag} />
            <span style={{ fontSize:11.5, color:G.muted, marginLeft:"auto" }}>{post.time}</span>
          </div>
          <span style={{ fontSize:11, color:G.muted }}>🔒 Anonymous</span>
        </div>
      </div>
      <p style={{ fontSize:15, lineHeight:1.78, color:G.midBrown, marginBottom:16 }}>{post.text}</p>
      <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap", paddingTop:12, borderTop:`1px solid ${G.border}` }}>
        <LikeBtn n={post.likes} on={post.liked} toggle={()=>onLike("post",post.id)} />
        <button className="ghost" onClick={()=>{ setExpanded(e=>!e); setShowCompose(false); }}>
          💬 {post.comments.length} {post.comments.length===1?"comment":"comments"}
        </button>
        <button className="ghost" onClick={()=>{ setShowCompose(c=>!c); setExpanded(true); }}>✏️ Add comment</button>
        <button className="ghost" style={{ marginLeft:"auto" }}>🔗 Share</button>
      </div>

      {showCompose && (
        <div style={{ marginTop:16, animation:"fadeUp .25s ease" }}>
          <div style={{ background:G.peach, borderRadius:16, padding:"14px 16px", border:`1px dashed ${G.border}` }}>
            <p style={{ fontSize:11.5, color:G.muted, marginBottom:9 }}>🔒 Posting anonymously · replies go 2 levels deep</p>
            <Compose placeholder="Share your thoughts, experience, or support…" rows={3} autoFocus
              onCancel={()=>setShowCompose(false)}
              onSubmit={txt=>{ onComment(post.id,txt); setShowCompose(false); setExpanded(true); }}
            />
          </div>
        </div>
      )}

      {expanded && post.comments.length > 0 && (
        <div style={{ marginTop:20, display:"flex", flexDirection:"column", gap:15, paddingTop:16, borderTop:`1px solid ${G.border}` }}>
          {post.comments.map(c => <CommentItem key={c.id} comment={c} postId={post.id} onLike={onLike} onReply={onReply} />)}
        </div>
      )}
    </div>
  );
}

// New post modal
function NewPostModal({ onClose, onCreate }) {
  const [txt, setTxt] = useState("");
  const [tag, setTag] = useState("Just diagnosed");
  const tags = ["Just diagnosed","Lifestyle win","Question","Mental health","Success story","Venting","Support needed"];
  return (
    <div className="overlay" onClick={e=>{ if(e.target===e.currentTarget) onClose(); }}>
      <div className="modal">
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:22 }}>
          <div>
            <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:22, color:G.warmBrown, marginBottom:3 }}>Share with the community</h2>
            <p style={{ fontSize:12.5, color:G.muted }}>🔒 You'll post as a randomly-generated name</p>
          </div>
          <button onClick={onClose} style={{ width:36, height:36, borderRadius:"50%", background:G.peach, border:"none", fontSize:18, cursor:"pointer", color:G.muted }}>×</button>
        </div>
        <p style={{ fontSize:11, fontWeight:700, letterSpacing:1.5, textTransform:"uppercase", color:G.terra, marginBottom:10 }}>Choose a tag</p>
        <div style={{ display:"flex", flexWrap:"wrap", gap:7, marginBottom:18 }}>
          {tags.map(t => (
            <button key={t} onClick={()=>setTag(t)}
              style={{ padding:"6px 14px", borderRadius:20, border:`1.5px solid ${tag===t?"transparent":G.border}`, background:tag===t?`linear-gradient(135deg,${G.terraLight},${G.terraDeep})`:"transparent", color:tag===t?"#fff":G.midBrown, fontSize:12.5, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all .15s" }}>
              {t}
            </button>
          ))}
        </div>
        <textarea className="compose" rows={5} placeholder="Share what's on your mind. You are not alone here 💛"
          value={txt} onChange={e=>setTxt(e.target.value)} maxLength={600} autoFocus />
        <div style={{ display:"flex", justifyContent:"space-between", marginTop:8, marginBottom:14 }}>
          <span style={{ fontSize:11.5, color:G.muted }}>{txt.length}/600</span>
          <span style={{ fontSize:11.5, color:G.muted }}>Max 2 levels of replies</span>
        </div>
        <div style={{ background:`linear-gradient(135deg,${G.peach},${G.cream})`, borderRadius:12, padding:"10px 14px", marginBottom:18, border:`1px solid ${G.border}` }}>
          <p style={{ fontSize:12.5, color:G.midBrown, lineHeight:1.65 }}>🌸 <strong>Guidelines:</strong> Be kind. Be real. No diagnosing others. No real names. No judgement.</p>
        </div>
        <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
          <button onClick={onClose} style={{ padding:"10px 22px", borderRadius:20, border:`1.5px solid ${G.border}`, background:"transparent", fontSize:13.5, cursor:"pointer", color:G.muted, fontFamily:"'DM Sans',sans-serif" }}>Cancel</button>
          <button className="post-btn" style={{ fontSize:14, padding:"10px 26px" }} disabled={!txt.trim()}
            onClick={()=>{ onCreate(txt.trim(),tag); onClose(); }}>
            Post anonymously 🌸
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ForumPage() {
  const [posts,   setPosts]   = useState(SEED);
  const [filter,  setFilter]  = useState("All");
  const [sort,    setSort]    = useState("recent");
  const [search,  setSearch]  = useState("");
  const [modal,   setModal]   = useState(false);
  const [banner,  setBanner]  = useState(true);

  useEffect(()=>{ const el=document.createElement("style"); el.textContent=STYLE; document.head.appendChild(el); return()=>document.head.removeChild(el); },[]);

  const handleLike = (type,id,parentId) => {
    setPosts(prev=>prev.map(p=>{
      if(type==="post"&&p.id===id) return{...p,likes:p.liked?p.likes-1:p.likes+1,liked:!p.liked};
      return{...p,comments:p.comments.map(c=>{
        if(type==="comment"&&c.id===id) return{...c,likes:c.liked?c.likes-1:c.likes+1,liked:!c.liked};
        if(type==="reply") return{...c,replies:c.replies.map(r=>r.id===id?{...r,likes:r.liked?r.likes-1:r.likes+1,liked:!r.liked}:r)};
        return c;
      })};
    }));
  };
  const handleComment = (postId,txt) => {
    const a=rndAnon();
    setPosts(prev=>prev.map(p=>p.id===postId?{...p,comments:[...p.comments,{id:Date.now(),anon:a.name,emoji:a.emoji,time:"Just now",text:txt,likes:0,liked:false,replies:[]}]}:p));
  };
  const handleReply = (postId,commentId,txt) => {
    const a=rndAnon();
    setPosts(prev=>prev.map(p=>p.id===postId?{...p,comments:p.comments.map(c=>c.id===commentId?{...c,replies:[...c.replies,{id:Date.now(),anon:a.name,emoji:a.emoji,time:"Just now",text:txt,likes:0,liked:false}]}:c)}:p));
  };
  const handleCreate = (txt,tag) => {
    const a=rndAnon();
    setPosts(prev=>[{id:Date.now(),anon:a.name,emoji:a.emoji,tag,time:"Just now",text:txt,likes:0,liked:false,comments:[]}, ...prev]);
  };

  const visible = posts
    .filter(p=>filter==="All"||p.tag===filter)
    .filter(p=>!search||p.text.toLowerCase().includes(search.toLowerCase()))
    .sort((a,b)=>sort==="popular"?b.likes-a.likes:0);

  const totalComments = posts.reduce((n,p)=>n+p.comments.length,0);

  return (
    <div className="f-wrap">
      {modal && <NewPostModal onClose={()=>setModal(false)} onCreate={handleCreate} />}

      {/* Hero */}
      <div style={{ background:"linear-gradient(135deg,#FFF0EB,#FDF8F3,#FFF5F0)", padding:"56px 24px 40px", borderBottom:`1px solid ${G.border}`, position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", width:280, height:280, background:`linear-gradient(135deg,${G.terraLight}33,${G.peach})`, top:-70, right:-30, animation:"blobAnim 8s ease-in-out infinite", borderRadius:"60% 40% 55% 45%/50% 60% 40% 50%", pointerEvents:"none" }} />
        <div style={{ maxWidth:820, margin:"0 auto", position:"relative" }}>
          <p style={{ fontSize:11, fontWeight:700, letterSpacing:2, textTransform:"uppercase", color:G.terra, marginBottom:10 }}>Community Forum</p>
          <h1 style={{ fontFamily:"'Fraunces',serif", fontSize:"clamp(28px,5vw,44px)", color:G.warmBrown, lineHeight:1.14, marginBottom:13 }}>
            You don't have to figure<br /><span style={{ fontStyle:"italic", color:G.terraDeep }}>this out alone.</span>
          </h1>
          <p style={{ fontSize:15, color:G.midBrown, lineHeight:1.75, maxWidth:480, marginBottom:24 }}>
            A genuinely anonymous space for women navigating PCOS — questions, wins, hard days, and everything in between.
          </p>
          <div style={{ display:"flex", gap:12, flexWrap:"wrap", alignItems:"center" }}>
            <button className="post-btn" style={{ fontSize:14, padding:"11px 24px" }} onClick={()=>setModal(true)}>+ Share something</button>
            <div style={{ display:"flex", gap:20 }}>
              {[["👩","Posts",posts.length],["💬","Comments",totalComments],["🔒","Anonymous","100%"]].map(([ic,lb,v])=>(
                <div key={lb} style={{ fontSize:12.5, color:G.muted }}><span>{ic} </span><strong style={{ color:G.warmBrown }}>{v}</strong> {lb}</div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:820, margin:"0 auto", padding:"26px 20px 60px" }}>
        {/* Privacy banner */}
        {banner && (
          <div style={{ background:`linear-gradient(135deg,${G.peach},${G.cream})`, border:`1.5px solid ${G.border}`, borderRadius:16, padding:"14px 18px", marginBottom:22, display:"flex", alignItems:"flex-start", gap:12, animation:"fadeUp .4s ease" }}>
            <span style={{ fontSize:22, flexShrink:0 }}>🔒</span>
            <div style={{ flex:1 }}>
              <p style={{ fontSize:13, fontWeight:600, color:G.warmBrown, marginBottom:3 }}>Genuinely anonymous. Always.</p>
              <p style={{ fontSize:12.5, color:G.midBrown, lineHeight:1.65 }}>Display names are randomly generated each session and cannot be traced back to you. Threads go <strong>2 levels deep</strong> — post → comment → reply — keeping conversations warm and focused.</p>
            </div>
            <button onClick={()=>setBanner(false)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:17, color:G.muted, flexShrink:0 }}>×</button>
          </div>
        )}

        {/* Search + sort */}
        <div style={{ display:"flex", gap:10, marginBottom:18, flexWrap:"wrap" }}>
          <div style={{ flex:1, minWidth:180, position:"relative" }}>
            <span style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", fontSize:15, color:G.muted }}>🔍</span>
            <input placeholder="Search posts…" value={search} onChange={e=>setSearch(e.target.value)}
              style={{ width:"100%", border:`1.5px solid ${G.border}`, borderRadius:20, padding:"9px 16px 9px 38px", fontSize:13.5, fontFamily:"'DM Sans',sans-serif", background:"#fff", color:G.warmBrown, outline:"none" }}
              onFocus={e=>e.target.style.borderColor=G.terra} onBlur={e=>e.target.style.borderColor=G.border} />
          </div>
          <select value={sort} onChange={e=>setSort(e.target.value)}
            style={{ border:`1.5px solid ${G.border}`, borderRadius:20, padding:"8px 14px", fontSize:13, fontFamily:"'DM Sans',sans-serif", color:G.midBrown, background:"#fff", cursor:"pointer", outline:"none" }}>
            <option value="recent">Most recent</option>
            <option value="popular">Most liked</option>
          </select>
        </div>

        {/* Tag filters */}
        <div style={{ display:"flex", gap:7, marginBottom:24, overflowX:"auto", paddingBottom:4 }}>
          {TAGS.map(t=><button key={t} className={`ftag${filter===t?" on":""}`} onClick={()=>setFilter(t)}>{t}</button>)}
        </div>

        {/* Posts */}
        <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
          {visible.length===0 ? (
            <div style={{ textAlign:"center", padding:"64px 24px", color:G.muted }}>
              <div style={{ fontSize:48, marginBottom:14 }}>🌸</div>
              <p style={{ fontFamily:"'Fraunces',serif", fontSize:20, color:G.warmBrown, marginBottom:8 }}>Nothing here yet</p>
              <p style={{ fontSize:14, marginBottom:20 }}>Be the first to post in this category.</p>
              <button className="post-btn" onClick={()=>setModal(true)}>Start the conversation →</button>
            </div>
          ) : visible.map((p,i)=>(
            <div key={p.id} style={{ animationDelay:`${i*.05}s` }}>
              <PostCard post={p} onLike={handleLike} onComment={handleComment} onReply={handleReply} />
            </div>
          ))}
        </div>
        {visible.length>0 && (
          <div style={{ textAlign:"center", marginTop:36 }}>
            <button className="ftag" style={{ padding:"11px 28px", fontSize:14 }}>Load more posts</button>
          </div>
        )}
      </div>
    </div>
  );
}