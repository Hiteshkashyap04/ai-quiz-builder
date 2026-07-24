"use client";

export const dynamic = 'force-dynamic';

import '@/lib/nextauth-env';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import QuizCard from '@/components/QuizCard';
import { clientRequest } from '@/lib/clientFetch';

function SkeletonCard() {
  return (
    <div className="card" style={{ gap: 14 }}>
      <div className="skeleton" style={{ height: 22, width: '60%' }} />
      <div className="skeleton" style={{ height: 16, width: '100%' }} />
      <div className="skeleton" style={{ height: 16, width: '80%' }} />
      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        <div className="skeleton" style={{ height: 34, width: 90, borderRadius: 999 }} />
        <div className="skeleton" style={{ height: 34, width: 70, borderRadius: 999 }} />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [quizzes, setQuizzes] = useState([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);
  const [quizError, setQuizError] = useState('');

  useEffect(() => {
    if (status !== 'authenticated') return;
    let active = true;

    async function load() {
      setLoadingQuizzes(true);
      setQuizError('');
      try {
        const data = await clientRequest('/api/quizzes');
        if (active) setQuizzes(Array.isArray(data) ? data : []);
      } catch (err) {
        if (active) setQuizError(err.message || 'Could not load your quizzes.');
      } finally {
        if (active) setLoadingQuizzes(false);
      }
    }

    load();
    return () => { active = false; };
  }, [status]);

  const handleDelete = async (quizId) => {
    if (!window.confirm('Delete this quiz? This cannot be undone.')) return;
    try {
      await clientRequest(`/api/quizzes/${quizId}`, { method: 'DELETE' });
      setQuizzes((curr) => curr.filter((q) => q.id !== quizId));
    } catch (err) {
      setQuizError(err.message || 'Could not delete the quiz.');
    }
  };

  const firstName = session?.user?.name?.split(' ')[0] || null;

  return (
    <section className="page-shell">
      {/* Hero */}
      <div className="hero">
        <span className="hero-eyebrow">✦ Adaptive learning workspace</span>
        <h1 className="hero-title">
          {firstName ? `Hey ${firstName}.` : 'Build smarter quizzes.'}
        </h1>
        <p className="hero-description">
          Generate AI-powered multiple-choice quizzes on any topic, take them, track your best scores —
          all in one serverless Next.js app with Google sign-in.
        </p>
        <div className="hero-actions">
          {status === 'authenticated' ? (
            <>
              <Link href="/generate" className="button button-primary button-lg">
                Generate a quiz
              </Link>
              <Link href="/profile" className="button button-ghost">
                Edit profile
              </Link>
            </>
          ) : (
            <Link href="/login" className="button button-primary button-lg">
              Sign in with Google
            </Link>
          )}
        </div>
        <div className="hero-stats">
          <div className="stat-card">
            <span className="stat-icon">✦</span>
            <span className="stat-value">AI</span>
            <span className="stat-label">Mistral-powered generation — no Python backend required.</span>
          </div>
          <div className="stat-card">
            <span className="stat-icon">🔐</span>
            <span className="stat-value">Google</span>
            <span className="stat-label">One-click sign-in with Prisma-backed session storage.</span>
          </div>
          <div className="stat-card">
            <span className="stat-icon">📊</span>
            <span className="stat-value">Scores</span>
            <span className="stat-label">Every attempt saved — best result surfaced per quiz.</span>
          </div>
        </div>
      </div>

      {/* Quiz list */}
      <div className="surface">
        <div className="section-header">
          <div>
            <h2 className="section-title">
              {status === 'authenticated' && quizzes.length > 0
                ? `${quizzes.length} quiz${quizzes.length !== 1 ? 'zes' : ''}`
                : 'Your quizzes'}
            </h2>
            <p className="section-subtitle">Open a quiz to continue, or generate a new one from any topic.</p>
          </div>
          {status === 'authenticated' && (
            <Link href="/generate" className="button button-primary">
              + New quiz
            </Link>
          )}
        </div>

        {status === 'loading' || loadingQuizzes ? (
          <div className="card-grid">
            {[1, 2, 3].map((n) => <SkeletonCard key={n} />)}
          </div>
        ) : status !== 'authenticated' ? (
          <div className="empty-state">
            <span className="empty-icon">🔐</span>
            <p className="empty-title">Sign in to get started</p>
            <p className="empty-body">Your quizzes and scores are tied to your Google account.</p>
            <Link href="/login" className="button button-primary">
              Sign in with Google
            </Link>
          </div>
        ) : quizError ? (
          <div className="alert">{quizError}</div>
        ) : quizzes.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📝</span>
            <p className="empty-title">No quizzes yet</p>
            <p className="empty-body">
              Pick a topic and let the AI generate your first set of questions.
            </p>
            <Link href="/generate" className="button button-primary">
              Create your first quiz
            </Link>
          </div>
        ) : (
          <div className="card-grid">
            {quizzes.map((quiz, i) => (
              <div key={quiz.id} style={{ animationDelay: `${i * 60}ms` }}>
                <QuizCard quiz={quiz} onDelete={handleDelete} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
