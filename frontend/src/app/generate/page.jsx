"use client";

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { clientRequest } from '@/lib/clientFetch';

export default function GenerateQuizPage() {
  const router = useRouter();
  const { status } = useSession();
  const [topic, setTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [router, status]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const generated = await clientRequest('/api/generate', {
        method: 'POST',
        body: {
          topic,
          num_questions: numQuestions,
        },
      });

      if (!generated?.ok || !generated?.data) {
        throw new Error('AI returned an unexpected quiz payload.');
      }

      await clientRequest('/api/quizzes', {
        method: 'POST',
        body: {
          title: topic,
          description: `A quiz about ${topic} with ${numQuestions} questions.`,
          content: JSON.stringify(generated.data),
        },
      });

      router.push('/');
    } catch (submissionError) {
      setError(submissionError.message || 'Could not generate the quiz.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="surface">
      <div className="section-header">
        <div>
          <h1 className="section-title">Generate a quiz</h1>
          <p className="section-subtitle">Describe the topic and let the backend AI create the questions.</p>
        </div>
      </div>

      <form className="form-grid" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="topic">Topic</label>
          <input
            id="topic"
            className="input"
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
            placeholder="React hooks, ancient Rome, climate science..."
            required
          />
        </div>

        <div className="split">
          <div className="field">
            <label htmlFor="numQuestions">Questions</label>
            <input
              id="numQuestions"
              className="input"
              type="number"
              min="1"
              max="20"
              value={numQuestions}
              onChange={(event) => setNumQuestions(Number(event.target.value))}
              required
            />
          </div>

          <div className="field">
            <label>Generation mode</label>
            <div className="chip">AI generation via the existing Mistral key</div>
          </div>
        </div>

        {error ? <div className="alert">{error}</div> : null}

        <button type="submit" className="button button-primary" disabled={loading}>
          {loading ? 'Generating quiz...' : 'Generate and save'}
        </button>
      </form>
    </section>
  );
}
