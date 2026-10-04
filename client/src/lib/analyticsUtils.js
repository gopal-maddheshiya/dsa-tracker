/**
 * Analytics Utility Helpers
 * Formatting and data-mapping helpers for charts, trends, and the activity heatmap.
 */

const MONTH_NAMES_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const MONTH_NAMES_LONG = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/**
 * Format YYYY-MM-DD string into compact label like "Sep 28"
 * @param {string} dateStr - 'YYYY-MM-DD'
 * @returns {string}
 */
export function formatWeeklyDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const monthName = MONTH_NAMES_SHORT[monthIdx] || parts[1];
  return `${monthName} ${day}`;
}

/**
 * Format YYYY-MM-DD into "Oct 1, 2026"
 * @param {string} dateStr - 'YYYY-MM-DD'
 * @returns {string}
 */
export function formatHeatmapTooltipDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const year = parts[0];
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const monthName = MONTH_NAMES_SHORT[monthIdx] || parts[1];
  return `${monthName} ${day}, ${year}`;
}

/**
 * Formats ISO date or YYYY-MM-DD string into YYYY-MM-DD UTC format
 * @param {Date} date
 * @returns {string} 'YYYY-MM-DD'
 */
export function toUtcDateString(date) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Generates a 12-week (84-day) trailing matrix for the activity heatmap.
 * Aligns the grid ending on Saturday of the current week (or today's week).
 * 
 * @param {Array<{ date: string, count: number }>} activeDays - Backend heatmap data
 * @param {Date} [referenceDate] - Optional reference date (defaults to now)
 * @param {number} [weeks=12] - Number of weeks to display
 * @returns {{
 *   weeks: Array<Array<{ date: string, count: number, dayOfWeek: number, isToday: boolean, monthName: string }>>,
 *   monthHeaders: Array<{ label: string, weekIndex: number }>,
 *   totalRangeAttempts: number,
 *   activeDaysCount: number
 * }}
 */
export function generateHeatmapGrid(activeDays = [], referenceDate = new Date(), weeks = 12) {
  // Build lookup map for fast O(1) count retrieval
  const countsMap = new Map();
  if (Array.isArray(activeDays)) {
    activeDays.forEach((item) => {
      if (item && item.date) {
        countsMap.set(item.date, Number(item.count) || 0);
      }
    });
  }

  const todayUtcStr = toUtcDateString(referenceDate);

  // Find the end of the current week (Saturday = 6 in JS getUTCDay())
  const endDate = new Date(Date.UTC(
    referenceDate.getUTCFullYear(),
    referenceDate.getUTCMonth(),
    referenceDate.getUTCDate()
  ));
  const dayOfWeek = endDate.getUTCDay(); // 0 is Sunday, 6 is Saturday
  const daysToSaturday = 6 - dayOfWeek;
  endDate.setUTCDate(endDate.getUTCDate() + daysToSaturday);

  // Total days to generate = weeks * 7 (84 days for 12 weeks)
  const totalDays = weeks * 7;
  const startDate = new Date(endDate);
  startDate.setUTCDate(startDate.getUTCDate() - totalDays + 1);

  const weeksList = [];
  let currentWeek = [];
  const monthHeaders = [];
  let lastMonth = -1;
  let totalRangeAttempts = 0;
  let activeDaysCount = 0;

  const cursor = new Date(startDate);
  let currentWeekIdx = 0;

  for (let i = 0; i < totalDays; i++) {
    const dateStr = toUtcDateString(cursor);
    const count = countsMap.get(dateStr) || 0;
    const currentDayOfWeek = cursor.getUTCDay();
    const currentMonth = cursor.getUTCMonth();

    if (count > 0) {
      totalRangeAttempts += count;
      activeDaysCount += 1;
    }

    // Capture month header label on change
    if (currentMonth !== lastMonth && (currentDayOfWeek === 0 || currentWeek.length === 0)) {
      monthHeaders.push({
        label: MONTH_NAMES_SHORT[currentMonth],
        weekIndex: currentWeekIdx,
      });
      lastMonth = currentMonth;
    }

    currentWeek.push({
      date: dateStr,
      count,
      dayOfWeek: currentDayOfWeek,
      isToday: dateStr === todayUtcStr,
      monthName: MONTH_NAMES_SHORT[currentMonth],
    });

    if (currentWeek.length === 7) {
      weeksList.push(currentWeek);
      currentWeek = [];
      currentWeekIdx += 1;
    }

    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  if (currentWeek.length > 0) {
    weeksList.push(currentWeek);
  }

  return {
    weeks: weeksList,
    monthHeaders,
    totalRangeAttempts,
    activeDaysCount,
  };
}

/**
 * Maps attempt count to restrained indigo design token classes
 * @param {number} count
 * @returns {string} Tailwind classes
 */
export function getHeatmapLevelClass(count) {
  if (!count || count <= 0) {
    return 'bg-surface-2/60 border-line/50 hover:border-line hover:bg-surface-hover';
  }
  if (count === 1) {
    return 'bg-accent/25 border-accent/40 hover:bg-accent/35 hover:border-accent/60';
  }
  if (count === 2 || count === 3) {
    return 'bg-accent/60 border-accent/80 hover:bg-accent/75 hover:border-accent';
  }
  return 'bg-accent border-accent-hover hover:bg-accent-hover';
}
