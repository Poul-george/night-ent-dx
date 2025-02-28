export type User = {
  id: number;
  name: string;
  email: string;
  storeId: number;
  createdAt: string;
};

export type Store = {
  id: number;
  name: string;
  address: string | null;
  createdAt: string;
};

export type Cast = {
  id: number;
  storeId: number;
  name: string;
  salarySystem: number; // 0: 月給, 1: 時給
  monthlySalary: number | null;
  hourlyWage: number | null;
  backSetting: number; // 0: バック設定なし, 1: バック設定あり
  createdAt: string;
};
