"use client";

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { clientRequest } from '@/lib/clientFetch';
import { getQuestionLabel, isCorrectAnswer, normalizeQuizContent } from '@/lib/quiz';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

function getScoreEmoji(pct) {
  if (pct >= 90) return '🏆';
  if (pct >= 70) return '🎉';
  if (pct >= 50) return '👍';
  return '📚';
}

export default function TakeQuizPage() {
  const { quizId } = useParams();
  const router = useRouter();
  const { status } = useSession();

  const [quiz, setQuiz]             = useState(null);
  const [questions, setQuestions]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers]       = useState({});
  const [results, setResults]       = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') { router.replace('/login'); return; }
    if (status !== 'authenticated' || !quizId) return;

    let active = true;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await clientRequest(`/api/quizzes/${quizId}`);
        if (!active) return;
        setQuiz(data);
        setQuestions(normalizeQuizContent(data.content));
      } catch (err) {
        if (active) setError(err.message || 'Could not load the quiz.');
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => { active = false; };
  }, [quizId, router, status]);

  const currentQuestion = questions[currentIndex];
  const questionKey = currentQuestion?.id ?? currentIndex;

  const progress = useMemo(() => {
    if (!questions.length) return 0;
    return ((currentIndex + 1) / questions.length) * 100;
  }, [currentIndex, questions.length]);

  const selectAnswer = (qKey, optionIndex) => {
    setAnswers((curr) => ({ ...curr, [qKey]: optionIndex }));
  };

  const submitQuiz = async () => {
    setSubmitting(true);
    let correct = 0;
    questions.forEach((q, idx) => {
      const key = q?.id ?? idx;
      if (answers[key] !== undefined && isCorrectAnswer(q, answers[key])) correct++;
    });
    const score = questions.length ? (correct / questions.length) * 100 : 0;

    try {
      await clientRequest(`/api/quizzes/${quizId}/score`, { method: 'POST', body: { score } });
    } catch {
      // best-effort
    }
    setSubmitting(false);
    setResults({ correct, score });
  };

  if (loading) {
    return (
      <div className="loading-center">
        <span className="spinner spinner-lg" />
        Loading quiz…
      </div>
    );
  }

  if (error) {
    return (
      <section className="surface">
        <div className="alert">{error}</div>
        <Link href="/" className="button button-ghost" style={{ marginTop: 16 }}>
          Back to dashboard
        </Link>
      </section>
    );
  }

  if (!quiz || !questions.length) {
    return (
      <section className="surface">
        <div className="empty-state">
          <span className="empty-icon">🤔</span>
          <p className="empty-title">No questions found</p>
          <p className="empty-body">This quiz has no questions yet.</p>
          <Link href="/" className="button button-primary">Back to dashboard</Link>
        </div>
      </section>
    );
  }

  if (results) {
    const emoji = getScoreEmoji(results.score);
    return (
      <section className="surface">
        <div className="results-panel">
          <div className="results-trophy">{emoji}</div>
          <p className="results-score">{results.score.toFixed(0)}%</p>
          <p className="results-summary">
            You answered <strong>{results.correct}</strong> of <strong>{questions.length}</strong> questions correctly.
            {results.score >= 70 ? ' Great work!' : ' Keep practising!'}
          </p>
          <div className="results-actions">
            <button
              type="button"
              className="button button-ghost"
              onClick={() => {
                setAnswers({});
                setCurrentIndex(0);
                setResults(null);
              }}
            >
              Retry
            </button>
            <button type="button" className="button button-primary" onClick={() => router.push('/')}>
              Back to dashboard
            </button>
          </div>
        </div>
      </section>
    );
  }

  const isLastQuestion = currentIndex === questions.length - 1;
  const hasAnswered = answers[questionKey] !== undefined;

  return (
    <section className="quiz-layout surface">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 className="section-title">{quiz.title}</h1>
          <p className="section-subtitle" style={{ marginTop: 4 }}>Answer each question, then submit to save your score.</p>
        </div>
        <span className="chip">
          {currentIndex + 1} / {questions.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="quiz-progress-row">
        <div className="quiz-progress" aria-hidden="true">
          <div className="quiz-progress-bar" style={{ width: `${progress}%` }} />
        </div>
        <span className="quiz-progress-label">{Math.round(progress)}%</span>
      </div>

      {/* Question */}
      <div className="stack">
        <h2 className="quiz-question">{getQuestionLabel(currentQuestion, currentIndex)}</h2>
        <div className="quiz-options">
          {(currentQuestion.options || []).map((option, idx) => {
            const text = typeof option === 'string'
              ? option
              : option?.text || option?.answer || option?.choice || option?.label || option?.value || `Option ${idx + 1}`;
            const optId = typeof option === 'object' && option?.id !== undefined ? option.id : idx;
            const selected = answers[questionKey] === optId;

            return (
              <button
                key={optId}
                type="button"
                className={`quiz-option${selected ? ' is-selected' : ''}`}
                onClick={() => selectAnswer(questionKey, optId)}
              >
                <span className="option-letter">{LETTERS[idx] || idx + 1}</span>
                {text}
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="quiz-navigation">
        <button
          type="button"
          className="button button-ghost"
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex((v) => Math.max(v - 1, 0))}
        >
          ← Back
        </button>

        {isLastQuestion ? (
          <button
            type="button"
            className="button button-primary"
            onClick={submitQuiz}
            disabled={submitting}
          >
            {submitting ? <><span className="spinner" /> Saving…</> : 'Submit quiz'}
          </button>
        ) : (
          <button
            type="button"
            className="button button-primary"
            disabled={!hasAnswered}
            onClick={() => setCurrentIndex((v) => v + 1)}
          >
            Next →
          </button>
        )}
      </div>
    </section>
  );
}
