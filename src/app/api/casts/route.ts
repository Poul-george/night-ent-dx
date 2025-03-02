import { prisma } from '@/client/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (e) {
      console.error('Error parsing JSON:', e);
      return NextResponse.json(
        { error: 'リクエストの形式が不正です' },
        { status: 400 }
      );
    }
    
    if (!body || !body.name || body.salarySystem === undefined || body.backSetting === undefined || !body.storeId) {
      return NextResponse.json(
        { error: '必須項目が不足しています' },
        { status: 400 }
      );
    }
    
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

    const newCast = await prisma.cast.create({
      data: {
        name: body.name,
        storeId: Number(body.storeId), // 数値型に変換
        salarySystem: Number(body.salarySystem), // 数値型に変換
        backSetting: Number(body.backSetting), // 数値型に変換
        monthlySalary: body.monthlySalary ? Number(body.monthlySalary) : undefined,
        hourlyWage: body.hourlyWage ? Number(body.hourlyWage) : undefined,
      }
    });

    return NextResponse.json(newCast, { status: 201 });
  } catch (error) {
    console.error('Error creating cast:', error);
    return NextResponse.json(
      { error: 'キャストの作成に失敗しました: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
} 
