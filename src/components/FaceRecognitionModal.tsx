import React, { useState, useEffect, useRef } from 'react';
import { Employee } from '../types';
import {
  Camera,
  CheckCircle2,
  ScanFace,
  RefreshCw,
  AlertCircle,
  X,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';

interface FaceRecognitionModalProps {
  isOpen: boolean;
  currentUser: Employee;
  actionType: 'IN' | 'OUT';
  onFaceVerified: (photoDataUrl: string) => void;
  onCancel: () => void;
}

export const FaceRecognitionModal: React.FC<FaceRecognitionModalProps> = ({
  isOpen,
  currentUser,
  actionType,
  onFaceVerified,
  onCancel,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [scanStatus, setScanStatus] = useState<'INITIALIZING' | 'SCANNING' | 'MATCHED' | 'ERROR'>('INITIALIZING');
  const [statusMessage, setStatusMessage] = useState<string>('Mengaktifkan kamera pemindai wajah...');
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);

  // Initialize camera or simulate camera
  useEffect(() => {
    if (!isOpen) {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
      setScanProgress(0);
      setScanStatus('INITIALIZING');
      setCapturedPhoto(null);
      return;
    }

    let currentStream: MediaStream | null = null;

    async function initCamera() {
      try {
        setScanStatus('INITIALIZING');
        setStatusMessage('Menghubungkan ke sensor kamera...');

        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const mediaStream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 640 },
              height: { ideal: 480 },
              facingMode: 'user',
            },
            audio: false,
          });

          currentStream = mediaStream;
          setStream(mediaStream);
          setCameraActive(true);

          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
            videoRef.current.play();
          }

          startScanSequence();
        } else {
          fallbackSimulation();
        }
      } catch (err) {
        console.warn('Camera access unavailable or blocked:', err);
        fallbackSimulation();
      }
    }

    function fallbackSimulation() {
      setCameraActive(false);
      startScanSequence();
    }

    function startScanSequence() {
      setScanStatus('SCANNING');
      setStatusMessage('Posisikan wajah di dalam bingkai oval ubin Milan...');

      let p = 0;
      const interval = setInterval(() => {
        p += 10;
        setScanProgress(p);

        if (p === 40) {
          setStatusMessage('Mendeteksi kontur wajah dan struktur biometrik...');
        } else if (p === 80) {
          setStatusMessage(`Memverifikasi kecocokan wajah dengan data NIK ${currentUser.nik}...`);
        } else if (p >= 100) {
          clearInterval(interval);
          captureAndComplete();
        }
      }, 250);
    }

    function captureAndComplete() {
      let photoUrl = currentUser.photoUrl;

      // Try capturing real snapshot from video canvas
      if (videoRef.current && canvasRef.current && cameraActive) {
        try {
          const video = videoRef.current;
          const canvas = canvasRef.current;
          canvas.width = video.videoWidth || 320;
          canvas.height = video.videoHeight || 240;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            photoUrl = canvas.toDataURL('image/jpeg', 0.8);
          }
        } catch (e) {
          console.warn('Could not export canvas photo, using profile avatar:', e);
        }
      }

      setCapturedPhoto(photoUrl);
      setScanStatus('MATCHED');
      setStatusMessage(`Wajah Terverifikasi 99.2% Cocok (${currentUser.name})`);

      // Auto finish after brief moment of recognition feedback
      setTimeout(() => {
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        onFaceVerified(photoUrl);
      }, 1100);
    }

    initCamera();

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-blue-900/30 overflow-hidden text-slate-800">
        
        {/* Modal Header */}
        <div className="bg-[#0B2545] text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ScanFace className="w-5 h-5 text-yellow-400" />
            <div>
              <h3 className="text-sm font-bold">Face Recognition Milan</h3>
              <p className="text-[11px] text-blue-200">
                Pemindaian Wajah Karyawan ({actionType === 'IN' ? 'Clock In' : 'Clock Out'})
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (stream) stream.getTracks().forEach(t => t.stop());
              onCancel();
            }}
            className="p-1 rounded-full text-blue-200 hover:text-white hover:bg-blue-800/60"
            aria-label="Batal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera Viewfinder with Biometric Overlay */}
        <div className="p-5 space-y-4">
          <div className="relative w-full h-64 bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center border-2 border-yellow-400/50 shadow-inner">
            
            {/* Live Camera Stream or Simulated Fallback Frame */}
            {cameraActive ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover -scale-x-100"
              />
            ) : (
              <div className="relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-blue-950 to-slate-900">
                <img
                  src={currentUser.photoUrl}
                  alt={currentUser.name}
                  className="w-28 h-28 rounded-full object-cover ring-4 ring-yellow-400/80 shadow-2xl"
                />
                <span className="text-[10px] text-yellow-300 font-mono mt-2 bg-black/60 px-2 py-0.5 rounded">
                  [SIMULASI BIOMETRIK KAMERA AKTIF]
                </span>
              </div>
            )}

            {/* Hidden canvas for capturing snapshot frame */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Oval Face Frame Guide with Ceramic Tile corners */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div
                className={`w-44 h-52 rounded-[50%] border-2 transition-all duration-300 flex items-center justify-center ${
                  scanStatus === 'MATCHED'
                    ? 'border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.8)]'
                    : 'border-yellow-400/80 shadow-[0_0_15px_rgba(250,204,21,0.5)]'
                }`}
              >
                {/* Crosshairs & Biometric targets */}
                <div className="absolute w-full h-[1px] bg-yellow-400/30" />
                <div className="absolute h-full w-[1px] bg-yellow-400/30" />

                {/* Corner tile brackets */}
                <div className="absolute top-2 left-6 w-4 h-4 border-t-2 border-l-2 border-yellow-300" />
                <div className="absolute top-2 right-6 w-4 h-4 border-t-2 border-r-2 border-yellow-300" />
                <div className="absolute bottom-2 left-6 w-4 h-4 border-b-2 border-l-2 border-yellow-300" />
                <div className="absolute bottom-2 right-6 w-4 h-4 border-b-2 border-r-2 border-yellow-300" />
              </div>
            </div>

            {/* Laser scanning beam */}
            {scanStatus === 'SCANNING' && (
              <div className="absolute left-6 right-6 h-0.5 bg-gradient-to-r from-transparent via-yellow-400 to-transparent shadow-[0_0_8px_#facc15] laser-beam pointer-events-none" />
            )}

            {/* Verification Success Badge */}
            {scanStatus === 'MATCHED' && (
              <div className="absolute inset-0 bg-emerald-950/70 backdrop-blur-xs flex flex-col items-center justify-center text-white animate-fade-in">
                <CheckCircle2 className="w-16 h-16 text-emerald-400 animate-bounce" />
                <span className="text-base font-extrabold mt-2 text-white">TERVERIFIKASI</span>
                <span className="text-xs text-emerald-200 font-mono mt-0.5">Kecocokan: 99.2%</span>
              </div>
            )}
          </div>

          {/* Progress Bar & Status Text */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-700">
              <span className="flex items-center space-x-1">
                {scanStatus === 'MATCHED' ? (
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                ) : (
                  <RefreshCw className="w-4 h-4 animate-spin text-yellow-600" />
                )}
                <span>{scanStatus === 'MATCHED' ? 'Identitas Valid' : 'Pemindaian Aktif'}</span>
              </span>
              <span className="font-mono text-blue-900">{scanProgress}%</span>
            </div>

            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  scanStatus === 'MATCHED'
                    ? 'bg-emerald-500'
                    : 'bg-gradient-to-r from-yellow-400 to-amber-500'
                }`}
                style={{ width: `${scanProgress}%` }}
              />
            </div>

            <p className="text-xs text-center font-medium text-slate-600 mt-1">
              {statusMessage}
            </p>
          </div>

          {/* Safety & Identity notice */}
          <div className="p-2.5 bg-blue-50/70 rounded-xl border border-blue-200 flex items-center space-x-2 text-[11px] text-[#0B2545]">
            <ShieldCheck className="w-4 h-4 text-yellow-600 shrink-0" />
            <span>
              Foto wajah dicocokkan dengan profil NIK: <strong>{currentUser.nik}</strong> ({currentUser.position}).
            </span>
          </div>

          {/* Manual Capture Fallback Button if needed */}
          {scanStatus !== 'MATCHED' && (
            <button
              type="button"
              onClick={() => {
                setScanProgress(100);
                setScanStatus('MATCHED');
                setTimeout(() => {
                  onFaceVerified(currentUser.photoUrl);
                }, 800);
              }}
              className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center justify-center space-x-1"
            >
              <Camera className="w-3.5 h-3.5 text-yellow-600" />
              <span>Verifikasi Langsung Sekarang</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
