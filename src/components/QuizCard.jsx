import Link from 'next/link';

function formatDate(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function ScoreIndicator({ score }) {
  if (typeof score !== 'number') {
    return <span className="badge badge-muted">No score yet</span>;
  }
  const pct = score.toFixed(1);
  const variant = score >= 70 ? 'badge-success' : score >= 40 ? 'badge-warning' : 'badge-muted';
  return <span className={`badge ${variant}`}>{pct}% best</span>;
}

export default function QuizCard({ quiz, onDelete }) {
  const scoreWidth = typeof quiz.bestScore === 'number' ? Math.min(quiz.bestScore, 100) : 0;

  return (
    <article className="card">
      <div className="card-meta">
        <span className="chip">{formatDate(quiz.createdAt)}</span>
        <ScoreIndicator score={quiz.bestScore} />
      </div>

      {typeof quiz.bestScore === 'number' && (
        <div className="score-bar">
          <div className="score-bar-fill" style={{ width: `${scoreWidth}%` }} />
        </div>
      )}

      <div>
        <h3 className="card-title">{quiz.title}</h3>
        <p className="card-description" style={{ marginTop: 6 }}>
          {quiz.description || 'AI-generated quiz — ready to take.'}
        </p>
      </div>

      <div className="card-actions">
        <Link href={`/quiz/${quiz.id}`} className="button button-primary button-sm">
          Take quiz
        </Link>
        <button
          type="button"
          className="button button-danger button-sm"
          onClick={() => onDelete(quiz.id)}
        >
          Delete
        </button>
      </div>
    </article>
  );
}
