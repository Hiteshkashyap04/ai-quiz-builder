"use client";

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { clientRequest } from '@/lib/clientFetch';

const TOPIC_SUGGESTIONS = [
  'React hooks', 'World History', 'Climate Science',
  'Python basics', 'Ancient Rome', 'Space exploration',
  'Machine Learning', 'Human Anatomy', 'The French Revolution',
];

const STEPS = { idle: null, generating: 'Generating questions…', saving: 'Saving quiz…', done: 'Done!' };

export default function GenerateQuizPage() {
  const router = useRouter();
  const { status } = useSession();
  const [topic, setTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [step, setStep] = useState('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login');
  }, [router, status]);

  const loading = step === 'generating' || step === 'saving';

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStep('generating');
    setError('');

    try {
      const generated = await clientRequest('/api/generate', {
        method: 'POST',
        body: { topic, num_questions: numQuestions },
      });

      if (!generated?.ok || !generated?.data) {
        throw new Error('AI returned an unexpected payload. Please try again.');
      }

      setStep('saving');

      await clientRequest('/api/quizzes', {
        method: 'POST',
        body: {
          title: topic,
          description: `A ${numQuestions}-question quiz about ${topic}.`,
          content: JSON.stringify(generated.data),
        },
      });

      setStep('done');
      setTimeout(() => router.push('/'), 600);
    } catch (err) {
      setError(err.message || 'Could not generate the quiz. Please try again.');
      setStep('idle');
    }
  };

  const stepUp   = () => setNumQuestions((n) => Math.min(n + 1, 20));
  const stepDown = () => setNumQuestions((n) => Math.max(n - 1, 1));

  return (
    <section className="surface" style={{ maxWidth: 680, margin: '0 auto' }}>
      <div className="section-header" style={{ marginBottom: 24 }}>
        <div>
          <h1 className="section-title">Generate a quiz</h1>
          <p className="section-subtitle">Name a topic and the AI will write your questions.</p>
        </div>
      </div>

      <form className="form-grid" onSubmit={handleSubmit}>
        {/* Topic */}
        <div className="field">
          <label htmlFor="topic" className="field-label">Topic</label>
          <input
            id="topic"
            className="input"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. React hooks, Ancient Rome, Climate Science…"
            required
            disabled={loading}
          />
          {/* Quick suggestions */}
          <div className="suggestions" style={{ marginTop: 4 }}>
            {TOPIC_SUGGESTIONS.filter((s) => s.toLowerCase() !== topic.toLowerCase()).slice(0, 6).map((s) => (
              <button
                key={s}
                type="button"
                className="suggestion-chip"
                onClick={() => setTopic(s)}
                disabled={loading}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Question count */}
        <div className="field">
          <label className="field-label">Number of questions</label>
          <div className="number-input-row">
            <div className="count-stepper">
              <button type="button" className="step-btn" onClick={stepDown} disabled={numQuestions <= 1 || loading}>−</button>
              <button type="button" className="step-btn" onClick={stepUp}   disabled={numQuestions >= 20 || loading}>+</button>
            </div>
            <input
              className="input"
              type="number"
              min="1"
              max="20"
              value={numQuestions}
              onChange={(e) => setNumQuestions(Math.min(20, Math.max(1, Number(e.target.value))))}
              disabled={loading}
              style={{ width: 80, textAlign: 'center' }}
            />
            <span className="muted" style={{ fontSize: '0.88rem' }}>
              {numQuestions === 1 ? '1 question' : `${numQuestions} questions`}
            </span>
          </div>
        </div>

        {error ? <div className="alert">{error}</div> : null}

        <button type="submit" className="button button-primary button-lg" disabled={loading || !topic.trim()}>
          {loading ? (
            <>
              <span className="spinner" />
              {STEPS[step]}
            </>
          ) : (
            'Generate and save'
          )}
        </button>
      </form>
    </section>
  );
}
