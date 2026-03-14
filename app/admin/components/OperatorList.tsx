'use client'

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
  isFeatured: boolean
  routes: Route[]
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

interface Props {
  operators: Operator[]
  loading: boolean
  onEdit: (op: Operator) => void
  onDelete: (id: string) => void
  onToggleFeatured?: (op: Operator) => void
}

export default function OperatorList({ operators, loading, onEdit, onDelete, onToggleFeatured }: Props) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl h-24 animate-pulse" />
        ))}
      </div>
    )
  }

  if (operators.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="mb-4 flex justify-center"><SpeedboatIcon className="w-14 h-14" color="blue" /></div>
        <p className="text-gray-500 dark:text-gray-400">No operators yet. Add one to get started!</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500 dark:text-gray-400">{operators.length} operator{operators.length !== 1 ? 's' : ''}</p>
      {operators.map((op) => {
        const sortedRoutes = [...op.routes].sort((a, b) => a.order - b.order)
        return (
          <div key={op.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-4 flex items-center gap-4 shadow-sm">
            {/* Logo */}
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-slate-700 flex items-center justify-center shrink-0 overflow-hidden">
              {op.logoUrl ? (
                <Image src={op.logoUrl} alt="" width={48} height={48} className="w-full h-full object-contain" unoptimized />
              ) : (
                <SpeedboatIcon className="w-7 h-7" color="blue" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-gray-800 dark:text-white text-sm">{op.name}</h3>
                <span className="text-xs text-gray-400">·</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{op.boatName}</span>
                {!op.isActive && (
                  <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full">Inactive</span>
                )}
                {op.isFeatured && (
                  <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full">⭐ Featured</span>
                )}
              </div>
              
              {/* Routes summary */}
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 space-y-0.5">
                {sortedRoutes.map((route, ri) => {
                  const sortedStops = [...route.stops].sort((a, b) => a.order - b.order)
                  const routeName = route.routeName ? `${route.routeName}: ` : ''
                  const stops = sortedStops.map(s => s.island).join(' → ')
                  return (
                    <div key={ri}>
                      <span className="font-medium">{routeName}</span>{stops}
                      {route.schedule && (
                        <span className="text-gray-400 ml-1">
                          ({JSON.parse(route.schedule.daysOfWeek).map((d: number) => DAY_NAMES[d]).join(', ')})
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {onToggleFeatured && (
                <button
                  onClick={() => onToggleFeatured(op)}
                  className={`text-sm px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    op.isFeatured
                      ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/50'
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {op.isFeatured ? '⭐ Unfeature' : '⭐ Feature'}
                </button>
              )}
              <button
                onClick={() => onEdit(op)}
                className="text-sm bg-blue-50 dark:bg-slate-700 hover:bg-blue-100 dark:hover:bg-slate-600 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-lg font-medium transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(op.id)}
                className="text-sm bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 px-3 py-1.5 rounded-lg font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
