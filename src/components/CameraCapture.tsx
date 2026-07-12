import React, { useState, useRef } from 'react';
import { UploadCloud, RefreshCw, Check, FileText } from 'lucide-react';
import { AbsenMode } from '../types';

interface CameraCaptureProps {
  mode: AbsenMode;
  onCapture: (base64Photo: string) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  uploadProgress: number;
}

export default function CameraCapture({
  mode,
  onCapture,
  onCancel,
  isSubmitting,
  uploadProgress
}: CameraCaptureProps) {
  const [photo, setPhoto] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result && typeof event.target.result === 'string') {
        setPhoto(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleSubmit = () => {
    if (photo) {
      onCapture(photo);
    }
  };

  const handleResetPhoto = () => {
    setPhoto(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col my-8">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div>
            <h3 className="font-display font-black text-slate-800 text-lg sm:text-xl">
              Unggah Foto Absen {mode}
            </h3>
            <p className="text-xs text-slate-400 font-medium font-sans">
              Pilih foto bukti kehadiran Anda dari galeri handphone / komputer
            </p>
          </div>
          <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider font-sans ${
            mode === 'MASUK' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'
          }`}>
            {mode}
          </span>
        </div>

        {/* Capture Body */}
        <div className="p-6 flex-1 flex flex-col justify-center min-h-[280px]">
          {isSubmitting ? (
            <div className="text-center py-12 space-y-6">
              <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-emerald-500/15 animate-ping absolute" />
                <div className="w-12 h-12 border-4 border-slate-100 border-t-emerald-500 rounded-full animate-spin" />
              </div>
              <div>
                <h4 className="font-display font-black text-slate-800 text-lg">Mengirim Absensi...</h4>
                <p className="text-slate-400 font-sans font-medium text-xs mt-1">Jangan menutup halaman ini</p>
              </div>

              {/* Progress bar */}
              <div className="max-w-xs mx-auto">
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-emerald-600 font-mono text-xs font-bold mt-2">
                  {uploadProgress}% Berhasil Diunggah
                </p>
              </div>
            </div>
          ) : photo ? (
            /* PHOTO PREVIEW */
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden bg-slate-900 border-2 border-emerald-500 aspect-video shadow-lg">
                <img src={photo} alt="Preview Absensi" className="w-full h-full object-cover" />
                <div className="absolute top-4 right-4 bg-emerald-500 text-white p-2 rounded-full shadow-lg">
                  <Check className="w-5 h-5 stroke-[2.5]" />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleResetPhoto}
                  className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-xs font-sans cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" /> Ganti Foto
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-xs shadow-lg shadow-emerald-500/10 font-sans cursor-pointer"
                >
                  <Check className="w-4 h-4" /> Kirim Absen Sekarang
                </button>
              </div>
            </div>
          ) : (
            /* FILE UPLOAD / GALLERY SELECT */
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-3 border-dashed rounded-3xl p-10 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center gap-4 ${
                dragOver
                  ? 'border-emerald-500 bg-emerald-50/50 scale-[1.02]'
                  : 'border-slate-200 hover:border-emerald-400 hover:bg-slate-50/50'
              }`}
            >
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500 shadow-sm">
                <UploadCloud className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="font-display font-extrabold text-slate-800 text-sm">
                  Pilih Foto dari Galeri
                </h4>
                <p className="text-xs text-slate-400 font-sans font-medium max-w-[280px] mx-auto leading-relaxed">
                  Sentuh area ini untuk membuka album foto / galeri handphone Anda. Dukungan format gambar JPEG, PNG, atau WebP.
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          )}
        </div>

        {/* Modal Footer */}
        {!isSubmitting && (
          <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
            <button
              onClick={onCancel}
              className="px-6 py-3 bg-slate-200/80 text-slate-600 rounded-xl font-bold text-xs hover:bg-slate-200 hover:text-slate-800 transition-all font-sans cursor-pointer"
            >
              Batalkan
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
