export type ShiftType = 'SHIFT_1' | 'SHIFT_2' | 'SHIFT_3' | 'NON_SHIFT' | 'OFF';

export interface Department {
  id: string;
  name: string;
  code: string;
  factoryName: string;
  latitude: number;
  longitude: number;
  radiusMeters: number; // Geofence radius
  description?: string;
}

export interface Employee {
  id: string;
  nik: string; // Nomor Induk Karyawan
  username: string;
  name: string;
  role: 'operator' | 'supervisor' | 'staff' | 'admin';
  departmentId: string;
  departmentName: string;
  position: string; // e.g. "Operator Mesin Kiln 04", "QC Glazing & Printing", "Admin HRD"
  photoUrl: string;
  phone: string;
  currentShift: ShiftType;
}

export type AttendanceStatus = 'ON_TIME' | 'LATE' | 'ABSENT' | 'LEAVE' | 'SICK';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  departmentName: string;
  date: string; // YYYY-MM-DD
  clockInTime: string | null; // HH:mm:ss
  clockOutTime: string | null; // HH:mm:ss
  shift: ShiftType;
  status: AttendanceStatus;
  workHours: number; // e.g. 7.5
  clockInPhotoUrl?: string;
  clockOutPhotoUrl?: string;
  clockInLat?: number;
  clockInLng?: number;
  clockInDistanceMeters?: number;
  clockInAddress?: string;
  isGeofenceValid: boolean;
  isFaceVerified: boolean;
  notes?: string;
}

export interface ShiftSchedule {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  shift: ShiftType;
  shiftName: string;
  startTime: string; // e.g. "07:00"
  endTime: string; // e.g. "15:00"
  lineOrKiln?: string; // e.g. "Kiln Line B-02 (Glazed Porcelain)"
  isOff: boolean;
}

export type RequestType = 'CUTI' | 'SAKIT' | 'LEMBUR';
export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface LeaveOrOvertimeRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  departmentName: string;
  type: RequestType;
  startDate: string;
  endDate: string;
  durationDaysOrHours: string;
  reason: string;
  doctorLetterUrl?: string; // for SAKIT
  overtimeTask?: string; // for LEMBUR
  status: RequestStatus;
  submittedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

export interface FactoryAnnouncement {
  id: string;
  title: string;
  date: string;
  category: 'OPERASIONAL' | 'K3_SAFETY' | 'HR_INFO';
  summary: string;
}

export interface AttendanceAnalytics {
  totalEmployees: number;
  presentToday: number;
  onTimeToday: number;
  lateToday: number;
  absentToday: number;
  onLeaveToday: number;
  punctualityRate: number; // percentage
  weeklyTrends: {
    day: string;
    date: string;
    present: number;
    late: number;
    absent: number;
  }[];
  departmentBreakdown: {
    department: string;
    total: number;
    present: number;
    late: number;
    percentage: number;
  }[];
  shiftBreakdown: {
    shift: string;
    count: number;
  }[];
}
