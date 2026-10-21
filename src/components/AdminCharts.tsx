import React from 'react';
import { AttendanceAnalytics } from '../types';
import { BarChart3, PieChart, TrendingUp, Users, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

interface AdminChartsProps {
  analytics: AttendanceAnalytics;
}

export const AdminCharts: React.FC<AdminChartsProps> = ({ analytics }) => {
  const {
    totalEmployees,
    presentToday,
    onTimeToday,
    lateToday,
    absentToday,
    onLeaveToday,
    punctualityRate,
    weeklyTrends,
    departmentBreakdown,
  } = analytics;

  // Max value for weekly bar scaling
  const maxWeekly = Math.max(...weeklyTrends.map(t => t.present + t.absent), 6);

  return (
    <div className="space-y-4">
      {/* 4 Quick Stat Metric Tiles */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Hadir Hari Ini</span>
            <Users className="w-4 h-4 text-blue-800" />
          </div>
          <div className="mt-1 flex items-baseline space-x-1.5">
            <span className="text-2xl font-black text-[#0B2545]">{presentToday}</span>
            <span className="text-xs text-slate-400 font-semibold">/ {totalEmployees} Karyawan</span>
          </div>
          <span className="text-[11px] text-emerald-600 font-bold block mt-0.5">
            {Math.round((presentToday / Math.max(totalEmployees, 1)) * 100)}% Partisipasi
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Tepat Waktu</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-1 flex items-baseline space-x-1.5">
            <span className="text-2xl font-black text-emerald-700">{onTimeToday}</span>
            <span className="text-xs text-slate-400 font-semibold">({punctualityRate}%)</span>
          </div>
          <span className="text-[11px] text-amber-600 font-bold block mt-0.5">
            {lateToday} Terlambat
          </span>
        </div>
      </div>

      {/* 1. Laporan Grafik: Tren Kehadiran Mingguan (Weekly Attendance Trends) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-[#0B2545] flex items-center space-x-1.5 uppercase tracking-wider">
            <TrendingUp className="w-4 h-4 text-yellow-600" />
            <span>Grafik Tren Kehadiran 7 Hari Terakhir</span>
          </h4>
          <span className="text-[10px] text-slate-400 font-semibold">Pabrik Milan Keramik</span>
        </div>

        {/* Custom Responsive SVG / Bar Chart */}
        <div className="h-44 pt-3 flex items-end justify-between gap-2 px-1">
          {weeklyTrends.map((trend, idx) => {
            const heightPercent = Math.round((trend.present / maxWeekly) * 100);
            const latePercent = Math.round((trend.late / maxWeekly) * 100);

            return (
              <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                <div className="text-[10px] font-mono font-bold text-slate-600 mb-1 group-hover:text-blue-900">
                  {trend.present}
                </div>

                <div className="w-full max-w-[28px] bg-slate-100 rounded-t-lg relative flex flex-col justify-end overflow-hidden h-28">
                  {/* On time bar */}
                  <div
                    className="w-full bg-[#0B2545] group-hover:bg-[#133E87] transition-all"
                    style={{ height: `${Math.max(heightPercent - latePercent, 10)}%` }}
                    title={`Tepat Waktu: ${trend.present - trend.late}`}
                  />
                  {/* Late top slice */}
                  {trend.late > 0 && (
                    <div
                      className="w-full bg-yellow-400 transition-all"
                      style={{ height: `${Math.max(latePercent, 8)}%` }}
                      title={`Terlambat: ${trend.late}`}
                    />
                  )}
                </div>

                <span className="text-[10px] font-bold text-slate-600 mt-2">
                  {trend.day}
                </span>
                <span className="text-[9px] text-slate-400">
                  {trend.date.slice(8)} Okt
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-center space-x-4 pt-2 border-t border-slate-100 text-[11px] text-slate-600">
          <span className="flex items-center space-x-1">
            <span className="w-3 h-3 bg-[#0B2545] rounded-sm" />
            <span>Tepat Waktu</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-3 h-3 bg-yellow-400 rounded-sm" />
            <span>Terlambat</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-3 h-3 bg-slate-200 rounded-sm" />
            <span>Alpa / Libur</span>
          </span>
        </div>
      </div>

      {/* 2. Laporan Grafik: Distribusi Rasio Ketepatan Waktu (Donut Chart) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <h4 className="text-xs font-bold text-[#0B2545] flex items-center space-x-1.5 uppercase tracking-wider">
          <PieChart className="w-4 h-4 text-yellow-600" />
          <span>Rasio Ketepatan Waktu Karyawan</span>
        </h4>

        <div className="flex items-center justify-around py-2">
          {/* Circular SVG Donut */}
          <div className="relative w-28 h-28 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100"
                strokeWidth="4"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-emerald-500"
                strokeDasharray={`${punctualityRate}, 100`}
                strokeWidth="4"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-yellow-400"
                strokeDasharray={`${Math.max(100 - punctualityRate, 0)}, 100`}
                strokeDashoffset={`-${punctualityRate}`}
                strokeWidth="4"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-xl font-black text-[#0B2545]">{punctualityRate}%</span>
              <span className="text-[9px] text-slate-500 font-bold uppercase">Disiplin</span>
            </div>
          </div>

          {/* Legend Details */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between space-x-4">
              <span className="flex items-center space-x-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Tepat Waktu:</span>
              </span>
              <strong className="text-slate-900 font-mono">{onTimeToday} orang</strong>
            </div>

            <div className="flex items-center justify-between space-x-4">
              <span className="flex items-center space-x-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <span>Terlambat:</span>
              </span>
              <strong className="text-slate-900 font-mono">{lateToday} orang</strong>
            </div>

            <div className="flex items-center justify-between space-x-4">
              <span className="flex items-center space-x-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                <span>Cuti / Izin:</span>
              </span>
              <strong className="text-slate-900 font-mono">{onLeaveToday} orang</strong>
            </div>

            <div className="flex items-center justify-between space-x-4">
              <span className="flex items-center space-x-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                <span>Belum Hadir:</span>
              </span>
              <strong className="text-slate-900 font-mono">{absentToday} orang</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Laporan Grafik: Kehadiran Berdasarkan Departemen Pabrik */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <h4 className="text-xs font-bold text-[#0B2545] flex items-center space-x-1.5 uppercase tracking-wider">
          <BarChart3 className="w-4 h-4 text-yellow-600" />
          <span>Tingkat Kehadiran per Departemen Pabrik</span>
        </h4>

        <div className="space-y-3 pt-1">
          {departmentBreakdown.map((dept, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-800">{dept.department}</span>
                <span className="font-mono text-blue-900">
                  {dept.present}/{dept.total} ({dept.percentage}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#0B2545] to-blue-600 transition-all duration-500 rounded-full"
                  style={{ width: `${Math.max(dept.percentage, 5)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
