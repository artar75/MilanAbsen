import React, { useState } from 'react';
import { AttendanceRecord } from '../types';
import { formatIndonesianDate, getStatusBadge } from '../utils/attendanceLogic';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  MapPin,
  Camera,
  Filter,
  FileSpreadsheet,
  X,
  UserCheck,
} from 'lucide-react';

interface AttendanceHistoryViewProps {
  records: AttendanceRecord[];
  onRefresh: () => void;
}

export const AttendanceHistoryView: React.FC<AttendanceHistoryViewProps> = ({
  records,
  onRefresh,
}) => {
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [filterMonth, setFilterMonth] = useState<string>('2026-10');

  const filteredRecords = records.filter(r => r.date.startsWith(filterMonth));

  // Statistics calculation
  const total = filteredRecords.length;
  const onTimeCount = filteredRecords.filter(r => r.status === 'ON_TIME').length;
  const lateCount = filteredRecords.filter(r => r.status === 'LATE').length;
  const absentCount = filteredRecords.filter(r => r.status === 'ABSENT').length;
  const totalHours = filteredRecords.reduce((acc, r) => acc + (r.workHours || 0), 0);

  return (
    <div className="space-y-4">
      {/* Page Title & Filter Header */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-blue-100 flex flex-col space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#0B2545] flex items-center space-x-1.5">
              <Clock className="w-5 h-5 text-yellow-500" />
              <span>Riwayat Hadir (Attendance Log)</span>
            </h2>
            <p className="text-xs text-slate-500">
              Catatan jam masuk, jam pulang &amp; total jam kerja real-time.
            </p>
          </div>

          <div className="flex items-center space-x-1 bg-blue-50 px-2.5 py-1.5 rounded-xl border border-blue-200">
            <Filter className="w-3.5 h-3.5 text-blue-800" />
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="text-xs font-semibold text-blue-900 bg-transparent outline-none cursor-pointer"
            >
              <option value="2026-10">Oktober 2026</option>
              <option value="2026-09">September 2026</option>
              <option value="2026-08">Agustus 2026</option>
            </select>
          </div>
        </div>

        {/* 3 Color Indicators Legend (Hijau, Kuning, Merah) */}
        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100 text-center">
          <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200">
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide block">
              ● Hijau
            </span>
            <span className="text-xs font-extrabold text-emerald-800 block">
              {onTimeCount} Tepat Waktu
            </span>
          </div>

          <div className="p-2 rounded-xl bg-amber-50 border border-amber-200">
            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wide block">
              ● Kuning
            </span>
            <span className="text-xs font-extrabold text-amber-800 block">
              {lateCount} Terlambat
            </span>
          </div>

          <div className="p-2 rounded-xl bg-rose-50 border border-rose-200">
            <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wide block">
              ● Merah
            </span>
            <span className="text-xs font-extrabold text-rose-800 block">
              {absentCount} Alpa / Cuti
            </span>
          </div>
        </div>
      </div>

      {/* Monthly Summary Statistics Card */}
      <div className="bg-gradient-to-r from-[#0B2545] to-[#133E87] text-white p-4 rounded-2xl shadow-md flex items-center justify-between">
        <div>
          <span className="text-[11px] text-yellow-300 font-bold uppercase tracking-wider">
            Total Akumulasi Jam Kerja
          </span>
          <p className="text-2xl font-black mt-0.5 tracking-tight text-white">
            {totalHours.toFixed(1)} <span className="text-sm font-medium text-blue-200">Jam</span>
          </p>
          <span className="text-[11px] text-blue-200">
            {total} hari kerja tercatat di bulan {filterMonth === '2026-10' ? 'Oktober' : 'ini'}
          </span>
        </div>

        <button
          onClick={() => alert('Fitur Cetak Rekap: Slip Rekap Kehadiran PDF sedang disiapkan untuk diunduh.')}
          className="flex items-center space-x-1.5 bg-yellow-400 text-blue-950 font-bold text-xs px-3 py-2 rounded-xl hover:bg-yellow-300 active:scale-95 transition-all shadow-sm"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Export Rekap</span>
        </button>
      </div>

      {/* List of Attendance Logs */}
      <div className="space-y-2.5">
        {filteredRecords.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-300 text-slate-500">
            <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-semibold">Belum ada riwayat absensi untuk bulan ini.</p>
          </div>
        ) : (
          filteredRecords.map((item) => {
            const badge = getStatusBadge(item.status);
            return (
              <div
                key={item.id}
                onClick={() => setSelectedRecord(item)}
                className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 hover:border-blue-400 transition-all cursor-pointer active:scale-[0.99] group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`w-3 h-3 rounded-full shrink-0 ${
                        badge.colorName === 'green'
                          ? 'bg-emerald-500 ring-2 ring-emerald-200'
                          : badge.colorName === 'yellow'
                          ? 'bg-amber-500 ring-2 ring-amber-200'
                          : 'bg-rose-500 ring-2 ring-rose-200'
                      }`}
                      title={badge.label}
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-900 transition-colors">
                        {formatIndonesianDate(item.date)}
                      </h4>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {item.shift.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${badge.bgClass} ${badge.borderClass}`}
                  >
                    {badge.label}
                  </span>
                </div>

                {/* Clock In / Out Time Stamps & Work Hours */}
                <div className="grid grid-cols-3 gap-2 mt-3 pt-2.5 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-medium block">
                      Masuk
                    </span>
                    <span className="font-mono font-bold text-slate-800">
                      {item.clockInTime || '-'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-medium block">
                      Pulang
                    </span>
                    <span className="font-mono font-bold text-slate-800">
                      {item.clockOutTime || '-'}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-medium block">
                      Total Kerja
                    </span>
                    <span className="font-mono font-bold text-blue-900">
                      {item.workHours > 0 ? `${item.workHours} Jam` : '-'}
                    </span>
                  </div>
                </div>

                {/* Verification tags */}
                <div className="flex items-center space-x-3 mt-2 text-[10px] text-slate-500 font-medium">
                  {item.isGeofenceValid && (
                    <span className="flex items-center space-x-1 text-emerald-700">
                      <MapPin className="w-3 h-3 text-emerald-600" />
                      <span>GPS Valid ({item.clockInDistanceMeters || 18}m)</span>
                    </span>
                  )}
                  {item.isFaceVerified && (
                    <span className="flex items-center space-x-1 text-blue-700">
                      <Camera className="w-3 h-3 text-blue-600" />
                      <span>Face Verified</span>
                    </span>
                  )}
                  {item.notes && (
                    <span className="text-slate-400 truncate max-w-[150px]">
                      • {item.notes}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Record Detail Inspection Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-blue-900/30 overflow-hidden text-slate-800">
            <div className="bg-[#0B2545] text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">Detail Bukti Presensi</h3>
                <p className="text-[11px] text-blue-200">
                  {formatIndonesianDate(selectedRecord.date)}
                </p>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-1 rounded-full text-blue-200 hover:text-white hover:bg-blue-800/60"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {/* Snapshot image if available */}
              <div className="flex items-center justify-center">
                {selectedRecord.clockInPhotoUrl ? (
                  <div className="relative">
                    <img
                      src={selectedRecord.clockInPhotoUrl}
                      alt="Bukti Wajah"
                      className="w-28 h-28 rounded-2xl object-cover ring-4 ring-yellow-400 shadow-md bg-slate-900"
                    />
                    <span className="absolute -bottom-2 -right-2 bg-emerald-600 text-white p-1 rounded-full shadow">
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-slate-100 flex flex-col items-center justify-center text-slate-400 border border-slate-200">
                    <Camera className="w-8 h-8 mb-1" />
                    <span className="text-[10px]">Foto Otomatis</span>
                  </div>
                )}
              </div>

              {/* Status details */}
              <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-200">
                <div className="flex justify-between">
                  <span className="text-slate-500">Karyawan:</span>
                  <span className="font-bold text-slate-900">{selectedRecord.employeeName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Departemen:</span>
                  <span className="font-medium text-slate-800">{selectedRecord.departmentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status Hadir:</span>
                  <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${getStatusBadge(selectedRecord.status).bgClass}`}>
                    {getStatusBadge(selectedRecord.status).label}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Waktu Masuk:</span>
                  <span className="font-mono font-bold text-emerald-700">
                    {selectedRecord.clockInTime || '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Waktu Pulang:</span>
                  <span className="font-mono font-bold text-blue-700">
                    {selectedRecord.clockOutTime || '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Durasi Kerja:</span>
                  <span className="font-bold text-blue-900">
                    {selectedRecord.workHours} Jam
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Lokasi / GPS:</span>
                  <span className="font-medium text-right text-slate-700 max-w-[180px] truncate">
                    {selectedRecord.clockInAddress || 'Area Pabrik Milan Gresik'}
                  </span>
                </div>
                {selectedRecord.notes && (
                  <div className="pt-2 border-t border-slate-200 text-slate-600 italic">
                    Catatan: {selectedRecord.notes}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="w-full py-2.5 rounded-xl bg-[#0B2545] text-yellow-300 font-bold hover:bg-[#133E87] transition-colors"
              >
                Tutup Rincian
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
