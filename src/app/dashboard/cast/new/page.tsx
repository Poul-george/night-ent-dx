'use client';

import { useState, useEffect } from 'react';
import { Cast } from '@/types/type';
import CastForm from '@/components/cast/CastForm';

export default function NewCast() {
  const [storeId, setStoreId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // セッションからstoreIdを取得
    const fetchStoreId = async () => {
      try {
        const sessionResponse = await fetch('/api/auth/session');
        if (!sessionResponse.ok) throw new Error('Failed to fetch session');
        const sessionData = await sessionResponse.json();
        setStoreId(sessionData.storeId);
      } catch (err) {
        console.error('Error fetching store ID:', err);
        setError('店舗情報の取得に失敗しました');
      }
    };

    fetchStoreId();
  }, []);

  const handleSubmit = async (data: Partial<Cast>) => {
    if (!storeId) {
      throw new Error('店舗情報が取得できませんでした');
    }

    // storeIdを追加
    const requestData = {
      ...data,
      storeId
    };

    // APIリクエスト
    const response = await fetch('/api/casts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'キャストの作成に失敗しました');
    }
  };

  if (error) {
    return <div className="p-8 text-red-500">エラー: {error}</div>;
  }

  return <CastForm mode="create" onSubmit={handleSubmit} />;
} 