import React, { useState } from 'react';
import { LeaveOrOvertimeRequest, RequestType, Employee } from '../types';
import { formatIndonesianDate } from '../utils/attendanceLogic';
import {
  FileText,
  PlusCircle,
  Clock,
  Calendar,
  Upload,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Bell,
  Sparkles,
  Send,
  X,
  FileCheck,
} from 'lucide-react';

interface LeaveRequestViewProps {
  currentUser: Employee;
  requests: LeaveOrOvertimeRequest[];
  onSubmitRequest: (payload: {
    type: RequestType;
    startDate: string;
    endDate: string;
    durationDaysOrHours: string;
    reason: string;
    doctorLetterUrl?: string;
    overtimeTask?: string;
  }) => Promise<void>;
}

export const LeaveRequestView: React.FC<LeaveRequestViewProps> = ({
  currentUser,
  requests,
  onSubmitRequest,
}) => {
  const [activeTab, setActiveTab] = useState<RequestType>('CUTI');
  const [showFormModal, setShowFormModal] = useState(false);
  const [startDate, setStartDate] = useState('2026-10-25');
  const [endDate, setEndDate] = useState('2026-10-26');
  const [duration, setDuration] = useState('2 Hari');
  const [reason, setReason] = useState('');
  const [overtimeTask, setOvertimeTask] = useState('Supervisi pembakaran lini kiln & finishing 60x60');
  const [doctorLetterUrl, setDoctorLetterUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert('Mohon isi alasan pengajuan secara lengkap.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmitRequest({
        type: activeTab,
        startDate,
        endDate,
        durationDaysOrHours: duration,
        reason,
        doctorLetterUrl: doctorLetterUrl || undefined,
        overtimeTask: activeTab === 'LEMBUR' ? overtimeTask : undefined,
      });

      setShowFormModal(false);
      setReason('');
      setDoctorLetterUrl(null);

      // Trigger instant push notification feedback
      setNotificationToast(`Notifikasi Instan Terkirim ke HP Atasan/HRD (Bambang Soerjono - CHCO)`);
      setTimeout(() => setNotificationToast(null), 5000);
    } catch (err) {
      alert('Gagal mengirim pengajuan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSimulatedFileUpload = () => {
    // Simulated upload of doctor note
    setDoctorLetterUrl('https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=400&auto=format&fit=crop&q=80');
  };

  return (
    <div className="space-y-4">
      {/* Instant Notification Toast */}
      {notificationToast && (
        <div className="bg-emerald-900 text-white px-4 py-3 rounded-2xl shadow-lg border border-emerald-500/50 flex items-center space-x-3 animate-bounce">
          <Bell className="w-5 h-5 text-yellow-400 shrink-0 animate-pulse" />
          <div className="text-xs">
            <p className="font-bold text-yellow-300">Notifikasi Digital Terkirim!</p>
            <p className="text-emerald-100">{notificationToast}</p>
          </div>
        </div>
      )}

      {/* Header & Quick Submit Card */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-blue-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#0B2545] flex items-center space-x-1.5">
              <FileText className="w-5 h-5 text-yellow-500" />
              <span>Pengajuan Cuti, Izin &amp; Lembur</span>
            </h2>
            <p className="text-xs text-slate-500">
              Formulir digital &amp; notifikasi persetujuan instan ke HP atasan.
            </p>
          </div>

          <button
            onClick={() => setShowFormModal(true)}
            className="flex items-center space-x-1.5 bg-gradient-to-r from-yellow-400 to-amber-500 text-blue-950 font-bold text-xs px-3 py-2 rounded-xl hover:from-yellow-300 hover:to-amber-400 active:scale-95 transition-all shadow-md"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Buat Baru</span>
          </button>
        </div>

        {/* Category Selector Tabs */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 text-center">
          <button
            onClick={() => {
              setActiveTab('CUTI');
              setDuration('2 Hari');
            }}
            className={`py-2 px-1 rounded-xl text-xs font-bold transition-all border ${
              activeTab === 'CUTI'
                ? 'bg-[#0B2545] text-yellow-300 border-[#0B2545] shadow-sm'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Cuti Tahunan
          </button>

          <button
            onClick={() => {
              setActiveTab('SAKIT');
              setDuration('1 Hari');
            }}
            className={`py-2 px-1 rounded-xl text-xs font-bold transition-all border ${
              activeTab === 'SAKIT'
                ? 'bg-[#0B2545] text-yellow-300 border-[#0B2545] shadow-sm'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Izin Sakit
          </button>

          <button
            onClick={() => {
              setActiveTab('LEMBUR');
              setDuration('3 Jam');
            }}
            className={`py-2 px-1 rounded-xl text-xs font-bold transition-all border ${
              activeTab === 'LEMBUR'
                ? 'bg-[#0B2545] text-yellow-300 border-[#0B2545] shadow-sm'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Lembur (OT)
          </button>
        </div>
      </div>

      {/* List of Requests */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-[#0B2545] uppercase tracking-wider px-1">
          Daftar Pengajuan ({requests.length})
        </h3>

        {requests.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-300 text-slate-500">
            <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-semibold">Belum ada pengajuan cuti atau lembur.</p>
          </div>
        ) : (
          requests.map((req) => (
            <div
              key={req.id}
              className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-2.5"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      req.status === 'APPROVED'
                        ? 'bg-emerald-500'
                        : req.status === 'REJECTED'
                        ? 'bg-rose-500'
                        : 'bg-amber-500'
                    }`}
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      Pengajuan {req.type === 'CUTI' ? 'Cuti Tahunan' : req.type === 'SAKIT' ? 'Izin Sakit' : 'Kerja Lembur'}
                    </h4>
                    <span className="text-[11px] text-slate-500">
                      Diajukan: {req.submittedAt}
                    </span>
                  </div>
                </div>

                {/* Status Badge */}
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                    req.status === 'APPROVED'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : req.status === 'REJECTED'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  {req.status === 'APPROVED'
                    ? 'Disetujui HRD'
                    : req.status === 'REJECTED'
                    ? 'Ditolak'
                    : 'Menunggu Persetujuan'}
                </span>
              </div>

              {/* Request Details */}
              <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs text-slate-700 border border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-500">Periode:</span>
                  <span className="font-semibold text-slate-900">
                    {req.startDate} s/d {req.endDate} ({req.durationDaysOrHours})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Alasan:</span>
                  <span className="font-medium text-slate-800 text-right max-w-[200px] truncate">
                    {req.reason}
                  </span>
                </div>
                {req.overtimeTask && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tugas Lembur:</span>
                    <span className="font-medium text-blue-900 text-right max-w-[200px] truncate">
                      {req.overtimeTask}
                    </span>
                  </div>
                )}
                {req.doctorLetterUrl && (
                  <div className="pt-1 flex items-center justify-between text-blue-700 font-semibold">
                    <span className="flex items-center space-x-1">
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>Lampiran Surat Dokter Terlampir</span>
                    </span>
                    <a
                      href={req.doctorLetterUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-yellow-600 hover:underline"
                    >
                      Lihat Foto
                    </a>
                  </div>
                )}
              </div>

              {/* Review notes if reviewed */}
              {req.reviewedBy && (
                <div className="p-2 bg-blue-50/60 rounded-lg text-[11px] text-blue-900 flex items-center justify-between">
                  <span>Ditinjau oleh: <strong>{req.reviewedBy}</strong></span>
                  <span className="text-slate-500">{req.reviewedAt}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal Form Submission */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-blue-900/30 overflow-hidden text-slate-800">
            <div className="bg-[#0B2545] text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-yellow-400" />
                <h3 className="text-sm font-bold">
                  Formulir Pengajuan {activeTab}
                </h3>
              </div>
              <button
                onClick={() => setShowFormModal(false)}
                className="text-blue-200 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  Jenis Pengajuan
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['CUTI', 'SAKIT', 'LEMBUR'] as RequestType[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setActiveTab(t)}
                      className={`py-2 rounded-xl font-bold border transition-all ${
                        activeTab === t
                          ? 'bg-[#0B2545] text-yellow-300 border-[#0B2545]'
                          : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">
                    Tanggal Mulai
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-300 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">
                    Tanggal Selesai
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-300 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  Durasi ({activeTab === 'LEMBUR' ? 'Jam' : 'Hari'})
                </label>
                <input
                  type="text"
                  required
                  placeholder="Misal: 2 Hari atau 3 Jam"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-300 font-semibold"
                />
              </div>

              {activeTab === 'LEMBUR' && (
                <div>
                  <label className="block text-slate-600 font-medium mb-1">
                    Target Tugas Lembur Produksi
                  </label>
                  <input
                    type="text"
                    required
                    value={overtimeTask}
                    onChange={(e) => setOvertimeTask(e.target.value)}
                    placeholder="Contoh: Percepatan pembakaran kiln lini 04 ubin 60x60"
                    className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-300 font-semibold"
                  />
                </div>
              )}

              {activeTab === 'SAKIT' && (
                <div>
                  <label className="block text-slate-600 font-medium mb-1">
                    Unggah Surat Dokter / Resep Klinik
                  </label>
                  {doctorLetterUrl ? (
                    <div className="flex items-center justify-between p-2.5 bg-emerald-50 rounded-xl border border-emerald-300">
                      <span className="text-emerald-800 font-bold flex items-center space-x-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Surat Dokter Terlampir</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setDoctorLetterUrl(null)}
                        className="text-xs text-rose-600 font-bold hover:underline"
                      >
                        Hapus
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSimulatedFileUpload}
                      className="w-full p-3 border-2 border-dashed border-yellow-500/60 rounded-xl bg-yellow-50/50 hover:bg-yellow-50 text-blue-950 flex items-center justify-center space-x-2 font-bold transition-all"
                    >
                      <Upload className="w-4 h-4 text-yellow-600" />
                      <span>Unggah Foto Surat Dokter</span>
                    </button>
                  )}
                </div>
              )}

              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  Alasan Keterangan Lengkap
                </label>
                <textarea
                  required
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Jelaskan kebutuhan pengajuan cuti/izin Anda..."
                  className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-yellow-400 font-normal"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="w-1/3 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-blue-950 font-bold hover:from-yellow-300 hover:to-amber-400 flex items-center justify-center space-x-1.5 shadow-md active:scale-95 transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Mengirim...' : 'Kirim ke HRD'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
