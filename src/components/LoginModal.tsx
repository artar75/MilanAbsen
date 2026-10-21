import React, { useState } from 'react';
import { Employee } from '../types';
import {
  LogIn,
  KeyRound,
  User,
  ShieldCheck,
  Building2,
  X,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (username: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  employees: Employee[];
  onSelectQuickUser: (user: Employee) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  employees,
  onSelectQuickUser,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await onLogin(username, password);
      if (!res.success) {
        setErrorMsg(res.error || 'Login gagal. Cek username dan password.');
      } else {
        onClose();
      }
    } catch (err) {
      setErrorMsg('Gagal terhubung ke server.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdmin = async () => {
    setUsername('admin');
    setPassword('252875');
    setLoading(true);
    const res = await onLogin('admin', '252875');
    setLoading(false);
    if (res.success) onClose();
  };

  const handleQuickSugeng = async () => {
    setUsername('sugeng');
    setPassword('123456');
    setLoading(true);
    const res = await onLogin('sugeng', '123456');
    setLoading(false);
    if (res.success) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-blue-900/30 overflow-hidden text-slate-800">
        
        {/* Header */}
        <div className="bg-[#0B2545] text-white p-5 border-b border-yellow-400/40 relative">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-yellow-400 text-blue-950 flex items-center justify-center font-black">
              M
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white">MILAN KERAMIK</h3>
              <p className="text-[11px] text-yellow-300">Portal Absensi &amp; Shift Karyawan</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full text-blue-200 hover:text-white"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          {/* Quick Demo Switcher Presets */}
          <div className="p-3 bg-gradient-to-r from-blue-50 to-amber-50 rounded-2xl border border-blue-200/80 space-y-2">
            <span className="text-[10px] font-bold text-blue-900 uppercase tracking-wider block">
              ⚡ Akun Cepat Siap Pakai:
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={handleQuickAdmin}
                className="p-2 rounded-xl bg-[#0B2545] text-yellow-300 font-bold text-[11px] hover:bg-blue-900 flex items-center space-x-1.5 shadow-sm active:scale-95 transition-all text-left"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                <div>
                  <div className="leading-tight">Admin HRD</div>
                  <div className="text-[9px] text-blue-200 font-mono">admin / 252875</div>
                </div>
              </button>

              <button
                type="button"
                onClick={handleQuickSugeng}
                className="p-2 rounded-xl bg-white border border-slate-300 text-slate-800 font-bold text-[11px] hover:bg-slate-50 flex items-center space-x-1.5 shadow-sm active:scale-95 transition-all text-left"
              >
                <User className="w-3.5 h-3.5 text-blue-800 shrink-0" />
                <div>
                  <div className="leading-tight truncate">Sugeng (Operator)</div>
                  <div className="text-[9px] text-slate-500 font-mono">sugeng / 123456</div>
                </div>
              </button>
            </div>
          </div>

          {/* Regular Login Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">
                Username / NIK Karyawan
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Contoh: admin atau sugeng"
                  className="w-full p-2.5 pl-8 bg-slate-50 rounded-xl border border-slate-300 font-medium text-slate-800 outline-none focus:ring-2 focus:ring-yellow-400"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-2.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Admin: 252875 / Karyawan: 123456"
                  className="w-full p-2.5 pl-8 bg-slate-50 rounded-xl border border-slate-300 font-medium text-slate-800 outline-none focus:ring-2 focus:ring-yellow-400"
                />
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-2.5 top-3" />
              </div>
            </div>

            {errorMsg && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center space-x-2 text-[11px]">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-blue-950 font-bold hover:from-yellow-300 hover:to-amber-400 shadow-md flex items-center justify-center space-x-2 active:scale-95 transition-all text-xs"
            >
              <LogIn className="w-4 h-4 text-blue-950" />
              <span>{loading ? 'Memverifikasi...' : 'Masuk ke Aplikasi'}</span>
            </button>
          </form>

          {/* List of other available employees */}
          <div className="pt-2 border-t border-slate-200 space-y-1.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">
              Pilihan Karyawan Pabrik Lainnya:
            </span>
            <div className="flex flex-wrap gap-1">
              {employees
                .filter(e => e.username !== 'admin' && e.username !== 'sugeng')
                .map((emp) => (
                  <button
                    key={emp.id}
                    type="button"
                    onClick={() => {
                      onSelectQuickUser(emp);
                      onClose();
                    }}
                    className="text-[10px] px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                  >
                    {emp.name.split(' ')[0]} ({emp.departmentName.split(' ')[0]})
                  </button>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
