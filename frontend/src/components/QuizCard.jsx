import Link from 'next/link'

const QuizCard = ({ quiz, onDelete }) => {
  return (
    <article className="card">
      <div className="card-meta">
        <span className="chip">Created {new Date(quiz.created_at).toLocaleDateString()}</span>
        {typeof quiz.best_score === 'number' ? (
          <span className="chip">Best score {quiz.best_score.toFixed(1)}%</span>
        ) : (
          <span className="chip">No score yet</span>
        )}
      </div>

      <div className="stack">
        <h3 className="card-title">{quiz.title}</h3>
        <p className="card-description">{quiz.description || 'Generated quiz with AI-powered questions.'}</p>
      </div>

      <div className="card-actions">
        <Link href={`/quiz/${quiz.id}`} className="button button-primary">
          Take quiz
        </Link>
        <button type="button" className="button button-danger" onClick={() => onDelete(quiz.id)}>
          Delete
        </button>
      </div>
    </article>
  )
}

export default QuizCard