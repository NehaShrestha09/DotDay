import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Home from './pages/home'
import UserOnboarding from './pages/userOnboarding'
import Calendar from './pages/calendar'
import Dashboard from './pages/dashboard'
import Insights from './pages/insights'
import CareTips from './pages/caretips'
import MyDiary from './pages/mydiary'
import Settings from './pages/settings'
import FaqPage from './pages/FaqPage'
import EmailTestPage from './pages/emailtest'

const App = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/useronboarding" element={<UserOnboarding />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/insights" element={<Insights />} />
              <Route path="/mydiary" element={<MyDiary />} />
        <Route path="/caretips" element={<CareTips />} />
        <Route path="/profile" element={<div className="flex h-screen w-screen bg-gray-50">
          <div className="flex-1 p-8 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Profile</h2>
              <p className="text-gray-600">Coming soon...</p>
            </div>
        </div>
      </div>} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/emailtest" element={<EmailTestPage />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
