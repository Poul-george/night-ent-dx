/**
 * 数値をカンマ区切りの文字列にフォーマットする
 * @param num フォーマットする数値
 * @returns カンマ区切りの文字列
 */
export const formatNumber = (num: number) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * 数値をパーセント表示用にフォーマットする
 * @param num フォーマットする数値
 * @returns 小数点第一位までのパーセント表示
 */
export const formatPercent = (num: number) => {
  return `${num.toFixed(1)}%`;
}; 