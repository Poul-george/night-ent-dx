import { prisma } from '@/client/db';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;
    
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'リクエストの形式が不正です' },
        { status: 400 }
      );
    }
    
    // 必須フィールドの検証
    if (!body || !body.name || body.salarySystem === undefined || body.backSetting === undefined) {
      return NextResponse.json(
        { error: '必須項目が不足しています' },
        { status: 400 }
      );
    }
    
    // 給与体系に応じた検証
    if (body.salarySystem === 0 && !body.monthlySalary) {
      return NextResponse.json(
        { error: '月給が指定されていません' },
        { status: 400 }
      );
    }
    
    if (body.salarySystem === 1 && !body.hourlyWage) {
      return NextResponse.json(
        { error: '時給が指定されていません' },
        { status: 400 }
      );
    }

    // キャストを更新
    const updatedCast = await prisma.cast.update({
      where: { id: Number(id) },
      data: {
        name: body.name,
        salarySystem: Number(body.salarySystem),
        backSetting: Number(body.backSetting),
        monthlySalary: body.salarySystem === 0 ? Number(body.monthlySalary) : null,
        hourlyWage: body.salarySystem === 1 ? Number(body.hourlyWage) : null,
      },
    });

    return NextResponse.json(updatedCast);
  } catch (error) {
    console.error('Error updating cast:', error);
    return NextResponse.json(
      { error: 'キャストの更新に失敗しました: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
} 
