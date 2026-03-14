import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || ''

  const operators = await prisma.operator.findMany({
    where: {
      isActive: true,
      ...(search
        ? {
            OR: [
              { name: { contains: search } },
              { boatName: { contains: search } },
              { routes: { some: { stops: { some: { island: { contains: search } } } } } },
            ],
          }
        : {}),
    },
    include: {
      routes: {
        orderBy: { order: 'asc' },
        include: {
          stops: { orderBy: { order: 'asc' } },
          schedule: true,
        },
      },
    },
    orderBy: { name: 'asc' },
  })

  return NextResponse.json(operators)
}

export async function POST(request: NextRequest) {
  // Check admin auth
  const authHeader = request.headers.get('x-admin-password')
  if (authHeader !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { name, boatName, logoUrl, contactNumber, liveLocationUrl, ticketingUrl, routes } = body

  // routes is an array of: { routeName, stops: [islands], schedule: { days: [nums], times: [strings] } }

  const operator = await prisma.operator.create({
    data: {
      name,
      boatName,
      logoUrl: logoUrl || null,
      contactNumber,
      liveLocationUrl: liveLocationUrl || null,
      ticketingUrl: ticketingUrl || null,
      routes: {
        create: routes.map((route: any, routeIndex: number) => ({
          routeName: route.routeName || null,
          order: routeIndex,
          stops: {
            create: route.stops.map((island: string, stopIndex: number) => ({
              island,
              order: stopIndex,
            })),
          },
          schedule: {
            create: {
              departureTimes: JSON.stringify(route.schedule.times || []),
              daysOfWeek: JSON.stringify(route.schedule.days || []),
            },
          },
        })),
      },
    },
    include: {
      routes: {
        orderBy: { order: 'asc' },
        include: {
          stops: { orderBy: { order: 'asc' } },
          schedule: true,
        },
      },
    },
  })

  return NextResponse.json(operator)
}
