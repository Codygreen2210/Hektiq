import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react'
import HektiqLanding from './HektiqLanding.jsx'
import HektiqDashboard from './HektiqDashboard.jsx'

function ProtectedRoute({ children }) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut><RedirectToSignIn /></SignedOut>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Analytics />
      <Routes>
        <Route path="/" element={<HektiqLanding />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <HektiqDashboard />
          </ProtectedRoute>
        } />
        <Route path="*" element={null} />
      </Routes>
    </BrowserRouter>
  )
}
