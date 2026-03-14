import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { name, email, mobile, message } = body

  if (!name || !email || !mobile) {
    return NextResponse.json({ error: 'Name, email, and mobile are required' }, { status: 400 })
  }

  const featureRequest = await prisma.featureRequest.create({
    data: {
      name,
      email,
      mobile,
      message: message || null,
    },
  })

  return NextResponse.json(featureRequest)
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')

  const requests = await prisma.featureRequest.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(requests)
}
