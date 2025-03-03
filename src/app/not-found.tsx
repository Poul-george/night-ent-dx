'use client';

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold text-[#454545] mb-4">404 Not Found</h1>
      <p className="text-[#757575]">
        お探しのページは見つかりませんでした。
      </p>
      <div className="mt-4">
        <Link href="/dashboard/home" className="text-[#454545]">
          ダッシュボードに戻る
        </Link>
      </div>
    </div>
  );
} 