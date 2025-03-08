export type User = {
  id: number;
  name: string;
  email: string;
  storeId: number;
  createdAt: Date;
};

export type Store = {
  id: number;
  name: string;
  address: string | null;
  createdAt: Date;
};

export type Cast = {
  id: number;
  storeId: number;
  name: string;
  salarySystem: number; // 0: 月給, 1: 時給
  monthlySalary: number | null;
  hourlyWage: number | null;
  backSetting: number; // 0: バック設定なし, 1: バック設定あり
  createdAt: Date;
};

export type CastDailyPerformance = {
  id: number;
  castId: number;
  storeId: number;
  performanceDate: Date;
  
  // 勤怠関連（入力項目）
  startTime: string;
  endTime: string;
  overtime: number;
  
  // 勤怠関連（非入力項目 - 自動計算）
  workHours: string; // 勤務時間（開始時間と終了時間から計算）
  timeReward: number; // 時間給与（勤務時間と時給から計算）
  
  // 各種バック・ボーナス関連（入力項目）
  drinkSubtotal: number; // ドリンク小計
  drinkSubtotalBack: number;
  bottleSubtotal: number;
  bottleSubtotalBack: number;
  foodSubtotal: number;
  foodSubtotalBack: number;
  bonus: number;
  
  // 日払い支給額関連（入力項目）
  welfareCost: number; // 厚生費
  dailyPayment: number; // 日払い額
  
  // 日払い支給額関連（非入力項目 - 自動計算）
  totalPayment: number; // 総支給額（時間給与 + バック合計 + ボーナス）
  remainingPayment: number; // 残り支給額（総支給額 - 日払い額）
  
  // マイナス関連（入力項目）
  absenceDeduction: number; // 欠勤控除
  soriDeduction: number; // 送り控除
  tardinessDeduction: number; // 遅刻控除
  otherDeductions: number; // その他控除
  
  // マイナス関連（非入力項目 - 自動計算）
  totalDeduction: number; // 控除合計（各種控除の合計）
  
  // キャスト情報
  hourlyRate: number;
  monthlySalary: number;
  salarySystem: number;
  castName: string;
};

export type StoreDailyPerformance = {
  id: number;
  storeId: number;
  performanceDate: Date;

  // 入金項目 (Incoming Funds)
  totalSales: number; // 総売上
  cashSales: number; // 現金売上 DB
  cardSales: number; // クレジット売上 DB
  receivablesCollection: number; // 売掛金回収 DB
  receivables: number; // 売掛金 DB

  // 出金項目 (Outgoing Funds)
  miscExpenses: number; // 雑費 DB
  otherExpenses: number; // その他の出金 DB
  castDailyPayment: number; // キャスト日払い
  employeeDailyPayment: number; // 従業員日払い

  // 売上関連 (Sales Related)
  castSales: number; // キャスト売上
  castSalary: number; // キャスト給与
  laborCostRatio: number; // 人件費率
  setCount: number; // セット数 DB
  customerCount: number; // 客数 DB
  averageSpendPerCustomer: number; // 客単価
  grossProfit: number; // 粗利益
  grossProfitMargin: number; // 粗利益率
  operatingProfit: number; // 営業利益
  operatingProfitMargin: number; // 営業利益率

  // 現金関連 (Cash Related)
  actualCash: number; // 実際の現金 DB
  coinCarryover: number; // 小銭繰越 DB
  transferredCash: number; // 移動現金 DB
};

