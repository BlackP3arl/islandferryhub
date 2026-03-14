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
  isFeatured: boolean
  routes: Route[]
}

interface FeatureRequest {
  id: string
  name: string
  email: string
  mobile: string
  message: string | null
  status: string
  createdAt: string
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [operators, setOperators] = useState<Operator[]>([])
  const [editingOperator, setEditingOperator] = useState<Operator | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'operators' | 'requests'>('operators')
  const [requests, setRequests] = useState<FeatureRequest[]>([])
  const [loadingRequests, setLoadingRequests] = useState(false)

  // Check session storage for saved auth
  useEffect(() => {
    const saved = sessionStorage.getItem('admin-auth')
    if (saved) {
      setAuthed(true)
    }
  }, [])

  useEffect(() => {
    if (authed) {
      fetchOperators()
      fetchRequests()
    }
  }, [authed])

  async function fetchRequests() {
    setLoadingRequests(true)
    const pw = sessionStorage.getItem('admin-auth') || ''
    const res = await fetch('/api/requests', {
      headers: { 'x-admin-password': pw }
    })
    const data = await res.json()
    setRequests(data)
    setLoadingRequests(false)
  }

  async function updateRequestStatus(id: string, status: string) {
    const pw = sessionStorage.getItem('admin-auth') || ''
    await fetch(`/api/requests/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'x-admin-password': pw 
      },
      body: JSON.stringify({ status }),
    })
    fetchRequests()
  }

  async function deleteRequest(id: string) {
    if (!confirm('Delete this request?')) return
    const pw = sessionStorage.getItem('admin-auth') || ''
    await fetch(`/api/requests/${id}`, {
      method: 'DELETE',
      headers: { 'x-admin-password': pw }
    })
    fetchRequests()
  }

  async function fetchOperators() {
    setLoading(true)
    const res = await fetch('/api/operators')
    const data = await res.json()
    setOperators(data)
    setLoading(false)
  }

  async function toggleFeatured(op: Operator) {
    const pw = sessionStorage.getItem('admin-auth') || ''
    await fetch(`/api/operators/${op.id}`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'x-admin-password': pw 
      },
      body: JSON.stringify({ isFeatured: !op.isFeatured }),
    })
    fetchOperators()
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
            
            {/* Tabs */}
            <div className="flex items-center bg-gray-100 dark:bg-slate-700 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setActiveTab('operators')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'operators'
                    ? 'bg-white dark:bg-slate-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Operators
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('requests')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors relative ${
                  activeTab === 'requests'
                    ? 'bg-white dark:bg-slate-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Requests
                {requests.filter(r => r.status === 'pending').length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                    {requests.filter(r => r.status === 'pending').length}
                  </span>
                )}
              </button>
            </div>

            {activeTab === 'operators' && (
              <button
                onClick={handleNew}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <span>+</span> Add Operator
              </button>
            )}
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
        {activeTab === 'operators' ? (
          showForm ? (
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
              onToggleFeatured={toggleFeatured}
            />
          )
        ) : (
          /* Requests Tab */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">Feature Requests</h2>
              <button
                onClick={fetchRequests}
                className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                Refresh
              </button>
            </div>
            
            {loadingRequests ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white dark:bg-slate-800 rounded-xl h-24 animate-pulse" />
                ))}
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl">
                <p className="text-gray-500 dark:text-gray-400">No requests yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {requests.map((req) => (
                  <div
                    key={req.id}
                    className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-800 dark:text-white">{req.name}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            req.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                            req.status === 'contacted' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                            req.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                            'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                          }`}>
                            {req.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{req.email}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{req.mobile}</p>
                        {req.message && (
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 italic">"{req.message}"</p>
                        )}
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(req.createdAt).toLocaleDateString()} {new Date(req.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          value={req.status}
                          onChange={(e) => updateRequestStatus(req.id, e.target.value)}
                          className="text-sm border border-gray-200 dark:border-slate-600 rounded-lg px-2 py-1 bg-white dark:bg-slate-700 text-gray-800 dark:text-white"
                        >
                          <option value="pending">Pending</option>
                          <option value="contacted">Contacted</option>
                          <option value="completed">Completed</option>
                          <option value="rejected">Rejected</option>
                        </select>
                        <button
                          onClick={() => deleteRequest(req.id)}
                          className="text-sm text-red-500 hover:text-red-700 px-2"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
