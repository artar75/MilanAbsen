import React, { useState, useEffect } from 'react';
import { Employee, AttendanceRecord, Department } from '../types';
import { SHIFT_DEFINITIONS, formatIndonesianDate } from '../utils/attendanceLogic';
import {
  LogIn,
  LogOut,
  MapPin,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Factory,
} from 'lucide-react';

interface MilanTileClockButtonProps {
  currentUser: Employee;
  todayRecord: AttendanceRecord | null;
  department: Department;
  onInitiateAttendance: (actionType: 'IN' | 'OUT') => void;
  onNavigateTab: (tabId: string) => void;
  announcementsCount?: number;
}

export const MilanTileClockButton: React.FC<MilanTileClockButtonProps> = ({
  currentUser,
  todayRecord,
  department,
  onInitiateAttendance,
  onNavigateTab,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentSeconds, setCurrentSeconds] = useState<string>('');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');
      setCurrentTime(`${h}:${m}`);
      setCurrentSeconds(s);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const shiftInfo = SHIFT_DEFINITIONS[currentUser.currentShift] || SHIFT_DEFINITIONS.SHIFT_1;
  const isClockedIn = Boolean(todayRecord?.clockInTime);
  const isClockedOut = Boolean(todayRecord?.clockOutTime);

  return (
    <div className="space-y-4">
      {/* 1. Shift Schedule Header Card (Adapted from reference image in Dark Blue & Bright Yellow) */}
      <div className="rounded-2xl overflow-hidden shadow-lg border border-blue-900/30 bg-white">
        {/* Top Header Banner: Dark Blue with Yellow Accent */}
        <div className="bg-[#0B2545] text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
            <span className="text-xs font-semibold tracking-wide text-blue-100">
              Jadwal Shift: {formatIndonesianDate('2026-10-21')}
            </span>
          </div>
          <span className="text-[11px] font-bold bg-yellow-400 text-blue-950 px-2 py-0.5 rounded-full uppercase tracking-wider">
            {shiftInfo.code}
          </span>
        </div>

        {/* Shift Details Body */}
        <div className="p-4 bg-gradient-to-b from-blue-50/70 to-white text-center">
          <div className="flex items-center justify-center space-x-2 mb-1">
            <Factory className="w-4 h-4 text-[#0B2545]" />
            <span className="text-base font-bold text-[#0B2545]">
              {shiftInfo.label}
            </span>
          </div>

          <p className="text-2xl font-extrabold text-[#0B2545] tracking-tight">
            {shiftInfo.startTime} - {shiftInfo.endTime} <span className="text-xs text-blue-600 font-semibold">WIB</span>
          </p>

          <p className="text-xs text-slate-500 mt-1 flex items-center justify-center space-x-1">
            <Layers className="w-3.5 h-3.5 text-yellow-500" />
            <span>Lini: {currentUser.position} • {department.factoryName}</span>
          </p>
        </div>

        {/* 2. THE SIGNATURE MILAN KERAMIK PORCELAIN TILE CLOCK BUTTON */}
        <div className="p-4 bg-gradient-to-b from-white via-sky-50/40 to-blue-50/60 flex flex-col items-center">
          {/* Porcelain Tile Outer Box */}
          <div className="w-full max-w-[340px] rounded-2xl p-1 bg-gradient-to-b from-yellow-300 via-amber-400 to-yellow-500 shadow-xl">
            <div className="milan-porcelain-tile glaze-reflection rounded-xl p-5 text-white text-center relative overflow-hidden">
              
              {/* Subtle ceramic glaze watermark */}
              <div className="absolute top-2 right-2 flex items-center space-x-1 opacity-25">
                <span className="text-[10px] font-mono tracking-widest uppercase font-black text-yellow-300">MILAN TILE</span>
              </div>

              {/* Digital Factory Clock */}
              <div className="mb-4">
                <div className="inline-flex items-baseline space-x-1 font-mono tracking-wider bg-black/40 px-3.5 py-1.5 rounded-lg border border-yellow-400/30">
                  <span className="text-2xl font-bold text-yellow-300">{currentTime || '08:07'}</span>
                  <span className="text-xs font-semibold text-yellow-400/80">:{currentSeconds || '00'}</span>
                  <span className="text-[10px] text-blue-200 ml-1 font-sans">WIB</span>
                </div>
                <div className="flex items-center justify-center space-x-3 text-[11px] text-blue-200 mt-2">
                  <span className="flex items-center space-x-1">
                    <MapPin className="w-3 h-3 text-yellow-400" />
                    <span>GPS Pabrik Valid</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center space-x-1">
                    <Camera className="w-3 h-3 text-yellow-400" />
                    <span>Face Match On</span>
                  </span>
                </div>
              </div>

              {/* Segmented Check-In / Check-Out Tile Button */}
              <div className="grid grid-cols-2 gap-2 p-1.5 bg-black/35 rounded-xl border border-yellow-400/40">
                {/* Clock In Tile Button */}
                <button
                  onClick={() => onInitiateAttendance('IN')}
                  disabled={isClockedIn}
                  className={`flex flex-col items-center justify-center py-3.5 px-2 rounded-lg font-bold text-sm transition-all relative ${
                    isClockedIn
                      ? 'bg-blue-950/60 text-slate-400 cursor-not-allowed border border-blue-900/50'
                      : 'bg-gradient-to-b from-yellow-400 to-amber-500 text-blue-950 hover:from-yellow-300 hover:to-amber-400 active:scale-95 shadow-md ring-2 ring-yellow-300/60'
                  }`}
                  aria-label="Clock In Kehadiran"
                >
                  <div className="flex items-center space-x-1.5">
                    <LogIn className={`w-4 h-4 ${isClockedIn ? 'text-slate-500' : 'text-blue-950'}`} />
                    <span className="tracking-wide">Clock In</span>
                  </div>
                  <span className="text-[10px] font-normal mt-0.5 opacity-90">
                    {isClockedIn ? 'Sudah Masuk' : 'Presensi Masuk'}
                  </span>
                  {isClockedIn && (
                    <span className="absolute top-1 right-1 text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5 fill-emerald-500 text-blue-950" />
                    </span>
                  )}
                </button>

                {/* Clock Out Tile Button */}
                <button
                  onClick={() => onInitiateAttendance('OUT')}
                  disabled={!isClockedIn || isClockedOut}
                  className={`flex flex-col items-center justify-center py-3.5 px-2 rounded-lg font-bold text-sm transition-all relative ${
                    !isClockedIn || isClockedOut
                      ? 'bg-blue-950/60 text-slate-400 cursor-not-allowed border border-blue-900/50'
                      : 'bg-gradient-to-b from-sky-400 to-blue-600 text-white hover:from-sky-300 hover:to-blue-500 active:scale-95 shadow-md ring-2 ring-sky-300/60'
                  }`}
                  aria-label="Clock Out Pulang"
                >
                  <div className="flex items-center space-x-1.5">
                    <LogOut className={`w-4 h-4 ${!isClockedIn || isClockedOut ? 'text-slate-500' : 'text-white'}`} />
                    <span className="tracking-wide">Clock Out</span>
                  </div>
                  <span className="text-[10px] font-normal mt-0.5 opacity-90">
                    {isClockedOut ? 'Sudah Pulang' : 'Presensi Pulang'}
                  </span>
                  {isClockedOut && (
                    <span className="absolute top-1 right-1 text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5 fill-emerald-500 text-blue-950" />
                    </span>
                  )}
                </button>
              </div>

              {/* Status Note under Button */}
              <div className="mt-3.5 pt-3 border-t border-blue-800/60 text-xs">
                {isClockedIn ? (
                  <div className="flex items-center justify-center space-x-1.5 text-emerald-300 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-[12px]">
                      Anda telah berhasil clock in pada pukul <strong className="text-yellow-300 font-mono">{todayRecord?.clockInTime}</strong>
                      {todayRecord?.clockOutTime && (
                        <> • Pulang: <strong className="text-yellow-300 font-mono">{todayRecord.clockOutTime}</strong></>
                      )}
                    </span>
                  </div>
                ) : (
                  <p className="text-blue-200/90 text-[12px] flex items-center justify-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-yellow-400 inline" />
                    <span>Tekan tombol di atas untuk absensi dengan validasi GPS &amp; Wajah.</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Geofence & Security Assurance Footer */}
        <div className="px-4 py-2 bg-blue-50/50 border-t border-blue-100 flex items-center justify-between text-[11px] text-slate-600">
          <span className="flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#0B2545]" />
            <span className="font-medium text-[#0B2545]">Geofence {department.name}</span>
          </span>
          <span className="text-emerald-700 font-semibold bg-emerald-100/70 px-2 py-0.5 rounded-full">
            Radius Aktif: {department.radiusMeters}m
          </span>
        </div>
      </div>

      {/* 3. Quick Action Icons Grid (Adapted from the 8 icons in reference image) */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-blue-100">
        <h3 className="text-xs font-bold text-[#0B2545] uppercase tracking-wider mb-3 px-1">
          Menu Operasional Pabrik
        </h3>
        <div className="grid grid-cols-4 gap-y-4 gap-x-2 text-center">
          {/* 1. Riwayat Hadir */}
          <button
            onClick={() => onNavigateTab('history')}
            className="flex flex-col items-center group active:scale-95 transition-transform"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-50 group-hover:bg-amber-100 text-amber-600 flex items-center justify-center shadow-sm border border-amber-200 transition-colors">
              <Clock className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-semibold text-slate-700 mt-1.5 leading-tight">
              Riwayat Hadir
            </span>
          </button>

          {/* 2. Cuti & Izin */}
          <button
            onClick={() => onNavigateTab('requests')}
            className="flex flex-col items-center group active:scale-95 transition-transform"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-50 group-hover:bg-blue-100 text-blue-600 flex items-center justify-center shadow-sm border border-blue-200 transition-colors">
              <Sparkles className="w-6 h-6 text-[#0B2545]" />
            </div>
            <span className="text-[11px] font-semibold text-slate-700 mt-1.5 leading-tight">
              Cuti &amp; Izin
            </span>
          </button>

          {/* 3. Shift Roster */}
          <button
            onClick={() => onNavigateTab('roster')}
            className="flex flex-col items-center group active:scale-95 transition-transform"
          >
            <div className="w-12 h-12 rounded-2xl bg-sky-50 group-hover:bg-sky-100 text-sky-600 flex items-center justify-center shadow-sm border border-sky-200 transition-colors">
              <Layers className="w-6 h-6 text-sky-700" />
            </div>
            <span className="text-[11px] font-semibold text-slate-700 mt-1.5 leading-tight">
              Jadwal Shift
            </span>
          </button>

          {/* 4. Lembur (Overtime) */}
          <button
            onClick={() => onNavigateTab('requests')}
            className="flex flex-col items-center group active:scale-95 transition-transform"
          >
            <div className="w-12 h-12 rounded-2xl bg-yellow-50 group-hover:bg-yellow-100 text-yellow-600 flex items-center justify-center shadow-sm border border-yellow-300 transition-colors">
              <span className="font-extrabold text-sm text-[#0B2545]">OT+</span>
            </div>
            <span className="text-[11px] font-semibold text-slate-700 mt-1.5 leading-tight">
              Form Lembur
            </span>
          </button>

          {/* 5. Geofence Radar */}
          <button
            onClick={() => onInitiateAttendance('IN')}
            className="flex flex-col items-center group active:scale-95 transition-transform"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 group-hover:bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-sm border border-emerald-200 transition-colors">
              <MapPin className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-semibold text-slate-700 mt-1.5 leading-tight">
              Cek GPS
            </span>
          </button>

          {/* 6. Pemindai Wajah */}
          <button
            onClick={() => onInitiateAttendance('IN')}
            className="flex flex-col items-center group active:scale-95 transition-transform"
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 group-hover:bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-sm border border-indigo-200 transition-colors">
              <Camera className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-semibold text-slate-700 mt-1.5 leading-tight">
              Face Scan
            </span>
          </button>

          {/* 7. SOP & K3 Keramik */}
          <button
            onClick={() => alert('SOP K3 Milan Keramik: Selalu gunakan Safety Shoes & Ear Protection di area Press & Kiln Firing.')}
            className="flex flex-col items-center group active:scale-95 transition-transform"
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-50 group-hover:bg-rose-100 text-rose-600 flex items-center justify-center shadow-sm border border-rose-200 transition-colors">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-semibold text-slate-700 mt-1.5 leading-tight">
              K3 Pabrik
            </span>
          </button>

          {/* 8. Bantuan HRD */}
          <button
            onClick={() => alert('Kontak HRD Milan Keramik: WhatsApp Hotline 0812-9876-5432 (Senin - Sabtu 08:00 - 17:00)')}
            className="flex flex-col items-center group active:scale-95 transition-transform"
          >
            <div className="w-12 h-12 rounded-2xl bg-slate-100 group-hover:bg-slate-200 text-slate-700 flex items-center justify-center shadow-sm border border-slate-200 transition-colors">
              <span className="font-bold text-xs text-[#0B2545]">HRD</span>
            </div>
            <span className="text-[11px] font-semibold text-slate-700 mt-1.5 leading-tight">
              Bantuan
            </span>
          </button>
        </div>
      </div>

      {/* 4. Production Motivation & Performance Banner (Matching reference image promo card) */}
      <div className="rounded-2xl p-4 bg-gradient-to-r from-[#0B2545] to-[#154279] text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex items-start justify-between">
          <div className="max-w-[70%]">
            <span className="bg-yellow-400 text-blue-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
              MILAN CERAMICS 2026
            </span>
            <h4 className="text-sm font-bold mt-1 text-yellow-300">
              Disiplin Presensi &amp; Kualitas Presisi
            </h4>
            <p className="text-[11px] text-blue-100/90 mt-0.5 leading-relaxed">
              Target pembakaran kiln ubin porselen 60x60 berlangsung stabil. Patuhi shift dan geofence lokasi kerja.
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-yellow-400/20 border border-yellow-400/40 flex items-center justify-center text-yellow-300 shrink-0">
            <Factory className="w-7 h-7" />
          </div>
        </div>
      </div>
    </div>
  );
};
