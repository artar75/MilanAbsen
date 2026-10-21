import React from 'react';
import { Home, Clock, Layers, FileText, ShieldCheck } from 'lucide-react';

interface BottomNavBarProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  isAdmin: boolean;
  onOpenAdmin: () => void;
  pendingRequestsCount?: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onSelectTab,
  isAdmin,
  onOpenAdmin,
  pendingRequestsCount = 0,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-blue-900/10 shadow-[0_-4px_20px_rgba(11,37,69,0.08)] max-w-[480px] mx-auto">
      <div className="grid grid-cols-4 py-1.5 px-2">
        {/* 1. Beranda (Home / Tile Clock) */}
        <button
          onClick={() => onSelectTab('home')}
          className={`flex flex-col items-center justify-center py-1 transition-all rounded-xl ${
            activeTab === 'home'
              ? 'text-blue-950 font-bold'
              : 'text-slate-400 hover:text-slate-600'
          }`}
          aria-label="Beranda"
        >
          <div
            className={`p-1 rounded-xl transition-all ${
              activeTab === 'home'
                ? 'bg-yellow-400 text-blue-950 shadow-sm'
                : 'text-slate-500'
            }`}
          >
            <Home className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-semibold">
            Beranda
          </span>
        </button>

        {/* 2. Riwayat Hadir (Log) */}
        <button
          onClick={() => onSelectTab('history')}
          className={`flex flex-col items-center justify-center py-1 transition-all rounded-xl ${
            activeTab === 'history'
              ? 'text-blue-950 font-bold'
              : 'text-slate-400 hover:text-slate-600'
          }`}
          aria-label="Riwayat Kehadiran"
        >
          <div
            className={`p-1 rounded-xl transition-all ${
              activeTab === 'history'
                ? 'bg-yellow-400 text-blue-950 shadow-sm'
                : 'text-slate-500'
            }`}
          >
            <Clock className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-semibold">
            Riwayat
          </span>
        </button>

        {/* 3. Shift Roster (Jadwal) */}
        <button
          onClick={() => onSelectTab('roster')}
          className={`flex flex-col items-center justify-center py-1 transition-all rounded-xl ${
            activeTab === 'roster'
              ? 'text-blue-950 font-bold'
              : 'text-slate-400 hover:text-slate-600'
          }`}
          aria-label="Jadwal Shift"
        >
          <div
            className={`p-1 rounded-xl transition-all ${
              activeTab === 'roster'
                ? 'bg-yellow-400 text-blue-950 shadow-sm'
                : 'text-slate-500'
            }`}
          >
            <Layers className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-semibold">
            Shift
          </span>
        </button>

        {/* 4. Pengajuan (Cuti & Izin) */}
        <button
          onClick={() => onSelectTab('requests')}
          className={`flex flex-col items-center justify-center py-1 transition-all rounded-xl relative ${
            activeTab === 'requests'
              ? 'text-blue-950 font-bold'
              : 'text-slate-400 hover:text-slate-600'
          }`}
          aria-label="Pengajuan Cuti dan Izin"
        >
          <div
            className={`p-1 rounded-xl transition-all relative ${
              activeTab === 'requests'
                ? 'bg-yellow-400 text-blue-950 shadow-sm'
                : 'text-slate-500'
            }`}
          >
            <FileText className="w-5 h-5" />
            {pendingRequestsCount > 0 && !isAdmin && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-yellow-500 rounded-full ring-2 ring-white" />
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-semibold">
            Pengajuan
          </span>
        </button>
      </div>

      {/* Android System Navigation Gesture Bar Indicator */}
      <div className="flex justify-center pb-1">
        <div className="w-28 h-1 bg-slate-300 rounded-full" />
      </div>
    </nav>
  );
};
