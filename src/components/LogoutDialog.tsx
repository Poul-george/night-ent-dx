'use client';
import { useState } from 'react';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function LogoutDialog({ isOpen, onClose, onConfirm }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 border border-gray-200 w-64">
      <p className="text-[#454545] mb-4 text-center">ログアウトしますか？</p>
      <div className="flex gap-2">
        <button
          onClick={onConfirm}
          className="flex-1 px-2 py-2 bg-[#454545] text-white rounded hover:bg-[#353535]"
        >
          はい
        </button>
        <button
          onClick={onClose}
          className="flex-1 px-2 py-2 border border-[#454545] text-[#454545] rounded hover:bg-gray-100"
        >
          キャンセル
        </button>
      </div>
    </div>
  );
} 