import { prisma } from '@/client/db'
import { NextRequest, NextResponse } from 'next/server'
import { Cast } from '@/types/type'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const storeId = (await params).id;
    const castsData = await prisma.cast.findMany({
      where: {
        storeId: Number(storeId),
        deletedAt: null,
      },
      select: {
        id: true,
        storeId: true,
        name: true,
        salarySystem: true,
        monthlySalary: true,
        hourlyWage: true,
        backSetting: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    const casts: Cast[] = castsData.map(cast => ({
      id: cast.id,
      storeId: cast.storeId,
      name: cast.name,
      salarySystem: cast.salarySystem,
      monthlySalary: cast.monthlySalary ? Number(cast.monthlySalary) : null,
      hourlyWage: cast.hourlyWage ? Number(cast.hourlyWage) : null,
      backSetting: cast.backSetting,
      createdAt: cast.createdAt,
    }))

    console.log(casts)

    return NextResponse.json(casts)
  } catch (error) {
    console.error('Error fetching casts:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
} 