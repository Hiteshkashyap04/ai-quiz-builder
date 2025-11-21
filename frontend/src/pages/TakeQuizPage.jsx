import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getQuizById, saveScore } from '../api/quiz' // <--- Ensure saveScore is imported
import styles from './TakeQuizPage.module.css'

const TakeQuizPage = () => {
  const { quizId } = useParams()
  const navigate = useNavigate()

  const [quiz, setQuiz] = useState(null)
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState({}) 
  const [quizResults, setQuizResults] = useState(null)

  // For animation reset
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true)
        const response = await getQuizById(quizId)
        const quizData = response.data;
        setQuiz(quizData)

        let parsedQuestions = [];
        try {
            if (typeof quizData.content === 'string') {
                parsedQuestions = JSON.parse(quizData.content);
            } else {
                parsedQuestions = quizData.content;
            }

            if (parsedQuestions && !Array.isArray(parsedQuestions)) {
                if (parsedQuestions.questions) parsedQuestions = parsedQuestions.questions;
                else if (parsedQuestions.data) parsedQuestions = parsedQuestions.data;
            }
            
            setQuestions(parsedQuestions || []);
        } catch (e) {
            console.error("Failed to parse quiz content", e);
            setError("Error: Could not load quiz questions.");
        }
      } catch (err) {
        console.error('Failed to fetch quiz:', err)
        setError('Could not load the quiz. It may not exist.')
      } finally {
        setLoading(false)
      }
    }
    fetchQuiz()
  }, [quizId])

  const handleOptionSelect = (questionId, optionId) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: optionId,
    })
  }

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setAnimationKey(prev => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
      setAnimationKey(prev => prev + 1)
    }
  }

  const checkAnswer = (question, userSelectedIndex) => {
    let userSelectedText = "";
    if (typeof question.options[userSelectedIndex] === 'string') {
        userSelectedText = question.options[userSelectedIndex];
    } else {
        userSelectedText = question.options[userSelectedIndex]?.text || "";
    }

    const objectOption = question.options[userSelectedIndex];
    if (typeof objectOption === 'object' && (objectOption.is_correct === true || objectOption.correct === true)) return true;

    if (question.answer && String(question.answer).trim() === String(userSelectedText).trim()) return true;

    if (question.answer !== undefined && Number(question.answer) === userSelectedIndex) return true;

    const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
    if (question.answer && letters.includes(String(question.answer).toUpperCase())) {
        const correctIndex = letters.indexOf(String(question.answer).toUpperCase());
        if (correctIndex === userSelectedIndex) return true;
    }

    return false;
  };

  const handleSubmit = async () => {
    if (window.confirm('Are you sure you want to submit your answers?')) {
        let correctCount = 0;
        
        questions.forEach((q, index) => {
            const qId = q.id !== undefined ? q.id : index;
            const userSelectedId = selectedAnswers[qId];
            
            if (userSelectedId !== undefined) {
                const isCorrect = checkAnswer(q, userSelectedId);
                if (isCorrect) correctCount++;
            }
        });
        
        const score = (correctCount / questions.length) * 100;

        // --- SAVE SCORE ---
        try {
            await saveScore(quizId, score);
            console.log("Score saved successfully!");
        } catch (err) {
            console.error("Failed to save score", err);
        }
        // ------------------
        
        setQuizResults({
            score: score,
            correct_answers: correctCount,
            total_questions: questions.length
        });
    }
  }

  const progressPercentage = questions.length > 0 
    ? ((currentQuestionIndex + 1) / questions.length) * 100 
    : 0;

  if (loading) return <div className={styles.container}><p>Loading quiz...</p></div>
  if (error) return <div className={styles.container}><p className={styles.error}>{error}</p></div>
  if (!quiz || questions.length === 0) return <div className={styles.container}><p>No questions found in this quiz.</p></div>

  if (quizResults) {
    return (
      <div className={styles.resultsContainer}>
        <h1 className={styles.title}>Quiz Results</h1>
        <h2 className={styles.score}>Your Score: {quizResults.score.toFixed(1)}%</h2>
        <p className={styles.summary}>
          You got <strong>{quizResults.correct_answers}</strong> out of <strong>{quizResults.total_questions}</strong> questions correct.
        </p>
        <button onClick={() => navigate('/')} className={styles.navButton}>
          Back to Dashboard
        </button>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex];
  const questionText = currentQuestion.text || currentQuestion.question || currentQuestion.question_text || "Question Text Missing";
  const currentQId = currentQuestion.id !== undefined ? currentQuestion.id : currentQuestionIndex;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{quiz.title}</h1>

      <div className={styles.progressContainer}>
        <div 
            className={styles.progressFill} 
            style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
      <div className={styles.progressText}>
        Question {currentQuestionIndex + 1} of {questions.length}
      </div>

      <div key={animationKey} className={`${styles.questionWrapper} ${styles.fadeIn}`}>
        <h2 className={styles.questionText}>{questionText}</h2>
        <div className={styles.optionsGrid}>
          {currentQuestion.options && currentQuestion.options.map((option, idx) => {
            let optText = "Option";
            let optId = idx;

            if (typeof option === 'string') {
                optText = option;
                optId = idx; 
            } else {
                optText = option.text || option.answer || option.choice || option.label || option.value || "Option";
                optId = option.id !== undefined ? option.id : idx;
            }
            
            return (
              <button
                key={optId}
                className={`${styles.option} ${
                  selectedAnswers[currentQId] === optId ? styles.selected : ''
                }`}
                onClick={() => handleOptionSelect(currentQId, optId)}
              >
                {optText}
              </button>
            )
          })}
        </div>
      </div>

      <div className={styles.navigation}>
        <button onClick={handleBack} disabled={currentQuestionIndex === 0} className={styles.navButton}>
          Back
        </button>
        {isLastQuestion ? (
          <button onClick={handleSubmit} className={styles.submitButton} disabled={selectedAnswers[currentQId] === undefined}>
            Submit Quiz
          </button>
        ) : (
          <button onClick={handleNext} disabled={selectedAnswers[currentQId] === undefined} className={styles.navButton}>
            Next
          </button>
        )}
      </div>
    </div>
  )
}

export default TakeQuizPage