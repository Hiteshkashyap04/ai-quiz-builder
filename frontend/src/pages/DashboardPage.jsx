import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getQuizzes, deleteQuiz } from '../api/quiz' // Import deleteQuiz
import QuizCard from '../components/QuizCard.jsx'
import styles from './DashboardPage.module.css'
import { useAuth } from '../context/AuthContext'

const DashboardPage = () => {
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { user } = useAuth()

  useEffect(() => {
    fetchQuizzes()
  }, [])

  const fetchQuizzes = async () => {
    try {
      setLoading(true)
      const response = await getQuizzes()
      setQuizzes(response.data) 
    } catch (err) {
      console.error('Failed to fetch quizzes:', err)
      setError('Could not load your quizzes. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  // --- NEW DELETE HANDLER ---
  const handleDelete = async (quizId) => {
    if (window.confirm("Are you sure you want to delete this quiz? This cannot be undone.")) {
      try {
        await deleteQuiz(quizId);
        // Remove the deleted quiz from the local state so it disappears immediately
        setQuizzes(quizzes.filter(quiz => quiz.id !== quizId));
      } catch (err) {
        console.error("Failed to delete quiz:", err);
        alert("Failed to delete quiz.");
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
            Welcome, {user?.full_name || user?.email}!
        </h1>
        <Link to="/generate" className={styles.generateButton}>
          + Create New Quiz
        </Link>
      </div>

      <h2 className={styles.subHeader}>Your Quizzes</h2>

      {loading && <p>Loading your quizzes...</p>}
      
      {error && <p className={styles.error}>{error}</p>}

      {!loading && !error && (
        <>
          {quizzes.length === 0 ? (
            <div className={styles.noQuizzes}>
              <p>You haven't created any quizzes yet.</p>
              <Link to="/generate" className={styles.generateButton}>
                Create one now
              </Link>
            </div>
          ) : (
            <div className={styles.quizGrid}>
              {quizzes.map((quiz) => (
                // Pass the handleDelete function to the card
                <QuizCard key={quiz.id} quiz={quiz} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default DashboardPage