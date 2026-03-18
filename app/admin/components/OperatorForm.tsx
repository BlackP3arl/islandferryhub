'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import SpeedboatIcon from '../../components/SpeedboatIcon'

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
  hasFixedSchedule: boolean
  socialLinks: string
  routes: Route[]
}

interface RouteInput {
  routeName: string
  stops: string[]
  schedule: {
    daysOfWeek: number[]
    departureTimes: string[]
    newTime: string
  }
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

interface Props {
  operator: Operator | null
  onClose: () => void
  onSaved: () => void
}

export default function OperatorForm({ operator, onClose, onSaved }: Props) {
  const [name, setName] = useState(operator?.name || '')
  const [boatName, setBoatName] = useState(operator?.boatName || '')
  const [contactNumber, setContactNumber] = useState(operator?.contactNumber || '')
  const [liveLocationUrl, setLiveLocationUrl] = useState(operator?.liveLocationUrl || '')
  const [ticketingUrl, setTicketingUrl] = useState(operator?.ticketingUrl || '')
  const [logoUrl, setLogoUrl] = useState(operator?.logoUrl || '')
  const [isActive, setIsActive] = useState(operator?.isActive ?? true)
  const [hasFixedSchedule, setHasFixedSchedule] = useState(operator?.hasFixedSchedule ?? true)
  
  // Social links state
  const [socialLinks, setSocialLinks] = useState<{whatsapp: string; facebook: string; viber: string}>(() => {
    if (operator?.socialLinks) {
      try {
        return JSON.parse(operator.socialLinks)
      } catch { return { whatsapp: '', facebook: '', viber: '' } }
    }
    return { whatsapp: '', facebook: '', viber: '' }
  })

  // Routes - each with stops and schedule
  const [routes, setRoutes] = useState<RouteInput[]>(() => {
    if (!operator?.routes.length) {
      // Start with one empty route
      return [{
        routeName: '',
        stops: [''],
        schedule: { daysOfWeek: [0, 1, 2, 3, 4, 5, 6], departureTimes: [], newTime: '' }
      }]
    }
    
    // Convert existing routes to input format
    return operator.routes.map(route => {
      const sortedStops = [...route.stops].sort((a, b) => a.order - b.order)
      // Skip Male' (first stop) since it's always added automatically
      const stopList = sortedStops.slice(1).map(s => s.island)
      
      return {
        routeName: route.routeName || '',
        stops: stopList.length > 0 ? stopList : [''],
        schedule: {
          daysOfWeek: route.schedule ? JSON.parse(route.schedule.daysOfWeek) : [0, 1, 2, 3, 4, 5, 6],
          departureTimes: route.schedule ? JSON.parse(route.schedule.departureTimes) : [],
          newTime: ''
        }
      }
    })
  })

  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    const pw = sessionStorage.getItem('admin-auth') || ''
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'x-admin-password': pw },
      body: fd,
    })
    const data = await res.json()
    setLogoUrl(data.url)
    setUploading(false)
  }

  // Route management
  function addRoute() {
    setRoutes([...routes, {
      routeName: '',
      stops: [''],
      schedule: { daysOfWeek: [0, 1, 2, 3, 4, 5, 6], departureTimes: [], newTime: '' }
    }])
  }

  function removeRoute(index: number) {
    if (routes.length === 1) return // Keep at least one route
    setRoutes(routes.filter((_, i) => i !== index))
  }

  function updateRouteName(index: number, value: string) {
    const updated = [...routes]
    updated[index].routeName = value
    setRoutes(updated)
  }

  // Stop management for a specific route
  function addStop(routeIndex: number) {
    const updated = [...routes]
    updated[routeIndex].stops.push('')
    setRoutes(updated)
  }

  function updateStop(routeIndex: number, stopIndex: number, value: string) {
    const updated = [...routes]
    updated[routeIndex].stops[stopIndex] = value
    setRoutes(updated)
  }

  function removeStop(routeIndex: number, stopIndex: number) {
    const updated = [...routes]
    updated[routeIndex].stops = updated[routeIndex].stops.filter((_, i) => i !== stopIndex)
    setRoutes(updated)
  }

  // Schedule management for a specific route
  function toggleDay(routeIndex: number, day: number) {
    const updated = [...routes]
    const schedule = updated[routeIndex].schedule
    if (schedule.daysOfWeek.includes(day)) {
      schedule.daysOfWeek = schedule.daysOfWeek.filter(d => d !== day)
    } else {
      schedule.daysOfWeek = [...schedule.daysOfWeek, day].sort()
    }
    setRoutes(updated)
  }

  function addTime(routeIndex: number) {
    const updated = [...routes]
    const schedule = updated[routeIndex].schedule
    const timeVal = schedule.newTime?.trim()
    if (!timeVal) return
    if (!schedule.departureTimes.includes(timeVal)) {
      schedule.departureTimes = [...schedule.departureTimes, timeVal].sort()
      schedule.newTime = ''
    }
    setRoutes(updated)
  }

  function removeTime(routeIndex: number, time: string) {
    const updated = [...routes]
    updated[routeIndex].schedule.departureTimes = 
      updated[routeIndex].schedule.departureTimes.filter(t => t !== time)
    setRoutes(updated)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!name || !boatName || !contactNumber) {
      setError('Name, boat name, and contact number are required.')
      return
    }

    // Validate routes
    const validRoutes = routes.filter(r => r.stops.some(s => s.trim()))
    if (validRoutes.length === 0) {
      setError('At least one route with destination islands is required.')
      return
    }

    setSaving(true)
    const pw = sessionStorage.getItem('admin-auth') || ''
    
    // Build payload with new structure
    const payload = {
      name,
      boatName,
      contactNumber,
      logoUrl: logoUrl || null,
      liveLocationUrl: liveLocationUrl || null,
      ticketingUrl: ticketingUrl || null,
      isActive,
      hasFixedSchedule,
      socialLinks: JSON.stringify(socialLinks),
      routes: validRoutes.map(route => ({
        routeName: route.routeName || null,
        stops: route.stops.filter(s => s.trim()),
        schedule: {
          days: route.schedule.daysOfWeek,
          times: route.schedule.departureTimes
        }
      }))
    }

    const url = operator ? `/api/operators/${operator.id}` : '/api/operators'
    const method = operator ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', 'x-admin-password': pw },
      body: JSON.stringify(payload),
    })

    if (res.ok) {
      onSaved()
      onClose()
    } else {
      try {
        const data = await res.json()
        setError(data.error || 'Failed to save')
      } catch {
        setError('Failed to save. Please try again.')
      }
    }
    setSaving(false)
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
      {/* Form header */}
      <div className="border-b border-gray-100 dark:border-slate-700 p-4 flex items-center justify-between">
        <h2 className="font-bold text-gray-800 dark:text-white">
          {operator ? `Edit: ${operator.name}` : 'Add New Operator'}
        </h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-sm">
          ← Back
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-xl">{error}</div>
        )}

        {/* Basic Info */}
        <section>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">Basic Info</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Operator / Resort Name *</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full border border-gray-200 dark:border-slate-600 rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="e.g. Maafushi Speedboat Co."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Boat Name *</label>
              <input
                value={boatName}
                onChange={e => setBoatName(e.target.value)}
                className="w-full border border-gray-200 dark:border-slate-600 rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="e.g. Sea Eagle 1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Number *</label>
              <input
                value={contactNumber}
                onChange={e => setContactNumber(e.target.value)}
                className="w-full border border-gray-200 dark:border-slate-600 rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="e.g. +960 337 8801"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Active</label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={e => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">Show on website</span>
              </label>
            </div>
          </div>
        </section>

        {/* Schedule Options */}
        <section>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">Schedule Type</h3>
          <div className="space-y-4">
            {/* Fixed schedule toggle */}
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="hasFixedSchedule"
                  checked={hasFixedSchedule === true}
                  onChange={() => setHasFixedSchedule(true)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Has fixed schedule</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="hasFixedSchedule"
                  checked={hasFixedSchedule === false}
                  onChange={() => setHasFixedSchedule(false)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">No fixed schedule</span>
              </label>
            </div>

            {/* Social links - show if no fixed schedule OR always show as optional */}
            <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-4 space-y-3">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {hasFixedSchedule ? 'Also share schedule via (optional):' : 'Where to find schedule:'}
              </p>
              
              {/* WhatsApp */}
              <div className="flex items-center gap-2">
                <span className="text-sm w-20 text-gray-600 dark:text-gray-400">WhatsApp</span>
                <input
                  type="url"
                  value={socialLinks.whatsapp}
                  onChange={e => setSocialLinks({ ...socialLinks, whatsapp: e.target.value })}
                  className="flex-1 border border-gray-200 dark:border-slate-600 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  placeholder="https://chat.whatsapp.com/..."
                />
              </div>
              
              {/* Facebook */}
              <div className="flex items-center gap-2">
                <span className="text-sm w-20 text-gray-600 dark:text-gray-400">Facebook</span>
                <input
                  type="url"
                  value={socialLinks.facebook}
                  onChange={e => setSocialLinks({ ...socialLinks, facebook: e.target.value })}
                  className="flex-1 border border-gray-200 dark:border-slate-600 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  placeholder="https://facebook.com/..."
                />
              </div>
              
              {/* Viber */}
              <div className="flex items-center gap-2">
                <span className="text-sm w-20 text-gray-600 dark:text-gray-400">Viber</span>
                <input
                  type="url"
                  value={socialLinks.viber}
                  onChange={e => setSocialLinks({ ...socialLinks, viber: e.target.value })}
                  className="flex-1 border border-gray-200 dark:border-slate-600 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  placeholder="https://viber.com/..."
                />
              </div>
            </div>
          </div>
        </section>

        {/* Logo */}
        <section>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">Logo</h3>
          <div className="flex items-center gap-4 mb-3">
            <div className="w-16 h-16 rounded-xl bg-blue-50 dark:bg-slate-700 flex items-center justify-center overflow-hidden shrink-0">
              {logoUrl ? (
                <Image src={logoUrl} alt="Logo" width={64} height={64} className="w-full h-full object-contain" unoptimized />
              ) : (
                <SpeedboatIcon className="w-10 h-10" color="blue" />
              )}
            </div>
            <div>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="text-sm bg-blue-50 dark:bg-slate-600 hover:bg-blue-100 dark:hover:bg-slate-500 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-xl font-medium transition-colors"
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Upload Logo'}
              </button>
              {logoUrl && (
                <button type="button" onClick={() => setLogoUrl('')} className="ml-2 text-sm text-red-500 hover:text-red-700">
                  Remove
                </button>
              )}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Or paste a logo URL</label>
            <input
              value={logoUrl?.startsWith('/uploads') ? '' : logoUrl}
              onChange={e => setLogoUrl(e.target.value)}
              className="w-full border border-gray-200 dark:border-slate-600 rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="https://example.com/logo.png"
            />
          </div>
        </section>

        {/* Routes */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Routes</h3>
            <button
              type="button"
              onClick={addRoute}
              className="text-sm bg-teal-50 dark:bg-teal-900/30 hover:bg-teal-100 dark:hover:bg-teal-900/50 text-teal-700 dark:text-teal-300 px-3 py-1.5 rounded-xl font-medium"
            >
              + Add Route
            </button>
          </div>

          <div className="space-y-4">
            {routes.map((route, ri) => (
              <div key={ri} className="border border-gray-200 dark:border-slate-600 rounded-xl p-4 space-y-3">
                {/* Route name */}
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <input
                      value={route.routeName}
                      onChange={e => updateRouteName(ri, e.target.value)}
                      className="w-full border border-gray-200 dark:border-slate-600 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                      placeholder="Route name (optional, e.g. 'Morning Route', 'Express')"
                    />
                  </div>
                  {routes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRoute(ri)}
                      className="text-red-500 hover:text-red-700 text-sm px-2"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Stops for this route */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Destinations (after Male')
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {route.stops.map((stop, si) => (
                      <div key={si} className="flex items-center gap-1">
                        <input
                          value={stop}
                          onChange={e => updateStop(ri, si, e.target.value)}
                          className="border border-gray-200 dark:border-slate-600 rounded-lg px-2 py-1 text-sm w-28 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                          placeholder="Island name"
                        />
                        {route.stops.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeStop(ri, si)}
                            className="text-gray-400 hover:text-red-500 text-xs"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addStop(ri)}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      + Add stop
                    </button>
                  </div>
                </div>

                {/* Schedule for this route */}
                <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3">
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Schedule for this route
                  </label>
                  
                  {/* Days */}
                  <div className="flex flex-wrap gap-1 mb-2">
                    {DAY_NAMES.map((day, di) => (
                      <button
                        key={di}
                        type="button"
                        onClick={() => toggleDay(ri, di)}
                        className={`text-[10px] px-2 py-1 rounded font-semibold transition-colors ${
                          route.schedule.daysOfWeek.includes(di)
                            ? 'bg-gray-900 dark:bg-blue-600 text-white'
                            : 'bg-gray-200 dark:bg-slate-600 text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>

                  {/* Times */}
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="time"
                      value={route.schedule.newTime}
                      onChange={e => {
                        const updated = [...routes]
                        updated[ri].schedule.newTime = e.target.value
                        setRoutes(updated)
                      }}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addTime(ri)
                        }
                      }}
                      className="border border-gray-200 dark:border-slate-600 rounded-lg px-2 py-1 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => addTime(ri)}
                      className="text-xs bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 px-2 py-1 rounded-lg font-medium"
                    >
                      + Add Time
                    </button>
                    <span className="text-xs text-gray-400">or press Enter</span>
                  </div>
                  
                  {/* Added times */}
                  {route.schedule.departureTimes.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {route.schedule.departureTimes.map(time => (
                        <span
                          key={time}
                          className="inline-flex items-center gap-1 text-xs bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-500 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded font-mono"
                        >
                          {time}
                          <button
                            type="button"
                            onClick={() => removeTime(ri, time)}
                            className="text-gray-400 hover:text-red-500 ml-1"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Links */}
        <section>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">Links (Optional)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Live Location URL</label>
              <input
                value={liveLocationUrl}
                onChange={e => setLiveLocationUrl(e.target.value)}
                className="w-full border border-gray-200 dark:border-slate-600 rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="https://maps.app.goo.gl/..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ticketing URL</label>
              <input
                value={ticketingUrl}
                onChange={e => setTicketingUrl(e.target.value)}
                className="w-full border border-gray-200 dark:border-slate-600 rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="https://book.example.mv/..."
              />
            </div>
          </div>
        </section>

        {/* Submit */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving...' : operator ? 'Update Operator' : 'Add Operator'}
          </button>
        </div>
      </form>
    </div>
  )
}
