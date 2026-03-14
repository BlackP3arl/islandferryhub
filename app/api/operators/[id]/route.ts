import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function checkAuth(request: NextRequest) {
  const authHeader = request.headers.get('x-admin-password')
  return authHeader === process.env.ADMIN_PASSWORD
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()
  const { isFeatured, featuredExpiry } = body

  const operator = await prisma.operator.update({
    where: { id },
    data: {
      isFeatured: isFeatured ?? false,
      featuredExpiry: featuredExpiry ?? null,
    },
  })

  return NextResponse.json(operator)
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const operator = await prisma.operator.findUnique({
    where: { id },
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
  if (!operator) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(operator)
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()
  const { name, boatName, logoUrl, contactNumber, liveLocationUrl, ticketingUrl, routes, isActive } = body

  // First get existing routes to delete their related data
  const existingRoutes = await prisma.route.findMany({ where: { operatorId: id } })
  
  // Delete related data in correct order
  for (const route of existingRoutes) {
    await prisma.schedule.deleteMany({ where: { routeId: route.id } })
    await prisma.routeStop.deleteMany({ where: { routeId: route.id } })
  }
  await prisma.route.deleteMany({ where: { operatorId: id } })

  // Recreate routes with new data
  const operator = await prisma.operator.update({
    where: { id },
    data: {
      name,
      boatName,
      logoUrl: logoUrl || null,
      contactNumber,
      liveLocationUrl: liveLocationUrl || null,
      ticketingUrl: ticketingUrl || null,
      isActive: isActive ?? true,
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
              departureTimes: JSON.stringify(route.schedule?.times || []),
              daysOfWeek: JSON.stringify(route.schedule?.days || []),
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

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  
  // Delete related data first
  const routes = await prisma.route.findMany({ where: { operatorId: id } })
  for (const route of routes) {
    await prisma.schedule.deleteMany({ where: { routeId: route.id } })
    await prisma.routeStop.deleteMany({ where: { routeId: route.id } })
  }
  await prisma.route.deleteMany({ where: { operatorId: id } })
  
  await prisma.operator.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
