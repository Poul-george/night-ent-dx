'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Cast } from '@/types/type';
import CastForm from '@/components/cast/CastForm';

export default function EditCast() {
  const params = useParams();
  const castId = params.id as string;
  
  const [cast, setCast] = useState<Cast | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCast = async () => {
      try {
        setLoading(true);
        // セッションからstoreIdを取得
        const sessionResponse = await fetch('/api/auth/session');
        if (!sessionResponse.ok) throw new Error('Failed to fetch session');
        const sessionData = await sessionResponse.json();

        // キャスト詳細を取得
        const castResponse = await fetch(`/api/casts/${castId}?storeId=${sessionData.storeId}`);
        if (!castResponse.ok) {
          if (castResponse.status === 404) {
            throw new Error('キャストが見つかりませんでした');
          }
          throw new Error('キャスト情報の取得に失敗しました');
        }
        
        const castData = await castResponse.json();
        setCast(castData);
      } catch (err) {
        console.error('Error fetching cast:', err);
        setError(err instanceof Error ? err.message : '予期せぬエラーが発生しました');
      } finally {
        setLoading(false);
      }
    };

    fetchCast();
  }, [castId]);

  const handleSubmit = async (data: Partial<Cast>) => {
    // APIリクエスト
    const response = await fetch(`/api/casts/${castId}/edit`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'キャストの更新に失敗しました');
    }
  };

  if (loading) return <div className="p-8">読み込み中...</div>;
  if (error) return <div className="p-8 text-red-500">エラー: {error}</div>;
  if (!cast) return <div className="p-8 text-red-500">キャストが見つかりませんでした</div>;

  return <CastForm mode="edit" initialData={cast} onSubmit={handleSubmit} />;
} 