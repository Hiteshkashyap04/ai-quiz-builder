"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import QuizCard from '@/components/QuizCard';
import { clientRequest } from '@/lib/clientFetch';

export default function DashboardPage() {
  const { status } = useSession();
  const [quizzes, setQuizzes] = useState([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);
  const [quizError, setQuizError] = useState('');

  useEffect(() => {
    if (status !== 'authenticated') {
      return;
    }

    let isMounted = true;

    async function loadQuizzes() {
      setLoadingQuizzes(true);
      setQuizError('');

      try {
        const data = await clientRequest('/api/quizzes');
        if (isMounted) {
          setQuizzes(Array.isArray(data) ? data : []);
        }
      } catch (requestError) {
        if (isMounted) {
          setQuizError(requestError.message || 'Could not load your quizzes.');
        }
      } finally {
        if (isMounted) {
          setLoadingQuizzes(false);
        }
      }
    }

    loadQuizzes();

    return () => {
      isMounted = false;
    };
  }, [status]);

  const handleDelete = async (quizId) => {
    const confirmed = window.confirm('Delete this quiz? This cannot be undone.');
    if (!confirmed) {
      return;
    }

    try {
      await clientRequest(`/api/quizzes/${quizId}`, {
        method: 'DELETE',
      });
      setQuizzes((current) => current.filter((quiz) => quiz.id !== quizId));
    } catch (requestError) {
      setQuizError(requestError.message || 'Could not delete the quiz.');
    }
  };

  return (
    <section className="page-shell">
      <div className="hero">
        <span className="hero-kicker">Adaptive learning workspace</span>
        <h1 className="hero-title">Build quizzes faster than you can brief them.</h1>
        <p className="hero-copy">
          Generate AI-powered quizzes, track scores, and manage your learning flow from a single Next.js app with Google sign-in.
        </p>
        <div className="hero-actions">
          {status === 'authenticated' ? (
            <>
              <Link href="/generate" className="button button-primary">
                Generate a quiz
              </Link>
              <Link href="/profile" className="button button-ghost">
                Edit profile
              </Link>
            </>
          ) : (
            <Link href="/login" className="button button-primary">
              Sign in with Google
            </Link>
          )}
        </div>
        <div className="hero-stats">
          <div className="stat">
            <strong>AI</strong>
            <span>Reuse the existing Mistral-backed quiz generator.</span>
          </div>
          <div className="stat">
            <strong>Google</strong>
            <span>One-click auth with backend session sync.</span>
          </div>
          <div className="stat">
            <strong>Scores</strong>
            <span>Save quiz attempts and surface best results.</span>
          </div>
        </div>
      </div>

      <div className="surface">
        <div className="section-header">
          <div>
            <h2 className="section-title">Your quizzes</h2>
            <p className="section-subtitle">
              Open a quiz to continue where you left off, or create a fresh set from a new topic.
            </p>
          </div>
          <Link href="/generate" className="button button-primary">
            New quiz
          </Link>
        </div>

        {status === 'loading' ? (
          <div className="empty-state">Loading your session...</div>
        ) : status !== 'authenticated' ? (
          <div className="empty-state">
            <p className="muted">You are not signed in yet.</p>
            <Link href="/login" className="button button-primary">
              Sign in with Google
            </Link>
          </div>
        ) : loadingQuizzes ? (
          <div className="empty-state">Loading your quizzes...</div>
        ) : quizError ? (
          <div className="alert">{quizError}</div>
        ) : quizzes.length === 0 ? (
          <div className="empty-state">
            <p className="muted">You have not created any quizzes yet.</p>
            <Link href="/generate" className="button button-primary">
              Create your first quiz
            </Link>
          </div>
        ) : (
          <div className="card-grid">
            {quizzes.map((quiz) => (
              <QuizCard key={quiz.id} quiz={quiz} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
