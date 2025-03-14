/**
 * 時間と分を分割する関数
 * @param timeString 時間文字列 (HH:MM形式)
 * @returns 時間と分のオブジェクト
 */
export const splitTime = (timeString: string) => {
  const [hours, minutes] = timeString.split(':').map(part => parseInt(part, 10));
  return { hours: hours || 0, minutes: minutes || 0 };
};

/**
 * 時間と分を結合する関数
 * @param hours 時間
 * @param minutes 分
 * @returns HH:MM形式の時間文字列
 */
export const combineTime = (hours: number, minutes: number) => {
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

/**
 * 時間を分に変換する関数
 * @param timeString 時間文字列 (HH:MM形式)
 * @returns 分に変換した値
 */
export const timeToMinutes = (timeString: string) => {
  const { hours, minutes } = splitTime(timeString);
  return hours * 60 + minutes;
};

/**
 * 分を時間形式に変換する関数
 * @param totalMinutes 合計分数
 * @returns HH:MM形式の時間文字列
 */
export const minutesToTime = (totalMinutes: number) => {
  const hours = Math.floor(Math.abs(totalMinutes) / 60);
  const minutes = Math.abs(totalMinutes) % 60;
  const sign = totalMinutes < 0 ? '-' : '';
  return `${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

/**
 * 勤務時間を計算する関数
 * @param startTime 開始時間 (HH:MM形式)
 * @param endTime 終了時間 (HH:MM形式)
 * @param overtime 残業時間（分）
 * @returns 勤務時間文字列 (HH:MM形式)
 */
export const calculateWorkHours = (startTime: string, endTime: string, overtime: number) => {
  const startMinutes = timeToMinutes(startTime);
  let endMinutes = timeToMinutes(endTime);
  
  // 終了時間が開始時間より前の場合（日をまたぐ場合）、24時間を加算
  if (endMinutes < startMinutes) {
    endMinutes += 24 * 60;
  }
  
  // 勤務時間（分）を計算し、残業時間を加算
  const totalWorkMinutes = endMinutes - startMinutes + overtime;
  
  return minutesToTime(totalWorkMinutes);
};

/**
 * 時間給与を計算する関数
 * @param workHours 勤務時間 (HH:MM形式)
 * @param hourlyRate 時給
 * @returns 計算された時間給与
 */
export const calculateTimeReward = (workHours: string, hourlyRate: number) => {
  const workMinutes = timeToMinutes(workHours);
  return Math.round((workMinutes / 60) * hourlyRate);
}; 
