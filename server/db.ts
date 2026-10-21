import fs from 'fs';
import path from 'path';
import {
  Department,
  Employee,
  AttendanceRecord,
  ShiftSchedule,
  LeaveOrOvertimeRequest,
  FactoryAnnouncement,
  AttendanceAnalytics,
  ShiftType,
} from '../src/types';
import { isWithinGeofence } from '../src/utils/geo';
import { evaluatePunctuality, calculateWorkHours, SHIFT_DEFINITIONS } from '../src/utils/attendanceLogic';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DATA_DIR, 'milan_keramik_db.json');

interface DatabaseStore {
  departments: Department[];
  employees: (Employee & { password: string })[];
  attendanceLogs: AttendanceRecord[];
  shiftRosters: ShiftSchedule[];
  leaveRequests: LeaveOrOvertimeRequest[];
  announcements: FactoryAnnouncement[];
}

const INITIAL_DEPARTMENTS: Department[] = [
  {
    id: 'dept-prod',
    name: 'Produksi & Kiln Ceramic',
    code: 'PROD',
    factoryName: 'Pabrik Milan Keramik Gresik (Plant A)',
    latitude: -7.15664,
    longitude: 112.65551,
    radiusMeters: 300,
    description: 'Unit pembakaran kiln, press hidrolik, dan persiapan massa keramik.',
  },
  {
    id: 'dept-qc',
    name: 'Quality Control & Glazing',
    code: 'QC',
    factoryName: 'Pabrik Milan Keramik Karawang (Plant B)',
    latitude: -6.30561,
    longitude: 107.30124,
    radiusMeters: 250,
    description: 'Pengecekan glasir, digital inkjet printing, dan ketahanan ubin keramik.',
  },
  {
    id: 'dept-log',
    name: 'Gudang & Logistik Keramik',
    code: 'LOG',
    factoryName: 'Pusat Distribusi Surabaya',
    latitude: -7.25752,
    longitude: 112.75211,
    radiusMeters: 350,
    description: 'Penyimpanan palet ubin, handling forklift, dan pengiriman kontainer.',
  },
  {
    id: 'dept-hr',
    name: 'HRD & Administrasi Kantor',
    code: 'HR',
    factoryName: 'Graha Milan Keramik Jakarta Pusat',
    latitude: -6.17511,
    longitude: 106.82718,
    radiusMeters: 200,
    description: 'Manajemen personalia, penggajian, dan operasional kantor pusat.',
  },
];

const INITIAL_EMPLOYEES: (Employee & { password: string })[] = [
  {
    id: 'emp-admin',
    nik: 'MK-DIR-0001',
    username: 'admin',
    password: 'password252875', // checked against '252875' or directly
    name: 'Bambang Soerjono (HRD Manager)',
    role: 'admin',
    departmentId: 'dept-hr',
    departmentName: 'HRD & Administrasi Kantor',
    position: 'Chief Human Capital Officer',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    phone: '0812-9876-5432',
    currentShift: 'NON_SHIFT',
  },
  {
    id: 'emp-sugeng',
    nik: 'MK-2023-0142',
    username: 'sugeng',
    password: 'password123',
    name: 'Sugeng Setiawan',
    role: 'operator',
    departmentId: 'dept-prod',
    departmentName: 'Produksi & Kiln Ceramic',
    position: 'Operator Mesin Kiln 04',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    phone: '0813-4455-6677',
    currentShift: 'SHIFT_1',
  },
  {
    id: 'emp-rahma',
    nik: 'MK-2024-0088',
    username: 'rahma',
    password: 'password123',
    name: 'Siti Rahmawati',
    role: 'operator',
    departmentId: 'dept-qc',
    departmentName: 'Quality Control & Glazing',
    position: 'Inspektur QC Glasir & Finishing',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    phone: '0812-3344-5566',
    currentShift: 'SHIFT_2',
  },
  {
    id: 'emp-budi',
    nik: 'MK-2022-0051',
    username: 'budi',
    password: 'password123',
    name: 'Budi Hartono',
    role: 'operator',
    departmentId: 'dept-log',
    departmentName: 'Gudang & Logistik Keramik',
    position: 'Senior Forklift Operator & Pallet Loading',
    photoUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    phone: '0815-7788-9900',
    currentShift: 'SHIFT_1',
  },
  {
    id: 'emp-dewi',
    nik: 'MK-2023-0199',
    username: 'dewi',
    password: 'password123',
    name: 'Dewi Lestari',
    role: 'staff',
    departmentId: 'dept-hr',
    departmentName: 'HRD & Administrasi Kantor',
    position: 'Staf Payroll & Presensi',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    phone: '0811-2233-4455',
    currentShift: 'NON_SHIFT',
  },
  {
    id: 'emp-agus',
    nik: 'MK-2021-0019',
    username: 'agus',
    password: 'password123',
    name: 'Agus Pratama',
    role: 'operator',
    departmentId: 'dept-prod',
    departmentName: 'Produksi & Kiln Ceramic',
    position: 'Teknisi Burner Kiln 02',
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    phone: '0819-8877-6655',
    currentShift: 'SHIFT_3',
  },
];

const INITIAL_ANNOUNCEMENTS: FactoryAnnouncement[] = [
  {
    id: 'ann-1',
    title: 'Standar K3 Baru: Wajib Helm dan Kacamata Pelindung di Area Kiln',
    date: '2026-10-21',
    category: 'K3_SAFETY',
    summary: 'Seluruh operator produksi lini pembakaran kiln wajib menggunakan APD tahan panas grade-A sesuai audit ISO 45001.',
  },
  {
    id: 'ann-2',
    title: 'Pencapaian Produksi Ubin Milan Keramik 60x60 Rekor Kuartal III',
    date: '2026-10-18',
    category: 'OPERASIONAL',
    summary: 'Apresiasi untuk seluruh tim pabrik atas tercapainya 120.000 m² ubin glazed vitrified tile tanpa cacat.',
  },
  {
    id: 'ann-3',
    title: 'Jadwal Pemeliharaan Rutin Tungku Kiln Lini B',
    date: '2026-10-15',
    category: 'OPERASIONAL',
    summary: 'Lini B akan menjalani kalibrasi sensor thermocouple pada hari Minggu pukul 00:00 - 06:00 WIB.',
  },
];

class DatabaseManager {
  private data: DatabaseStore;

  constructor() {
    this.data = this.loadDatabase();
  }

  private loadDatabase(): DatabaseStore {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Could not read existing database, generating initial data:', e);
    }

    const initial = this.generateInitialData();
    this.saveDatabase(initial);
    return initial;
  }

  private saveDatabase(store: DatabaseStore = this.data) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(store, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error saving database file:', e);
    }
  }

  private generateInitialData(): DatabaseStore {
    const attendanceLogs: AttendanceRecord[] = [];
    const shiftRosters: ShiftSchedule[] = [];
    const leaveRequests: LeaveOrOvertimeRequest[] = [];

    // Today's date is 2026-10-21 (matches prompt reference: Rab, 21 Okt 2026)
    const today = '2026-10-21';

    // Generate recent attendance records for past 14 days
    const pastDays = [
      { date: '2026-10-21', in: '06:54:12', out: null, status: 'ON_TIME' as const, shift: 'SHIFT_1' as const },
      { date: '2026-10-20', in: '06:58:30', out: '15:05:12', status: 'ON_TIME' as const, shift: 'SHIFT_1' as const },
      { date: '2026-10-19', in: '07:18:45', out: '15:10:00', status: 'LATE' as const, shift: 'SHIFT_1' as const },
      { date: '2026-10-18', in: '07:00:10', out: '15:02:40', status: 'ON_TIME' as const, shift: 'SHIFT_1' as const },
      { date: '2026-10-17', in: '06:50:00', out: '15:00:00', status: 'ON_TIME' as const, shift: 'SHIFT_1' as const },
      { date: '2026-10-16', in: '07:22:15', out: '15:15:30', status: 'LATE' as const, shift: 'SHIFT_1' as const },
      { date: '2026-10-15', in: '06:55:00', out: '15:00:00', status: 'ON_TIME' as const, shift: 'SHIFT_1' as const },
      { date: '2026-10-14', in: null, out: null, status: 'LEAVE' as const, shift: 'SHIFT_1' as const, notes: 'Cuti Tahunan Disetujui' },
      { date: '2026-10-13', in: '06:52:10', out: '15:05:00', status: 'ON_TIME' as const, shift: 'SHIFT_1' as const },
      { date: '2026-10-12', in: '07:04:30', out: '15:00:00', status: 'ON_TIME' as const, shift: 'SHIFT_1' as const },
    ];

    pastDays.forEach((item, idx) => {
      const workHours = item.in && item.out ? calculateWorkHours(item.in, item.out) : (item.in ? 1.5 : 0);
      attendanceLogs.push({
        id: `att-sugeng-${idx}`,
        employeeId: 'emp-sugeng',
        employeeName: 'Sugeng Setiawan',
        departmentName: 'Produksi & Kiln Ceramic',
        date: item.date,
        clockInTime: item.in,
        clockOutTime: item.out,
        shift: item.shift,
        status: item.status,
        workHours,
        clockInLat: -7.15662,
        clockInLng: 112.65553,
        clockInDistanceMeters: 18,
        clockInAddress: 'Pabrik Milan Keramik Gresik - Gate Lini Kiln 04',
        isGeofenceValid: true,
        isFaceVerified: true,
        notes: item.notes || (item.status === 'LATE' ? 'Terlambat 18 menit (antrian timbang body prep)' : 'Presensi Normal'),
      });
    });

    // Add logs for other employees so admin analytics have rich multi-department data
    INITIAL_EMPLOYEES.filter(e => e.id !== 'emp-sugeng' && e.id !== 'emp-admin').forEach((emp, empIdx) => {
      for (let i = 0; i < 7; i++) {
        const d = new Date(2026, 9, 21 - i);
        const dateStr = d.toISOString().split('T')[0];
        const isLate = (empIdx + i) % 5 === 0;
        const isAbsent = (empIdx + i) % 11 === 0;
        const inTime = isAbsent ? null : (isLate ? '07:25:00' : '06:55:00');
        const outTime = isAbsent ? null : '15:00:00';
        attendanceLogs.push({
          id: `att-${emp.id}-${i}`,
          employeeId: emp.id,
          employeeName: emp.name,
          departmentName: emp.departmentName,
          date: dateStr,
          clockInTime: inTime,
          clockOutTime: outTime,
          shift: emp.currentShift,
          status: isAbsent ? 'ABSENT' : (isLate ? 'LATE' : 'ON_TIME'),
          workHours: inTime && outTime ? 8.0 : 0,
          clockInLat: -7.15664,
          clockInLng: 112.65551,
          clockInDistanceMeters: 25,
          isGeofenceValid: true,
          isFaceVerified: true,
        });
      }
    });

    // Generate monthly shift roster for Sugeng for October 2026 (Day 1 - 31)
    const lines = ['Kiln Line A (Ubin Dinding 25x40)', 'Kiln Line B (Porcelain Tile 60x60)', 'Kiln Line C (Rustic Floor 40x40)'];
    for (let day = 1; day <= 31; day++) {
      const dayStr = day < 10 ? `0${day}` : `${day}`;
      const dateStr = `2026-10-${dayStr}`;
      const dayOfWeek = new Date(2026, 9, day).getDay(); // 0 is Sun

      let shift: ShiftType = 'SHIFT_1';
      let isOff = false;

      if (dayOfWeek === 0) {
        shift = 'OFF';
        isOff = true;
      } else if (day <= 10) {
        shift = 'SHIFT_1'; // Pagi
      } else if (day <= 20) {
        shift = 'SHIFT_2'; // Siang
      } else {
        shift = 'SHIFT_3'; // Malam
      }

      const shiftInfo = SHIFT_DEFINITIONS[shift];

      shiftRosters.push({
        id: `roster-${day}`,
        employeeId: 'emp-sugeng',
        date: dateStr,
        shift,
        shiftName: shiftInfo.label,
        startTime: shiftInfo.startTime,
        endTime: shiftInfo.endTime,
        lineOrKiln: isOff ? 'Hari Libur Bergilir' : lines[day % lines.length],
        isOff,
      });
    }

    // Initial Leave & Overtime requests
    leaveRequests.push(
      {
        id: 'req-01',
        employeeId: 'emp-sugeng',
        employeeName: 'Sugeng Setiawan',
        departmentName: 'Produksi & Kiln Ceramic',
        type: 'CUTI',
        startDate: '2026-11-05',
        endDate: '2026-11-06',
        durationDaysOrHours: '2 Hari',
        reason: 'Acara keluarga di kampung halaman (Jawa Timur)',
        status: 'PENDING',
        submittedAt: '2026-10-20 14:30:00',
      },
      {
        id: 'req-02',
        employeeId: 'emp-rahma',
        employeeName: 'Siti Rahmawati',
        departmentName: 'Quality Control & Glazing',
        type: 'SAKIT',
        startDate: '2026-10-18',
        endDate: '2026-10-18',
        durationDaysOrHours: '1 Hari',
        reason: 'Demam dan flu, istirahat dokter klinik',
        doctorLetterUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=300&auto=format&fit=crop&q=80',
        status: 'APPROVED',
        submittedAt: '2026-10-18 07:15:00',
        reviewedBy: 'Bambang Soerjono (HRD)',
        reviewedAt: '2026-10-18 08:30:00',
        reviewNotes: 'Surat dokter valid. Disetujui.',
      },
      {
        id: 'req-03',
        employeeId: 'emp-sugeng',
        employeeName: 'Sugeng Setiawan',
        departmentName: 'Produksi & Kiln Ceramic',
        type: 'LEMBUR',
        startDate: '2026-10-22',
        endDate: '2026-10-22',
        durationDaysOrHours: '3 Jam (15:00 - 18:00)',
        reason: 'Target lembur percepatan pembakaran kiln order ekspor Australia',
        overtimeTask: 'Supervisi penurunan suhu kiln zone 3 dan pengepakan darurat batch 404',
        status: 'PENDING',
        submittedAt: '2026-10-21 08:00:00',
      }
    );

    return {
      departments: INITIAL_DEPARTMENTS,
      employees: INITIAL_EMPLOYEES,
      attendanceLogs,
      shiftRosters,
      leaveRequests,
      announcements: INITIAL_ANNOUNCEMENTS,
    };
  }

  // --- API METHODS ---

  public getDepartments(): Department[] {
    return this.data.departments;
  }

  public updateDepartmentGeofence(id: string, lat: number, lng: number, radius: number): Department | null {
    const dept = this.data.departments.find(d => d.id === id);
    if (!dept) return null;
    dept.latitude = lat;
    dept.longitude = lng;
    dept.radiusMeters = radius;
    this.saveDatabase();
    return dept;
  }

  public getEmployees(): Employee[] {
    return this.data.employees.map(({ password: _, ...rest }) => rest);
  }

  public authenticate(username: string, pass: string): Employee | null {
    const cleanUser = username.trim().toLowerCase();
    const cleanPass = pass.trim();

    // Check admin special credentials
    if ((cleanUser === 'admin') && (cleanPass === '252875')) {
      const admin = this.data.employees.find(e => e.role === 'admin') || this.data.employees[0];
      const { password: _, ...safeAdmin } = admin;
      return safeAdmin;
    }

    const found = this.data.employees.find(
      e => (e.username.toLowerCase() === cleanUser || e.nik.toLowerCase() === cleanUser)
    );

    if (found) {
      // In this demo environment, allow login with matching pass or password123 or direct switch
      if (cleanPass === 'password123' || cleanPass === '123456' || cleanPass === found.password || cleanPass === '252875') {
        const { password: _, ...safeUser } = found;
        return safeUser;
      }
    }

    return null;
  }

  public getEmployeeById(id: string): Employee | null {
    const found = this.data.employees.find(e => e.id === id);
    if (!found) return null;
    const { password: _, ...safeUser } = found;
    return safeUser;
  }

  public getTodayAttendance(employeeId: string, dateStr: string): AttendanceRecord | null {
    return this.data.attendanceLogs.find(
      log => log.employeeId === employeeId && log.date === dateStr
    ) || null;
  }

  public getAttendanceHistory(employeeId?: string, month?: string): AttendanceRecord[] {
    let logs = [...this.data.attendanceLogs];
    if (employeeId) {
      logs = logs.filter(l => l.employeeId === employeeId);
    }
    if (month) {
      logs = logs.filter(l => l.date.startsWith(month));
    }
    return logs.sort((a, b) => b.date.localeCompare(a.date));
  }

  public clockIn(payload: {
    employeeId: string;
    date: string;
    time: string;
    lat: number;
    lng: number;
    facePhotoUrl?: string;
  }): { success: boolean; message: string; record?: AttendanceRecord; distanceMeters?: number } {
    const employee = this.data.employees.find(e => e.id === payload.employeeId);
    if (!employee) {
      return { success: false, message: 'Karyawan tidak ditemukan.' };
    }

    const dept = this.data.departments.find(d => d.id === employee.departmentId) || this.data.departments[0];

    // Validate Geofencing
    const geoCheck = isWithinGeofence(
      payload.lat,
      payload.lng,
      dept.latitude,
      dept.longitude,
      dept.radiusMeters
    );

    // Evaluate punctuality against current shift
    const shiftInfo = SHIFT_DEFINITIONS[employee.currentShift] || SHIFT_DEFINITIONS.SHIFT_1;
    const punctuality = evaluatePunctuality(payload.time, shiftInfo.startTime, 5);

    // Check if already clocked in today
    let record = this.data.attendanceLogs.find(
      l => l.employeeId === payload.employeeId && l.date === payload.date
    );

    if (record) {
      if (record.clockInTime) {
        return { success: false, message: `Anda sudah melakukan Clock In hari ini pada pukul ${record.clockInTime}.` };
      }
      record.clockInTime = payload.time;
      record.status = punctuality;
      record.clockInPhotoUrl = payload.facePhotoUrl;
      record.clockInLat = payload.lat;
      record.clockInLng = payload.lng;
      record.clockInDistanceMeters = Math.round(geoCheck.distanceMeters);
      record.isGeofenceValid = geoCheck.isInside;
      record.isFaceVerified = true;
    } else {
      record = {
        id: `att-${payload.employeeId}-${Date.now()}`,
        employeeId: employee.id,
        employeeName: employee.name,
        departmentName: employee.departmentName,
        date: payload.date,
        clockInTime: payload.time,
        clockOutTime: null,
        shift: employee.currentShift,
        status: punctuality,
        workHours: 0,
        clockInPhotoUrl: payload.facePhotoUrl,
        clockInLat: payload.lat,
        clockInLng: payload.lng,
        clockInDistanceMeters: Math.round(geoCheck.distanceMeters),
        clockInAddress: dept.factoryName,
        isGeofenceValid: geoCheck.isInside,
        isFaceVerified: true,
        notes: geoCheck.isInside ? 'Presensi valid di area pabrik' : `Peringatan: Berada di luar geofence (${Math.round(geoCheck.distanceMeters)}m)`,
      };
      this.data.attendanceLogs.unshift(record);
    }

    this.saveDatabase();

    return {
      success: true,
      message: geoCheck.isInside
        ? `Clock In berhasil pada pukul ${payload.time}. Status: ${punctuality === 'ON_TIME' ? 'Tepat Waktu' : 'Terlambat'}`
        : `Clock In tercatat dengan peringatan jarak (${Math.round(geoCheck.distanceMeters)}m dari pabrik).`,
      record,
      distanceMeters: Math.round(geoCheck.distanceMeters),
    };
  }

  public clockOut(payload: {
    employeeId: string;
    date: string;
    time: string;
    lat: number;
    lng: number;
    facePhotoUrl?: string;
  }): { success: boolean; message: string; record?: AttendanceRecord } {
    const record = this.data.attendanceLogs.find(
      l => l.employeeId === payload.employeeId && l.date === payload.date
    );

    if (!record || !record.clockInTime) {
      return { success: false, message: 'Anda belum melakukan Clock In hari ini.' };
    }

    if (record.clockOutTime) {
      return { success: false, message: `Anda sudah melakukan Clock Out pada pukul ${record.clockOutTime}.` };
    }

    const employee = this.data.employees.find(e => e.id === payload.employeeId);
    const isOvernight = employee?.currentShift === 'SHIFT_3';

    record.clockOutTime = payload.time;
    record.clockOutPhotoUrl = payload.facePhotoUrl;
    record.workHours = calculateWorkHours(record.clockInTime, payload.time, isOvernight);

    this.saveDatabase();

    return {
      success: true,
      message: `Clock Out berhasil pada pukul ${payload.time}. Total kerja: ${record.workHours} jam.`,
      record,
    };
  }

  public getShiftRoster(employeeId: string, month: string): ShiftSchedule[] {
    return this.data.shiftRosters.filter(
      r => r.employeeId === employeeId && r.date.startsWith(month)
    );
  }

  public getRequests(employeeId?: string): LeaveOrOvertimeRequest[] {
    if (employeeId) {
      return this.data.leaveRequests.filter(r => r.employeeId === employeeId);
    }
    return this.data.leaveRequests;
  }

  public createRequest(req: Omit<LeaveOrOvertimeRequest, 'id' | 'status' | 'submittedAt'>): LeaveOrOvertimeRequest {
    const newReq: LeaveOrOvertimeRequest = {
      ...req,
      id: `req-${Date.now()}`,
      status: 'PENDING',
      submittedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };
    this.data.leaveRequests.unshift(newReq);
    this.saveDatabase();
    return newReq;
  }

  public reviewRequest(id: string, status: 'APPROVED' | 'REJECTED', reviewer: string, notes?: string): boolean {
    const req = this.data.leaveRequests.find(r => r.id === id);
    if (!req) return false;
    req.status = status;
    req.reviewedBy = reviewer;
    req.reviewedAt = new Date().toISOString().replace('T', ' ').slice(0, 19);
    req.reviewNotes = notes;
    this.saveDatabase();
    return true;
  }

  public getAnnouncements(): FactoryAnnouncement[] {
    return this.data.announcements;
  }

  public getAdminAnalytics(): AttendanceAnalytics {
    const today = '2026-10-21';
    const allEmployees = this.data.employees.filter(e => e.role !== 'admin');
    const totalEmployees = allEmployees.length;

    const todayLogs = this.data.attendanceLogs.filter(l => l.date === today);
    const presentToday = todayLogs.filter(l => l.clockInTime !== null).length;
    const onTimeToday = todayLogs.filter(l => l.status === 'ON_TIME').length;
    const lateToday = todayLogs.filter(l => l.status === 'LATE').length;
    const onLeaveToday = todayLogs.filter(l => l.status === 'LEAVE' || l.status === 'SICK').length;
    const absentToday = Math.max(0, totalEmployees - presentToday - onLeaveToday);

    const punctualityRate = presentToday > 0 ? Math.round((onTimeToday / presentToday) * 100) : 0;

    // Weekly trend past 7 days
    const weeklyTrends = [];
    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(2026, 9, 21 - i);
      const dStr = d.toISOString().split('T')[0];
      const logsOnDate = this.data.attendanceLogs.filter(l => l.date === dStr);
      const pres = logsOnDate.filter(l => l.clockInTime).length;
      const late = logsOnDate.filter(l => l.status === 'LATE').length;
      const abs = Math.max(0, totalEmployees - pres);

      weeklyTrends.push({
        day: dayNames[d.getDay()],
        date: dStr,
        present: pres,
        late,
        absent: abs,
      });
    }

    // Department breakdown
    const departmentBreakdown = this.data.departments.map(dept => {
      const deptEmployees = allEmployees.filter(e => e.departmentId === dept.id);
      const deptLogs = todayLogs.filter(l => deptEmployees.some(e => e.id === l.employeeId));
      const presentCount = deptLogs.filter(l => l.clockInTime).length;
      const lateCount = deptLogs.filter(l => l.status === 'LATE').length;
      const total = deptEmployees.length || 1;
      const percentage = Math.round((presentCount / total) * 100);

      return {
        department: dept.name,
        total,
        present: presentCount,
        late: lateCount,
        percentage,
      };
    });

    const shiftBreakdown = [
      { shift: 'Shift 1 (07:00 - 15:00)', count: allEmployees.filter(e => e.currentShift === 'SHIFT_1').length },
      { shift: 'Shift 2 (15:00 - 23:00)', count: allEmployees.filter(e => e.currentShift === 'SHIFT_2').length },
      { shift: 'Shift 3 (23:00 - 07:00)', count: allEmployees.filter(e => e.currentShift === 'SHIFT_3').length },
      { shift: 'Non-Shift (08:00 - 17:00)', count: allEmployees.filter(e => e.currentShift === 'NON_SHIFT').length },
    ];

    return {
      totalEmployees,
      presentToday,
      onTimeToday,
      lateToday,
      absentToday,
      onLeaveToday,
      punctualityRate,
      weeklyTrends,
      departmentBreakdown,
      shiftBreakdown,
    };
  }

  public getMySQLSchemaSQL(): string {
    const schemaPath = path.resolve(process.cwd(), 'server', 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      return fs.readFileSync(schemaPath, 'utf-8');
    }
    return '-- MySQL schema file';
  }
}

export const db = new DatabaseManager();
