export const isValidTimeSlot = (time: string): boolean => {
  const regex = /^([01]\d|2[0-3]):(00|30)$/;
  return regex.test(time);
};

export const isStartBeforeEnd = (start: string, end: string): boolean => {
  const [startHour, startMinute] = start.split(":").map(Number);
  const [endHour, endMinute] = end.split(":").map(Number);
  if (startHour < endHour) return true;
  if (startHour === endHour && startMinute < endMinute) return true;
  return false;
};
