'use client'

import { useState } from 'react'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSignup() {
    setLoading(true)
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (data.error) setError(data.error)
      else window.location.href = '/'
    } catch (e) {
      setError('Something went wrong')
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-[#0F172A] text-white flex items-center justify-center">
      <div className="w-full max-w-md p-8 border border-gray-700 rounded">
        <h1 className="text-2xl font-bold text-blue-400 mb-2">Hektiq</h1>
        <h2 className="text-xl font-bold mb-6">Create Account</h2>
        {error && <p className="text-red-400 mb-4">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-3 mb-4 text-white"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-3 mb-6 text-white"
        />
        <button
          onClick={handleSignup}
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 py-3 rounded font-medium"
        >
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>
        <p className="text-center text-gray-400 mt-4">
          Already have an account? <a href="/auth/login" className="text-blue-400">Login</a>
        </p>
      </div>
    </main>
  )
}