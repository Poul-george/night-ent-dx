import { prisma } from '@/client/db'
import { NextRequest, NextResponse } from 'next/server'
import { Store } from '@/types/type'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;
    const storeData = await prisma.store.findFirst({
      where: {
        id: Number(id),
      },
      select: {
        id: true,
        name: true,
        address: true,
        createdAt: true,
      },
    })

    if (!storeData) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    const storeRes: Store = {
      id: storeData.id,
      name: storeData.name,
      address: storeData.address,
      createdAt: storeData.createdAt,
    }

    return NextResponse.json(storeRes)
  } catch (error) {
    console.error('Error fetching store:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
} 