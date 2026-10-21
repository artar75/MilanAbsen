import { AttendanceStatus, ShiftType } from '../types';

export interface ShiftInfo {
  type: ShiftType;
  label: string;
  code: string;
  startTime: string; // "07:00"
  endTime: string;   // "15:00"
  description: string;
  isOvernight: boolean;
}

export const SHIFT_DEFINITIONS: Record<ShiftType, ShiftInfo> = {
  SHIFT_1: {
    type: 'SHIFT_1',
    label: 'Shift 1 (Pagi)',
    code: 'S1',
    startTime: '07:00',
    endTime: '15:00',
    description: 'Operasional Pagi - Persiapan Pembakaran Kiln & Body Prep',
    isOvernight: false,
  },
  SHIFT_2: {
    type: 'SHIFT_2',
    label: 'Shift 2 (Siang)',
    code: 'S2',
    startTime: '15:00',
    endTime: '23:00',
    description: 'Operasional Siang - Glazing, Printing & Sortir Keramik',
    isOvernight: false,
  },
  SHIFT_3: {
    type: 'SHIFT_3',
    label: 'Shift 3 (Malam)',
    code: 'S3',
    startTime: '23:00',
    endTime: '07:00',
    description: 'Operasional Malam - Continuous Firing Kiln & Monitoring Suhu',
    isOvernight: true,
  },
  NON_SHIFT: {
    type: 'NON_SHIFT',
    label: 'Normal Office (Non-Shift)',
    code: 'NS',
    startTime: '08:00',
    endTime: '17:00',
    description: 'Staf Administrasi, HRD & Manajemen',
    isOvernight: false,
  },
  OFF: {
    type: 'OFF',
    label: 'Libur Rutin / Off',
    code: 'OFF',
    startTime: '-',
    endTime: '-',
    description: 'Jadwal Libur Berkala',
    isOvernight: false,
  },
};

/**
 * Evaluates whether clock-in time is ON_TIME or LATE based on shift start time.
 * @param clockInTime "HH:mm" or "HH:mm:ss"
 * @param shiftStart "HH:mm"
 * @param gracePeriodMinutes default 5 minutes
 */
export function evaluatePunctuality(
  clockInTime: string,
  shiftStart: string,
  gracePeriodMinutes = 5
): AttendanceStatus {
  if (!clockInTime) return 'ABSENT';

  const [inHour, inMin] = clockInTime.split(':').map(Number);
  const [startHour, startMin] = shiftStart.split(':').map(Number);

  const clockInTotalMin = inHour * 60 + inMin;
  const shiftStartTotalMin = startHour * 60 + startMin;

  // If clock-in is within shift start + grace period
  if (clockInTotalMin <= shiftStartTotalMin + gracePeriodMinutes) {
    return 'ON_TIME';
  }
  return 'LATE';
}

/**
 * Calculates total worked hours between clock-in and clock-out.
 * Returns decimal hours rounded to 2 decimal places (e.g. 8.25).
 */
export function calculateWorkHours(
  clockInTime: string | null,
  clockOutTime: string | null,
  isOvernight = false
): number {
  if (!clockInTime || !clockOutTime) return 0;

  const [inH, inM, inS = 0] = clockInTime.split(':').map(Number);
  const [outH, outM, outS = 0] = clockOutTime.split(':').map(Number);

  let inSec = inH * 3600 + inM * 60 + inS;
  let outSec = outH * 3600 + outM * 60 + outS;

  if (outSec < inSec || isOvernight) {
    // Crossed midnight
    outSec += 24 * 3600;
  }

  const durationHours = (outSec - inSec) / 3600;
  return Math.max(0, Math.round(durationHours * 100) / 100);
}

/**
 * Formats date into Indonesian localized format (e.g. "Rabu, 21 Okt 2026")
 */
export function formatIndonesianDate(dateStr: string): string {
  try {
    const date = new Date(dateStr + 'T00:00:00');
    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
      'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
    ];
    return `${dayNames[date.getDay()]}, ${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
  } catch {
    return dateStr;
  }
}

/**
 * Get status badge details (color, text, icon tag)
 */
export function getStatusBadge(status: AttendanceStatus): {
  label: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  colorName: 'green' | 'yellow' | 'red';
} {
  switch (status) {
    case 'ON_TIME':
      return {
        label: 'Tepat Waktu',
        bgClass: 'bg-emerald-50 text-emerald-700',
        textClass: 'text-emerald-700',
        borderClass: 'border-emerald-200',
        colorName: 'green',
      };
    case 'LATE':
      return {
        label: 'Terlambat',
        bgClass: 'bg-amber-50 text-amber-700',
        textClass: 'text-amber-700',
        borderClass: 'border-amber-200',
        colorName: 'yellow',
      };
    case 'ABSENT':
      return {
        label: 'Absen / Alpa',
        bgClass: 'bg-rose-50 text-rose-700',
        textClass: 'text-rose-700',
        borderClass: 'border-rose-200',
        colorName: 'red',
      };
    case 'LEAVE':
      return {
        label: 'Cuti Resmi',
        bgClass: 'bg-blue-50 text-blue-700',
        textClass: 'text-blue-700',
        borderClass: 'border-blue-200',
        colorName: 'yellow',
      };
    case 'SICK':
      return {
        label: 'Izin Sakit',
        bgClass: 'bg-purple-50 text-purple-700',
        textClass: 'text-purple-700',
        borderClass: 'border-purple-200',
        colorName: 'yellow',
      };
  }
}
