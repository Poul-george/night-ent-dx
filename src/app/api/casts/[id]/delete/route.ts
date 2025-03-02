import { prisma } from '@/client/db';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);

    // 現在の日時を取得
    const now = new Date();

    // キャストを論理削除（deletedAtに現在の日時を設定）
    await prisma.cast.update({
      where: { id },
      data: {
        deletedAt: now,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting cast:', error);
    return NextResponse.json(
      { error: 'キャストの削除に失敗しました: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
} 