'use client'

import Image from 'next/image'
import SpeedboatIcon from './SpeedboatIcon'

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
  routes: Route[]
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function RouteWithSchedule({ route }: { route: Route }) {
  const sortedStops = [...route.stops].sort((a, b) => a.order - b.order)
  const schedule = route.schedule
  
  return (
    <div className="space-y-2">
      {/* Route name if exists */}
      {route.routeName && (
        <p className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
          {route.routeName}
        </p>
      )}
      
      {/* Route stops */}
      <div className="flex items-center flex-wrap gap-y-1.5">
        {sortedStops.map((stop, index) => (
          <div key={stop.id} className="flex items-center">
            <div className="flex items-center gap-1.5">
              <div
                className={`
                  w-2 h-2 rounded-full shrink-0
                  ${index === 0
                    ? 'bg-blue-500'
                    : index === sortedStops.length - 1
                    ? 'bg-teal-500'
                    : 'bg-gray-300 dark:bg-gray-600'}
                `}
              />
              <span className={`text-xs font-medium whitespace-nowrap ${
                index === 0 || index === sortedStops.length - 1 ? 'text-gray-800 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'
              }`}>
                {stop.island}
              </span>
            </div>
            {index < sortedStops.length - 1 && (
              <svg className="w-4 h-4 text-gray-300 dark:text-gray-600 mx-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            )}
          </div>
        ))}
      </div>

      {/* Schedule for this route */}
      {schedule && (
        <div className="space-y-1">
          <div className="flex flex-wrap gap-1">
            {DAY_NAMES.map((day, i) => {
              const days: number[] = JSON.parse(schedule.daysOfWeek)
              return (
                <span
                  key={i}
                  className={`text-[10px] px-1.5 py-0.5 rounded font-semibold tracking-wide ${
                    days.includes(i)
                      ? 'bg-gray-900 dark:bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-300 dark:text-gray-500'
                  }`}
                >
                  {day}
                </span>
              )
            })}
          </div>
          {(() => {
            const times: string[] = JSON.parse(schedule.departureTimes)
            return times.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {times.map((time) => (
                  <span
                    key={time}
                    className="text-[11px] text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-slate-700/50 border border-gray-200/80 dark:border-slate-600/50 px-2 py-0.5 rounded font-mono"
                  >
                    {time}
                  </span>
                ))}
              </div>
            ) : null
          })()}
        </div>
      )}
    </div>
  )
}

export default function OperatorCard({ operator }: { operator: Operator }) {
  const sortedRoutes = [...operator.routes].sort((a, b) => a.order - b.order)

  return (
    <div className="group bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/80 dark:border-slate-700/60 hover:border-blue-200 dark:hover:border-blue-500/50 hover:shadow-lg dark:hover:shadow-slate-900/50 transition-all duration-300 overflow-hidden">
      {/* Header */}
      <div className="p-5 pb-3">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-50 to-teal-50 dark:from-blue-900/30 dark:to-teal-900/30 border border-blue-100/50 dark:border-blue-700/30 flex items-center justify-center shrink-0 overflow-hidden">
            {operator.logoUrl ? (
              <Image
                src={operator.logoUrl}
                alt={`${operator.name} logo`}
                width={44}
                height={44}
                className="w-full h-full object-contain"
                unoptimized={operator.logoUrl.startsWith('http')}
              />
            ) : (
              <SpeedboatIcon className="w-6 h-6" color="blue" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-[15px] font-semibold text-gray-900 dark:text-white leading-snug truncate">{operator.name}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{operator.boatName}</p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-5 h-px bg-gray-100 dark:bg-slate-700" />

      {/* Body */}
      <div className="p-5 pt-3.5 space-y-4">
        {/* Routes with schedules */}
        <div>
          <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Routes & Schedules</p>
          
          {/* Check if any route has a schedule */}
          {sortedRoutes.some(r => r.schedule && (JSON.parse(r.schedule.departureTimes).length > 0)) ? (
            <div className="space-y-3">
              {sortedRoutes.map((route) => (
                <RouteWithSchedule key={route.id} route={route} />
              ))}
            </div>
          ) : operator.ticketingUrl ? (
            <a
              href={operator.ticketingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-xs text-center py-3 px-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/30 rounded-lg text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
            >
              Please visit the operator&apos;s booking page to view schedule and make booking
            </a>
          ) : (
            <p className="text-xs text-gray-400">No schedule available</p>
          )}
        </div>

        {/* Contact & Links */}
        <div className="flex items-center flex-wrap gap-2 pt-1">
          <a
            href={`tel:${operator.contactNumber}`}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-slate-700/50 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-200/80 dark:border-slate-600/50 px-3 py-1.5 rounded-lg transition-colors"
          >
            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            {operator.contactNumber}
          </a>

          {operator.liveLocationUrl && (
            <a
              href={operator.liveLocationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 border border-blue-200/60 dark:border-blue-700/30 px-3 py-1.5 rounded-lg transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Live
            </a>
          )}

          {operator.ticketingUrl && (
            <a
              href={operator.ticketingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 hover:bg-teal-100 dark:hover:bg-teal-900/40 border border-teal-200/60 dark:border-teal-700/30 px-3 py-1.5 rounded-lg transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
              Book
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
