// /server/utils/validators.ts

// 檢查時間格式是否合法
export const isValidTimeSlot = (time: string, interval: number = 30): boolean => {
  // 計算合法分鐘值，基於 interval 生成 ["00", "10", "20", ...]
  const validMinutes = Array.from({ length: 60 / interval }, (_, i) =>
    (i * interval).toString().padStart(2, "0"),
  );
  const validMinutesRegex = validMinutes.join("|");

  // 動態正則，允許小時為 0-23 或 00-23，分鐘基於 interval 檢查
  const regex = new RegExp(`^([0-9]|[01]\\d|2[0-3]|0\\d):(${validMinutesRegex})$`);
  return regex.test(time);
};

// 檢查開始時間是否早於結束時間
export const isStartBeforeEnd = (start: string, end: string, interval: number = 30): boolean => {
  const [startHour, startMinute] = start.split(":").map(Number);
  const [endHour, endMinute] = end.split(":").map(Number);

  // 確保起始時間和結束時間都符合 interval
  if (!isValidTimeSlot(start, interval) || !isValidTimeSlot(end, interval)) {
    return false;
  }

  if (startHour < endHour) return true;
  if (startHour === endHour && startMinute < endMinute) return true;
  return false;
};

// 計算時間段
export const calculateTimeSlots = (start: string, end: string, interval: number = 30): string[] => {
  const [startHour, startMinute] = start.split(":").map(Number);
  const [endHour, endMinute] = end.split(":").map(Number);

  const startTotal = startHour * 60 + startMinute;
  const endTotal = endHour * 60 + endMinute;

  const slots = [];
  for (let time = startTotal; time < endTotal; time += interval) {
    const hour = Math.floor(time / 60)
      .toString()
      .padStart(2, "0");
    const minute = (time % 60).toString().padStart(2, "0");
    slots.push(`${hour}:${minute}`);
  }
  return slots;
};

export const formatTime = (timeString: string) => {
  const count = timeString.split(":").length;
  if (count === 1) {
    return `${timeString}:00`;
  }
  const [hours, minutes, ..._] = timeString.split(":");
  return `${hours}:${minutes}`;
};
