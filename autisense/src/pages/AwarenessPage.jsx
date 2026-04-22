import React, { useState } from 'react';
import { PageWrapper, SectionHeading, Card, Btn } from '../components/UI';
import { AWARENESS_SIGNS, RESOURCES } from '../data/dummyData';

export default function AwarenessPage() {
  const [checkedItems, setCheckedItems] = useState(new Set());

  const handleCheck = (index) => {
    const next = new Set(checkedItems);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    setCheckedItems(next);
  };

  const CHECKLIST = [
    "Child doesn't respond to their name by 12 months.",
    "Child avoids making eye contact.",
    "Child doesn't point to objects to show interest by 14 months.",
    "Child doesn't play 'pretend' games by 18 months.",
    "Child repeats words or phrases over and over (echolalia).",
    "Child has delayed speech and language skills.",
    "Child gets upset by minor changes in routine.",
    "Child flaps their hands, rocks their body, or spins in circles."
  ];

  return (
    <PageWrapper style={{ padding: '0 0 60px' }}>
      
      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, var(--orange-pale) 0%, white 100%)', padding: '80px 24px', textAlign: 'center', borderBottom: '1px solid var(--border)' }}>
        <div className="container animate-fadeInUp">
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>🧩</div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '2.5rem', color: 'var(--dark)', marginBottom: 12 }}>
            Autism Awareness & Resources
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'var(--mid)', maxWidth: 600, margin: '0 auto', lineHeight: 1.6 }}>
            Early detection is key to better outcomes. Learn about the early signs of autism, use our quick checklist, and find support centres near you.
          </p>
        </div>
      </section>

      <div className="container" style={{ padding: '60px 24px' }}>
        
        {/* Early Signs */}
        <div style={{ marginBottom: 80 }}>
          <SectionHeading label="Learn" title="Early Signs of Autism" subtitle="Children develop at their own pace, but these are common indicators to watch for." center />
          <div className="grid-4">
            {AWARENESS_SIGNS.map((s, i) => (
              <Card key={i} className={`animate-fadeInUp delay-${(i % 4) + 1}`} style={{ padding: 24, transition: 'all 0.3s ease' }} 
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--orange)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div style={{ fontSize: '2.2rem', marginBottom: 12 }}>{s.emoji}</div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1rem', color: 'var(--dark)', marginBottom: 6 }}>{s.title}</h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--mid)', lineHeight: 1.6 }}>{s.description}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Checklist */}
        <div className="grid-2" style={{ marginBottom: 80, alignItems: 'center', gap: 40 }}>
          <div className="animate-slideRight">
            <SectionHeading label="Observe" title="Quick Awareness Checklist" subtitle="If you notice several of these behaviours in your child, it may be time to consult a paediatrician." />
            <div style={{ background: 'var(--orange)', color: 'white', padding: '6px 14px', borderRadius: 'var(--radius-full)', display: 'inline-block', fontSize: '0.8rem', fontWeight: 700, marginBottom: 24 }}>
              {checkedItems.size} of 8 signs observed
            </div>
            {checkedItems.size >= 4 && (
              <div className="animate-fadeIn" style={{ background: 'var(--red-pale)', color: '#991B1B', padding: '12px 16px', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', fontWeight: 600, marginBottom: 24, border: '1px solid var(--red)' }}>
                ⚠️ You've noted {checkedItems.size} signs. We highly recommend completing the full M-CHAT screening or consulting a doctor.
              </div>
            )}
            <Btn size="lg" onClick={() => window.location.href='/login'}>Start Full Screening</Btn>
          </div>
          
          <Card className="animate-slideLeft delay-2" style={{ padding: '32px 40px', background: 'white' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {CHECKLIST.map((text, i) => (
                <label key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer', padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: checkedItems.has(i) ? 'var(--orange-pale)' : 'transparent', transition: 'background 0.2s' }}>
                  <input type="checkbox" checked={checkedItems.has(i)} onChange={() => handleCheck(i)} style={{ accentColor: 'var(--orange)', width: 18, height: 18, marginTop: 2, cursor: 'pointer' }} />
                  <span style={{ fontSize: '0.9rem', color: checkedItems.has(i) ? 'var(--orange-deep)' : 'var(--dark)', fontWeight: checkedItems.has(i) ? 600 : 400, lineHeight: 1.5 }}>
                    {text}
                  </span>
                </label>
              ))}
            </div>
          </Card>
        </div>

        {/* Resources */}
        <div style={{ marginBottom: 80 }}>
          <SectionHeading label="Support" title="Therapy Centres in India" subtitle="Find professional support and early intervention centres." center />
          <div className="grid-3">
            {RESOURCES.map((r, i) => (
              <Card key={i} className={`animate-fadeInUp delay-${i+1}`} style={{ padding: 24, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'inline-block', background: 'var(--orange-pale)', color: 'var(--orange-deep)', padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: 12, alignSelf: 'flex-start' }}>
                  {r.type}
                </div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.1rem', color: 'var(--dark)', marginBottom: 12 }}>{r.name}</h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--mid)', marginBottom: 8, display: 'flex', gap: 8 }}><span>📍</span> {r.address}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--mid)', marginBottom: 8, display: 'flex', gap: 8 }}><span>📞</span> {r.phone}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--mid)', marginBottom: 20, display: 'flex', gap: 8 }}><span>🕒</span> {r.hours}</div>
                <Btn variant="outline" size="sm" style={{ marginTop: 'auto', width: '100%' }} onClick={() => alert(`Opening maps for ${r.name}...`)}>Get Directions</Btn>
              </Card>
            ))}
          </div>
        </div>

        {/* Useful Links */}
        <div>
          <SectionHeading label="Learn More" title="Useful Links" center />
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
            {['World Health Organization (WHO)', 'NIMHANS', 'Action For Autism', 'Autism Society of India'].map((l, i) => (
              <button key={i} style={{ padding: '12px 24px', background: 'var(--cream)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-full)', fontSize: '0.85rem', fontWeight: 700, color: 'var(--dark)', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'var(--font-body)' }}
                onMouseEnter={e => { e.target.style.background = 'var(--orange)'; e.target.style.color = 'white'; e.target.style.borderColor = 'var(--orange)'; }}
                onMouseLeave={e => { e.target.style.background = 'var(--cream)'; e.target.style.color = 'var(--dark)'; e.target.style.borderColor = 'var(--border)'; }}
              >{l}</button>
            ))}
          </div>
        </div>

      </div>
    </PageWrapper>
  );
}
