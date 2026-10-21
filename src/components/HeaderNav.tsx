import React, { useState, useEffect } from 'react';
import { Employee } from '../types';
import { Bell, ShieldCheck, LogOut, UserCheck, Sparkles, Building2, Wifi, BatteryCharging } from 'lucide-react';

interface HeaderNavProps {
  currentUser: Employee;
  onLogout: () => void;
  onOpenLogin: () => void;
  onOpenAdmin: () => void;
  pendingRequestsCount?: number;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  currentUser,
  onLogout,
  onOpenLogin,
  onOpenAdmin,
  pendingRequestsCount = 0,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return 'Selamat pagi';
    if (hour < 15) return 'Selamat siang';
    if (hour < 18) return 'Selamat sore';
    return 'Selamat malam';
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0B2545] text-white shadow-md border-b border-blue-900/50">
      {/* Android Top Status Bar */}
      <div className="flex items-center justify-between px-4 py-1 text-[11px] font-medium text-blue-200/80 bg-[#07192f] select-none">
        <div className="flex items-center space-x-1.5 font-semibold text-white tracking-wide">
          <span>{currentTime || '08:07'}</span>
          <span className="text-[10px] text-blue-300">WIB</span>
        </div>
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-[10px] font-mono text-yellow-300 font-bold">MILAN 4G+</span>
          <Wifi className="w-3.5 h-3.5 text-blue-200" />
          <div className="flex items-center space-x-0.5">
            <span className="text-[10px]">89%</span>
            <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
          </div>
        </div>
      </div>

      {/* Main Profile & Branding Bar */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img
              src={currentUser.photoUrl}
              alt={currentUser.name}
              className="w-11 h-11 rounded-full object-cover ring-2 ring-yellow-400 shadow-md bg-blue-950"
            />
            {currentUser.role === 'admin' ? (
              <span className="absolute -bottom-1 -right-1 bg-yellow-400 text-blue-950 p-0.5 rounded-full ring-2 ring-[#0B2545]">
                <ShieldCheck className="w-3.5 h-3.5 font-bold" />
              </span>
            ) : (
              <span className="absolute -bottom-1 -right-1 bg-emerald-500 w-3 h-3 rounded-full ring-2 ring-[#0B2545]" />
            )}
          </div>

          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-xs text-blue-200 font-medium">
                {getGreeting()},
              </span>
              {currentUser.role === 'admin' && (
                <span className="text-[10px] bg-yellow-400/20 text-yellow-300 font-bold px-1.5 py-0.2 rounded border border-yellow-400/40">
                  ADMIN HRD
                </span>
              )}
            </div>
            <h1 className="text-sm font-bold text-white tracking-tight line-clamp-1">
              {currentUser.name}
            </h1>
            <p className="text-[11px] text-yellow-300/90 font-medium flex items-center space-x-1">
              <Building2 className="w-3 h-3 text-yellow-400 inline shrink-0" />
              <span className="truncate max-w-[180px]">{currentUser.position}</span>
            </p>
          </div>
        </div>

        {/* Action icons on right */}
        <div className="flex items-center space-x-2">
          {currentUser.role === 'admin' ? (
            <button
              onClick={onOpenAdmin}
              className="flex items-center space-x-1 bg-yellow-400 text-blue-950 font-bold px-2.5 py-1.5 rounded-lg text-xs hover:bg-yellow-300 active:scale-95 transition-all shadow-sm"
              title="Buka Dasbor Admin & Grafik Kehadiran"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Admin</span>
              {pendingRequestsCount > 0 && (
                <span className="w-4 h-4 bg-red-600 text-white rounded-full text-[10px] flex items-center justify-center font-bold">
                  {pendingRequestsCount}
                </span>
              )}
            </button>
          ) : (
            <button
              onClick={onOpenLogin}
              className="text-xs bg-blue-900/60 hover:bg-blue-800 text-blue-100 px-2.5 py-1.5 rounded-lg border border-blue-700/60 flex items-center space-x-1 active:scale-95 transition-all"
              title="Ganti Akun / Login Admin"
            >
              <UserCheck className="w-3.5 h-3.5 text-yellow-400" />
              <span>Ganti</span>
            </button>
          )}

          <button
            onClick={onLogout}
            className="p-1.5 text-blue-200 hover:text-white hover:bg-blue-900/60 rounded-lg transition-colors"
            title="Keluar"
            aria-label="Logout"
          >
            <LogOut className="w-4 h-4 text-blue-300 hover:text-red-400" />
          </button>
        </div>
      </div>

      {/* Milan Keramik Tile Brand Stripe */}
      <div className="h-1 w-full bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 shadow-sm" />
    </header>
  );
};
