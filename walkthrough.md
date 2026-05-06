# AutiSense — Project Walkthrough

> **MCA Final Year Project** · AI-Based Early Autism Detection System for Preschool Children (Ages 2–6)
> **Stack:** React 18 + Vite + Tailwind CSS v4 + React Router v6 + Lucide React 

---

## 🚀 How to Run

```bash
cd autisense
npm install        # already done
npm run dev        # → http://localhost:5173
```

**Demo login credentials** (use any email + password):

| Role   | Dashboard route |
|--------|-----------------|
| Parent | `/parent`       |
| Doctor | `/doctor`       |
| Admin  | `/admin` (sidebar layout) |

---

## 📁 Project Structure

```
autisense/
├── index.html                   # SEO meta, Google Fonts preload
├── vite.config.js               # Vite + @tailwindcss/vite plugin
└── src/
    ├── main.jsx                 # React DOM entry point
    ├── App.jsx                  # BrowserRouter + AuthProvider + Layout
    ├── index.css                # Global CSS, animations, Tailwind base
    ├── context/
    │   └── AuthContext.jsx      # login/logout state (no backend)
    ├── data/
    │   └── dummyData.js         # ALL hardcoded dummy constants
    ├── components/
    │   ├── UI.jsx               # Card, Btn, Badge, Navbar, Table, Toast…
    │   └── Chatbot.jsx          # Floating chatbot (keyword Q&A)
    └── pages/
        ├── LandingPage.jsx      # Page 1
        ├── LoginPage.jsx        # Page 2
        ├── ParentDashboard.jsx  # Page 3
        ├── AddChildPage.jsx     # Page 4
        ├── ScreeningPage.jsx    # Page 5
        ├── ResultPage.jsx       # Page 6
        ├── DoctorDashboard.jsx  # Page 7
        ├── AwarenessPage.jsx    # Page 9
        ├── AdminPanel.jsx       # Page 10
        └── NotFoundPage.jsx     # 404
```

---

## 📄 All 10 Pages

| # | Page | Route | Access |
|---|------|--------|--------|
| 1 | Landing Page | `/` | Public |
| 2 | Login & Register | `/login` | Public |
| 3 | Parent Dashboard | `/parent` | Parent |
| 4 | Add Child Form | `/add-child` | Parent |
| 5 | Screening Questionnaire | `/screening` | Parent |
| 6 | Result / Report | `/result` | Parent |
| 7 | Doctor Dashboard | `/doctor` | Doctor |
| 8 | AI Chatbot Widget | Floating (all pages) | All |
| 9 | Awareness & Resources | `/awareness` | Public |
| 10 | Admin Panel | `/admin` | Admin |

---

## ✨ Feature Highlights

### 🔐 Auth & Routing
- `AuthContext` — `user`, `login()`, `logout()` available app-wide
- `Protected` route — unauthenticated → `/login`, wrong role → own dashboard
- React Router v6 with clean path-based navigation

### 📋 Screening (Page 5)
- 20 M-CHAT questions in **5 steps of 4** each
- Progress bar + animated step dots
- Yes/No with color feedback (green/red)
- "Next" locked until all questions on step are answered
- 1.2s fake "Analyzing…" spinner before navigating to results

### 📊 Results (Page 6)
- Auto-colored risk header: ✅ Low · ⚠️ Medium · 🔴 High
- Score bar with Low / Medium / High zones labeled
- 5-category breakdown bars (Social, Communication, Behavior, Sensory, Routine)
- Flagged concerns + strengths observed
- "What This Means" info card + 3-step recommendation
- Download PDF (dummy alert) + Share with Doctor (dummy alert)

### 🤖 AI Chatbot (Page 8)
- Floating orange FAB + green online dot
- Quick suggestion chips (first open)
- 6 keyword-matched Q&A pairs: signs, M-CHAT, therapy, causes, doctor, age
- Fake typing indicator (0.9–1.3s random delay)
- Slide-in panel animation

### ⚙️ Admin Panel (Page 10)
- Collapsible sidebar (collapses to icon-only)
- Monthly screenings bar chart (pure CSS)
- Risk distribution horizontal progress bars
- User management table with live Enable / Disable toggle

---

## 🎨 Design System

| Token | Value |
|-------|-------|
| Primary orange | `#FF6B2B` |
| Deep orange | `#E85520` |
| Dark text | `#1E1410` |
| Mid text | `#5C3D26` |
| Muted text | `#9A7A65` |
| Background | `#FFFAF5` (cream) |
| Heading font | Nunito (800/900) |
| Body font | Poppins (400/600) |
| Cards | `rounded-2xl`, `border border-orange-100` |
| Buttons | `rounded-full`, orange gradient shadow |
| Animations | `fadeInUp`, `slideIn`, `float`, `bounce-dot` |

---

## 📦 Dependencies

```json
{
  "react": "^18",
  "react-dom": "^18",
  "react-router-dom": "^6",
  "lucide-react": "latest",
  "tailwindcss": "^4 (via @tailwindcss/vite)"
}
```

> Build output: **322 kB JS · 48 kB CSS** · ✅ 0 errors
