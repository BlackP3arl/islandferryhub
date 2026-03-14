'use client'

import { useState, useEffect } from 'react'
import OperatorForm from './components/OperatorForm'
import OperatorList from './components/OperatorList'
import SpeedboatIcon from '../components/SpeedboatIcon'

interface RouteStop {
  id: string
  island: string
  order: number
}

interface Schedule {
  id: string
  departureTimes: string
  daysOfWeek: string
}

interface Route {
  id: string
  routeName: string | null
  order: number
  stops: RouteStop[]
  schedule: Schedule | null
}

interface Operator {
  id: string
  name: string
  boatName: string
  logoUrl: string | null
  contactNumber: string
  liveLocationUrl: string | null
  ticketingUrl: string | null
  isActive: boolean
  routes: Route[]
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [operators, setOperators] = useState<Operator[]>([])
  const [editingOperator, setEditingOperator] = useState<Operator | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)

  // Check session storage for saved auth
  useEffect(() => {
    const saved = sessionStorage.getItem('admin-auth')
    if (saved) {
      setAuthed(true)
    }
  }, [])

  useEffect(() => {
    if (authed) fetchOperators()
  }, [authed])

  async function fetchOperators() {
    setLoading(true)
    const res = await fetch('/api/operators')
    const data = await res.json()
    setOperators(data)
    setLoading(false)
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (res.ok) {
      sessionStorage.setItem('admin-auth', password)
      setAuthed(true)
      setLoginError('')
    } else {
      setLoginError('Invalid password')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this operator?')) return
    const savedPw = sessionStorage.getItem('admin-auth') || ''
    await fetch(`/api/operators/${id}`, {
      method: 'DELETE',
      headers: { 'x-admin-password': savedPw },
    })
    fetchOperators()
  }

  function handleEdit(op: Operator) {
    setEditingOperator(op)
    setShowForm(true)
  }

  function handleNew() {
    setEditingOperator(null)
    setShowForm(true)
  }

  function handleFormClose() {
    setShowForm(false)
    setEditingOperator(null)
    fetchOperators()
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-700 to-teal-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="mb-2 flex justify-center"><SpeedboatIcon className="w-12 h-12" /></div>
            <h1 className="text-xl font-bold text-gray-800">Speedboat Directory</h1>
            <p className="text-gray-500 text-sm mt-1">Admin Panel</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Enter admin password"
                autoFocus
              />
              {loginError && <p className="text-red-500 text-xs mt-1">{loginError}</p>}
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition-colors"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SpeedboatIcon className="w-7 h-7" />
            <div>
              <h1 className="font-bold text-gray-800">Speedboat Directory</h1>
              <p className="text-xs text-gray-500">Admin Panel</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href="/" target="_blank" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View Site →
            </a>
            <button
              onClick={handleNew}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <span>+</span> Add Operator
            </button>
            <button
              onClick={() => {
                sessionStorage.removeItem('admin-auth')
                setAuthed(false)
              }}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {showForm ? (
          <OperatorForm
            operator={editingOperator}
            onClose={handleFormClose}
            onSaved={fetchOperators}
          />
        ) : (
          <OperatorList
            operators={operators}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>
    </div>
  )
}
