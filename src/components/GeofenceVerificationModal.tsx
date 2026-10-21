import React, { useState, useEffect } from 'react';
import { Department } from '../types';
import { calculateHaversineDistanceMeters, formatDistance } from '../utils/geo';
import {
  MapPin,
  Compass,
  CheckCircle2,
  AlertCircle,
  Radio,
  ArrowRight,
  X,
  Building,
  RefreshCw,
} from 'lucide-react';

interface GeofenceVerificationModalProps {
  isOpen: boolean;
  department: Department;
  actionType: 'IN' | 'OUT';
  onVerified: (coords: { lat: number; lng: number; distance: number; isValid: boolean }) => void;
  onCancel: () => void;
}

export const GeofenceVerificationModal: React.FC<GeofenceVerificationModalProps> = ({
  isOpen,
  department,
  actionType,
  onVerified,
  onCancel,
}) => {
  const [isLocating, setIsLocating] = useState(true);
  const [useSimulation, setUseSimulation] = useState(true); // Default simulation inside factory for smooth testing
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number }>({
    lat: department.latitude + 0.00012, // ~15m inside factory
    lng: department.longitude + 0.00015,
  });
  const [distance, setDistance] = useState<number>(18);
  const [isWithin, setIsWithin] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Recalculate distance when department or coordinates change
  useEffect(() => {
    if (!isOpen) return;

    setIsLocating(true);
    setErrorMsg(null);

    const timer = setTimeout(() => {
      if (useSimulation) {
        // Deterministic location inside department's factory zone
        const simLat = department.latitude + 0.00010;
        const simLng = department.longitude + 0.00012;
        setUserCoords({ lat: simLat, lng: simLng });
        const d = calculateHaversineDistanceMeters(
          simLat,
          simLng,
          department.latitude,
          department.longitude
        );
        setDistance(d);
        setIsWithin(d <= department.radiusMeters);
        setIsLocating(false);
      } else {
        // Try real browser geolocation
        if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const realLat = pos.coords.latitude;
              const realLng = pos.coords.longitude;
              setUserCoords({ lat: realLat, lng: realLng });
              const d = calculateHaversineDistanceMeters(
                realLat,
                realLng,
                department.latitude,
                department.longitude
              );
              setDistance(d);
              setIsWithin(d <= department.radiusMeters);
              setIsLocating(false);
            },
            (err) => {
              console.warn('Geolocation error, falling back to simulated factory zone:', err);
              setErrorMsg('GPS perangkat tidak dapat diakses (izin diblokir/iframe). Mengaktifkan verifikasi pabrik.');
              setUseSimulation(true);
              setIsLocating(false);
            },
            { enableHighAccuracy: true, timeout: 6000 }
          );
        } else {
          setUseSimulation(true);
          setIsLocating(false);
        }
      }
    }, 700);

    return () => clearTimeout(timer);
  }, [isOpen, useSimulation, department]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-blue-900/30 overflow-hidden text-slate-800">
        
        {/* Header */}
        <div className="bg-[#0B2545] text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-yellow-400" />
            <div>
              <h3 className="text-sm font-bold">Validasi GPS Geofencing</h3>
              <p className="text-[11px] text-blue-200">
                Presensi {actionType === 'IN' ? 'Clock In' : 'Clock Out'} Milan Keramik
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-1 rounded-full text-blue-200 hover:text-white hover:bg-blue-800/60"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Radar Scanner Animation */}
          <div className="relative h-44 bg-gradient-to-b from-[#07192F] to-[#0F2B5C] rounded-2xl flex items-center justify-center overflow-hidden border border-blue-900 shadow-inner">
            {/* Concentric radar rings */}
            <div className="absolute w-36 h-36 rounded-full border border-blue-400/20" />
            <div className="absolute w-24 h-24 rounded-full border border-blue-400/30" />
            <div className="absolute w-12 h-12 rounded-full border border-yellow-400/40" />
            
            {/* Radar wave ping */}
            {isLocating && (
              <div className="absolute w-28 h-28 rounded-full bg-yellow-400/20 radar-wave" />
            )}

            {/* Factory Marker in Center */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-yellow-400 text-blue-950 flex items-center justify-center shadow-lg ring-4 ring-yellow-400/30">
                <Building className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-yellow-300 mt-1.5 uppercase tracking-wide bg-blue-950/80 px-2 py-0.5 rounded-full border border-yellow-400/30">
                PABRIK MILAN
              </span>
            </div>

            {/* User GPS Pin */}
            {!isLocating && (
              <div
                className={`absolute z-10 flex items-center space-x-1 transition-all duration-700 ${
                  isWithin ? 'top-10 right-14' : 'top-4 right-4'
                }`}
              >
                <div className={`p-1.5 rounded-full shadow-lg ${isWithin ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                  <Radio className="w-3.5 h-3.5 animate-pulse" />
                </div>
                <span className="text-[9px] font-bold text-white bg-black/60 px-1.5 py-0.5 rounded shadow">
                  Posisi Anda ({formatDistance(distance)})
                </span>
              </div>
            )}
          </div>

          {/* Department Geofence Info */}
          <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 text-xs space-y-1">
            <div className="flex items-center justify-between font-semibold text-[#0B2545]">
              <span className="flex items-center space-x-1">
                <Compass className="w-3.5 h-3.5 text-yellow-600" />
                <span>Zona: {department.name}</span>
              </span>
              <span className="text-[11px] bg-yellow-400/30 text-blue-950 font-bold px-2 py-0.5 rounded-full">
                Maks: {department.radiusMeters} meter
              </span>
            </div>
            <p className="text-[11px] text-slate-600">
              {department.factoryName} (Koordinat: {department.latitude.toFixed(4)}, {department.longitude.toFixed(4)})
            </p>
          </div>

          {/* Distance & Validation Status */}
          <div className="p-3 rounded-xl border flex items-center justify-between text-xs transition-colors">
            {isLocating ? (
              <div className="flex items-center space-x-2 text-blue-800">
                <RefreshCw className="w-4 h-4 animate-spin text-yellow-500" />
                <span>Memindai sinyal GPS &amp; koordinat satelit...</span>
              </div>
            ) : isWithin ? (
              <div className="flex items-center space-x-2 text-emerald-700">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <div>
                  <p className="font-bold">Lokasi Valid di Area Pabrik</p>
                  <p className="text-[11px] text-slate-500">
                    Jarak ke titik tengah pabrik: <strong>{formatDistance(distance)}</strong>
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-rose-700">
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                <div>
                  <p className="font-bold">Di Luar Area Pabrik</p>
                  <p className="text-[11px] text-slate-500">
                    Jarak: <strong>{formatDistance(distance)}</strong> (Melebihi batas {department.radiusMeters}m)
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Mode Selector for Testing Flexibility */}
          <div className="flex items-center justify-between text-[11px] bg-slate-50 p-2 rounded-lg border border-slate-200">
            <span className="text-slate-600 font-medium">Mode Pengujian GPS:</span>
            <div className="flex space-x-1">
              <button
                type="button"
                onClick={() => setUseSimulation(true)}
                className={`px-2 py-1 rounded font-semibold transition-all ${
                  useSimulation
                    ? 'bg-[#0B2545] text-yellow-300 shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                Simulasi Pabrik
              </button>
              <button
                type="button"
                onClick={() => setUseSimulation(false)}
                className={`px-2 py-1 rounded font-semibold transition-all ${
                  !useSimulation
                    ? 'bg-[#0B2545] text-yellow-300 shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                GPS Asli
              </button>
            </div>
          </div>

          {errorMsg && (
            <p className="text-[11px] text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
              {errorMsg}
            </p>
          )}

          {/* Actions */}
          <div className="flex space-x-2 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="w-1/3 py-2.5 px-3 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 active:scale-95 transition-all"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={isLocating}
              onClick={() => {
                onVerified({
                  lat: userCoords.lat,
                  lng: userCoords.lng,
                  distance,
                  isValid: isWithin,
                });
              }}
              className="w-2/3 py-2.5 px-3 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-blue-950 font-bold text-xs hover:from-yellow-300 hover:to-amber-400 active:scale-95 transition-all shadow-md flex items-center justify-center space-x-1.5"
            >
              <span>Lanjut ke Face Scan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
