import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
// FIX: Import the correct function name here!
import { fetchGeneratedQuiz, saveQuiz } from '../api/quiz'
import styles from './GenerateQuizPage.module.css'

const GenerateQuizPage = () => {
  const [topic, setTopic] = useState('')
  const [numQuestions, setNumQuestions] = useState(5)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const generationParams = {
        topic,
        num_questions: numQuestions,
      };
      
      // FIX: Use the correct function name here!
      const generationResponse = await fetchGeneratedQuiz(generationParams);
      
      if (!generationResponse.data.ok || !generationResponse.data.data) {
        throw new Error('AI failed to generate quiz content.');
      }
      
      const aiContent = generationResponse.data.data;

      const quizToSave = {
        title: topic,
        description: `A quiz about ${topic} with ${numQuestions} questions.`,
        content: JSON.stringify(aiContent)
      };

      const saveResponse = await saveQuiz(quizToSave);
      
      navigate('/') 
      
    } catch (err) {
      console.error('Failed to generate quiz:', err)
      setError(err.response?.data?.detail || 'Could not generate the quiz. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <h1 className={styles.title}>Generate a New Quiz</h1>
        <p className={styles.subtitle}>
          Provide a topic and let the AI do the rest.
        </p>
        
        {error && <p className={styles.error}>{error}</p>}
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="topic">Topic</label>
            <input
              type="text"
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., 'The Roman Empire' or 'React Hooks'"
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="numQuestions">Number of Questions</label>
            <input
              type="number"
              id="numQuestions"
              value={numQuestions}
              onChange={(e) => setNumQuestions(Number(e.target.value))}
              min="1"
              max="20"
              required
            />
          </div>

          <button type="submit" disabled={loading} className={styles.submitButton}>
            {loading ? 'Generating...' : 'Generate Quiz'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default GenerateQuizPage