import { prisma } from '@/client/db'
import { NextRequest, NextResponse } from 'next/server'
import { Cast } from '@/types/type'
import { Prisma } from '@prisma/client'

// バリデーションも入れる
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;
    const url = new URL(request.url);
    const storeId = url.searchParams.get('storeId');

    // Prismaの型定義を使用して型安全に
    const whereCondition: Prisma.CastWhereInput = {
      id: Number(id),
      deletedAt: null,
    };

    // storeIdが指定されている場合は検索条件に追加
    if (storeId) {
      whereCondition.storeId = Number(storeId);
    }

    const castData = await prisma.cast.findFirst({
      where: whereCondition,
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
    })

    if (!castData) {
      return NextResponse.json({ error: 'Cast not found' }, { status: 404 })
    }

    const cast: Cast = {
      id: castData.id,
      storeId: castData.storeId,
      name: castData.name,
      salarySystem: castData.salarySystem,
      monthlySalary: castData.monthlySalary ? Number(castData.monthlySalary) : null,
      hourlyWage: castData.hourlyWage ? Number(castData.hourlyWage) : null,
      backSetting: castData.backSetting,
      createdAt: castData.createdAt.toISOString(),
    }

    return NextResponse.json(cast)
  } catch (error) {
    console.error('Error fetching cast:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
} 