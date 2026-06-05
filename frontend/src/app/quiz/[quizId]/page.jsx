"use client";

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { clientRequest } from '@/lib/clientFetch';
import { getQuestionLabel, isCorrectAnswer, normalizeQuizContent } from '@/lib/quiz';

export default function TakeQuizPage() {
  const { quizId } = useParams();
  const router = useRouter();
  const { status } = useSession();

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
      return;
    }

    if (status !== 'authenticated' || !quizId) {
      return;
    }

    let isActive = true;

    async function loadQuiz() {
      setLoading(true);
      setError('');

      try {
        const data = await clientRequest(`/api/quizzes/${quizId}`);
        if (!isActive) {
          return;
        }

        setQuiz(data);
        setQuestions(normalizeQuizContent(data.content));
      } catch (requestError) {
        if (isActive) {
          setError(requestError.message || 'Could not load the quiz.');
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    loadQuiz();

    return () => {
      isActive = false;
    };
  }, [quizId, router, status]);

  const currentQuestion = questions[currentIndex];
  const progress = useMemo(() => {
    if (!questions.length) {
      return 0;
    }
    return ((currentIndex + 1) / questions.length) * 100;
  }, [currentIndex, questions.length]);

  const selectAnswer = (questionKey, optionIndex) => {
    setAnswers((current) => ({
      ...current,
      [questionKey]: optionIndex,
    }));
  };

  const submitQuiz = async () => {
    let correctCount = 0;

    questions.forEach((question, index) => {
      const questionKey = question?.id ?? index;
      if (answers[questionKey] !== undefined && isCorrectAnswer(question, answers[questionKey])) {
        correctCount += 1;
      }
    });

    const score = questions.length ? (correctCount / questions.length) * 100 : 0;

    try {
      await clientRequest(`/api/quizzes/${quizId}/score`, {
        method: 'POST',
        body: { score },
      });
    } catch {
      // Score save is best-effort.
    }

    setResults({ correctCount, score });
  };

  if (loading) {
    return <section className="surface">Loading quiz...</section>;
  }

  if (error) {
    return <section className="surface alert">{error}</section>;
  }

  if (!quiz || !questions.length) {
    return <section className="surface">No questions were found in this quiz.</section>;
  }

  if (results) {
    return (
      <section className="surface results-panel">
        <h1 className="section-title">Quiz results</h1>
        <p className="results-score">{results.score.toFixed(1)}%</p>
        <p className="muted">
          You answered {results.correctCount} of {questions.length} questions correctly.
        </p>
        <button type="button" className="button button-primary" onClick={() => router.push('/')}>
          Back to dashboard
        </button>
      </section>
    );
  }

  const questionKey = currentQuestion?.id ?? currentIndex;
  const isLastQuestion = currentIndex === questions.length - 1;

  return (
    <section className="quiz-layout surface">
      <div className="section-header">
        <div>
          <h1 className="section-title">{quiz.title}</h1>
          <p className="section-subtitle">Answer each question and save your score when you finish.</p>
        </div>
        <span className="chip">
          Question {currentIndex + 1} of {questions.length}
        </span>
      </div>

      <div className="quiz-progress" aria-hidden="true">
        <div style={{ width: `${progress}%` }} />
      </div>

      <div className="stack">
        <h2 className="quiz-question">{getQuestionLabel(currentQuestion, currentIndex)}</h2>
        <div className="quiz-options">
          {(currentQuestion.options || []).map((option, optionIndex) => {
            const optionText = typeof option === 'string'
              ? option
              : option?.text || option?.answer || option?.choice || option?.label || option?.value || 'Option';
            const optionId = typeof option === 'object' && option?.id !== undefined ? option.id : optionIndex;

            return (
              <button
                key={optionId}
                type="button"
                className={`quiz-option ${answers[questionKey] === optionId ? 'is-selected' : ''}`}
                onClick={() => selectAnswer(questionKey, optionId)}
              >
                {optionText}
              </button>
            );
          })}
        </div>
      </div>

      <div className="quiz-navigation">
        <button
          type="button"
          className="button button-ghost"
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex((value) => Math.max(value - 1, 0))}
        >
          Back
        </button>

        {isLastQuestion ? (
          <button type="button" className="button button-primary" onClick={submitQuiz}>
            Submit quiz
          </button>
        ) : (
          <button
            type="button"
            className="button button-primary"
            disabled={answers[questionKey] === undefined}
            onClick={() => setCurrentIndex((value) => value + 1)}
          >
            Next
          </button>
        )}
      </div>
    </section>
  );
}
