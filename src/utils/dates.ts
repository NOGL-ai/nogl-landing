export const formatToDateString = (date: Date | string): string => {
  if (date instanceof Date) {
    return date.toISOString();
  }
  return date;
};

export const parseDate = (dateString: string): Date => {
  return new Date(dateString);
};

export const formatDisplayDate = (date: string): string => {
  return new Date(date).toLocaleDateString();
};

export const formatDisplayTime = (time: string): string => {
  return new Date(time).toLocaleTimeString();
}; 