'use client'

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

interface Schedule {
  id: string
  departureTimes: string
  daysOfWeek: string
}

interface ScheduleDisplayProps {
  schedules: Schedule[]
}

export default function ScheduleDisplay({ schedules }: ScheduleDisplayProps) {
  return (
    <div className="space-y-2.5">
      {schedules.map((schedule) => {
        const times: string[] = JSON.parse(schedule.departureTimes)
        const days: number[] = JSON.parse(schedule.daysOfWeek)

        return (
          <div key={schedule.id} className="space-y-1.5">
            <div className="flex flex-wrap gap-1">
              {DAY_NAMES.map((day, i) => (
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
              ))}
            </div>
            {times.length > 0 && (
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
            )}
          </div>
        )
      })}
    </div>
  )
}
