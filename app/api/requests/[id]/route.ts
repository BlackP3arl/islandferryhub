import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function checkAuth(request: NextRequest) {
  const authHeader = request.headers.get('x-admin-password')
  return authHeader === process.env.ADMIN_PASSWORD
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()
  const { status } = body

  const featureRequest = await prisma.featureRequest.update({
    where: { id },
    data: { status },
  })

  return NextResponse.json(featureRequest)
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  await prisma.featureRequest.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
