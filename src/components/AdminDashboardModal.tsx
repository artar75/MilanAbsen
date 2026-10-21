import React, { useState } from 'react';
import { AttendanceAnalytics, Department, LeaveOrOvertimeRequest } from '../types';
import { AdminCharts } from './AdminCharts';
import {
  ShieldCheck,
  BarChart3,
  CheckSquare,
  MapPin,
  Database,
  X,
  Download,
  Save,
  CheckCircle2,
  XCircle,
  FileCode,
  Building,
} from 'lucide-react';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  analytics: AttendanceAnalytics | null;
  departments: Department[];
  pendingRequests: LeaveOrOvertimeRequest[];
  onReviewRequest: (id: string, status: 'APPROVED' | 'REJECTED', notes?: string) => Promise<void>;
  onUpdateGeofence: (deptId: string, lat: number, lng: number, radius: number) => Promise<void>;
  onDownloadMySQLDump: () => void;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
  analytics,
  departments,
  pendingRequests,
  onReviewRequest,
  onUpdateGeofence,
  onDownloadMySQLDump,
}) => {
  const [activeTab, setActiveTab] = useState<'CHARTS' | 'APPROVALS' | 'GEOFENCE' | 'MYSQL'>('CHARTS');
  const [selectedDeptId, setSelectedDeptId] = useState<string>(departments[0]?.id || 'dept-prod');
  const selectedDept = departments.find(d => d.id === selectedDeptId) || departments[0];

  const [geoLat, setGeoLat] = useState<number>(selectedDept?.latitude || -7.15664);
  const [geoLng, setGeoLng] = useState<number>(selectedDept?.longitude || 112.65551);
  const [geoRadius, setGeoRadius] = useState<number>(selectedDept?.radiusMeters || 300);
  const [isSavingGeo, setIsSavingGeo] = useState<boolean>(false);
  const [geoSuccessMsg, setGeoSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectDept = (id: string) => {
    setSelectedDeptId(id);
    const d = departments.find(item => item.id === id);
    if (d) {
      setGeoLat(d.latitude);
      setGeoLng(d.longitude);
      setGeoRadius(d.radiusMeters);
    }
  };

  const handleSaveGeofence = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingGeo(true);
    try {
      await onUpdateGeofence(selectedDeptId, geoLat, geoLng, geoRadius);
      setGeoSuccessMsg(`Koordinat & radius untuk ${selectedDept.name} berhasil diperbarui!`);
      setTimeout(() => setGeoSuccessMsg(null), 3500);
    } catch (e) {
      alert('Gagal menyimpan konfigurasi geofence.');
    } finally {
      setIsSavingGeo(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-blue-900/30 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Admin Header */}
        <div className="bg-[#0B2545] text-white p-4 flex items-center justify-between border-b border-yellow-400/40">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-yellow-400 text-blue-950 rounded-xl font-bold shadow">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Panel Administrator HRD
                </h3>
                <span className="text-[10px] bg-yellow-400 text-blue-950 font-extrabold px-1.5 py-0.2 rounded uppercase">
                  MILAN KERAMIK
                </span>
              </div>
              <p className="text-[11px] text-blue-200">
                Grafik Kehadiran, Konfigurasi Geofence &amp; Database MySQL
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-blue-200 hover:text-white hover:bg-blue-800/60"
            aria-label="Tutup Panel Admin"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-4 bg-slate-100 p-1.5 gap-1 border-b border-slate-200 text-xs">
          <button
            onClick={() => setActiveTab('CHARTS')}
            className={`py-2 px-1 rounded-xl font-bold flex flex-col items-center justify-center transition-all ${
              activeTab === 'CHARTS'
                ? 'bg-white text-blue-900 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <BarChart3 className="w-4 h-4 mb-0.5 text-yellow-600" />
            <span className="text-[10px]">Grafik Hadir</span>
          </button>

          <button
            onClick={() => setActiveTab('APPROVALS')}
            className={`py-2 px-1 rounded-xl font-bold flex flex-col items-center justify-center transition-all relative ${
              activeTab === 'APPROVALS'
                ? 'bg-white text-blue-900 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <CheckSquare className="w-4 h-4 mb-0.5 text-blue-800" />
            <span className="text-[10px]">Approval ({pendingRequests.length})</span>
            {pendingRequests.length > 0 && (
              <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-red-600 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('GEOFENCE')}
            className={`py-2 px-1 rounded-xl font-bold flex flex-col items-center justify-center transition-all ${
              activeTab === 'GEOFENCE'
                ? 'bg-white text-blue-900 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <MapPin className="w-4 h-4 mb-0.5 text-emerald-600" />
            <span className="text-[10px]">Geofence</span>
          </button>

          <button
            onClick={() => setActiveTab('MYSQL')}
            className={`py-2 px-1 rounded-xl font-bold flex flex-col items-center justify-center transition-all ${
              activeTab === 'MYSQL'
                ? 'bg-white text-blue-900 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Database className="w-4 h-4 mb-0.5 text-indigo-600" />
            <span className="text-[10px]">MySQL DB</span>
          </button>
        </div>

        {/* Tab Body Content */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* TAB 1: Attendance Charts (Exclusive to Admin) */}
          {activeTab === 'CHARTS' && (
            <div>
              {analytics ? (
                <AdminCharts analytics={analytics} />
              ) : (
                <div className="p-8 text-center text-slate-500">
                  <BarChart3 className="w-8 h-8 text-slate-400 mx-auto mb-2 animate-bounce" />
                  <p>Memuat data analitik kehadiran karyawan...</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Approval Requests */}
          {activeTab === 'APPROVALS' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#0B2545] uppercase tracking-wider">
                  Pengajuan Menunggu Persetujuan HRD
                </h4>
                <span className="text-[11px] font-semibold text-slate-500">
                  Total: {pendingRequests.length}
                </span>
              </div>

              {pendingRequests.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="text-xs font-semibold">Semua pengajuan cuti &amp; lembur telah ditindaklanjuti.</p>
                </div>
              ) : (
                pendingRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2.5"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                          {req.type}
                        </span>
                        <h5 className="text-xs font-bold text-slate-900 mt-1">
                          {req.employeeName} ({req.departmentName})
                        </h5>
                        <p className="text-[11px] text-slate-500">
                          Periode: {req.startDate} s/d {req.endDate} ({req.durationDaysOrHours})
                        </p>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">
                        {req.submittedAt}
                      </span>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-xl text-xs text-slate-700 border border-slate-100">
                      <strong>Alasan:</strong> {req.reason}
                      {req.overtimeTask && (
                        <p className="mt-1 text-blue-900">
                          <strong>Tugas Lembur:</strong> {req.overtimeTask}
                        </p>
                      )}
                    </div>

                    {req.doctorLetterUrl && (
                      <div className="flex items-center space-x-2 text-xs text-blue-800">
                        <a
                          href={req.doctorLetterUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="font-bold underline hover:text-blue-950"
                        >
                          Lihat Lampiran Surat Dokter
                        </a>
                      </div>
                    )}

                    <div className="flex space-x-2 pt-1">
                      <button
                        onClick={() => onReviewRequest(req.id, 'REJECTED', 'Ditolak: Kebutuhan operasional shift penuh')}
                        className="w-1/2 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 flex items-center justify-center space-x-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Tolak</span>
                      </button>

                      <button
                        onClick={() => onReviewRequest(req.id, 'APPROVED', 'Disetujui oleh HRD')}
                        className="w-1/2 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow flex items-center justify-center space-x-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Setujui</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: Geofence Per Department Config */}
          {activeTab === 'GEOFENCE' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-[#0B2545] uppercase tracking-wider mb-1">
                  Penentuan Geofence Pabrik (HRD Admin)
                </h4>
                <p className="text-xs text-slate-500">
                  Atur koordinat pusat pabrik dan radius toleransi meter berdasarkan departemen karyawan.
                </p>
              </div>

              {geoSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-800 font-bold flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{geoSuccessMsg}</span>
                </div>
              )}

              {/* Department selector */}
              <div className="grid grid-cols-2 gap-2">
                {departments.map((dept) => (
                  <button
                    key={dept.id}
                    type="button"
                    onClick={() => handleSelectDept(dept.id)}
                    className={`p-2.5 rounded-xl text-left border transition-all text-xs ${
                      selectedDeptId === dept.id
                        ? 'bg-blue-50/80 border-blue-900 text-blue-950 font-bold shadow-sm'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Building className="w-3.5 h-3.5 text-yellow-600 mb-1" />
                    <p className="truncate font-bold">{dept.code} - {dept.name}</p>
                    <p className="text-[10px] text-slate-400 font-normal truncate">{dept.factoryName}</p>
                  </button>
                ))}
              </div>

              {/* Edit Form */}
              <form onSubmit={handleSaveGeofence} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">
                    Latitude Pusat Pabrik
                  </label>
                  <input
                    type="number"
                    step="0.0000001"
                    required
                    value={geoLat}
                    onChange={(e) => setGeoLat(parseFloat(e.target.value))}
                    className="w-full p-2.5 bg-white rounded-xl border border-slate-300 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">
                    Longitude Pusat Pabrik
                  </label>
                  <input
                    type="number"
                    step="0.0000001"
                    required
                    value={geoLng}
                    onChange={(e) => setGeoLng(parseFloat(e.target.value))}
                    className="w-full p-2.5 bg-white rounded-xl border border-slate-300 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">
                    Radius Validasi Geofence (Meter)
                  </label>
                  <input
                    type="number"
                    min="50"
                    max="5000"
                    required
                    value={geoRadius}
                    onChange={(e) => setGeoRadius(parseInt(e.target.value, 10))}
                    className="w-full p-2.5 bg-white rounded-xl border border-slate-300 font-mono font-bold"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Karyawan di luar radius ini akan ditolak atau diberi tanda peringatan absensi luar zona.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isSavingGeo}
                  className="w-full py-2.5 rounded-xl bg-[#0B2545] text-yellow-300 font-bold hover:bg-[#133E87] flex items-center justify-center space-x-1.5 shadow"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingGeo ? 'Menyimpan...' : 'Simpan Geofence Departemen'}</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 4: MySQL Database Tools & Export */}
          {activeTab === 'MYSQL' && (
            <div className="space-y-3 text-xs">
              <div>
                <h4 className="text-xs font-bold text-[#0B2545] uppercase tracking-wider mb-1">
                  Arsitektur Database Relasional MySQL
                </h4>
                <p className="text-xs text-slate-500">
                  Skema relasional lengkap untuk integrasi ke MySQL / MariaDB Server PT Milan Keramik.
                </p>
              </div>

              {/* MySQL Status Card */}
              <div className="p-3.5 bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-2xl shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-yellow-300 flex items-center space-x-1">
                    <Database className="w-3.5 h-3.5" />
                    <span>Engine: MySQL 8.0+ Compatible</span>
                  </span>
                  <span className="bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Active &amp; Seeded
                  </span>
                </div>
                <p className="text-[11px] text-blue-200">
                  Tabel: `departments`, `employees`, `shifts`, `shift_rosters`, `attendance_logs`, `leave_requests`.
                </p>
                <button
                  onClick={onDownloadMySQLDump}
                  className="w-full py-2 rounded-xl bg-yellow-400 text-blue-950 font-bold text-xs flex items-center justify-center space-x-1.5 hover:bg-yellow-300 active:scale-95 transition-all shadow"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh File milan_keramik_absensi.sql</span>
                </button>
              </div>

              {/* SQL Schema Preview */}
              <div className="bg-slate-900 text-slate-200 p-3.5 rounded-2xl font-mono text-[11px] space-y-2 max-h-56 overflow-y-auto">
                <div className="flex items-center justify-between text-yellow-400 font-bold border-b border-slate-700 pb-1">
                  <span className="flex items-center space-x-1">
                    <FileCode className="w-3.5 h-3.5" />
                    <span>server/schema.sql</span>
                  </span>
                  <span className="text-[10px] text-slate-400">DDL &amp; Constraints</span>
                </div>
                <pre className="text-slate-300 whitespace-pre-wrap leading-relaxed">
{`CREATE TABLE departments (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  latitude DECIMAL(10, 7) NOT NULL,
  longitude DECIMAL(10, 7) NOT NULL,
  radius_meters INT NOT NULL DEFAULT 300
);

CREATE TABLE employees (
  id VARCHAR(50) PRIMARY KEY,
  nik VARCHAR(30) NOT NULL UNIQUE,
  username VARCHAR(50) NOT NULL UNIQUE,
  role ENUM('operator', 'admin'),
  current_shift VARCHAR(20)
);

CREATE TABLE attendance_logs (
  id VARCHAR(50) PRIMARY KEY,
  employee_id VARCHAR(50) NOT NULL,
  date DATE NOT NULL,
  clock_in_time TIME NULL,
  clock_out_time TIME NULL,
  status ENUM('ON_TIME', 'LATE', 'ABSENT'),
  is_geofence_valid BOOLEAN,
  is_face_verified BOOLEAN
);`}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition-colors"
          >
            Tutup Panel
          </button>
        </div>
      </div>
    </div>
  );
};
