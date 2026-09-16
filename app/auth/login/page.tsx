'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)
export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    else window.location.href = '/'
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-[#0F172A] text-white flex items-center justify-center">
      <div className="w-full max-w-md p-8 border border-gray-700 rounded">
        <h1 className="text-2xl font-bold text-blue-400 mb-2">Hektiq</h1>
        <h2 className="text-xl font-bold mb-6">Login</h2>
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
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 py-3 rounded font-medium"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
        <p className="text-center text-gray-400 mt-4">
          No account? <a href="/auth/signup" className="text-blue-400">Sign up</a>
        </p>
      </div>
    </main>
  )
}