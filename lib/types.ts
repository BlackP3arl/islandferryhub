export interface RouteStop {
  id: string
  island: string
  order: number
}

export interface Schedule {
  id: string
  departureTimes: string[]
  daysOfWeek: number[]
}

export interface Operator {
  id: string
  name: string
  boatName: string
  logoUrl: string | null
  contactNumber: string
  liveLocationUrl: string | null
  ticketingUrl: string | null
  isActive: boolean
  routes: RouteStop[]
  schedules: Schedule[]
}

export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
export const DAY_FULL_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
