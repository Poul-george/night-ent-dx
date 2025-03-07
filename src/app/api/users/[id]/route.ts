import { prisma } from '@/client/db'
import { NextRequest, NextResponse } from 'next/server'
import { User } from '@/types/type'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;
    const userData = await prisma.user.findFirst({
      where: {
        id: Number(id),
      },
      select: {
        id: true,
        name: true,
        email: true,
        storeId: true,
        createdAt: true,
      },
    })

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userRes: User = {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      storeId: userData.storeId,
      createdAt: userData.createdAt,
    }

    return NextResponse.json(userRes)
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
} 