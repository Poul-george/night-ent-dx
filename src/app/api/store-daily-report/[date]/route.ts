import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ date: string }> }
) {
  try {
    // URLからパラメータを取得
    const { date } = await params;
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId');
    
    if (!date || !storeId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // リクエストボディを取得
    const storeReport = await request.json();
    
    // 日付をパース
    const [year, month, day] = date.split('-').map(Number);
    const performanceDate = new Date(year, month - 1, day);
    
    // 既存の日報を検索
    let existingReport = null;
    try {
      existingReport = await prisma.storeDailyPerformance.findFirst({
        where: {
          storeId: Number(storeId),
          performanceDate: {
            gte: new Date(new Date(performanceDate).setHours(0, 0, 0, 0)),
            lt: new Date(new Date(performanceDate).setHours(23, 59, 59, 999)),
          },
        },
      });
    } catch (error) {
      console.error('Error finding existing report:', error);
      // エラーが発生しても処理を続行（新規作成として扱う）
    }

    let result;
    
    if (existingReport) {
      // 既存の日報を更新
      result = await prisma.storeDailyPerformance.update({
        where: { id: existingReport.id },
        data: {
          // 入金項目
          cashSales: Number(storeReport.cashSales),
          cardSales: Number(storeReport.cardSales),
          receivables: Number(storeReport.receivables),
          receivablesCollection: Number(storeReport.receivablesCollection),
          
          // 出金項目
          miscExpenses: Number(storeReport.miscExpenses),
          otherExpenses: Number(storeReport.otherExpenses),
          
          // 売上関連
          setCount: Number(storeReport.setCount),
          customerCount: Number(storeReport.customerCount),
          
          // 現金関連
          actualCash: Number(storeReport.actualCash),
          coinCarryover: Number(storeReport.coinCarryover),
          transferredCash: Number(storeReport.transferredCash),
          
          // 更新情報
          updatedAt: new Date(),
        },
      });
    } else {
      // 新規日報を作成
      result = await prisma.storeDailyPerformance.create({
        data: {
          storeId: Number(storeId),
          performanceDate: performanceDate,
          
          // 入金項目
          cashSales: Number(storeReport.cashSales),
          cardSales: Number(storeReport.cardSales),
          receivables: Number(storeReport.receivables),
          receivablesCollection: Number(storeReport.receivablesCollection),
          
          // 出金項目
          miscExpenses: Number(storeReport.miscExpenses),
          otherExpenses: Number(storeReport.otherExpenses),
          
          // 売上関連
          setCount: Number(storeReport.setCount),
          customerCount: Number(storeReport.customerCount),
          
          // 現金関連
          actualCash: Number(storeReport.actualCash),
          coinCarryover: Number(storeReport.coinCarryover),
          transferredCash: Number(storeReport.transferredCash),
        },
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in store daily report API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ date: string }> }
) {
  try {
    // URLからパラメータを取得
    const { date } = await params;
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId');
    
    if (!date || !storeId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // 日付をパース
    const [year, month, day] = date.split('-').map(Number);
    const performanceDate = new Date(year, month - 1, day);
    
    // 日報を検索
    let storeReport = null;
    try {
      storeReport = await prisma.storeDailyPerformance.findFirst({
        where: {
          storeId: Number(storeId),
          performanceDate: {
            gte: new Date(new Date(performanceDate).setHours(0, 0, 0, 0)),
            lt: new Date(new Date(performanceDate).setHours(23, 59, 59, 999)),
          },
        },
      });
    } catch (error) {
      console.error('Error finding store report:', error);
      // エラーが発生した場合は空のデータを返す
    }

    if (!storeReport) {
      // 日報が存在しない場合は空のデータを返す
      return NextResponse.json({
        id: 0,
        storeId: Number(storeId),
        performanceDate: performanceDate,
        cashSales: 0,
        cardSales: 0,
        receivables: 0,
        receivablesCollection: 0,
        miscExpenses: 0,
        otherExpenses: 0,
        castDailyPayment: 0,
        employeeDailyPayment: 0,
        castSales: 0,
        castSalary: 0,
        laborCostRatio: 0,
        totalSales: 0,
        setCount: 0,
        customerCount: 0,
        averageSpendPerCustomer: 0,
        grossProfit: 0,
        grossProfitMargin: 0,
        operatingProfit: 0,
        operatingProfitMargin: 0,
        actualCash: 0,
        coinCarryover: 0,
        transferredCash: 0,
      });
    }

    return NextResponse.json(storeReport);
  } catch (error) {
    console.error('Error in store daily report API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 
