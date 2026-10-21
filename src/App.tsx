import React, { useState, useEffect } from 'react';
import {
  Employee,
  AttendanceRecord,
  ShiftSchedule,
  LeaveOrOvertimeRequest,
  Department,
  FactoryAnnouncement,
  AttendanceAnalytics,
  RequestType,
} from './types';
import { HeaderNav } from './components/HeaderNav';
import { MilanTileClockButton } from './components/MilanTileClockButton';
import { GeofenceVerificationModal } from './components/GeofenceVerificationModal';
import { FaceRecognitionModal } from './components/FaceRecognitionModal';
import { AttendanceHistoryView } from './components/AttendanceHistoryView';
import { ShiftRosterView } from './components/ShiftRosterView';
import { LeaveRequestView } from './components/LeaveRequestView';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { LoginModal } from './components/LoginModal';
import { BottomNavBar } from './components/BottomNavBar';
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  Building2,
  Calendar,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Megaphone,
} from 'lucide-react';

export default function App() {
  // Current active user (default: Sugeng Setiawan - Operator Kiln Milan Keramik)
  const [currentUser, setCurrentUser] = useState<Employee>({
    id: 'emp-sugeng',
    nik: 'MK-2023-0142',
    username: 'sugeng',
    name: 'Sugeng Setiawan',
    role: 'operator',
    departmentId: 'dept-prod',
    departmentName: 'Produksi & Kiln Ceramic',
    position: 'Operator Mesin Kiln 04',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    phone: '0813-4455-6677',
    currentShift: 'SHIFT_1',
  });

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [activeTab, setActiveTab] = useState<string>('home'); // 'home' | 'history' | 'roster' | 'requests'

  // Attendance state
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [historyRecords, setHistoryRecords] = useState<AttendanceRecord[]>([]);
  const [roster, setRoster] = useState<ShiftSchedule[]>([]);
  const [requests, setRequests] = useState<LeaveOrOvertimeRequest[]>([]);
  const [announcements, setAnnouncements] = useState<FactoryAnnouncement[]>([]);
  const [analytics, setAnalytics] = useState<AttendanceAnalytics | null>(null);

  // Modals state
  const [geofenceModalOpen, setGeofenceModalOpen] = useState(false);
  const [faceModalOpen, setFaceModalOpen] = useState(false);
  const [pendingActionType, setPendingActionType] = useState<'IN' | 'OUT'>('IN');
  const [tempGeoCoords, setTempGeoCoords] = useState<{
    lat: number;
    lng: number;
    distance: number;
    isValid: boolean;
  } | null>(null);

  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Current user's department
  const currentDept = departments.find(d => d.id === currentUser.departmentId) || {
    id: 'dept-prod',
    name: 'Produksi & Kiln Ceramic',
    code: 'PROD',
    factoryName: 'Pabrik Milan Keramik Gresik (Plant A)',
    latitude: -7.15664,
    longitude: 112.65551,
    radiusMeters: 300,
  };

  // Load initial data
  useEffect(() => {
    fetchInitialData();
  }, [currentUser.id]);

  const fetchInitialData = async () => {
    try {
      // 1. Departments & Employees
      const [deptRes, empRes] = await Promise.all([
        fetch('/api/departments'),
        fetch('/api/auth/employees'),
      ]);
      const deptData = await deptRes.json();
      const empData = await empRes.json();
      if (deptData.departments) setDepartments(deptData.departments);
      if (empData.employees) setEmployees(empData.employees);

      // 2. Today's Attendance
      const attRes = await fetch(`/api/attendance/today?employeeId=${currentUser.id}&date=2026-10-21`);
      const attData = await attRes.json();
      setTodayRecord(attData.record || null);

      // 3. History
      const histRes = await fetch(`/api/attendance/history?employeeId=${currentUser.id}`);
      const histData = await histRes.json();
      if (histData.history) setHistoryRecords(histData.history);

      // 4. Shift Roster
      const shiftRes = await fetch(`/api/shifts?employeeId=${currentUser.id}&month=2026-10`);
      const shiftData = await shiftRes.json();
      if (shiftData.roster) setRoster(shiftData.roster);

      // 5. Requests
      const reqRes = await fetch(`/api/requests?employeeId=${currentUser.role === 'admin' ? '' : currentUser.id}`);
      const reqData = await reqRes.json();
      if (reqData.requests) setRequests(reqData.requests);

      // 6. Announcements
      const annRes = await fetch('/api/announcements');
      const annData = await annRes.json();
      if (annData.announcements) setAnnouncements(annData.announcements);

      // 7. Admin Analytics
      if (currentUser.role === 'admin') {
        const anaRes = await fetch('/api/admin/analytics');
        const anaData = await anaRes.json();
        if (anaData.analytics) setAnalytics(anaData.analytics);
      }
    } catch (e) {
      console.warn('API error fetching initial data, fallback to local state:', e);
    }
  };

  // --- ATTENDANCE WORKFLOW (Geofencing GPS -> Face Recognition -> Complete) ---
  const handleInitiateAttendance = (actionType: 'IN' | 'OUT') => {
    setPendingActionType(actionType);
    setGeofenceModalOpen(true);
  };

  const handleGeofenceVerified = (coords: {
    lat: number;
    lng: number;
    distance: number;
    isValid: boolean;
  }) => {
    setTempGeoCoords(coords);
    setGeofenceModalOpen(false);
    // Proceed to Step 2: Face Recognition
    setFaceModalOpen(true);
  };

  const handleFaceVerified = async (facePhotoUrl: string) => {
    setFaceModalOpen(false);

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    const endpoint = pendingActionType === 'IN' ? '/api/attendance/clock-in' : '/api/attendance/clock-out';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: currentUser.id,
          date: '2026-10-21',
          time: timeStr,
          lat: tempGeoCoords?.lat || currentDept.latitude,
          lng: tempGeoCoords?.lng || currentDept.longitude,
          facePhotoUrl,
        }),
      });

      const data = await res.json();
      if (data.record) {
        setTodayRecord(data.record);
        setSuccessToast(
          pendingActionType === 'IN'
            ? `Berhasil Clock In (${data.record.status === 'ON_TIME' ? 'Tepat Waktu' : 'Terlambat'}). GPS & Wajah Valid!`
            : `Berhasil Clock Out! Jam kerja: ${data.record.workHours} Jam.`
        );
        setTimeout(() => setSuccessToast(null), 5000);
        fetchInitialData();
      } else {
        alert(data.message || 'Terjadi kesalahan saat memproses absensi.');
      }
    } catch (err) {
      alert('Gagal mengirim data absensi ke server.');
    }
  };

  // --- LEAVE & OVERTIME SUBMISSIONS ---
  const handleCreateRequest = async (payload: {
    type: RequestType;
    startDate: string;
    endDate: string;
    durationDaysOrHours: string;
    reason: string;
    doctorLetterUrl?: string;
    overtimeTask?: string;
  }) => {
    const res = await fetch('/api/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        employeeId: currentUser.id,
        employeeName: currentUser.name,
        departmentName: currentUser.departmentName,
      }),
    });
    const data = await res.json();
    if (data.request) {
      setRequests(prev => [data.request, ...prev]);
    }
  };

  // --- ADMIN ACTIONS ---
  const handleReviewRequest = async (id: string, status: 'APPROVED' | 'REJECTED', notes?: string) => {
    const res = await fetch(`/api/requests/${id}/review`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status,
        reviewer: currentUser.name,
        reviewNotes: notes,
      }),
    });
    if (res.ok) {
      setRequests(prev =>
        prev.map(r => (r.id === id ? { ...r, status, reviewedBy: currentUser.name, reviewNotes: notes } : r))
      );
    }
  };

  const handleUpdateGeofence = async (deptId: string, lat: number, lng: number, radius: number) => {
    const res = await fetch('/api/admin/geofence', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        departmentId: deptId,
        latitude: lat,
        longitude: lng,
        radiusMeters: radius,
      }),
    });
    const data = await res.json();
    if (data.department) {
      setDepartments(prev => prev.map(d => (d.id === deptId ? data.department : d)));
    }
  };

  const handleDownloadMySQLDump = () => {
    window.location.href = '/api/admin/mysql-dump';
  };

  // --- AUTH ACTIONS ---
  const handleLogin = async (username: string, pass: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password: pass }),
    });
    const data = await res.json();
    if (data.success && data.user) {
      setCurrentUser(data.user);
      if (data.user.role === 'admin') {
        setAdminModalOpen(true);
      }
      return { success: true };
    }
    return { success: false, error: data.error };
  };

  const handleLogout = () => {
    setLoginModalOpen(true);
  };

  const pendingRequestsCount = requests.filter(r => r.status === 'PENDING').length;

  return (
    <div className="min-h-screen bg-cloud-atmosphere ceramic-subtle-grid flex flex-col items-center">
      
      {/* Android Mobile Frame Container */}
      <div className="android-viewport w-full bg-white/80 backdrop-blur-sm min-h-screen flex flex-col pb-20 shadow-2xl border-x border-blue-900/10">
        
        {/* Android Header Bar with Milan Keramik Brand */}
        <HeaderNav
          currentUser={currentUser}
          onLogout={handleLogout}
          onOpenLogin={() => setLoginModalOpen(true)}
          onOpenAdmin={() => {
            fetchInitialData();
            setAdminModalOpen(true);
          }}
          pendingRequestsCount={pendingRequestsCount}
        />

        {/* Global Success Notification Toast */}
        {successToast && (
          <div className="mx-4 mt-3 bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-3.5 rounded-2xl shadow-lg border border-emerald-400 flex items-center space-x-2.5 animate-bounce">
            <CheckCircle2 className="w-5 h-5 text-yellow-300 shrink-0" />
            <span className="text-xs font-bold leading-tight">{successToast}</span>
          </div>
        )}

        {/* Admin Quick Alert Banner if Logged in as Admin */}
        {currentUser.role === 'admin' && (
          <div className="mx-4 mt-3 p-3 bg-gradient-to-r from-[#0B2545] to-[#133E87] text-white rounded-2xl border border-yellow-400/50 shadow-md flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-yellow-400" />
              <div>
                <h4 className="text-xs font-bold text-yellow-300">Akses Administrator Aktif</h4>
                <p className="text-[10px] text-blue-200">Laporan Grafik Kehadiran &amp; Approval Karyawan</p>
              </div>
            </div>
            <button
              onClick={() => {
                fetchInitialData();
                setAdminModalOpen(true);
              }}
              className="bg-yellow-400 text-blue-950 font-bold text-xs px-3 py-1.5 rounded-xl hover:bg-yellow-300 active:scale-95 transition-all shadow"
            >
              Lihat Grafik
            </button>
          </div>
        )}

        {/* MAIN BODY CONTENT: Switching between the 4 Essential Menus */}
        <main className="p-4 space-y-4 flex-1">
          {/* MENU 1: Tombol Check-In / Check-Out Utama (Halaman Depan) */}
          {activeTab === 'home' && (
            <div className="space-y-4">
              <MilanTileClockButton
                currentUser={currentUser}
                todayRecord={todayRecord}
                department={currentDept}
                onInitiateAttendance={handleInitiateAttendance}
                onNavigateTab={(tab) => setActiveTab(tab)}
              />

              {/* Announcements Section (Matching reference image "Pengumuman") */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-blue-100 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-[#0B2545] flex items-center space-x-1.5 uppercase tracking-wider">
                    <Megaphone className="w-4 h-4 text-yellow-600" />
                    <span>Pengumuman Pabrik</span>
                  </h3>
                  <button
                    onClick={() => alert('Seluruh pengumuman operasional pabrik telah disinkronkan.')}
                    className="text-xs font-bold text-blue-700 hover:text-blue-900"
                  >
                    Lihat semua
                  </button>
                </div>

                <div className="space-y-2.5">
                  {announcements.map((ann) => (
                    <div
                      key={ann.id}
                      className="p-3 rounded-xl bg-blue-50/60 hover:bg-blue-50 border border-blue-100 transition-colors cursor-pointer"
                      onClick={() => alert(`${ann.title}\n\n${ann.summary}`)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-400/30 text-blue-950">
                          {ann.category === 'K3_SAFETY' ? 'K3 & Keselamatan' : 'Operasional'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {ann.date}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 mt-1 line-clamp-1">
                        {ann.title}
                      </h4>
                      <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2">
                        {ann.summary}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* MENU 2: Riwayat Hadir (Attendance Log) */}
          {activeTab === 'history' && (
            <AttendanceHistoryView
              records={historyRecords}
              onRefresh={fetchInitialData}
            />
          )}

          {/* MENU 3: Shift & Jadwal Kerja (Shift Roster) */}
          {activeTab === 'roster' && (
            <ShiftRosterView
              roster={roster}
              employeeName={currentUser.name}
            />
          )}

          {/* MENU 4: Pengajuan Cuti & Izin (Request & Approval) */}
          {activeTab === 'requests' && (
            <LeaveRequestView
              currentUser={currentUser}
              requests={requests}
              onSubmitRequest={handleCreateRequest}
            />
          )}
        </main>

        {/* Android Bottom Navigation Bar */}
        <BottomNavBar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          isAdmin={currentUser.role === 'admin'}
          onOpenAdmin={() => {
            fetchInitialData();
            setAdminModalOpen(true);
          }}
          pendingRequestsCount={pendingRequestsCount}
        />
      </div>

      {/* MODAL 1: GPS Geofencing Verification */}
      <GeofenceVerificationModal
        isOpen={geofenceModalOpen}
        department={currentDept}
        actionType={pendingActionType}
        onVerified={handleGeofenceVerified}
        onCancel={() => setGeofenceModalOpen(false)}
      />

      {/* MODAL 2: Face Recognition Biometric Scan */}
      <FaceRecognitionModal
        isOpen={faceModalOpen}
        currentUser={currentUser}
        actionType={pendingActionType}
        onFaceVerified={handleFaceVerified}
        onCancel={() => setFaceModalOpen(false)}
      />

      {/* MODAL 3: Admin Dashboard (Attendance Charts, Geofence, Approvals, MySQL DDL) */}
      <AdminDashboardModal
        isOpen={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
        analytics={analytics}
        departments={departments}
        pendingRequests={requests.filter(r => r.status === 'PENDING')}
        onReviewRequest={handleReviewRequest}
        onUpdateGeofence={handleUpdateGeofence}
        onDownloadMySQLDump={handleDownloadMySQLDump}
      />

      {/* MODAL 4: Login & Quick Employee Switcher */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLogin={handleLogin}
        employees={employees}
        onSelectQuickUser={(user) => {
          setCurrentUser(user);
          if (user.role === 'admin') setAdminModalOpen(true);
        }}
      />
    </div>
  );
}
