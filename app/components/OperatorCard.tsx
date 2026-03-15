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
  hasFixedSchedule: boolean
  socialLinks: string
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
                unoptimized
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
          
          {/* Parse social links */}
          {(() => {
            const social = (() => {
              try { return JSON.parse(operator.socialLinks || '{}') } catch { return {} }
            })()
            const hasSocialLinks = social.whatsapp || social.facebook || social.viber
            const hasFixedTimes = sortedRoutes.some(r => r.schedule && (JSON.parse(r.schedule.departureTimes).length > 0))
            
            // Show schedule if has fixed schedule AND has times
            if (operator.hasFixedSchedule && hasFixedTimes) {
              return (
                <div className="space-y-3">
                  {sortedRoutes.map((route) => (
                    <RouteWithSchedule key={route.id} route={route} />
                  ))}
                </div>
              )
            }
            
            // Show social links message
            if (hasSocialLinks) {
              return (
                <div className="space-y-2">
                  <p className="text-xs text-center py-2 px-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/30 rounded-lg text-blue-700 dark:text-blue-300">
                    Check schedule on:
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {social.whatsapp && (
                      <a href={social.whatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 border border-green-200 dark:border-green-700/30 px-3 py-1.5 rounded-lg">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                        WhatsApp
                      </a>
                    )}
                    {social.facebook && (
                      <a href={social.facebook} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 border border-blue-200 dark:border-blue-700/30 px-3 py-1.5 rounded-lg">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                        Facebook
                      </a>
                    )}
                    {social.viber && (
                      <a href={social.viber} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/40 border border-purple-200 dark:border-purple-700/30 px-3 py-1.5 rounded-lg">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12.002 0C5.376 0 0 5.164 0 11.54c0 4.535 2.605 8.6 6.518 10.618l-1.34 4.683c-.112.392.18.783.573.783l2.867-.026c.357-.003.623-.3.623-.663v-3.19c1.902-.21 3.61-.907 5.004-1.96 1.505 1.797 3.78 2.867 6.33 2.867 6.627 0 12.002-5.164 12.002-11.54S18.63 0 12.002 0zm3.66 16.523c-.238.656-.855 1.395-1.61 1.945-.755.55-1.59.935-2.457 1.142l-.36.086c-.43.103-.863.103-1.293 0l-.36-.086c-.867-.207-1.702-.592-2.457-1.142-.755-.55-1.372-1.29-1.61-1.945-.238-.655-.17-1.322.17-1.945.34-.624 1.03-1.167 1.767-1.573.737-.406 1.592-.674 2.488-.777l.37-.043c.428-.047.857-.047 1.285 0l.37.043c.896.103 1.751.37 2.488.777.737.406 1.427.95 1.767 1.573.34.623.408 1.29.17 1.945z"/></svg>
                        Viber
                      </a>
                    )}
                  </div>
                </div>
              )
            }
            
            // Fallback to ticketing URL
            if (operator.ticketingUrl) {
              return (
                <a href={operator.ticketingUrl} target="_blank" rel="noopener noreferrer" className="block text-xs text-center py-3 px-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/30 rounded-lg text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors">
                  Please visit the operator&apos;s booking page to view schedule and make booking
                </a>
              )
            }
            
            return <p className="text-xs text-gray-400">No schedule available</p>
          })()}
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
