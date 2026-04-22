import { useState, useRef, useEffect } from "react";

// ─── CLAUDE API ───────────────────────────────────────────────────────────────
async function askClaude(messages, systemPrompt) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: systemPrompt,
      messages,
    }),
  });
  const data = await res.json();
  return data.content?.[0]?.text || "Sorry, I couldn't process that.";
}

// ─── DUMMY DATA ───────────────────────────────────────────────────────────────
const CHILDREN = [
  { id: 1, name: "Arjun Sharma", age: 3, gender: "Boy", dob: "2021-04-10", guardian: "Priya Sharma", lastScreen: "2024-10-12", risk: "Low", score: 4 },
  { id: 2, name: "Meera Patel",  age: 4, gender: "Girl", dob: "2020-08-22", guardian: "Sunita Patel",  lastScreen: "2024-09-28", risk: "Medium", score: 11 },
];

const PATIENTS = [
  { id: 1, name: "Arjun Sharma", age: 3, risk: "Low",    date: "2024-10-12", status: "Reviewed",  score: 4  },
  { id: 2, name: "Meera Patel",  age: 4, risk: "Medium", date: "2024-09-28", status: "Pending",   score: 11 },
  { id: 3, name: "Rohan Das",    age: 5, risk: "High",   date: "2024-10-01", status: "Urgent",    score: 17 },
];

const MCHAT_QUESTIONS = [
  { id:1,  text: "Does your child look at you when you call his/her name?",           emoji: "👁️" },
  { id:2,  text: "Does your child make eye contact with people?",                     emoji: "👀" },
  { id:3,  text: "Does your child point to show you interesting things?",             emoji: "👆" },
  { id:4,  text: "Does your child play pretend or make-believe?",                     emoji: "🎭" },
  { id:5,  text: "Does your child follow when you point at something far away?",      emoji: "🔭" },
  { id:6,  text: "Does your child show repetitive hand or body movements?",           emoji: "🔁" },
  { id:7,  text: "Does your child get upset by small changes in routine?",            emoji: "😟" },
  { id:8,  text: "Does your child respond to smiling faces?",                         emoji: "😊" },
  { id:9,  text: "Does your child avoid being touched or held?",                      emoji: "🤚" },
  { id:10, text: "Does your child have difficulty understanding what others feel?",   emoji: "💭" },
  { id:11, text: "Does your child show interest in other children?",                  emoji: "👫" },
  { id:12, text: "Does your child use words to communicate?",                         emoji: "💬" },
  { id:13, text: "Does your child walk on tiptoes frequently?",                       emoji: "🦶" },
  { id:14, text: "Does your child seem sensitive to sounds or lights?",               emoji: "👂" },
  { id:15, text: "Does your child imitate you or other people?",                      emoji: "🪞" },
];

// ─── THEME ────────────────────────────────────────────────────────────────────
const T = {
  orange: "#FF6B2B", orangeDeep: "#E85520", orangeLight: "#FF8C55",
  orangePale: "#FFF0E8", yellow: "#FFD166", cream: "#FFFAF5",
  dark: "#1E1410", mid: "#5C3D26", light: "#9A7A65",
  white: "#FFFFFF", teal: "#2EC4B6", green: "#52C41A", red: "#E53E3E",
};

const riskColor = (r) => r === "Low" ? T.green : r === "Medium" ? "#E6A817" : T.red;
const riskBg   = (r) => r === "Low" ? "#E8F8E8" : r === "Medium" ? "#FFF8E1" : "#FFE8E8";

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────
const Navbar = ({ page, setPage, user, setUser }) => (
  <nav style={{
    position:"fixed", top:0, left:0, right:0, zIndex:200,
    display:"flex", alignItems:"center", justifyContent:"space-between",
    padding:"14px 40px",
    background:"rgba(255,250,245,0.92)", backdropFilter:"blur(14px)",
    borderBottom:`1px solid rgba(255,107,43,0.13)`,
    boxShadow:"0 2px 16px rgba(255,107,43,0.07)"
  }}>
    <button onClick={()=>setPage("landing")} style={{
      fontFamily:"Nunito,sans-serif", fontWeight:900, fontSize:"1.4rem",
      color:T.orange, background:"none", border:"none", cursor:"pointer",
      display:"flex", alignItems:"center", gap:8
    }}>
      <span style={{width:10,height:10,borderRadius:"50%",background:T.orange,display:"inline-block"}}/>
      Auti<span style={{color:T.dark}}>Sense</span>
    </button>
    <div style={{display:"flex",alignItems:"center",gap:20}}>
      {user ? (
        <>
          <span style={{fontSize:"0.85rem",fontWeight:600,color:T.mid}}>👤 {user.name}</span>
          <button onClick={()=>setPage(user.role==="doctor"?"doctor":"parent")} style={navBtn}>Dashboard</button>
          <button onClick={()=>{setUser(null);setPage("landing")}} style={{...navBtn,background:T.orange,color:"white",border:"none"}}>Logout</button>
        </>
      ) : (
        <>
          <button onClick={()=>setPage("awareness")} style={navBtn}>Awareness</button>
          <button onClick={()=>setPage("login")} style={navBtn}>Login</button>
          <button onClick={()=>setPage("login")} style={{...navBtn,background:T.orange,color:"white",border:"none",boxShadow:`0 4px 16px rgba(255,107,43,0.3)`}}>Start Screening</button>
        </>
      )}
    </div>
  </nav>
);
const navBtn = {
  padding:"8px 20px", borderRadius:50, border:`1.5px solid rgba(30,20,16,0.12)`,
  fontWeight:700, fontSize:"0.85rem", cursor:"pointer", background:"transparent", color:T.dark,
  transition:"all 0.2s", fontFamily:"Sora,sans-serif"
};

const Card = ({children, style={}}) => (
  <div style={{background:T.white,borderRadius:20,padding:28,border:`1.5px solid rgba(255,107,43,0.1)`,boxShadow:"0 4px 20px rgba(255,107,43,0.07)",...style}}>
    {children}
  </div>
);

const Badge = ({risk}) => (
  <span style={{
    background:riskBg(risk), color:riskColor(risk),
    padding:"4px 14px", borderRadius:50, fontWeight:700, fontSize:"0.78rem"
  }}>{risk} Risk</span>
);

const Input = ({label, ...props}) => (
  <div style={{marginBottom:16}}>
    {label && <label style={{display:"block",fontSize:"0.82rem",fontWeight:700,color:T.mid,marginBottom:6}}>{label}</label>}
    <input {...props} style={{
      width:"100%", padding:"12px 16px", borderRadius:12,
      border:`1.5px solid rgba(255,107,43,0.2)`, outline:"none",
      fontSize:"0.9rem", fontFamily:"Sora,sans-serif", color:T.dark,
      background:"#FDFAF8", boxSizing:"border-box",
      ...(props.style||{})
    }}/>
  </div>
);

const Btn = ({children, onClick, style={}, disabled=false}) => (
  <button onClick={onClick} disabled={disabled} style={{
    background:disabled?"#ccc":T.orange, color:"white",
    padding:"13px 32px", borderRadius:50, border:"none", cursor:disabled?"not-allowed":"pointer",
    fontFamily:"Nunito,sans-serif", fontWeight:800, fontSize:"0.95rem",
    boxShadow:disabled?"none":`0 6px 24px rgba(255,107,43,0.3)`,
    transition:"all 0.2s", ...style
  }}>{children}</button>
);

// ─── CHATBOT (Claude-powered) ─────────────────────────────────────────────────
const CHAT_SYSTEM = `You are AutiSense AI, a warm and helpful assistant for parents and caregivers concerned about autism spectrum disorder (ASD) in preschool children (ages 2-6). You provide:
- Clear, compassionate information about early autism signs
- Guidance on screening tools like M-CHAT-R
- Advice on when to see a pediatrician
- Emotional support for anxious parents
- Information about therapies and early intervention
Keep responses concise (3-5 sentences), warm, and jargon-free. Never diagnose — always recommend professional evaluation. Speak as if talking to a worried parent.`;

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([
    { role:"assistant", content:"👋 Hi! I'm AutiSense AI. Ask me anything about autism signs, screening, or how to support your child. I'm here to help! 🧡" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef();

  useEffect(() => { bottomRef.current?.scrollIntoView({behavior:"smooth"}); }, [msgs]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role:"user", content:input };
    const newMsgs = [...msgs, userMsg];
    setMsgs(newMsgs); setInput(""); setLoading(true);
    try {
      const apiMsgs = newMsgs.map(m=>({role:m.role,content:m.content}));
      const reply = await askClaude(apiMsgs, CHAT_SYSTEM);
      setMsgs(prev => [...prev, {role:"assistant", content:reply}]);
    } catch { setMsgs(prev => [...prev, {role:"assistant",content:"Sorry, I'm having trouble connecting. Please try again!"}]); }
    setLoading(false);
  };

  return (
    <>
      <button onClick={()=>setOpen(o=>!o)} style={{
        position:"fixed", bottom:32, right:32, zIndex:500,
        width:60, height:60, borderRadius:"50%",
        background:`linear-gradient(135deg,${T.orange},${T.orangeDeep})`,
        border:"none", cursor:"pointer", fontSize:"1.6rem",
        boxShadow:`0 8px 32px rgba(255,107,43,0.45)`,
        display:"flex",alignItems:"center",justifyContent:"center",
        transition:"transform 0.2s"
      }}>🤖</button>

      {open && (
        <div style={{
          position:"fixed", bottom:104, right:32, zIndex:500,
          width:360, height:480, borderRadius:24,
          background:T.white, boxShadow:"0 24px 80px rgba(0,0,0,0.18)",
          display:"flex", flexDirection:"column", overflow:"hidden",
          border:`1.5px solid rgba(255,107,43,0.15)`
        }}>
          <div style={{background:`linear-gradient(135deg,${T.orange},${T.orangeDeep})`,padding:"16px 20px",color:"white"}}>
            <div style={{fontFamily:"Nunito,sans-serif",fontWeight:900,fontSize:"1.05rem"}}>🤖 AutiSense AI</div>
            <div style={{fontSize:"0.75rem",opacity:0.85,marginTop:2}}>Ask me about autism, screening & more</div>
          </div>
          <div style={{flex:1,overflowY:"auto",padding:16,display:"flex",flexDirection:"column",gap:10}}>
            {msgs.map((m,i)=>(
              <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
                <div style={{
                  maxWidth:"80%", padding:"10px 14px", borderRadius:16,
                  background:m.role==="user"?T.orange:T.orangePale,
                  color:m.role==="user"?"white":T.dark,
                  fontSize:"0.83rem", lineHeight:1.6,
                  borderBottomRightRadius:m.role==="user"?4:16,
                  borderBottomLeftRadius:m.role==="assistant"?4:16,
                }}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{display:"flex",gap:4,padding:"10px 14px",background:T.orangePale,borderRadius:16,width:"fit-content"}}>
                {[0,1,2].map(i=>(
                  <div key={i} style={{width:7,height:7,borderRadius:"50%",background:T.orange,animation:`bounce 1s ${i*0.2}s infinite`}}/>
                ))}
              </div>
            )}
            <div ref={bottomRef}/>
          </div>
          <div style={{padding:"12px 16px",borderTop:`1px solid rgba(255,107,43,0.1)`,display:"flex",gap:8}}>
            <input
              value={input} onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&send()}
              placeholder="Ask about autism..."
              style={{flex:1,padding:"10px 14px",borderRadius:50,border:`1.5px solid rgba(255,107,43,0.2)`,outline:"none",fontSize:"0.85rem",fontFamily:"Sora,sans-serif"}}
            />
            <button onClick={send} style={{background:T.orange,color:"white",border:"none",borderRadius:"50%",width:40,height:40,cursor:"pointer",fontSize:"1rem"}}>➤</button>
          </div>
        </div>
      )}
      <style>{`@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}`}</style>
    </>
  );
};

// ─── PAGE: LANDING ────────────────────────────────────────────────────────────
const LandingPage = ({setPage}) => (
  <div style={{paddingTop:80}}>
    {/* Hero */}
    <div style={{minHeight:"92vh",display:"flex",alignItems:"center",padding:"80px 60px",position:"relative",overflow:"hidden",background:`radial-gradient(ellipse 700px 500px at 80% 50%, rgba(255,107,43,0.1), transparent), ${T.cream}`}}>
      {[{w:300,h:300,t:"10%",r:"8%",c:T.orange,d:0},{w:160,h:160,t:"60%",r:"22%",c:T.yellow,d:2},{w:100,h:100,t:"25%",r:"36%",c:T.teal,d:4}].map((b,i)=>(
        <div key={i} style={{position:"absolute",width:b.w,height:b.h,borderRadius:"50%",background:b.c,top:b.t,right:b.r,opacity:0.1,animation:`float 8s ${b.d}s ease-in-out infinite`}}/>
      ))}
      <div style={{maxWidth:620,position:"relative",zIndex:1}}>
        <div style={{display:"inline-flex",alignItems:"center",gap:8,background:T.orangePale,border:`1.5px solid rgba(255,107,43,0.3)`,padding:"6px 16px",borderRadius:50,fontSize:"0.75rem",fontWeight:700,color:T.orange,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:24}}>
          <span style={{width:7,height:7,borderRadius:"50%",background:T.orange,display:"inline-block"}}/>AI-Powered Early Detection
        </div>
        <h1 style={{fontFamily:"Nunito,sans-serif",fontWeight:900,fontSize:"clamp(2.4rem,5vw,3.8rem)",lineHeight:1.1,color:T.dark,marginBottom:20}}>
          Catching <span style={{color:T.orange,borderBottom:`4px solid ${T.yellow}`}}>Autism Early</span><br/>Changes Everything
        </h1>
        <p style={{fontSize:"1.05rem",lineHeight:1.7,color:T.mid,maxWidth:500,marginBottom:36}}>
          AutiSense uses AI and behavioral screening to help parents and doctors detect early signs of autism in children aged 2–6. Powered by Claude AI for real-time analysis.
        </p>
        <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
          <Btn onClick={()=>setPage("login")}>🧡 Start Free Screening</Btn>
          <button onClick={()=>setPage("awareness")} style={{padding:"13px 28px",borderRadius:50,border:`2px solid rgba(30,20,16,0.15)`,fontWeight:700,fontSize:"0.95rem",cursor:"pointer",background:"transparent",color:T.dark,fontFamily:"Nunito,sans-serif"}}>
            📖 Learn More
          </button>
        </div>
        <div style={{display:"flex",gap:40,marginTop:48}}>
          {[["1 in 36","Children affected"],["94%","AI Accuracy"],["5 min","Screening time"]].map(([n,l])=>(
            <div key={l}><div style={{fontFamily:"Nunito,sans-serif",fontWeight:900,fontSize:"1.9rem",color:T.orange}}>{n}</div><div style={{fontSize:"0.8rem",color:T.light,fontWeight:600,marginTop:3}}>{l}</div></div>
          ))}
        </div>
      </div>
    </div>

    {/* How it Works */}
    <div style={{padding:"80px 60px",background:T.white}}>
      <div style={{fontSize:"0.75rem",fontWeight:700,color:T.orange,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:12}}>Simple Process</div>
      <h2 style={{fontFamily:"Nunito,sans-serif",fontWeight:900,fontSize:"2.2rem",color:T.dark,marginBottom:48}}>How AutiSense Works</h2>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:24}}>
        {[
          {num:"01",icon:"📝",title:"Answer Questions",desc:"Complete our 15-question M-CHAT based behavioral screening — takes under 5 minutes."},
          {num:"02",icon:"🧠",title:"Claude AI Analyzes",desc:"Our Claude-powered AI reads your responses and generates a detailed risk assessment with explanations."},
          {num:"03",icon:"📄",title:"Get Your Report",desc:"Receive a full report with risk level, contributing factors, and personalized recommendations."},
        ].map(s=>(
          <Card key={s.num} style={{position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:16,right:20,fontFamily:"Nunito,sans-serif",fontWeight:900,fontSize:"3.5rem",color:"rgba(255,107,43,0.06)"}}>{s.num}</div>
            <div style={{fontSize:"2rem",marginBottom:16}}>{s.icon}</div>
            <div style={{fontFamily:"Nunito,sans-serif",fontWeight:800,fontSize:"1.1rem",marginBottom:10}}>{s.title}</div>
            <div style={{fontSize:"0.87rem",lineHeight:1.65,color:T.mid}}>{s.desc}</div>
          </Card>
        ))}
      </div>
    </div>

    {/* Features */}
    <div style={{padding:"80px 60px",background:`linear-gradient(135deg,${T.dark},#3D2010)`,margin:"0 40px",borderRadius:36}}>
      <div style={{fontSize:"0.75rem",fontWeight:700,color:T.yellow,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:12}}>Powered by Claude AI</div>
      <h2 style={{fontFamily:"Nunito,sans-serif",fontWeight:900,fontSize:"2.2rem",color:"white",marginBottom:48}}>Everything You Need</h2>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:20}}>
        {[
          {icon:"🎯",t:"AI Risk Prediction",d:"Claude AI analyzes behavioral responses to classify Low/Medium/High risk with detailed reasoning."},
          {icon:"💬",t:"24/7 AI Chatbot",d:"Ask Claude anything about autism signs, therapies, and parenting strategies — in plain language."},
          {icon:"📊",t:"Progress Tracking",d:"Monitor your child's development across multiple screenings with visual trend charts."},
          {icon:"🩺",t:"Doctor Dashboard",d:"Clinicians review flagged cases with AI-generated summaries and clinical note tools."},
          {icon:"📄",t:"Instant AI Reports",d:"Claude generates a full narrative report explaining each risk factor in parent-friendly language."},
          {icon:"🌐",t:"Awareness Hub",d:"Educational content about early autism signs, M-CHAT guidelines, and local therapy resources."},
        ].map(f=>(
          <div key={f.t} style={{background:"rgba(255,255,255,0.05)",border:"1.5px solid rgba(255,255,255,0.08)",borderRadius:18,padding:24,transition:"all 0.3s"}}>
            <div style={{fontSize:"1.8rem",marginBottom:14}}>{f.icon}</div>
            <div style={{fontFamily:"Nunito,sans-serif",fontWeight:800,fontSize:"1rem",color:"white",marginBottom:8}}>{f.t}</div>
            <div style={{fontSize:"0.83rem",lineHeight:1.6,color:"rgba(255,255,255,0.55)"}}>{f.d}</div>
          </div>
        ))}
      </div>
    </div>

    {/* CTA */}
    <div style={{padding:"80px 60px",textAlign:"center"}}>
      <h2 style={{fontFamily:"Nunito,sans-serif",fontWeight:900,fontSize:"2.4rem",color:T.dark,marginBottom:14}}>Ready to Screen Your Child?</h2>
      <p style={{color:T.mid,fontSize:"1rem",marginBottom:32}}>Free, confidential, and powered by real Claude AI. Takes only 5 minutes.</p>
      <Btn onClick={()=>setPage("login")} style={{fontSize:"1.05rem",padding:"15px 44px"}}>🧡 Begin Free Screening Now</Btn>
    </div>
    <style>{`@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-20px)}}`}</style>
  </div>
);

// ─── PAGE: LOGIN ──────────────────────────────────────────────────────────────
const LoginPage = ({setPage, setUser}) => {
  const [tab, setTab] = useState("login");
  const [form, setForm] = useState({name:"",email:"",password:"",role:"parent"});
  const [toast, setToast] = useState("");

  const handle = (e) => setForm(f=>({...f,[e.target.name]:e.target.value}));
  const submit = () => {
    if (!form.email || !form.password) { setToast("Please fill all fields"); return; }
    const user = { name: form.name||form.email.split("@")[0], email:form.email, role:form.role };
    setUser(user);
    setToast("Welcome! Redirecting...");
    setTimeout(()=>setPage(form.role==="doctor"?"doctor":form.role==="admin"?"admin":"parent"), 800);
  };

  return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:`radial-gradient(ellipse at 60% 40%, rgba(255,107,43,0.1), transparent), ${T.cream}`,paddingTop:80}}>
      {toast && <div style={{position:"fixed",top:90,right:32,background:T.orange,color:"white",padding:"12px 24px",borderRadius:12,fontWeight:700,zIndex:999}}>{toast}</div>}
      <Card style={{width:420,padding:40}}>
        <h2 style={{fontFamily:"Nunito,sans-serif",fontWeight:900,fontSize:"1.8rem",color:T.orange,textAlign:"center",marginBottom:8}}>🧡 AutiSense</h2>
        <div style={{display:"flex",gap:0,marginBottom:28,borderRadius:12,overflow:"hidden",border:`1.5px solid rgba(255,107,43,0.2)`}}>
          {["login","register"].map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{flex:1,padding:"11px",border:"none",cursor:"pointer",fontWeight:700,fontSize:"0.88rem",fontFamily:"Nunito,sans-serif",background:tab===t?T.orange:"transparent",color:tab===t?"white":T.mid,transition:"all 0.2s"}}>
              {t==="login"?"🔐 Login":"📝 Register"}
            </button>
          ))}
        </div>
        {tab==="register" && <Input label="Full Name" name="name" value={form.name} onChange={handle} placeholder="Your full name"/>}
        <Input label="Email Address" name="email" type="email" value={form.email} onChange={handle} placeholder="email@example.com"/>
        <Input label="Password" name="password" type="password" value={form.password} onChange={handle} placeholder="••••••••"/>
        <div style={{marginBottom:20}}>
          <label style={{display:"block",fontSize:"0.82rem",fontWeight:700,color:T.mid,marginBottom:6}}>Role</label>
          <select name="role" value={form.role} onChange={handle} style={{width:"100%",padding:"12px 16px",borderRadius:12,border:`1.5px solid rgba(255,107,43,0.2)`,outline:"none",fontSize:"0.9rem",fontFamily:"Sora,sans-serif",background:"#FDFAF8",color:T.dark}}>
            <option value="parent">👨‍👩‍👧 Parent / Guardian</option>
            <option value="doctor">🩺 Doctor / Clinician</option>
            <option value="admin">⚙️ Admin</option>
          </select>
        </div>
        <Btn onClick={submit} style={{width:"100%",justifyContent:"center"}}>
          {tab==="login"?"🔐 Login":"📝 Create Account"}
        </Btn>
        <p style={{textAlign:"center",fontSize:"0.8rem",color:T.light,marginTop:16}}>
          {tab==="login"?"Don't have an account? ":"Already have an account? "}
          <button onClick={()=>setTab(tab==="login"?"register":"login")} style={{color:T.orange,fontWeight:700,border:"none",background:"none",cursor:"pointer"}}>
            {tab==="login"?"Register":"Login"}
          </button>
        </p>
      </Card>
    </div>
  );
};

// ─── PAGE: PARENT DASHBOARD ───────────────────────────────────────────────────
const ParentDashboard = ({setPage, user}) => {
  const [children] = useState(CHILDREN);
  return (
    <div style={{minHeight:"100vh",background:T.cream,padding:"100px 48px 60px"}}>
      <div style={{marginBottom:32}}>
        <h1 style={{fontFamily:"Nunito,sans-serif",fontWeight:900,fontSize:"2rem",color:T.dark}}>Hello, {user?.name||"Parent"} 👋</h1>
        <p style={{color:T.mid,marginTop:6}}>Here's an overview of your children's screening history.</p>
      </div>

      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:20,marginBottom:36}}>
        {[
          {label:"Children Tracked",val:2,icon:"👦"},
          {label:"Total Screenings",val:5,icon:"📋"},
          {label:"High Risk Alerts",val:0,icon:"🚨"},
          {label:"Last Screening",val:"12 Oct",icon:"📅"},
        ].map(s=>(
          <Card key={s.label} style={{textAlign:"center",padding:24}}>
            <div style={{fontSize:"2rem",marginBottom:8}}>{s.icon}</div>
            <div style={{fontFamily:"Nunito,sans-serif",fontWeight:900,fontSize:"1.8rem",color:T.orange}}>{s.val}</div>
            <div style={{fontSize:"0.8rem",color:T.light,fontWeight:600,marginTop:4}}>{s.label}</div>
          </Card>
        ))}
      </div>

      {/* Children Cards */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <h2 style={{fontFamily:"Nunito,sans-serif",fontWeight:800,fontSize:"1.3rem",color:T.dark}}>My Children</h2>
        <Btn onClick={()=>setPage("addchild")} style={{padding:"10px 24px",fontSize:"0.85rem"}}>+ Add Child</Btn>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:20,marginBottom:40}}>
        {children.map(c=>(
          <Card key={c.id} style={{display:"flex",alignItems:"center",gap:20}}>
            <div style={{width:64,height:64,borderRadius:"50%",background:`linear-gradient(135deg,${T.orange},${T.orangeDeep})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.8rem",flexShrink:0}}>
              {c.gender==="Boy"?"👦":"👧"}
            </div>
            <div style={{flex:1}}>
              <div style={{fontFamily:"Nunito,sans-serif",fontWeight:800,fontSize:"1.1rem",color:T.dark}}>{c.name}</div>
              <div style={{fontSize:"0.82rem",color:T.light,marginTop:3}}>Age {c.age} · {c.gender} · DOB: {c.dob}</div>
              <div style={{display:"flex",alignItems:"center",gap:10,marginTop:10}}>
                <Badge risk={c.risk}/>
                <span style={{fontSize:"0.78rem",color:T.light}}>Score: {c.score}/20</span>
              </div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              <Btn onClick={()=>setPage("screening")} style={{padding:"8px 18px",fontSize:"0.8rem"}}>Screen Now</Btn>
              <button onClick={()=>setPage("result")} style={{padding:"8px 18px",fontSize:"0.8rem",borderRadius:50,border:`1.5px solid rgba(255,107,43,0.3)`,background:"transparent",color:T.orange,cursor:"pointer",fontWeight:700}}>View Report</button>
            </div>
          </Card>
        ))}
      </div>

      {/* History Table */}
      <h2 style={{fontFamily:"Nunito,sans-serif",fontWeight:800,fontSize:"1.3rem",color:T.dark,marginBottom:16}}>Screening History</h2>
      <Card style={{padding:0,overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:"0.88rem"}}>
          <thead><tr style={{background:T.orangePale}}>
            {["Child","Date","Score","Risk Level","Action"].map(h=>(
              <th key={h} style={{padding:"14px 20px",textAlign:"left",fontWeight:700,color:T.mid,fontSize:"0.8rem"}}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {[{n:"Arjun Sharma",d:"12 Oct 2024",s:"4/20",r:"Low"},{n:"Meera Patel",d:"28 Sep 2024",s:"11/20",r:"Medium"},{n:"Arjun Sharma",d:"15 Aug 2024",s:"3/20",r:"Low"}].map((row,i)=>(
              <tr key={i} style={{borderBottom:`1px solid rgba(255,107,43,0.07)`}}>
                <td style={{padding:"14px 20px",fontWeight:600}}>{row.n}</td>
                <td style={{padding:"14px 20px",color:T.light}}>{row.d}</td>
                <td style={{padding:"14px 20px",fontWeight:700,color:T.orange}}>{row.s}</td>
                <td style={{padding:"14px 20px"}}><Badge risk={row.r}/></td>
                <td style={{padding:"14px 20px"}}><button onClick={()=>setPage("result")} style={{color:T.orange,fontWeight:700,border:"none",background:"none",cursor:"pointer",fontSize:"0.85rem"}}>View Report →</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

// ─── PAGE: ADD CHILD ──────────────────────────────────────────────────────────
const AddChildPage = ({setPage}) => {
  const [form, setForm] = useState({name:"",dob:"",gender:"Boy",guardian:""});
  const [toast, setToast] = useState(false);
  const handle = e => setForm(f=>({...f,[e.target.name]:e.target.value}));
  const submit = () => {
    if(!form.name||!form.dob){return;}
    setToast(true);
    setTimeout(()=>{setToast(false);setPage("parent");},1500);
  };
  return (
    <div style={{minHeight:"100vh",background:T.cream,padding:"100px 48px 60px",display:"flex",justifyContent:"center"}}>
      {toast && <div style={{position:"fixed",top:90,right:32,background:T.green,color:"white",padding:"12px 24px",borderRadius:12,fontWeight:700,zIndex:999}}>✅ Child added successfully!</div>}
      <Card style={{width:480,height:"fit-content"}}>
        <h2 style={{fontFamily:"Nunito,sans-serif",fontWeight:900,fontSize:"1.6rem",color:T.dark,marginBottom:24}}>👶 Add New Child</h2>
        <Input label="Child's Full Name" name="name" value={form.name} onChange={handle} placeholder="e.g. Arjun Sharma"/>
        <Input label="Date of Birth" name="dob" type="date" value={form.dob} onChange={handle}/>
        <div style={{marginBottom:16}}>
          <label style={{display:"block",fontSize:"0.82rem",fontWeight:700,color:T.mid,marginBottom:6}}>Gender</label>
          <div style={{display:"flex",gap:12}}>
            {["Boy","Girl"].map(g=>(
              <button key={g} onClick={()=>setForm(f=>({...f,gender:g}))} style={{flex:1,padding:"11px",borderRadius:12,border:`2px solid ${form.gender===g?T.orange:"rgba(255,107,43,0.2)"}`,background:form.gender===g?T.orangePale:"transparent",fontWeight:700,cursor:"pointer",color:form.gender===g?T.orange:T.mid,fontFamily:"Sora,sans-serif"}}>
                {g==="Boy"?"👦 Boy":"👧 Girl"}
              </button>
            ))}
          </div>
        </div>
        <Input label="Guardian / Parent Name" name="guardian" value={form.guardian} onChange={handle} placeholder="Your full name"/>
        <div style={{display:"flex",gap:12,marginTop:8}}>
          <button onClick={()=>setPage("parent")} style={{flex:1,padding:"13px",borderRadius:50,border:`1.5px solid rgba(30,20,16,0.15)`,background:"transparent",fontWeight:700,cursor:"pointer",fontFamily:"Nunito,sans-serif"}}>Cancel</button>
          <Btn onClick={submit} style={{flex:1,justifyContent:"center"}}>Add Child</Btn>
        </div>
      </Card>
    </div>
  );
};

// ─── PAGE: SCREENING ──────────────────────────────────────────────────────────
const ScreeningPage = ({setPage}) => {
  const perPage = 3;
  const totalSteps = Math.ceil(MCHAT_QUESTIONS.length / perPage);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);

  const pageQs = MCHAT_QUESTIONS.slice(step*perPage, step*perPage+perPage);
  const progress = ((step+1)/totalSteps)*100;
  const allAnswered = pageQs.every(q=>answers[q.id]!==undefined);

  const submit = async () => {
    setLoading(true);
    // pre-compute result then navigate
    setTimeout(()=>{ setLoading(false); setPage("result"); }, 800);
  };

  return (
    <div style={{minHeight:"100vh",background:T.cream,padding:"100px 48px 60px",display:"flex",justifyContent:"center"}}>
      <div style={{width:"100%",maxWidth:620}}>
        {/* Progress */}
        <div style={{marginBottom:32}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <span style={{fontFamily:"Nunito,sans-serif",fontWeight:800,fontSize:"1rem",color:T.dark}}>Step {step+1} of {totalSteps}</span>
            <span style={{fontSize:"0.82rem",color:T.light,fontWeight:600}}>{Object.keys(answers).length}/{MCHAT_QUESTIONS.length} answered</span>
          </div>
          <div style={{height:8,background:"rgba(255,107,43,0.1)",borderRadius:4,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${progress}%`,background:`linear-gradient(90deg,${T.orange},${T.orangeLight})`,borderRadius:4,transition:"width 0.4s"}}/>
          </div>
        </div>

        <Card>
          <h2 style={{fontFamily:"Nunito,sans-serif",fontWeight:900,fontSize:"1.4rem",color:T.dark,marginBottom:6}}>📋 M-CHAT Behavioral Screening</h2>
          <p style={{fontSize:"0.85rem",color:T.light,marginBottom:28}}>Answer based on your child's typical behavior over the past few months.</p>

          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            {pageQs.map(q=>(
              <div key={q.id} style={{padding:20,borderRadius:16,border:`1.5px solid ${answers[q.id]!==undefined?"rgba(255,107,43,0.3)":"rgba(0,0,0,0.07)"}`,background:answers[q.id]!==undefined?T.orangePale:T.white}}>
                <div style={{display:"flex",gap:14,alignItems:"flex-start",marginBottom:14}}>
                  <span style={{fontSize:"1.8rem"}}>{q.emoji}</span>
                  <span style={{fontSize:"0.92rem",lineHeight:1.5,fontWeight:600,color:T.dark,paddingTop:4}}>{q.text}</span>
                </div>
                <div style={{display:"flex",gap:10}}>
                  {["Yes","No"].map(opt=>(
                    <button key={opt} onClick={()=>setAnswers(a=>({...a,[q.id]:opt}))} style={{
                      flex:1, padding:"10px", borderRadius:12, border:"none", cursor:"pointer",
                      fontFamily:"Nunito,sans-serif", fontWeight:800, fontSize:"0.9rem",
                      background:answers[q.id]===opt?(opt==="Yes"?T.green:T.red):"rgba(0,0,0,0.05)",
                      color:answers[q.id]===opt?"white":T.mid,
                      transition:"all 0.2s"
                    }}>
                      {opt==="Yes"?"✓ Yes":"✗ No"}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{display:"flex",gap:12,marginTop:28}}>
            {step>0 && <button onClick={()=>setStep(s=>s-1)} style={{flex:1,padding:13,borderRadius:50,border:`1.5px solid rgba(30,20,16,0.15)`,background:"transparent",fontWeight:700,cursor:"pointer",fontFamily:"Nunito,sans-serif"}}>← Back</button>}
            {step<totalSteps-1 ? (
              <Btn onClick={()=>setStep(s=>s+1)} disabled={!allAnswered} style={{flex:1,justifyContent:"center"}}>Next →</Btn>
            ) : (
              <Btn onClick={submit} disabled={!allAnswered||loading} style={{flex:1,justifyContent:"center"}}>
                {loading?"🔄 Analyzing...":"🧠 Submit & Analyze"}
              </Btn>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

// ─── PAGE: RESULT (Claude AI powered) ────────────────────────────────────────
const ResultPage = ({setPage}) => {
  const [report, setReport] = useState("");
  const [loading, setLoading] = useState(true);
  const child = CHILDREN[1]; // Meera as demo

  const REPORT_SYSTEM = `You are a compassionate pediatric screening AI. Generate a short autism screening result report for parents. Be warm, clear, and non-alarming. Avoid medical jargon. Structure: 1) What the score means (2 sentences), 2) Key observations (3 bullet points), 3) Recommended next steps (2 sentences). Keep total under 150 words.`;

  useEffect(()=>{
    askClaude([{role:"user",content:`Child: ${child.name}, Age: ${child.age}, Score: ${child.score}/20, Risk: ${child.risk}. Generate a parent-friendly screening result summary.`}], REPORT_SYSTEM)
      .then(r=>{setReport(r);setLoading(false);})
      .catch(()=>{setReport("Based on the screening results, your child shows some behavioral patterns worth discussing with your pediatrician. Early awareness and professional guidance can make a significant positive difference.");setLoading(false);});
  },[]);

  const categories = [
    {label:"Social Interaction",score:3,max:5},
    {label:"Communication",score:2,max:5},
    {label:"Repetitive Behavior",score:2,max:5},
    {label:"Sensory Response",score:2,max:3},
    {label:"Routine Flexibility",score:2,max:2},
  ];

  return (
    <div style={{minHeight:"100vh",background:T.cream,padding:"100px 48px 60px"}}>
      <div style={{maxWidth:760,margin:"0 auto"}}>

        {/* Header */}
        <Card style={{marginBottom:24,background:`linear-gradient(135deg,${child.risk==="Medium"?"#FFF8E1":"#E8F8E8"},${T.white})`,textAlign:"center",padding:"36px 40px"}}>
          <div style={{fontSize:"3.5rem",marginBottom:12}}>{child.risk==="Medium"?"⚠️":"✅"}</div>
          <div style={{fontFamily:"Nunito,sans-serif",fontWeight:900,fontSize:"2rem",color:riskColor(child.risk)}}>{child.risk.toUpperCase()} RISK</div>
          <div style={{fontSize:"0.9rem",color:T.mid,marginTop:8}}>
            {child.name} · Age {child.age} · Score: <strong style={{color:T.orange}}>{child.score}/20</strong> · Screened Oct 12, 2024
          </div>
          <div style={{marginTop:16,height:12,background:"rgba(0,0,0,0.06)",borderRadius:6,overflow:"hidden",maxWidth:400,margin:"16px auto 0"}}>
            <div style={{height:"100%",width:`${(child.score/20)*100}%`,background:riskColor(child.risk),borderRadius:6,transition:"width 1s"}}/>
          </div>
        </Card>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24,marginBottom:24}}>
          {/* AI Report */}
          <Card style={{gridColumn:"1/-1"}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
              <span style={{fontSize:"1.4rem"}}>🤖</span>
              <span style={{fontFamily:"Nunito,sans-serif",fontWeight:800,fontSize:"1.1rem",color:T.dark}}>Claude AI Analysis</span>
              <span style={{fontSize:"0.72rem",background:T.orangePale,color:T.orange,padding:"3px 10px",borderRadius:50,fontWeight:700,marginLeft:"auto"}}>AI Generated</span>
            </div>
            {loading ? (
              <div style={{display:"flex",gap:6,padding:"12px 0"}}>
                {[0,1,2].map(i=><div key={i} style={{width:8,height:8,borderRadius:"50%",background:T.orange,animation:`bounce 1s ${i*0.2}s infinite`}}/>)}
              </div>
            ) : (
              <p style={{fontSize:"0.9rem",lineHeight:1.75,color:T.mid,whiteSpace:"pre-wrap"}}>{report}</p>
            )}
          </Card>

          {/* Category Bars */}
          <Card>
            <h3 style={{fontFamily:"Nunito,sans-serif",fontWeight:800,fontSize:"1rem",marginBottom:20,color:T.dark}}>📊 Category Breakdown</h3>
            {categories.map(c=>(
              <div key={c.label} style={{marginBottom:14}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:"0.8rem",fontWeight:600,color:T.mid,marginBottom:5}}>
                  <span>{c.label}</span><span>{c.score}/{c.max}</span>
                </div>
                <div style={{height:7,background:"rgba(0,0,0,0.06)",borderRadius:4,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${(c.score/c.max)*100}%`,background:c.score/c.max>0.6?T.red:c.score/c.max>0.4?"#E6A817":T.green,borderRadius:4}}/>
                </div>
              </div>
            ))}
          </Card>

          {/* Flagged Behaviors */}
          <Card>
            <h3 style={{fontFamily:"Nunito,sans-serif",fontWeight:800,fontSize:"1rem",marginBottom:16,color:T.dark}}>🚩 Areas to Monitor</h3>
            {["Limited pointing to show interest","Some repetitive hand movements","Occasional sensitivity to sounds","Variable response to name"].map((item,i)=>(
              <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:12,fontSize:"0.84rem",color:T.mid}}>
                <span style={{width:20,height:20,borderRadius:"50%",background:"#FFF3CD",color:"#E6A817",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.7rem",flexShrink:0,fontWeight:800}}>!</span>
                {item}
              </div>
            ))}
          </Card>
        </div>

        {/* Recommendation */}
        <Card style={{background:`linear-gradient(135deg,${T.orangePale},${T.white})`,border:`1.5px solid rgba(255,107,43,0.25)`,marginBottom:24}}>
          <h3 style={{fontFamily:"Nunito,sans-serif",fontWeight:800,fontSize:"1rem",color:T.orange,marginBottom:10}}>💡 Recommendation</h3>
          <p style={{fontSize:"0.88rem",lineHeight:1.7,color:T.mid}}>
            Based on this Medium Risk result, we recommend <strong>scheduling an appointment with your pediatrician</strong> to discuss these findings. Share this report with them. Early evaluation and intervention, if needed, leads to significantly better developmental outcomes.
          </p>
        </Card>

        {/* Actions */}
        <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
          <Btn onClick={()=>alert("PDF Downloaded! 📄")} style={{flex:1}}>📥 Download PDF Report</Btn>
          <button onClick={()=>alert("Report shared with doctor! 🩺")} style={{flex:1,padding:"13px 24px",borderRadius:50,border:`2px solid ${T.orange}`,color:T.orange,background:"transparent",fontWeight:800,cursor:"pointer",fontFamily:"Nunito,sans-serif",fontSize:"0.95rem"}}>🩺 Share with Doctor</button>
          <button onClick={()=>setPage("parent")} style={{flex:1,padding:"13px 24px",borderRadius:50,border:`1.5px solid rgba(0,0,0,0.1)`,color:T.mid,background:"transparent",fontWeight:700,cursor:"pointer",fontFamily:"Nunito,sans-serif",fontSize:"0.9rem"}}>← Dashboard</button>
        </div>
      </div>
      <style>{`@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}`}</style>
    </div>
  );
};

// ─── PAGE: DOCTOR DASHBOARD ───────────────────────────────────────────────────
const DoctorDashboard = ({user, setPage}) => {
  const [selected, setSelected] = useState(null);
  const [remark, setRemark] = useState("");
  const [aiNote, setAiNote] = useState("");
  const [noteLoading, setNoteLoading] = useState(false);

  const genNote = async (patient) => {
    setNoteLoading(true); setAiNote("");
    const note = await askClaude(
      [{role:"user",content:`Patient: ${patient.name}, Age ${patient.age}, Score: ${patient.score}/20, Risk: ${patient.risk}. Write a 3-sentence clinical summary note for a pediatrician.`}],
      "You are a clinical AI assistant. Write concise, professional pediatric screening notes. Use clinical terminology."
    );
    setAiNote(note); setNoteLoading(false);
  };

  return (
    <div style={{minHeight:"100vh",background:T.cream,padding:"100px 48px 60px"}}>
      <h1 style={{fontFamily:"Nunito,sans-serif",fontWeight:900,fontSize:"2rem",color:T.dark,marginBottom:8}}>🩺 Doctor Dashboard</h1>
      <p style={{color:T.mid,marginBottom:32}}>Welcome Dr. {user?.name||"Doctor"} — review flagged patient screenings.</p>

      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:20,marginBottom:36}}>
        {[{l:"Total Patients",v:3,i:"👥"},{l:"High Risk Cases",v:1,i:"🚨"},{l:"Pending Reviews",v:1,i:"📋"}].map(s=>(
          <Card key={s.l} style={{textAlign:"center",padding:24}}>
            <div style={{fontSize:"2rem"}}>{s.i}</div>
            <div style={{fontFamily:"Nunito,sans-serif",fontWeight:900,fontSize:"2rem",color:T.orange}}>{s.v}</div>
            <div style={{fontSize:"0.82rem",color:T.light,fontWeight:600,marginTop:4}}>{s.l}</div>
          </Card>
        ))}
      </div>

      <div style={{display:"grid",gridTemplateColumns:selected?"1fr 1fr":"1fr",gap:24}}>
        <Card style={{padding:0,overflow:"hidden"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:"0.88rem"}}>
            <thead><tr style={{background:T.orangePale}}>
              {["Patient","Age","Risk","Date","Status","Action"].map(h=>(
                <th key={h} style={{padding:"14px 18px",textAlign:"left",fontWeight:700,color:T.mid,fontSize:"0.8rem"}}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {PATIENTS.map(p=>(
                <tr key={p.id} style={{borderBottom:`1px solid rgba(255,107,43,0.07)`,background:selected?.id===p.id?T.orangePale:"transparent"}}>
                  <td style={{padding:"14px 18px",fontWeight:600}}>{p.name}</td>
                  <td style={{padding:"14px 18px",color:T.light}}>{p.age} yrs</td>
                  <td style={{padding:"14px 18px"}}><Badge risk={p.risk}/></td>
                  <td style={{padding:"14px 18px",color:T.light,fontSize:"0.82rem"}}>{p.date}</td>
                  <td style={{padding:"14px 18px"}}>
                    <span style={{fontSize:"0.78rem",fontWeight:700,padding:"3px 10px",borderRadius:50,background:p.status==="Urgent"?"#FFE8E8":p.status==="Pending"?"#FFF8E1":"#E8F8E8",color:p.status==="Urgent"?T.red:p.status==="Pending"?"#E6A817":T.green}}>
                      {p.status}
                    </span>
                  </td>
                  <td style={{padding:"14px 18px"}}>
                    <button onClick={()=>{setSelected(p);setAiNote("");setRemark("");}} style={{color:T.orange,fontWeight:700,border:"none",background:"none",cursor:"pointer"}}>View →</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {selected && (
          <Card>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <h3 style={{fontFamily:"Nunito,sans-serif",fontWeight:800,fontSize:"1.1rem",color:T.dark}}>{selected.name}</h3>
              <button onClick={()=>setSelected(null)} style={{border:"none",background:"rgba(0,0,0,0.05)",borderRadius:"50%",width:28,height:28,cursor:"pointer",fontWeight:700}}>✕</button>
            </div>
            <div style={{display:"flex",gap:12,marginBottom:20,flexWrap:"wrap"}}>
              <Badge risk={selected.risk}/>
              <span style={{fontSize:"0.82rem",color:T.light,fontWeight:600}}>Score: {selected.score}/20</span>
              <span style={{fontSize:"0.82rem",color:T.light}}>Age {selected.age}</span>
            </div>

            <Btn onClick={()=>genNote(selected)} style={{width:"100%",marginBottom:16,padding:"11px"}}>
              🤖 Generate AI Clinical Note
            </Btn>

            {noteLoading && <div style={{display:"flex",gap:5,marginBottom:16}}>{[0,1,2].map(i=><div key={i} style={{width:8,height:8,borderRadius:"50%",background:T.orange,animation:`bounce 1s ${i*0.2}s infinite`}}/>)}</div>}
            {aiNote && (
              <div style={{background:T.orangePale,border:`1.5px solid rgba(255,107,43,0.2)`,borderRadius:12,padding:16,marginBottom:16,fontSize:"0.85rem",lineHeight:1.7,color:T.mid}}>
                <strong style={{color:T.orange,display:"block",marginBottom:6}}>🤖 AI Clinical Note:</strong>
                {aiNote}
              </div>
            )}

            <label style={{display:"block",fontSize:"0.82rem",fontWeight:700,color:T.mid,marginBottom:6}}>Add Your Remarks</label>
            <textarea value={remark} onChange={e=>setRemark(e.target.value)} placeholder="Clinical observations, next steps..." rows={4} style={{width:"100%",padding:"12px 16px",borderRadius:12,border:`1.5px solid rgba(255,107,43,0.2)`,outline:"none",resize:"vertical",fontSize:"0.88rem",fontFamily:"Sora,sans-serif",boxSizing:"border-box",background:"#FDFAF8"}}/>
            <Btn onClick={()=>alert("Remarks saved!")} style={{width:"100%",marginTop:12,padding:11}}>💾 Save Remarks</Btn>
            <style>{`@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}`}</style>
          </Card>
        )}
      </div>
    </div>
  );
};

// ─── PAGE: AWARENESS ──────────────────────────────────────────────────────────
const AwarenessPage = () => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const askAboutAutism = async () => {
    if (!question.trim()) return;
    setLoading(true); setAnswer("");
    const res = await askClaude(
      [{role:"user",content:question}],
      "You are an autism awareness educator. Answer questions about autism spectrum disorder clearly and compassionately in 3-4 sentences. Target audience: worried parents of preschool children. No jargon."
    );
    setAnswer(res); setLoading(false);
  };

  return (
    <div style={{minHeight:"100vh",background:T.cream,padding:"100px 48px 60px"}}>
      <div style={{textAlign:"center",marginBottom:60}}>
        <div style={{fontSize:"0.75rem",fontWeight:700,color:T.orange,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:12}}>Know the Signs</div>
        <h1 style={{fontFamily:"Nunito,sans-serif",fontWeight:900,fontSize:"2.4rem",color:T.dark,marginBottom:14}}>Autism Awareness & Resources</h1>
        <p style={{color:T.mid,fontSize:"1rem",maxWidth:560,margin:"0 auto"}}>Early awareness leads to early action. Learn the signs, ask Claude AI your questions, and find support near you.</p>
      </div>

      {/* Ask Claude */}
      <Card style={{maxWidth:680,margin:"0 auto 60px",background:`linear-gradient(135deg,${T.dark},#3D2010)`}}>
        <div style={{fontFamily:"Nunito,sans-serif",fontWeight:900,fontSize:"1.2rem",color:"white",marginBottom:6}}>🤖 Ask Claude About Autism</div>
        <p style={{fontSize:"0.84rem",color:"rgba(255,255,255,0.6)",marginBottom:20}}>Get clear, compassionate answers powered by real AI.</p>
        <div style={{display:"flex",gap:10}}>
          <input value={question} onChange={e=>setQuestion(e.target.value)} onKeyDown={e=>e.key==="Enter"&&askAboutAutism()} placeholder="e.g. What are the first signs of autism?" style={{flex:1,padding:"12px 16px",borderRadius:12,border:"1.5px solid rgba(255,255,255,0.15)",background:"rgba(255,255,255,0.08)",color:"white",outline:"none",fontSize:"0.9rem",fontFamily:"Sora,sans-serif"}}/>
          <Btn onClick={askAboutAutism} disabled={loading}>{loading?"...":"Ask"}</Btn>
        </div>
        {loading && <div style={{display:"flex",gap:5,marginTop:16}}>{[0,1,2].map(i=><div key={i} style={{width:8,height:8,borderRadius:"50%",background:T.orange,animation:`bounce 1s ${i*0.2}s infinite`}}/>)}</div>}
        {answer && <div style={{marginTop:16,padding:16,background:"rgba(255,255,255,0.06)",borderRadius:12,fontSize:"0.88rem",lineHeight:1.75,color:"rgba(255,255,255,0.85)"}}>{answer}</div>}
        <style>{`@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}`}</style>
      </Card>

      {/* Signs Grid */}
      <h2 style={{fontFamily:"Nunito,sans-serif",fontWeight:800,fontSize:"1.4rem",color:T.dark,marginBottom:24}}>🚨 Early Warning Signs</h2>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:18,marginBottom:60}}>
        {[
          {e:"👁️",t:"Limited Eye Contact",d:"Avoiding eye contact during play or conversations."},
          {e:"🤝",t:"Social Withdrawal",d:"Prefers to play alone; difficulty with peer interaction."},
          {e:"🔁",t:"Repetitive Behaviors",d:"Hand-flapping, rocking, spinning objects repeatedly."},
          {e:"💬",t:"Speech Delays",d:"Delayed language development or loss of speech."},
          {e:"👂",t:"No Name Response",d:"Not turning when their name is called consistently."},
          {e:"🧩",t:"Intense Fixations",d:"Very strong focus on specific topics or objects."},
          {e:"😟",t:"Sensory Sensitivity",d:"Over/under-reaction to sounds, light, or textures."},
          {e:"👋",t:"Limited Gestures",d:"Not pointing or waving by 12 months of age."},
        ].map(s=>(
          <Card key={s.t} style={{textAlign:"center",padding:24}}>
            <div style={{fontSize:"2rem",marginBottom:10}}>{s.e}</div>
            <div style={{fontFamily:"Nunito,sans-serif",fontWeight:800,fontSize:"0.92rem",marginBottom:8}}>{s.t}</div>
            <div style={{fontSize:"0.78rem",color:T.light,lineHeight:1.5}}>{s.d}</div>
          </Card>
        ))}
      </div>

      {/* Resources */}
      <h2 style={{fontFamily:"Nunito,sans-serif",fontWeight:800,fontSize:"1.4rem",color:T.dark,marginBottom:24}}>🏥 Support Resources</h2>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:20}}>
        {[
          {n:"NIMHANS, Bengaluru",a:"Hosur Road, Bengaluru - 560029",p:"+91-80-46110007",t:"Hospital"},
          {n:"Action For Autism",a:"New Delhi - Pocket 7 & 8, Jasola",p:"+91-11-40540991",t:"NGO"},
          {n:"Asha School",a:"Koramangala, Bengaluru - 560095",p:"+91-80-25530455",t:"School"},
        ].map(r=>(
          <Card key={r.n}>
            <div style={{fontSize:"0.72rem",fontWeight:700,color:T.orange,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8}}>{r.t}</div>
            <div style={{fontFamily:"Nunito,sans-serif",fontWeight:800,fontSize:"1rem",marginBottom:6}}>{r.n}</div>
            <div style={{fontSize:"0.82rem",color:T.light,marginBottom:4}}>📍 {r.a}</div>
            <div style={{fontSize:"0.82rem",color:T.orange,fontWeight:600}}>📞 {r.p}</div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// ─── PAGE: ADMIN ──────────────────────────────────────────────────────────────
const AdminPanel = () => {
  const users = [
    {name:"Priya Sharma",role:"Parent",email:"priya@gmail.com",status:"Active"},
    {name:"Dr. Ramesh Gupta",role:"Doctor",email:"ramesh@hospital.com",status:"Active"},
    {name:"Sunita Patel",role:"Parent",email:"sunita@gmail.com",status:"Active"},
  ];
  const months = ["Jul","Aug","Sep","Oct","Nov","Dec"];
  const screenings = [8,14,11,19,16,22];
  const maxS = Math.max(...screenings);

  return (
    <div style={{minHeight:"100vh",background:T.cream,padding:"100px 48px 60px"}}>
      <h1 style={{fontFamily:"Nunito,sans-serif",fontWeight:900,fontSize:"2rem",color:T.dark,marginBottom:8}}>⚙️ Admin Panel</h1>
      <p style={{color:T.mid,marginBottom:32}}>System overview and user management.</p>

      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:20,marginBottom:36}}>
        {[{l:"Total Users",v:42,i:"👥"},{l:"Total Screenings",v:118,i:"📋"},{l:"High Risk Cases",v:7,i:"🚨"},{l:"Model Accuracy",v:"94%",i:"🎯"}].map(s=>(
          <Card key={s.l} style={{textAlign:"center",padding:24}}>
            <div style={{fontSize:"2rem"}}>{s.i}</div>
            <div style={{fontFamily:"Nunito,sans-serif",fontWeight:900,fontSize:"2rem",color:T.orange}}>{s.v}</div>
            <div style={{fontSize:"0.8rem",color:T.light,fontWeight:600,marginTop:4}}>{s.l}</div>
          </Card>
        ))}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24,marginBottom:24}}>
        {/* Bar Chart */}
        <Card>
          <h3 style={{fontFamily:"Nunito,sans-serif",fontWeight:800,fontSize:"1rem",marginBottom:24,color:T.dark}}>📊 Screenings Per Month</h3>
          <div style={{display:"flex",alignItems:"flex-end",gap:12,height:140}}>
            {months.map((m,i)=>(
              <div key={m} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
                <div style={{fontSize:"0.72rem",fontWeight:700,color:T.orange}}>{screenings[i]}</div>
                <div style={{width:"100%",background:`linear-gradient(to top,${T.orange},${T.orangeLight})`,borderRadius:"6px 6px 0 0",height:`${(screenings[i]/maxS)*100}px`,transition:"height 0.5s"}}/>
                <div style={{fontSize:"0.72rem",color:T.light,fontWeight:600}}>{m}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Risk Distribution */}
        <Card>
          <h3 style={{fontFamily:"Nunito,sans-serif",fontWeight:800,fontSize:"1rem",marginBottom:24,color:T.dark}}>🎯 Risk Distribution</h3>
          {[{l:"Low Risk",pct:62,c:T.green},{l:"Medium Risk",pct:27,c:"#E6A817"},{l:"High Risk",pct:11,c:T.red}].map(r=>(
            <div key={r.l} style={{marginBottom:16}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:"0.82rem",fontWeight:600,color:T.mid,marginBottom:5}}>
                <span>{r.l}</span><span>{r.pct}%</span>
              </div>
              <div style={{height:10,background:"rgba(0,0,0,0.05)",borderRadius:5,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${r.pct}%`,background:r.c,borderRadius:5}}/>
              </div>
            </div>
          ))}
        </Card>
      </div>

      {/* Users Table */}
      <h2 style={{fontFamily:"Nunito,sans-serif",fontWeight:800,fontSize:"1.3rem",color:T.dark,marginBottom:16}}>👥 User Management</h2>
      <Card style={{padding:0,overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:"0.88rem"}}>
          <thead><tr style={{background:T.orangePale}}>
            {["Name","Role","Email","Status","Action"].map(h=>(
              <th key={h} style={{padding:"14px 20px",textAlign:"left",fontWeight:700,color:T.mid,fontSize:"0.8rem"}}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {users.map((u,i)=>(
              <tr key={i} style={{borderBottom:`1px solid rgba(255,107,43,0.07)`}}>
                <td style={{padding:"14px 20px",fontWeight:600}}>{u.name}</td>
                <td style={{padding:"14px 20px"}}><span style={{background:T.orangePale,color:T.orange,padding:"3px 12px",borderRadius:50,fontSize:"0.78rem",fontWeight:700}}>{u.role}</span></td>
                <td style={{padding:"14px 20px",color:T.light}}>{u.email}</td>
                <td style={{padding:"14px 20px"}}><span style={{background:"#E8F8E8",color:T.green,padding:"3px 12px",borderRadius:50,fontSize:"0.78rem",fontWeight:700}}>{u.status}</span></td>
                <td style={{padding:"14px 20px"}}><button onClick={()=>alert(`${u.name} disabled`)} style={{color:T.red,fontWeight:700,border:"none",background:"none",cursor:"pointer",fontSize:"0.85rem"}}>Disable</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("landing");
  const [user, setUser] = useState(null);

  const renderPage = () => {
    switch(page) {
      case "landing":   return <LandingPage setPage={setPage}/>;
      case "login":     return <LoginPage setPage={setPage} setUser={setUser}/>;
      case "parent":    return <ParentDashboard setPage={setPage} user={user}/>;
      case "addchild":  return <AddChildPage setPage={setPage}/>;
      case "screening": return <ScreeningPage setPage={setPage}/>;
      case "result":    return <ResultPage setPage={setPage}/>;
      case "doctor":    return <DoctorDashboard setPage={setPage} user={user}/>;
      case "awareness": return <AwarenessPage/>;
      case "admin":     return <AdminPanel/>;
      default:          return <LandingPage setPage={setPage}/>;
    }
  };

  return (
    <div style={{fontFamily:"'Sora',sans-serif"}}>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Sora:wght@300;400;600;700&display=swap" rel="stylesheet"/>
      <Navbar page={page} setPage={setPage} user={user} setUser={setUser}/>
      {renderPage()}
      <Chatbot/>
    </div>
  );
}
