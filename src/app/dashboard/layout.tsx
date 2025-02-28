'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { MdKeyboardArrowRight } from "react-icons/md";
import LogoutDialog from '@/components/LogoutDialog';
import { logout } from '@/utils/auth';

type MenuItem = {
  label: string;
  path?: string;
  subItems?: { label: string; path: string }[];
};

const menuItems: MenuItem[] = [
  {
    label: '日報登録',
    path: '/dashboard/daily-report'
  },
  {
    label: 'キャスト',
    subItems: [
      { label: '登録・編集', path: '/dashboard/cast/manage' }
    ]
  },
  {
    label: '売上・実績',
    subItems: [
      { label: 'キャスト売上・実績', path: '/dashboard/sales/cast' },
      { label: '店舗売上・実績', path: '/dashboard/sales/store' }
    ]
  },
  {
    label: '設定'
  }
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userName, setUserName] = useState('');
  const [openMenus, setOpenMenus] = useState<number[]>([]);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const sessionResponse = await fetch('/api/auth/session');
        if (!sessionResponse.ok) throw new Error('Failed to fetch session');
        const sessionData = await sessionResponse.json();

        const userResponse = await fetch(`/api/users/${sessionData.userId}`);
        if (!userResponse.ok) throw new Error('Failed to fetch user');
        const userData = await userResponse.json();
        
        setUserName(userData.name);
      } catch (error) {
        console.error('Error fetching user info:', error);
        window.location.href = '/';
      }
    };

    fetchUserInfo();
  }, []);

  const toggleMenu = (index: number) => {
    setOpenMenus(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <div className="flex min-h-screen">
      <aside className="w-[200px] bg-[#F9F9FC] flex flex-col">
        <div className="mb-4 p-4 border-b">
          <p className="text-[#757575] text-sm font-bold mb-1">スナックBooM</p>
          <Link href="/dashboard/home">
            <h2 className="font-bold text-[#454545] hover:underline cursor-pointer">
              {userName || 'ママ'}
            </h2>
          </Link>
        </div>

        <nav className="flex-1">
          {menuItems.map((item, index) => (
            <div key={index}>
              {item.path ? (
                <Link 
                  href={item.path}
                  className="block px-4 py-3 text-[#454545] text-lg font-bold active:bg-[#F1F1F1]"
                >
                  {item.label}
                </Link>
              ) : (
                <button
                  onClick={() => toggleMenu(index)}
                  className="w-full flex items-center pl-2 pr-4 py-3 text-[#454545] text-lg font-bold active:bg-[#F1F1F1]"
                >
                  <MdKeyboardArrowRight 
                    size={24}
                    className={`mr-2 transition-transform duration-200 ${
                      openMenus.includes(index) ? 'rotate-90' : ''
                    }`}
                  />
                  <span>{item.label}</span>
                </button>
              )}

              {item.subItems && (
                <div className={`overflow-hidden transition-all duration-200 ${
                  openMenus.includes(index) ? 'max-h-40' : 'max-h-0'
                }`}>
                  {item.subItems.map((subItem, subIndex) => (
                    <Link
                      key={subIndex}
                      href={subItem.path}
                      className="block pl-8 py-2 text-[#757575] active:bg-[#F1F1F1]"
                    >
                      {subItem.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="p-4 border-t">
          <button 
            className="text-[#454545] hover:underline"
            onClick={() => setIsLogoutDialogOpen(true)}
          >
            ログアウト
          </button>
        </div>
      </aside>

      <main className="flex-1 bg-white">
        {children}
      </main>

      <LogoutDialog
        isOpen={isLogoutDialogOpen}
        onClose={() => setIsLogoutDialogOpen(false)}
        onConfirm={() => {
          logout();
          setIsLogoutDialogOpen(false);
        }}
      />
    </div>
  );
} 