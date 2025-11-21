import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import styles from './Navbar.module.css'

const Navbar = () => {
  const { isAuthenticated, user } = useAuth()
  
  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        
        {/* LEFT SIDE: Profile Info (if logged in) OR Brand Text (if logged out) */}
        <div className={styles.leftSection}>
            {isAuthenticated ? (
                <Link to="/profile" className={styles.profileLink}>
                    {user?.avatar ? (
                        <img 
                            src={user.avatar} 
                            alt="avatar" 
                            className={styles.avatar} 
                        />
                    ) : (
                        <div className={styles.avatarPlaceholder}>👤</div>
                    )}
                    <span className={styles.userName}>
                        {user?.full_name || user?.email}
                    </span>
                </Link>
            ) : (
                <Link to="/" className={styles.brand}>
                    AI Quiz Builder
                </Link>
            )}
        </div>

        {/* RIGHT SIDE: Navigation Links */}
        <div className={styles.navLinks}>
          {isAuthenticated ? (
            <>
              <Link to="/" className={styles.navLink}>Dashboard</Link>
              <Link to="/generate" className={styles.navLink}>New Quiz</Link>
              {/* Logout button is now in the Profile Page */}
            </>
          ) : (
            <>
              <Link to="/login" className={styles.navLink}>Login</Link>
              <Link to="/register" className={styles.navLink}>Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar