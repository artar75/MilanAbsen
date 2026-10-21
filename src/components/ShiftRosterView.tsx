import React, { useState } from 'react';
import { ShiftSchedule, ShiftType } from '../types';
import { SHIFT_DEFINITIONS, formatIndonesianDate } from '../utils/attendanceLogic';
import {
  Calendar as CalendarIcon,
  Layers,
  ChevronLeft,
  ChevronRight,
  Factory,
  ArrowLeftRight,
  Info,
  Clock,
  Sparkles,
} from 'lucide-react';

interface ShiftRosterViewProps {
  roster: ShiftSchedule[];
  employeeName: string;
}

export const ShiftRosterView: React.FC<ShiftRosterViewProps> = ({
  roster,
  employeeName,
}) => {
  const [selectedDay, setSelectedDay] = useState<ShiftSchedule | null>(
    roster.find(r => r.date === '2026-10-21') || roster[0] || null
  );
  const [swapModalOpen, setSwapModalOpen] = useState(false);
  const [swapPartner, setSwapPartner] = useState('Agus Pratama (Lini Kiln 02)');

  // Calendar days grid for October 2026 (starts on Thursday, 31 days)
  // 2026-10-01 was Thursday (Day 4 in 0-indexed Sun=0)
  const daysInMonth = 31;
  const firstDayOfMonth = 4; // Thursday

  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);
  const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const getShiftColor = (shift: ShiftType) => {
    switch (shift) {
      case 'SHIFT_1':
        return 'bg-blue-100 text-blue-800 border-blue-300 font-bold';
      case 'SHIFT_2':
        return 'bg-amber-100 text-amber-800 border-amber-300 font-bold';
      case 'SHIFT_3':
        return 'bg-purple-100 text-purple-800 border-purple-300 font-bold';
      case 'OFF':
        return 'bg-slate-100 text-slate-500 border-slate-300';
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    }
  };

  return (
    <div className="space-y-4">
      {/* Title Card */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-blue-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#0B2545] flex items-center space-x-1.5">
              <Layers className="w-5 h-5 text-yellow-500" />
              <span>Shift &amp; Jadwal Kerja Pabrik</span>
            </h2>
            <p className="text-xs text-slate-500">
              Roster rotasi operasional kiln &amp; produksi ubin keramik.
            </p>
          </div>

          <span className="text-[11px] font-bold bg-[#0B2545] text-yellow-300 px-2.5 py-1 rounded-xl">
            Oktober 2026
          </span>
        </div>

        {/* 3 Shift Quick Info Banner */}
        <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100 text-center">
          <div className="p-2 rounded-xl bg-blue-50/80 border border-blue-200">
            <span className="text-[10px] font-bold text-blue-900 block">Shift 1 (Pagi)</span>
            <span className="text-xs font-mono font-bold text-blue-700">07:00 - 15:00</span>
          </div>

          <div className="p-2 rounded-xl bg-amber-50/80 border border-amber-200">
            <span className="text-[10px] font-bold text-amber-900 block">Shift 2 (Siang)</span>
            <span className="text-xs font-mono font-bold text-amber-700">15:00 - 23:00</span>
          </div>

          <div className="p-2 rounded-xl bg-purple-50/80 border border-purple-200">
            <span className="text-[10px] font-bold text-purple-900 block">Shift 3 (Malam)</span>
            <span className="text-xs font-mono font-bold text-purple-700">23:00 - 07:00</span>
          </div>
        </div>
      </div>

      {/* Interactive Monthly Calendar Grid */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-blue-100">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs font-bold text-[#0B2545] uppercase tracking-wider">
            Kalender Roster Karyawan: {employeeName}
          </span>
          <span className="text-[11px] text-slate-500">Klik tanggal untuk rincian</span>
        </div>

        {/* Day Header */}
        <div className="grid grid-cols-7 gap-1 text-center font-bold text-[11px] text-slate-500 pb-2 border-b border-slate-100">
          <span className="text-rose-500">Min</span>
          <span>Sen</span>
          <span>Sel</span>
          <span>Rab</span>
          <span>Kam</span>
          <span>Jum</span>
          <span>Sab</span>
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1.5 pt-2">
          {blanks.map((b) => (
            <div key={`blank-${b}`} className="h-14 rounded-lg bg-slate-50/40" />
          ))}

          {monthDays.map((day) => {
            const dayStr = day < 10 ? `0${day}` : `${day}`;
            const dateStr = `2026-10-${dayStr}`;
            const schedule = roster.find(r => r.date === dateStr);
            const isToday = dateStr === '2026-10-21';
            const isSelected = selectedDay?.date === dateStr;

            const shiftCode = schedule ? (schedule.isOff ? 'OFF' : schedule.shift.replace('SHIFT_', 'S')) : 'S1';

            return (
              <button
                key={day}
                type="button"
                onClick={() => schedule && setSelectedDay(schedule)}
                className={`h-14 rounded-xl p-1 flex flex-col justify-between items-center transition-all border text-left relative ${
                  isSelected
                    ? 'ring-2 ring-yellow-400 border-blue-900 bg-blue-50/70 shadow-sm'
                    : isToday
                    ? 'border-yellow-400 bg-yellow-50/50'
                    : 'border-slate-100 hover:bg-slate-50'
                }`}
              >
                <div className="w-full flex items-center justify-between px-0.5">
                  <span
                    className={`text-[11px] font-bold ${
                      isToday
                        ? 'text-yellow-600 bg-yellow-100 px-1 rounded'
                        : 'text-slate-700'
                    }`}
                  >
                    {day}
                  </span>
                  {isToday && (
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                  )}
                </div>

                {schedule && (
                  <span
                    className={`w-full text-center text-[10px] py-0.5 rounded border leading-none ${getShiftColor(
                      schedule.shift
                    )}`}
                  >
                    {shiftCode}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Details Card */}
      {selectedDay && (
        <div className="bg-gradient-to-r from-[#0B2545] to-[#133E87] text-white p-4 rounded-2xl shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="w-4 h-4 text-yellow-400" />
              <h3 className="text-sm font-bold text-white">
                Rincian Jadwal: {formatIndonesianDate(selectedDay.date)}
              </h3>
            </div>
            <span className="text-[11px] font-bold bg-yellow-400 text-blue-950 px-2 py-0.5 rounded-full uppercase">
              {selectedDay.shift.replace('_', ' ')}
            </span>
          </div>

          <div className="p-3 bg-black/25 rounded-xl border border-blue-800/80 grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[10px] text-blue-200 block font-medium">Jam Tugas Operasional</span>
              <span className="font-mono font-bold text-yellow-300 text-sm">
                {selectedDay.startTime} - {selectedDay.endTime} WIB
              </span>
            </div>

            <div>
              <span className="text-[10px] text-blue-200 block font-medium">Penugasan Lini / Mesin</span>
              <span className="font-semibold text-white truncate block">
                {selectedDay.lineOrKiln || 'Kiln Lini 04'}
              </span>
            </div>
          </div>

          {/* Shift Swap Button */}
          <div className="flex items-center justify-between pt-1">
            <p className="text-[11px] text-blue-200">
              Perlu berhalangan hadir pada tanggal ini?
            </p>
            <button
              onClick={() => setSwapModalOpen(true)}
              className="flex items-center space-x-1.5 bg-yellow-400 text-blue-950 font-bold text-xs px-3 py-1.5 rounded-xl hover:bg-yellow-300 active:scale-95 transition-all shadow-sm"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>Ajukan Tukar Shift</span>
            </button>
          </div>
        </div>
      )}

      {/* Shift Swap Modal */}
      {swapModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-blue-900/30 overflow-hidden text-slate-800 p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center space-x-2">
                <ArrowLeftRight className="w-5 h-5 text-yellow-600" />
                <h3 className="text-sm font-bold text-[#0B2545]">Formulir Tukar Shift</h3>
              </div>
              <button
                onClick={() => setSwapModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-500 font-medium mb-1">Tanggal Roster Anda</label>
                <input
                  type="text"
                  disabled
                  value={selectedDay ? formatIndonesianDate(selectedDay.date) : ''}
                  className="w-full p-2.5 bg-slate-100 rounded-xl border font-bold text-slate-700"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-medium mb-1">Pilih Rekan Operator Pengganti</label>
                <select
                  value={swapPartner}
                  onChange={(e) => setSwapPartner(e.target.value)}
                  className="w-full p-2.5 bg-white rounded-xl border border-slate-300 font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-yellow-400"
                >
                  <option value="Agus Pratama (Lini Kiln 02)">Agus Pratama (Lini Kiln 02)</option>
                  <option value="Budi Hartono (Gudang Keramik)">Budi Hartono (Gudang Keramik)</option>
                  <option value="Siti Rahmawati (QC Glasir)">Siti Rahmawati (QC Glasir)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 font-medium mb-1">Alasan Penukaran</label>
                <textarea
                  placeholder="Misal: Keperluan keluarga mendesak / kontrol dokter..."
                  rows={2}
                  className="w-full p-2.5 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setSwapModalOpen(false)}
                className="w-1/2 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  alert(`Pengajuan tukar shift berhasil dikirimkan ke ${swapPartner} dan Supervisor Lini!`);
                  setSwapModalOpen(false);
                }}
                className="w-1/2 py-2.5 rounded-xl bg-[#0B2545] text-yellow-300 font-bold text-xs hover:bg-[#133E87]"
              >
                Kirim Pengajuan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
