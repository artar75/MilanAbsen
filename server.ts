import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './server/db';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // --- API ROUTES ---

  // 1. Auth routes
  app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username dan password wajib diisi.' });
    }

    const user = db.authenticate(username, password);
    if (!user) {
      return res.status(401).json({ error: 'Username atau password salah.' });
    }

    return res.json({ success: true, user });
  });

  app.get('/api/auth/employees', (req, res) => {
    return res.json({ employees: db.getEmployees() });
  });

  app.get('/api/departments', (req, res) => {
    return res.json({ departments: db.getDepartments() });
  });

  // 2. Attendance routes
  app.get('/api/attendance/today', (req, res) => {
    const { employeeId, date } = req.query;
    const targetDate = (date as string) || '2026-10-21';
    if (!employeeId) {
      return res.status(400).json({ error: 'employeeId diperlukan' });
    }
    const record = db.getTodayAttendance(employeeId as string, targetDate);
    return res.json({ record });
  });

  app.post('/api/attendance/clock-in', (req, res) => {
    const { employeeId, date, time, lat, lng, facePhotoUrl } = req.body;
    if (!employeeId || !date || !time) {
      return res.status(400).json({ error: 'Data absensi tidak lengkap.' });
    }

    const result = db.clockIn({
      employeeId,
      date,
      time,
      lat: typeof lat === 'number' ? lat : -7.15664,
      lng: typeof lng === 'number' ? lng : 112.65551,
      facePhotoUrl,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }
    return res.json(result);
  });

  app.post('/api/attendance/clock-out', (req, res) => {
    const { employeeId, date, time, lat, lng, facePhotoUrl } = req.body;
    if (!employeeId || !date || !time) {
      return res.status(400).json({ error: 'Data absensi tidak lengkap.' });
    }

    const result = db.clockOut({
      employeeId,
      date,
      time,
      lat: typeof lat === 'number' ? lat : -7.15664,
      lng: typeof lng === 'number' ? lng : 112.65551,
      facePhotoUrl,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }
    return res.json(result);
  });

  app.get('/api/attendance/history', (req, res) => {
    const { employeeId, month } = req.query;
    const history = db.getAttendanceHistory(
      employeeId ? (employeeId as string) : undefined,
      month ? (month as string) : undefined
    );
    return res.json({ history });
  });

  // 3. Shifts & Roster
  app.get('/api/shifts', (req, res) => {
    const { employeeId, month } = req.query;
    const targetMonth = (month as string) || '2026-10';
    if (!employeeId) {
      return res.status(400).json({ error: 'employeeId diperlukan' });
    }
    const roster = db.getShiftRoster(employeeId as string, targetMonth);
    return res.json({ roster });
  });

  // 4. Leave & Overtime Requests
  app.get('/api/requests', (req, res) => {
    const { employeeId } = req.query;
    const requests = db.getRequests(employeeId ? (employeeId as string) : undefined);
    return res.json({ requests });
  });

  app.post('/api/requests', (req, res) => {
    const { employeeId, employeeName, departmentName, type, startDate, endDate, durationDaysOrHours, reason, doctorLetterUrl, overtimeTask } = req.body;
    if (!employeeId || !type || !startDate || !endDate || !reason) {
      return res.status(400).json({ error: 'Mohon lengkapi formulir pengajuan.' });
    }

    const newReq = db.createRequest({
      employeeId,
      employeeName,
      departmentName,
      type,
      startDate,
      endDate,
      durationDaysOrHours: durationDaysOrHours || '1 Hari',
      reason,
      doctorLetterUrl,
      overtimeTask,
    });

    return res.json({ success: true, request: newReq });
  });

  app.put('/api/requests/:id/review', (req, res) => {
    const { id } = req.params;
    const { status, reviewer, reviewNotes } = req.body;
    if (!status || (status !== 'APPROVED' && status !== 'REJECTED')) {
      return res.status(400).json({ error: 'Status tidak valid.' });
    }

    const updated = db.reviewRequest(id, status, reviewer || 'Admin HRD', reviewNotes);
    if (!updated) {
      return res.status(404).json({ error: 'Pengajuan tidak ditemukan.' });
    }
    return res.json({ success: true });
  });

  // 5. Announcements
  app.get('/api/announcements', (req, res) => {
    return res.json({ announcements: db.getAnnouncements() });
  });

  // 6. Admin exclusive: Attendance Analytics & Charts
  app.get('/api/admin/analytics', (req, res) => {
    const analytics = db.getAdminAnalytics();
    return res.json({ analytics });
  });

  app.put('/api/admin/geofence', (req, res) => {
    const { departmentId, latitude, longitude, radiusMeters } = req.body;
    if (!departmentId || latitude == null || longitude == null || radiusMeters == null) {
      return res.status(400).json({ error: 'Parameter geofence tidak valid.' });
    }

    const updated = db.updateDepartmentGeofence(
      departmentId,
      parseFloat(latitude),
      parseFloat(longitude),
      parseInt(radiusMeters, 10)
    );

    if (!updated) {
      return res.status(404).json({ error: 'Departemen tidak ditemukan.' });
    }
    return res.json({ success: true, department: updated });
  });

  app.get('/api/admin/mysql-dump', (req, res) => {
    const sql = db.getMySQLSchemaSQL();
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="milan_keramik_absensi.sql"');
    return res.send(sql);
  });

  // --- VITE DEV OR PROD STATIC ---
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server Milan Keramik Absensi berjalan di http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
