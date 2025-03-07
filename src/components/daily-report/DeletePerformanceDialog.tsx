'use client';

import { CastDailyPerformance } from '@/types/type';
import { useState } from 'react';

type DeletePerformanceDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  performance: CastDailyPerformance | null;
  onDeleteSuccess: () => void;
  date: { year: number; month: number; day: number };
};

export default function DeletePerformanceDialog({
  isOpen,
  onClose,
  performance,
  onDeleteSuccess,
  date
}: DeletePerformanceDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !performance) return null;

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      
      // 新規追加されたキャスト（IDが負の数値）の場合はAPIを呼び出さない
      console.log('performance', performance);
      if (performance && performance.id < 0) {
        // 削除成功時の処理を直接実行
        onDeleteSuccess();
        onClose();
        return;
      }
      
      // 既存のキャスト（DBに保存済み）の場合はAPIを呼び出す
      // 日付をフォーマット
      const formattedDate = `${date.year}-${String(date.month).padStart(2, '0')}-${String(
        date.day
      ).padStart(2, '0')}`;
      
      // 削除APIを呼び出し
      const response = await fetch(
        `/api/daily-report/${formattedDate}?storeId=${performance.storeId}&castId=${performance.castId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete performance');
      }

      // 削除成功時の処理
      onDeleteSuccess();
      onClose();
    } catch (error) {
      console.error('Error deleting performance:', error);
      alert('削除に失敗しました');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-xl font-bold mb-4 text-[#454545]">削除の確認</h3>
        <p className="mb-6">
          <span className="font-bold">{performance.castName}</span>の日報を削除してもよろしいですか？
        </p>
        <div className="flex justify-center space-x-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 border border-gray-300 rounded-md text-[#454545] font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            キャンセル
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 disabled:opacity-50"
          >
            {isDeleting ? '削除中...' : '削除する'}
          </button>
        </div>
      </div>
    </div>
  );
}
