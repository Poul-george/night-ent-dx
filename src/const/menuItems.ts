export type MenuItem = {
  label: string;
  path?: string;
  subItems?: { label: string; path: string }[];
};

export const menuItems: MenuItem[] = [
  {
    label: '日報登録',
    path: '/dashboard/daily-report'
  },
  {
    label: 'キャスト',
    subItems: [
      { label: '一覧', path: '/dashboard/cast/list' },
      { label: '新規登録', path: '/dashboard/cast/new' }
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
    label: '設定',
    subItems: [
      { label: 'ユーザー設定', path: '/dashboard/settings/user' },
      { label: '店舗設定', path: '/dashboard/settings/store' }
    ]
  }
]; 