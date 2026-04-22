// ============================================================
//  AutiSense — All Dummy / Hardcoded Data
// ============================================================

/* ── Children ─────────────────────────────────────── */
export const CHILDREN = [
  {
    id: 1,
    name: 'Arjun Sharma',
    age: 3,
    gender: 'Boy',
    dob: '2021-04-10',
    guardian: 'Priya Sharma',
    avatar: '👦',
    lastScreen: '2024-10-12',
    risk: 'Low',
    score: 4,
    total: 20,
  },
  {
    id: 2,
    name: 'Meera Patel',
    age: 4,
    gender: 'Girl',
    dob: '2020-08-22',
    guardian: 'Sunita Patel',
    avatar: '👧',
    lastScreen: '2024-09-28',
    risk: 'Medium',
    score: 11,
    total: 20,
  },
];

/* ── Screening History ────────────────────────────── */
export const SCREENING_HISTORY = [
  { id: 1, childId: 1, child: 'Arjun Sharma',  date: '2024-10-12', score: 4,  total: 20, risk: 'Low',    status: 'Completed' },
  { id: 2, childId: 2, child: 'Meera Patel',   date: '2024-09-28', score: 11, total: 20, risk: 'Medium', status: 'Completed' },
  { id: 3, childId: 1, child: 'Arjun Sharma',  date: '2024-08-15', score: 3,  total: 20, risk: 'Low',    status: 'Completed' },
  { id: 4, childId: 2, child: 'Meera Patel',   date: '2024-07-10', score: 9,  total: 20, risk: 'Medium', status: 'Completed' },
  { id: 5, childId: 1, child: 'Arjun Sharma',  date: '2024-06-05', score: 5,  total: 20, risk: 'Low',    status: 'Completed' },
];

/* ── M-CHAT Questions (20) ────────────────────────── */
// riskIfNo: true  → child NOT doing this is a concern (typical behaviour expected)
// riskIfNo: false → child DOING this is a concern    (atypical behaviour flagged)
export const MCHAT_QUESTIONS = [
  // ── Step 1: Social Cues ──────────────────────────
  { id: 1,  step: 0, text: 'Does your child look at you when you call his/her name?',               emoji: '👁️',  riskIfNo: true  },
  { id: 2,  step: 0, text: 'Does your child make eye contact with familiar people?',                emoji: '👀',  riskIfNo: true  },
  { id: 3,  step: 0, text: 'Does your child point to show you something interesting?',              emoji: '👆',  riskIfNo: true  },
  { id: 4,  step: 0, text: 'Does your child smile back when you smile at them?',                    emoji: '😊',  riskIfNo: true  },
  // ── Step 2: Communication ────────────────────────
  { id: 5,  step: 1, text: 'Does your child use words to communicate (or babble before 12 mo)?',   emoji: '💬',  riskIfNo: true  },
  { id: 6,  step: 1, text: 'Does your child follow when you point at something across the room?',  emoji: '🔭',  riskIfNo: true  },
  { id: 7,  step: 1, text: 'Does your child bring objects to show you things?',                     emoji: '🎁',  riskIfNo: true  },
  { id: 8,  step: 1, text: 'Does your child respond to simple instructions (e.g. "Come here")?',  emoji: '🙋',  riskIfNo: true  },
  // ── Step 3: Behaviour ────────────────────────────
  { id: 9,  step: 2, text: 'Does your child engage in pretend or make-believe play?',              emoji: '🎭',  riskIfNo: true  },
  { id: 10, step: 2, text: 'Does your child show interest in playing with other children?',        emoji: '👫',  riskIfNo: true  },
  { id: 11, step: 2, text: 'Does your child show repetitive hand or arm movements (flapping)?',    emoji: '🔁',  riskIfNo: false },
  { id: 12, step: 2, text: 'Does your child spin objects or spin themselves repeatedly?',           emoji: '🌀',  riskIfNo: false },
  // ── Step 4: Sensory ──────────────────────────────
  { id: 13, step: 3, text: 'Does your child seem sensitive to loud sounds or bright lights?',      emoji: '👂',  riskIfNo: false },
  { id: 14, step: 3, text: 'Does your child walk on tiptoes more often than on flat feet?',        emoji: '🦶',  riskIfNo: false },
  { id: 15, step: 3, text: 'Does your child avoid physical contact like hugging?',                 emoji: '🤚',  riskIfNo: false },
  { id: 16, step: 3, text: 'Does your child have unusual reactions to textures (food/clothing)?',  emoji: '✋',  riskIfNo: false },
  // ── Step 5: Routine & Play ───────────────────────
  { id: 17, step: 4, text: 'Does your child get very upset by small changes in daily routine?',    emoji: '😟',  riskIfNo: false },
  { id: 18, step: 4, text: 'Does your child line up toys or objects in rigid patterns?',           emoji: '🧱',  riskIfNo: false },
  { id: 19, step: 4, text: 'Does your child seem to be "in his/her own world" often?',             emoji: '🌍',  riskIfNo: false },
  { id: 20, step: 4, text: 'Does your child respond when you try to play with them?',              emoji: '🤝',  riskIfNo: true  },
];

/* ── Doctor Patients ──────────────────────────────── */
export const PATIENTS = [
  { id: 1, name: 'Arjun Sharma', age: 3, risk: 'Low',    date: '2024-10-12', status: 'Reviewed', score: 4,  total: 20, remarks: 'Child shows normal developmental milestones. No immediate concerns.' },
  { id: 2, name: 'Meera Patel',  age: 4, risk: 'Medium', date: '2024-09-28', status: 'Pending',  score: 11, total: 20, remarks: '' },
  { id: 3, name: 'Rohan Das',    age: 5, risk: 'High',   date: '2024-10-01', status: 'Urgent',   score: 17, total: 20, remarks: '' },
  { id: 4, name: 'Anaya Singh',  age: 3, risk: 'Low',    date: '2024-10-18', status: 'Reviewed', score: 3,  total: 20, remarks: 'Routine follow-up in 6 months recommended.' },
];

/* ── Admin Users ──────────────────────────────────── */
export const ADMIN_USERS = [
  { id: 1, name: 'Priya Sharma',      role: 'Parent', email: 'priya@gmail.com',      joined: 'Jan 2024', status: 'Active',   screenings: 5 },
  { id: 2, name: 'Dr. Ramesh Gupta',  role: 'Doctor', email: 'ramesh@hospital.com',  joined: 'Feb 2024', status: 'Active',   screenings: 0 },
  { id: 3, name: 'Sunita Patel',      role: 'Parent', email: 'sunita@gmail.com',     joined: 'Mar 2024', status: 'Active',   screenings: 2 },
  { id: 4, name: 'Dr. Anjali Rao',    role: 'Doctor', email: 'anjali@clinic.in',     joined: 'Jan 2024', status: 'Disabled', screenings: 0 },
  { id: 5, name: 'Admin User',        role: 'Admin',  email: 'admin@autisense.ai',   joined: 'Jan 2024', status: 'Active',   screenings: 0 },
];

/* ── Monthly Screening Data (for admin chart) ─────── */
export const MONTHLY_DATA = [
  { month: 'Jul', count: 8  },
  { month: 'Aug', count: 14 },
  { month: 'Sep', count: 11 },
  { month: 'Oct', count: 19 },
  { month: 'Nov', count: 16 },
  { month: 'Dec', count: 22 },
];

/* ── Awareness Signs ──────────────────────────────── */
export const AWARENESS_SIGNS = [
  { emoji: '👁️', title: 'Limited Eye Contact',    description: 'Avoids eye contact during play or conversations with others.' },
  { emoji: '👆', title: 'No Pointing Gesture',     description: 'Does not point to share interest or to ask for things by 12 months.' },
  { emoji: '💬', title: 'Speech Delays',            description: 'Delayed language development or no single words by 16 months.' },
  { emoji: '🔁', title: 'Repetitive Movements',    description: 'Hand-flapping, rocking, spinning objects repeatedly for long periods.' },
  { emoji: '👂', title: 'Sensory Sensitivity',     description: 'Over or under-reacting to sounds, lights, textures, or pain.' },
  { emoji: '🤝', title: 'Social Withdrawal',        description: 'Prefers to play alone; difficulty engaging with peers or adults.' },
  { emoji: '😟', title: 'Rigid Routines',           description: 'Extreme distress when familiar routines or environments change.' },
  { emoji: '🙋', title: 'No Name Response',         description: 'Consistently not turning when their name is called by age 12 months.' },
];

/* ── Therapy Resources ────────────────────────────── */
export const RESOURCES = [
  {
    name: 'NIMHANS Autism Clinic',
    type: 'Government Hospital',
    address: 'Hosur Road, Bengaluru — 560029',
    phone: '+91-80-46110007',
    hours: 'Mon–Fri, 9am–5pm',
  },
  {
    name: 'Action For Autism',
    type: 'NGO / Resource Centre',
    address: 'Pocket 7 & 8, Jasola Vihar, New Delhi — 110025',
    phone: '+91-11-40540991',
    hours: 'Mon–Sat, 10am–6pm',
  },
  {
    name: 'Asha School for Special Children',
    type: 'Special Education',
    address: '5th Block, Koramangala, Bengaluru — 560095',
    phone: '+91-80-25530455',
    hours: 'Mon–Fri, 8am–4pm',
  },
];

/* ── Chatbot Q&A (keyword matching) ──────────────── */
export const CHATBOT_QA = [
  {
    keywords: ['sign', 'symptom', 'early', 'detect', 'notice', 'look for'],
    answer: 'Early signs of autism include limited eye contact, not responding to their name by 12 months, delayed speech, repetitive hand movements (like flapping), and difficulty with social interaction. Every child develops differently, so seeing multiple signs together is when to consult a doctor. 🧡',
  },
  {
    keywords: ['mchat', 'm-chat', 'screening', 'test', 'questionnaire', 'quiz'],
    answer: 'The M-CHAT (Modified Checklist for Autism in Toddlers) is a scientifically validated screening tool for children aged 16–30 months. It has 20 yes/no questions about your child\'s behaviour. A higher score suggests further evaluation may be needed — it does NOT diagnose autism. 📋',
  },
  {
    keywords: ['therapy', 'treatment', 'aba', 'speech', 'occupational', 'intervention'],
    answer: 'Common therapies include ABA (Applied Behavior Analysis), speech therapy, occupational therapy, and social skills training. There is no single cure, but early intervention — ideally before age 3 — leads to significantly better outcomes for most children. 💪',
  },
  {
    keywords: ['cause', 'why', 'reason', 'vaccine', 'genetic', 'origin'],
    answer: 'Autism is caused by a combination of genetic and environmental factors. Research consistently shows vaccines do NOT cause autism — that claim has been thoroughly debunked. It is a neurodevelopmental condition present from before birth, though signs often become visible as the child grows. 🔬',
  },
  {
    keywords: ['doctor', 'see', 'consult', 'pediatrician', 'when', 'should i'],
    answer: 'If your child is not meeting developmental milestones — no babbling by 12 months, no words by 16 months, losing previously learned skills — consult your pediatrician right away. Early action before age 3 makes the biggest difference. Don\'t wait and see! 🩺',
  },
  {
    keywords: ['age', 'how old', 'toddler', 'infant', 'baby', 'years'],
    answer: 'Autism can often be reliably identified as early as 18–24 months. The AutiSense screening is designed for children aged 2–6. If you have concerns about a younger infant, speak directly to your paediatrician for personalised guidance. 👶',
  },
  {
    keywords: ['diagnos', 'confirm', 'official', 'specialist', 'assessment'],
    answer: 'An official autism diagnosis requires evaluation by a developmental paediatrician, child psychologist, or psychiatrist. They use standardised tools like the ADOS-2 and ADI-R. AutiSense screening is a helpful first step, but only a licensed professional can diagnose. 🏥',
  },
  {
    keywords: ['school', 'education', 'learn', 'class', 'iep', 'support'],
    answer: 'Children with autism often thrive with the right support at school. Inclusive classrooms, special education teachers, and Individualised Education Plans (IEPs) can help. Many schools in India now have resource rooms and trained staff for children with special needs. 📚',
  },
];

/* ── Category Score Breakdown (for Result page) ──── */
export const CATEGORIES = [
  { label: 'Social Interaction', key: 'social',    max: 5 },
  { label: 'Communication',      key: 'comm',      max: 5 },
  { label: 'Behavior',           key: 'behavior',  max: 5 },
  { label: 'Sensory',            key: 'sensory',   max: 3 },
  { label: 'Routine & Play',     key: 'routine',   max: 2 },
];

/* ── Helper: risk level from score ───────────────── */
export function getRisk(score) {
  if (score <= 6)  return 'Low';
  if (score <= 13) return 'Medium';
  return 'High';
}

/* ── Helper: risk colour (CSS var string) ────────── */
export function riskColor(risk) {
  if (risk === 'Low')    return 'var(--green)';
  if (risk === 'Medium') return 'var(--amber)';
  return 'var(--red)';
}

export function riskBgColor(risk) {
  if (risk === 'Low')    return 'var(--green-pale)';
  if (risk === 'Medium') return 'var(--amber-pale)';
  return 'var(--red-pale)';
}

export function riskTextColor(risk) {
  if (risk === 'Low')    return '#166534';
  if (risk === 'Medium') return '#92400E';
  return '#991B1B';
}
