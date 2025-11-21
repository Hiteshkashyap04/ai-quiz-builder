import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { updateProfile } from '../api/auth'
import styles from './LoginPage.module.css' 

const ProfilePage = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  
  const [fullName, setFullName] = useState('')
  const [avatar, setAvatar] = useState('') 
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (user) {
        setFullName(user.full_name || '')
        setAvatar(user.avatar || '')
    }
  }, [user])

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        if (file.size > 50000) {
            alert("File is too big! Please choose a smaller image (under 50KB).");
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            setAvatar(reader.result);
        };
        reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
        await updateProfile({ full_name: fullName, avatar: avatar })
        setMessage('Profile updated successfully! (Refresh to see changes across the app)')
    } catch (error) {
        console.error("Failed to update profile", error)
        setMessage('Failed to update profile.')
    } finally {
        setLoading(false)
    }
  }

  // New Logout Function
  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
        logout();
        navigate('/login');
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <h2 className={styles.title}>Your Profile</h2>
        
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <div style={{ 
                width: '100px', 
                height: '100px', 
                borderRadius: '50%', 
                backgroundColor: '#e9ecef', 
                overflow: 'hidden',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                border: '2px solid #007bff'
            }}>
                {avatar ? (
                    <img src={avatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                    <span style={{ fontSize: '2rem' }}>👤</span>
                )}
            </div>
        </div>

        {message && <p className={styles.error} style={{backgroundColor: '#d4edda', color: '#155724', borderColor:'#c3e6cb'}}>{message}</p>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label>Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your name"
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Profile Picture</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ padding: '10px 0' }}
            />
          </div>

          <button type="submit" disabled={loading} className={styles.submitButton}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>

        <hr style={{margin: '2rem 0', border: '0', borderTop: '1px solid #eee'}} />

        {/* LOGOUT BUTTON */}
        <button 
            onClick={handleLogout} 
            className={styles.submitButton} 
            style={{backgroundColor: '#dc3545', marginTop: '0'}}
        >
            Logout
        </button>

      </div>
    </div>
  )
}

export default ProfilePage