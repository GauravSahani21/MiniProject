import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageWrapper, Card, Btn, Select } from '../components/UI';
import { CHILDREN, MCHAT_QUESTIONS } from '../data/dummyData';

export default function ScreeningPage() {
  const { childId } = useParams();
  const navigate = useNavigate();

  const [step, setStep] = useState(0); // 0 = pre, 1-5 = questions, 6 = analyzing
  const [selectedChild, setSelectedChild] = useState(childId ? parseInt(childId) : (CHILDREN[0]?.id || ''));
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    if (step === 6) {
      setTimeout(() => navigate('/result'), 1500);
    }
  }, [step, navigate]);

  const handleAnswer = (qId, val) => setAnswers({ ...answers, [qId]: val });

  const currentQuestions = MCHAT_QUESTIONS.filter(q => q.step === step - 1);
  const allAnswered = currentQuestions.every(q => answers[q.id] !== undefined);

  if (step === 0) {
    return (
      <PageWrapper style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <Card className="animate-fadeInUp" style={{ maxWidth: 500, width: '100%', padding: '36px 32px' }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>📝</div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.4rem', color: 'var(--dark)' }}>M-CHAT Screening</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: 4 }}>Answer 20 questions to assess your child's development.</p>
          </div>
          
          <Select label="Select Child" value={selectedChild} onChange={e => setSelectedChild(e.target.value)}>
            {CHILDREN.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
          
          <div style={{ background: 'var(--orange-pale)', padding: 16, borderRadius: 'var(--radius-sm)', marginTop: 24, fontSize: '0.85rem', color: 'var(--dark)', border: '1px solid var(--border)' }}>
            <strong>Before you start:</strong>
            <ul style={{ paddingLeft: 20, marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <li>Answer based on how your child <em>usually</em> behaves.</li>
              <li>If the behaviour is rare, answer "No".</li>
              <li>This test takes about 5 minutes.</li>
            </ul>
          </div>
          
          <Btn size="lg" style={{ width: '100%', marginTop: 28 }} onClick={() => setStep(1)} disabled={!selectedChild}>
            Begin Screening
          </Btn>
        </Card>
      </PageWrapper>
    );
  }

  if (step === 6) {
    return (
      <PageWrapper style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div className="animate-spin" style={{ width: 48, height: 48, border: '4px solid var(--orange-pale)', borderTopColor: 'var(--orange)', borderRadius: '50%', marginBottom: 20 }} />
          <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.2rem' }}>Analyzing with AI...</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--muted)', marginTop: 8 }}>Scoring responses against clinical markers.</p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper style={{ padding: '40px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: '100%', maxWidth: 640 }}>
        {/* Progress header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.2rem' }}>Step {step} of 5</h2>
            <div style={{ display: 'flex', gap: 8 }}>
              {[1,2,3,4,5].map(s => (
                <div key={s} style={{ position: 'relative', width: 10, height: 10 }}>
                  <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: s < step ? 'var(--orange)' : s === step ? 'var(--orange)' : 'var(--border)' }} />
                  {s === step && <div style={{ position: 'absolute', inset: -4, borderRadius: '50%', border: '2px solid var(--orange)', animation: 'pulse-dot 1.5s infinite' }} />}
                </div>
              ))}
            </div>
          </div>
          <div style={{ height: 6, background: 'var(--orange-pale)', borderRadius: 3 }}>
            <div style={{ width: `${(step / 5) * 100}%`, height: '100%', background: 'var(--orange)', borderRadius: 3, transition: 'width 0.3s ease' }} />
          </div>
        </div>

        {/* Questions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minHeight: 440 }}>
          {currentQuestions.map((q, i) => (
            <Card key={q.id} className={`animate-slideRight delay-${i+1}`} style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ fontSize: '1.8rem' }}>{q.emoji}</div>
              <div style={{ flex: 1, fontSize: '0.95rem', fontWeight: 600 }}>{q.text}</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => handleAnswer(q.id, 'yes')}
                  style={{
                    padding: '8px 24px', borderRadius: 'var(--radius-full)', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                    background: answers[q.id] === 'yes' ? 'var(--green)' : 'var(--cream)',
                    color: answers[q.id] === 'yes' ? 'white' : 'var(--dark)',
                    border: `1.5px solid ${answers[q.id] === 'yes' ? 'var(--green)' : 'var(--border)'}`,
                  }}
                >Yes</button>
                <button
                  onClick={() => handleAnswer(q.id, 'no')}
                  style={{
                    padding: '8px 24px', borderRadius: 'var(--radius-full)', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                    background: answers[q.id] === 'no' ? 'var(--red)' : 'var(--cream)',
                    color: answers[q.id] === 'no' ? 'white' : 'var(--dark)',
                    border: `1.5px solid ${answers[q.id] === 'no' ? 'var(--red)' : 'var(--border)'}`,
                  }}
                >No</button>
              </div>
            </Card>
          ))}
        </div>

        {/* Nav */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32 }}>
          <Btn variant="outline" onClick={() => setStep(s => s - 1)}>← Back</Btn>
          <Btn onClick={() => setStep(s => s + 1)} disabled={!allAnswered}>
            {step === 5 ? 'Submit & Analyze' : 'Next →'}
          </Btn>
        </div>
      </div>
    </PageWrapper>
  );
}
