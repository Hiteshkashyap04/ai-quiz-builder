import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

// Import Pages
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx' // <--- Import New Page
import DashboardPage from './pages/DashboardPage.jsx'
import GenerateQuizPage from './pages/GenerateQuizPage.jsx'
import TakeQuizPage from './pages/TakeQuizPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx' // <--- IMPORT
function App() {
  return (
    <div className="App">
      <Navbar />
      <main>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} /> {/* <--- Add Route */}

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/generate"
            element={
              <ProtectedRoute>
                <GenerateQuizPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quiz/:quizId"
            element={
              <ProtectedRoute>
                <TakeQuizPage />
              </ProtectedRoute>
            }
          />
          <Route
           path="/profile" 
           element={
          <ProtectedRoute>
           <ProfilePage />
          </ProtectedRoute>
          } 
         />
          
          {/* Fallback for unknown routes */}
          <Route path="*" element={<h2>404: Page Not Found</h2>} />
        </Routes>
      </main>
    </div>
  )
}

export default App