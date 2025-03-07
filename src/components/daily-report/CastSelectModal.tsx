'use client';

import { useState, useEffect } from 'react';
import { Cast, CastDailyPerformance } from '@/types/type';

type CastSelectModalProps = {
  isOpen: boolean;
  onClose: () => void;
  setCastDailyPerformances: React.Dispatch<React.SetStateAction<CastDailyPerformance[]>>;
  castDailyPerformances: CastDailyPerformance[];
  storeId: number;
};

export default function CastSelectModal({
  isOpen,
  onClose,
  storeId,
  castDailyPerformances,
  setCastDailyPerformances,
}: CastSelectModalProps) {
  const [casts, setCasts] = useState<Cast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCast, setSelectedCast] = useState<Cast | null>(null);

  // 既存のキャストIDのリストを作成
  const existingCastIds = castDailyPerformances.map(performance => performance.castId);

  // キャスト一覧を取得
  useEffect(() => {
    if (!isOpen) return;

    const fetchCasts = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/stores/${storeId}/casts`);
        if (!response.ok) {
          throw new Error('キャスト情報の取得に失敗しました');
        }
        const data = await response.json();
        setCasts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '予期せぬエラーが発生しました');
        console.error('Error fetching casts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCasts();
    // モーダルが開くたびに選択状態をリセット
    setSelectedCast(null);
  }, [isOpen, storeId]);

  // すでに表示されているキャストを除外
  const availableCasts = casts.filter(cast => !existingCastIds.includes(cast.id));

  // キャスト選択ハンドラー
  const handleCastClick = (cast: Cast) => {
    setSelectedCast(cast);
  };

  // 追加ボタンハンドラー - このコンポーネント内で処理を完結
  const handleAddClick = () => {
    if (selectedCast) {
      // 新しいIDを生成（既存の最大ID + 1）
      const newId = Math.max(0, ...castDailyPerformances.map(performance => performance.id)) + 1;
      
      // 新しいキャスト実績データを作成
      const newCast: CastDailyPerformance = {
        id: newId,
        castId: selectedCast.id,
        storeId: storeId,
        performanceDate: new Date(),
        castName: selectedCast.name,
        startTime: '00:00', // デフォルト開始時間
        endTime: '00:00', // デフォルト終了時間
        overtime: 0,
        workHours: '00:00', // 自動計算されるが初期値を設定
        hourlyRate: selectedCast.hourlyWage || 0,
        timeReward: 0,
        welfareCost: 0,
        dailyPayment: 0,
        totalPayment: 0, // 自動計算
        remainingPayment: 0, // 自動計算
        absenceDeduction: 0,
        soriDeduction: 0,
        tardinessDeduction: 0,
        otherDeductions: 0,
        totalDeduction: 0,
        drinkSubtotal: 0,
        drinkSubtotalBack: 0,
        bottleSubtotal: 0,
        bottleSubtotalBack: 0,
        foodSubtotal: 0,
        foodSubtotalBack: 0,
        bonus: 0,
      };
      
      // 親コンポーネントの状態を更新
      setCastDailyPerformances(prevPerformances => [...prevPerformances, newCast]);
      
      // モーダルを閉じる
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-md p-5 max-w-md w-full flex flex-col overflow-hidden">
        <div className="flex justify-between items-center mb-3 flex-shrink-0">
          <h2 className="text-xl font-semibold text-[#454545]">キャストを選択</h2>
          <button
            onClick={onClose}
            className="text-[#454545] hover:text-[#353535]"
          >
            ✕
          </button>
        </div>

        <div className="flex-grow overflow-auto mb-3 h-[200px]">
          {loading ? (
            <div className="py-4 text-center">読み込み中...</div>
          ) : error ? (
            <div className="py-4 text-center text-red-500">{error}</div>
          ) : availableCasts.length === 0 ? (
            <div className="py-4 text-center">追加可能なキャストがありません</div>
          ) : (
            <div className="border border-gray-300 rounded-md h-[200px]">
              <div className="h-full overflow-y-auto">
                <ul className="divide-y divide-gray-200">
                  {availableCasts.map(cast => (
                    <li
                      key={cast.id}
                      className={`py-3 px-4 border-none cursor-pointer transition-colors ${
                        selectedCast?.id === cast.id ? 'bg-[#f1f1f1]' : 'hover:bg-gray-100'
                      }`}
                      onClick={() => handleCastClick(cast)}
                    >
                      {cast.name}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-[#454545] text-[#454545] rounded-md hover:bg-gray-50"
          >
            キャンセル
          </button>
          <button
            onClick={handleAddClick}
            disabled={!selectedCast}
            className={`px-4 py-2 rounded-md ${
              selectedCast
                ? 'bg-[#454545] text-white hover:bg-[#353535]'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            追加
          </button>
        </div>
      </div>
    </div>
  );
} 