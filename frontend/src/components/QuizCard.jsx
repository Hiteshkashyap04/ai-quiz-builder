import React from 'react'
import { Link } from 'react-router-dom'
import styles from './QuizCard.module.css'

const QuizCard = ({ quiz, onDelete }) => {
  return (
    <div className={styles.card}>
      <div className={styles.cardContent}>
        <h3 className={styles.title}>{quiz.title}</h3>
        <p className={styles.description}>
            {quiz.description || "AI Generated Quiz"}
        </p>
        
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px'}}>
            <span className={styles.topic}>
                Topic: {quiz.title}
            </span>

            {/* SHOW BEST SCORE IF IT EXISTS */}
            {quiz.best_score !== null && quiz.best_score !== undefined && (
                <span style={{
                    backgroundColor: '#d4edda', 
                    color: '#155724', 
                    padding: '4px 8px', 
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    fontWeight: '600'
                }}>
                    🏆 Best: {quiz.best_score.toFixed(0)}%
                </span>
            )}
        </div>
      </div>

      <div className={styles.footer}>
        <Link to={`/quiz/${quiz.id}`} className={styles.takeQuizButton}>
          Take Quiz
        </Link>
        
        <button 
            onClick={() => onDelete(quiz.id)} 
            className={styles.deleteButton}
            title="Delete Quiz"
        >
            Delete
        </button>
      </div>
    </div>
  )
}

export default QuizCard