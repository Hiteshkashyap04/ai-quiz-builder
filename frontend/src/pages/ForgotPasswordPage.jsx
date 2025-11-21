import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import styles from './LoginPage.module.css' // Re-using styles

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  
  const handleSubmit = (e) => {
    e.preventDefault()
    // Here you would normally call your backend API:
    // await apiClient.post('/auth/forgot-password', { email })
    
    // For now, we simulate success
    setSubmitted(true)
  }

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <h2 className={styles.title}>Reset Password</h2>
        
        {!submitted ? (
            <>
                <p style={{textAlign: 'center', marginBottom: '1.5rem', color: '#6c757d'}}>
                    Enter your email address and we'll send you a link to reset your password.
                </p>
                <form onSubmit={handleSubmit} className={styles.form}>
                  <div className={styles.inputGroup}>
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="Enter your registered email"
                    />
                  </div>
                  <button type="submit" className={styles.submitButton}>
                    Send Reset Link
                  </button>
                </form>
            </>
        ) : (
            <div style={{textAlign: 'center'}}>
                <div style={{fontSize: '3rem', marginBottom: '1rem'}}>📧</div>
                <h3 style={{marginBottom: '1rem', color: '#28a745'}}>Check your inbox</h3>
                <p style={{color: '#6c757d', marginBottom: '2rem'}}>
                    If an account exists for <strong>{email}</strong>, we have sent a password reset link.
                </p>
                <button 
                    onClick={() => setSubmitted(false)} 
                    style={{background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', textDecoration: 'underline'}}
                >
                    Try another email
                </button>
            </div>
        )}

        <div className={styles.link}>
            <p>
                <Link to="/login">← Back to Login</Link>
            </p>
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordPage