import { Task } from '../types';
import { CATEGORY_CONFIG, PRIORITY_CONFIG } from './constants';

/**
 * Format a Date or date+time string into iCalendar UTC/Local format: YYYYMMDDTHHmmSS
 */
function formatIcsDateTime(dateStr: string, timeStr?: string): string {
  const [year, month, day] = dateStr.split('-');
  if (!timeStr) {
    // All day format: YYYYMMDD
    return `${year}${month}${day}`;
  }
  const [hours, minutes] = timeStr.split(':');
  return `${year}${month}${day}T${hours.padStart(2, '0')}${minutes.padStart(2, '0')}00`;
}

/**
 * Create a Google Calendar URL for one-click adding
 */
export function generateGoogleCalendarUrl(task: Task): string {
  const title = encodeURIComponent(task.title);
  
  let detailsText = '';
  if (task.description) detailsText += `${task.description}\n\n`;
  detailsText += `الأولوية: ${PRIORITY_CONFIG[task.priority].label}\n`;
  detailsText += `التصنيف: ${CATEGORY_CONFIG[task.category].label}\n`;
  if (task.subtasks && task.subtasks.length > 0) {
    detailsText += `\nقائمة المهام الفرعية:\n` + task.subtasks.map(s => `- [${s.completed ? '✓' : ' '}] ${s.title}`).join('\n');
  }
  const details = encodeURIComponent(detailsText);

  // Format dates
  const [y, m, d] = task.dueDate.split('-');
  let datesParam: string;

  if (task.dueTime) {
    const [h, min] = task.dueTime.split(':');
    const startHour = parseInt(h, 10);
    const startMin = parseInt(min, 10);
    const endHour = (startHour + 1) % 24;
    
    const startStr = `${y}${m}${d}T${String(startHour).padStart(2, '0')}${String(startMin).padStart(2, '0')}00`;
    const endStr = `${y}${m}${d}T${String(endHour).padStart(2, '0')}${String(startMin).padStart(2, '0')}00`;
    datesParam = `${startStr}/${endStr}`;
  } else {
    const nextDay = new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10) + 1);
    const ny = nextDay.getFullYear();
    const nm = String(nextDay.getMonth() + 1).padStart(2, '0');
    const nd = String(nextDay.getDate()).padStart(2, '0');
    datesParam = `${y}${m}${d}/${ny}${nm}${nd}`;
  }

  let url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=${datesParam}`;

  // Recurrence for Google Calendar
  if (task.recurrence === 'daily') {
    url += '&recur=RRULE:FREQ=DAILY';
  } else if (task.recurrence === 'weekly') {
    url += '&recur=RRULE:FREQ=WEEKLY';
  } else if (task.recurrence === 'monthly') {
    url += '&recur=RRULE:FREQ=MONTHLY';
  } else if (task.recurrence === 'weekdays') {
    url += '&recur=RRULE:FREQ=WEEKLY;BYDAY=SU,MO,TU,WE,TH';
  }

  return url;
}

/**
 * Generate RFC 5545 standard .ics file string for one or multiple tasks
 */
export function generateIcsContent(tasks: Task[], calendarTitle: string = 'مهام إنجاز'): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Injaz App//Arabic Task Manager//AR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${calendarTitle}`,
    'X-WR-TIMEZONE:UTC',
  ];

  tasks.forEach((task) => {
    const uid = `injaz-${task.id}@injaz-app.local`;
    const nowStamp = formatIcsDateTime(new Date().toISOString().split('T')[0], '00:00');
    const startStamp = formatIcsDateTime(task.dueDate, task.dueTime);
    const isAllDay = !task.dueTime;

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${uid}`);
    lines.push(`DTSTAMP:${nowStamp}Z`);

    if (isAllDay) {
      lines.push(`DTSTART;VALUE=DATE:${startStamp}`);
    } else {
      lines.push(`DTSTART:${startStamp}`);
      // Default duration 1 hour
      const [h, min] = (task.dueTime || '10:00').split(':');
      const endH = String((parseInt(h, 10) + 1) % 24).padStart(2, '0');
      const endStamp = formatIcsDateTime(task.dueDate, `${endH}:${min}`);
      lines.push(`DTEND:${endStamp}`);
    }

    lines.push(`SUMMARY:${escapeIcsText(task.title)}`);

    let description = task.description || '';
    description += `\\nالأولوية: ${PRIORITY_CONFIG[task.priority].label}`;
    description += `\\nالتصنيف: ${CATEGORY_CONFIG[task.category].label}`;
    if (task.subtasks && task.subtasks.length > 0) {
      description += '\\nالمهام الفرعية:\\n' + task.subtasks.map(s => `- [${s.completed ? 'X' : ' '}] ${escapeIcsText(s.title)}`).join('\\n');
    }
    lines.push(`DESCRIPTION:${escapeIcsText(description)}`);

    // Priority (1=High, 5=Medium, 9=Low)
    const icsPriority = task.priority === 'high' ? '1' : task.priority === 'medium' ? '5' : '9';
    lines.push(`PRIORITY:${icsPriority}`);
    lines.push(`CATEGORIES:${CATEGORY_CONFIG[task.category].label}`);

    // Recurrence Rule
    if (task.recurrence === 'daily') {
      lines.push('RRULE:FREQ=DAILY');
    } else if (task.recurrence === 'weekly') {
      lines.push('RRULE:FREQ=WEEKLY');
    } else if (task.recurrence === 'monthly') {
      lines.push('RRULE:FREQ=MONTHLY');
    } else if (task.recurrence === 'weekdays') {
      lines.push('RRULE:FREQ=WEEKLY;BYDAY=SU,MO,TU,WE,TH');
    }

    // Alarm reminder
    if (task.reminderEnabled) {
      const minutes = task.reminderMinutesBefore || 0;
      lines.push('BEGIN:VALARM');
      lines.push('ACTION:DISPLAY');
      lines.push(`DESCRIPTION:${escapeIcsText(task.title)}`);
      lines.push(`TRIGGER:-PT${minutes}M`);
      lines.push('END:VALARM');
    }

    if (task.completed) {
      lines.push('STATUS:COMPLETED');
    } else {
      lines.push('STATUS:CONFIRMED');
    }

    lines.push('END:VEVENT');
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

function escapeIcsText(text: string): string {
  if (!text) return '';
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Trigger browser file download of .ics
 */
export function downloadIcsFile(filename: string, icsContent: string) {
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute('download', filename.endsWith('.ics') ? filename : `${filename}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
