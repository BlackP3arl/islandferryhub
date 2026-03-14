'use client'

interface RouteStop {
  id: string
  island: string
  order: number
}

interface RouteDisplayProps {
  stops: RouteStop[]
}

export default function RouteDisplay({ stops }: RouteDisplayProps) {
  const sorted = [...stops].sort((a, b) => a.order - b.order)

  return (
    <div className="flex items-center flex-wrap gap-y-1.5">
      {sorted.map((stop, index) => (
        <div key={stop.id} className="flex items-center">
          <div className="flex items-center gap-1.5">
            <div
              className={`
                w-2 h-2 rounded-full shrink-0
                ${index === 0
                  ? 'bg-blue-500'
                  : index === sorted.length - 1
                  ? 'bg-teal-500'
                  : 'bg-gray-300 dark:bg-gray-600'}
              `}
            />
            <span className={`text-xs font-medium whitespace-nowrap ${
              index === 0 || index === sorted.length - 1 ? 'text-gray-800 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'
            }`}>
              {stop.island}
            </span>
          </div>
          {index < sorted.length - 1 && (
            <svg className="w-4 h-4 text-gray-300 dark:text-gray-600 mx-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          )}
        </div>
      ))}
    </div>
  )
}
