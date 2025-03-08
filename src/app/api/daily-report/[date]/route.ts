import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/client/db';
import { CastDailyPerformance } from '@/types/type';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ date: string }> }
) {
  try {
    const { date } = await params;
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId');
    
    if (!storeId) {
      return NextResponse.json({ error: 'Store ID is required' }, { status: 400 });
    }
    
    // 日付をパース
    const performanceDate = new Date(date);
    
    // 指定された日付のパフォーマンスデータを取得（castIdの降順）
    const rawPerformances = await prisma.castDailyPerformance.findMany({
      where: {
        storeId: Number(storeId),
        performanceDate,
        deletedAt: null,
      },
      include: {
        cast: true,
      },
      orderBy: {
        castId: 'asc',
      },
    });
    
    const performances: CastDailyPerformance[] = rawPerformances.map(performance => {
      // 勤務時間と時間給与の計算（必要に応じて）
      const workHours = calculateWorkHours(performance.startTime, performance.endTime, Number(performance.overtime));
      const timeReward = calculateTimeReward(workHours, Number(performance.cast.hourlyWage));
      
      // 総控除額の計算
      const totalDeduction = 
        Number(performance.absenceDeduction || 0) + 
        Number(performance.soriDeduction || 0) + 
        Number(performance.tardinessDeduction || 0) + 
        Number(performance.otherDeductions || 0);
      
      // 総支給額の計算
      const totalPayment = 
        Number(timeReward || 0) + 
        Number(performance.drinkSubtotalBack || 0) + 
        Number(performance.bottleSubtotalBack || 0) + 
        Number(performance.foodSubtotalBack || 0) + 
        Number(performance.bonus || 0);
      
      // 残り支給額の計算
      const remainingPayment = totalPayment - Number(performance.dailyPayment || 0);

      // バック設定の場合はバック支給額を加算
      
      return {
        id: performance.id,
        castId: performance.castId,
        storeId: performance.storeId,
        performanceDate: performance.performanceDate,
        castName: performance.cast.name,
        startTime: performance.startTime,
        endTime: performance.endTime,
        overtime: Number(performance.overtime),
        workHours: workHours,
        hourlyRate: Number(performance.cast.hourlyWage),
        timeReward: timeReward,
        welfareCost: Number(performance.welfareCost),
        dailyPayment: Number(performance.dailyPayment),
        totalPayment: totalPayment,
        remainingPayment: remainingPayment,
        absenceDeduction: Number(performance.absenceDeduction),
        soriDeduction: Number(performance.soriDeduction),
        tardinessDeduction: Number(performance.tardinessDeduction),
        otherDeductions: Number(performance.otherDeductions),
        totalDeduction: totalDeduction,
        drinkSubtotal: Number(performance.drinkSubtotal),
        drinkSubtotalBack: Number(performance.drinkSubtotalBack),
        bottleSubtotal: Number(performance.bottleSubtotal),
        bottleSubtotalBack: Number(performance.bottleSubtotalBack),
        foodSubtotal: Number(performance.foodSubtotal),
        foodSubtotalBack: Number(performance.foodSubtotalBack),
        bonus: Number(performance.bonus)
      };
    });
    
    return NextResponse.json(performances);
  } catch (error) {
    console.error('Error fetching daily report:', error);
    return NextResponse.json({ error: 'Failed to fetch daily report' }, { status: 500 });
  }
}

// 勤務時間を計算する関数
function calculateWorkHours(startTime: string, endTime: string, overtime: number): string {
  // 時間を分に変換
  const startMinutes = timeToMinutes(startTime);
  let endMinutes = timeToMinutes(endTime);
  
  // 終了時間が開始時間より前の場合、翌日とみなす
  if (endMinutes < startMinutes) {
    endMinutes += 24 * 60; // 24時間分を加算
  }
  
  // 基本勤務時間（分）
  const baseWorkMinutes = endMinutes - startMinutes;
  
  // 時間外を加算
  const totalWorkMinutes = baseWorkMinutes + overtime;
  
  return minutesToTime(totalWorkMinutes);
}

// 時間給与を計算する関数
function calculateTimeReward(workHours: string, hourlyRate: number): number {
  const workMinutes = timeToMinutes(workHours);
  return Math.round((workMinutes / 60) * hourlyRate);
}

// 時間を分に変換する関数
function timeToMinutes(timeString: string): number {
  const [hours, minutes] = timeString.split(':').map(part => parseInt(part, 10));
  return (hours || 0) * 60 + (minutes || 0);
}

// 分を時間形式に変換する関数
function minutesToTime(totalMinutes: number): string {
  const hours = Math.floor(Math.abs(totalMinutes) / 60);
  const minutes = Math.abs(totalMinutes) % 60;
  const sign = totalMinutes < 0 ? '-' : '';
  return `${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ date: string }> }
) {
  try {
    const { date } = await params;
    const { performances } = await request.json();
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId');
    
    if (!storeId) {
      return NextResponse.json({ error: 'Store ID is required' }, { status: 400 });
    }
    
    // 日付をパース
    const performanceDate = new Date(date);
    
    // トランザクションで一括更新
    const result = await prisma.$transaction(
      performances.map((performance: CastDailyPerformance) => {
        // 既存のパフォーマンスデータを更新または新規作成
        return prisma.castDailyPerformance.upsert({
          where: {
            id: performance.id > 0 ? performance.id : 0, // 新規の場合は存在しないIDを指定
          },
          update: {
            startTime: performance.startTime,
            endTime: performance.endTime,
            overtime: performance.overtime,
            
            // 各種バック・ボーナス関連
            drinkSubtotal: performance.drinkSubtotal,
            drinkSubtotalBack: performance.drinkSubtotalBack,
            bottleSubtotal: performance.bottleSubtotal,
            bottleSubtotalBack: performance.bottleSubtotalBack,
            foodSubtotal: performance.foodSubtotal,
            foodSubtotalBack: performance.foodSubtotalBack,
            bonus: performance.bonus,
            
            // 日払い支給額関連
            welfareCost: performance.welfareCost,
            dailyPayment: performance.dailyPayment,
            
            // マイナス関連
            absenceDeduction: performance.absenceDeduction,
            soriDeduction: performance.soriDeduction,
            tardinessDeduction: performance.tardinessDeduction,
            otherDeductions: performance.otherDeductions,
          },
          create: {
            castId: performance.castId,
            storeId: Number(storeId),
            performanceDate,
            startTime: performance.startTime,
            endTime: performance.endTime,
            overtime: performance.overtime,
            
            // 各種バック・ボーナス関連
            drinkSubtotal: performance.drinkSubtotal,
            drinkSubtotalBack: performance.drinkSubtotalBack,
            bottleSubtotal: performance.bottleSubtotal,
            bottleSubtotalBack: performance.bottleSubtotalBack,
            foodSubtotal: performance.foodSubtotal,
            foodSubtotalBack: performance.foodSubtotalBack,
            bonus: performance.bonus,
            
            // 日払い支給額関連
            welfareCost: performance.welfareCost,
            dailyPayment: performance.dailyPayment,
            
            // マイナス関連
            absenceDeduction: performance.absenceDeduction,
            soriDeduction: performance.soriDeduction,
            tardinessDeduction: performance.tardinessDeduction,
            otherDeductions: performance.otherDeductions,
          },
        });
      })
    );
    
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Error saving daily report:', error);
    return NextResponse.json({ error: 'Failed to save daily report' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ date: string }> }
) {
  try {
    const { date } = await params;
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId');
    const castId = searchParams.get('castId');
    
    if (!storeId || !castId) {
      return NextResponse.json({ error: 'Store ID and Cast ID are required' }, { status: 400 });
    }
    
    // 日付をパース
    const performanceDate = new Date(date);
    
    // 論理削除（deletedAtを現在時刻に設定）
    const deletedPerformance = await prisma.castDailyPerformance.updateMany({
      where: {
        storeId: Number(storeId),
        castId: Number(castId),
        performanceDate,
        deletedAt: null, // まだ削除されていないレコードのみ
      },
      data: {
        deletedAt: new Date(), // 現在時刻を設定
      },
    });
    
    if (deletedPerformance.count === 0) {
      return NextResponse.json({ error: 'Performance record not found' }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Performance record deleted successfully',
      count: deletedPerformance.count
    });
  } catch (error) {
    console.error('Error deleting daily report:', error);
    return NextResponse.json({ error: 'Failed to delete daily report' }, { status: 500 });
  }
} 