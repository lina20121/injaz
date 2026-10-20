import { RecurrenceType } from '../types';

export const ARABIC_MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

export const ARABIC_WEEKDAYS_SHORT = ['سبت', 'أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة'];
export const ARABIC_WEEKDAYS_FULL = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

/**
 * Format a YYYY-MM-DD string to a readable Arabic date
 */
export function formatArabicDate(dateStr: string, includeDayName: boolean = true): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  
  if (isNaN(date.getTime())) return dateStr;

  const today = getTodayStr();
  const tomorrow = getTomorrowStr();
  const yesterday = getYesterdayStr();

  if (dateStr === today) {
    return 'اليوم';
  } else if (dateStr === tomorrow) {
    return 'غداً';
  } else if (dateStr === yesterday) {
    return 'أمس';
  }

  const monthName = ARABIC_MONTHS[month - 1];
  const dayIndex = (date.getDay() + 1) % 7; // Saturday is index 0 in Arabic week
  const dayName = ARABIC_WEEKDAYS_FULL[dayIndex];

  if (includeDayName) {
    return `${dayName}، ${day} ${monthName} ${year}`;
  }
  return `${day} ${monthName} ${year}`;
}

export function formatTimeArabic(timeStr?: string): string {
  if (!timeStr) return '';
  const [hoursStr, minutesStr] = timeStr.split(':');
  let hours = parseInt(hoursStr, 10);
  const minutes = minutesStr || '00';
  const period = hours >= 12 ? 'م' : 'ص';
  
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 becomes 12
  
  return `${hours}:${minutes} ${period}`;
}

export function getTodayStr(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTomorrowStr(): string {
  const d = new Date(Date.now() + 86400000);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getYesterdayStr(): string {
  const d = new Date(Date.now() - 86400000);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isOverdue(dueDate: string, dueTime?: string, completed: boolean = false): boolean {
  if (completed || !dueDate) return false;
  const today = getTodayStr();
  if (dueDate < today) return true;
  if (dueDate === today && dueTime) {
    const now = new Date();
    const currentHours = String(now.getHours()).padStart(2, '0');
    const currentMinutes = String(now.getMinutes()).padStart(2, '0');
    const currentTime = `${currentHours}:${currentMinutes}`;
    return dueTime < currentTime;
  }
  return false;
}

export function isDueToday(dueDate: string): boolean {
  return dueDate === getTodayStr();
}

export function isDueThisWeek(dueDate: string): boolean {
  if (!dueDate) return false;
  const today = new Date();
  const target = new Date(dueDate);
  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays >= 0 && diffDays <= 7;
}

export function getNextRecurringDate(currentDateStr: string, recurrence: RecurrenceType): string {
  const [year, month, day] = currentDateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  switch (recurrence) {
    case 'daily':
      date.setDate(date.getDate() + 1);
      break;
    case 'weekdays': {
      // Advance to next weekday (Sun-Thu in Arabic region or Mon-Fri)
      // Standard: skip Friday (5) & Saturday (6)
      do {
        date.setDate(date.getDate() + 1);
      } while (date.getDay() === 5 || date.getDay() === 6);
      break;
    }
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    default:
      return currentDateStr;
  }

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Get days for calendar view month (starts on Saturday)
 */
export interface CalendarDay {
  dateStr: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
}

export function getMonthDays(year: number, month: number): CalendarDay[] {
  const today = getTodayStr();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // In Arabic calendar, week starts on Saturday (getDay() = 6 -> index 0)
  // getDay(): 0 is Sunday, 1 is Monday ... 6 is Saturday
  // To map to Saturday=0: (day + 1) % 7
  const startDayIndex = (firstDay.getDay() + 1) % 7;
  const totalDays = lastDay.getDate();

  const days: CalendarDay[] = [];

  // Previous month trailing days
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startDayIndex - 1; i >= 0; i--) {
    const prevDayNum = prevMonthLastDay - i;
    const prevDate = new Date(year, month - 1, prevDayNum);
    const dateStr = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}-${String(prevDayNum).padStart(2, '0')}`;
    days.push({
      dateStr,
      dayNumber: prevDayNum,
      isCurrentMonth: false,
      isToday: dateStr === today,
    });
  }

  // Current month days
  for (let i = 1; i <= totalDays; i++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    days.push({
      dateStr,
      dayNumber: i,
      isCurrentMonth: true,
      isToday: dateStr === today,
    });
  }

  // Next month leading days to complete grid (multiples of 7)
  const remaining = (7 - (days.length % 7)) % 7;
  for (let i = 1; i <= remaining; i++) {
    const nextDate = new Date(year, month + 1, i);
    const dateStr = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    days.push({
      dateStr,
      dayNumber: i,
      isCurrentMonth: false,
      isToday: dateStr === today,
    });
  }

  return days;
}
