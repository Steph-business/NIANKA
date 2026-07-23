"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function UserAnalysisPage() {
  const router = useRouter();
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stepText, setStepText] = useState('Identification...');

  const handleStartAnalysis = () => {
    setIsScanning(true);
    setProgress(0);
    setStepText('Identification...');

    let currentProgress = 0;
    const steps = ['Identification...', 'Détection des anomalies...', 'Calcul du score & grade...'];
    let stepIdx = 0;

    const timer = setInterval(() => {
      currentProgress += Math.random() * 8 + 3;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(timer);
        setTimeout(() => {
          setIsScanning(false);
          router.push('/analysis/result');
        }, 800);
      }

      if (currentProgress > 35 && stepIdx === 0) {
        stepIdx = 1;
        setStepText(steps[1]);
      } else if (currentProgress > 70 && stepIdx === 1) {
        stepIdx = 2;
        setStepText(steps[2]);
      }

      setProgress(Math.floor(currentProgress));
    }, 120);
  };

  return (
    <div className="bg-slate-50 text-slate-900 font-sans min-h-screen flex flex-col">
      
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl shadow-sm border-b border-slate-200">
        <div className="flex justify-between items-center h-16 px-6 max-w-7xl mx-auto">
          <div className="flex items-center gap-8">
            <Link href="/" className="font-extrabold text-2xl tracking-tighter text-[#006947] flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#006947] text-white flex items-center justify-center text-base font-bold">N</div>
              NIANKA
            </Link>

            <div className="hidden md:flex gap-6 font-semibold text-sm">
              <Link href="/user/dashboard" className="text-slate-600 hover:text-[#006947] transition-colors">
                Dashboard
              </Link>
              <Link href="/user/analysis" className="text-[#006947] font-bold border-b-2 border-[#006947] pb-1">
                AI Analysis
              </Link>
              <Link href="/user/history" className="text-slate-600 hover:text-[#006947] transition-colors">
                History
              </Link>
              <Link href="/user/terminal" className="text-slate-600 hover:text-[#006947] transition-colors">
                Field Terminal
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-[#006947] cursor-pointer">notifications</span>
            <span className="material-symbols-outlined text-[#006947] cursor-pointer">account_circle</span>
            <Link href="/" className="font-semibold text-sm text-[#006947] ml-2">Déconnexion</Link>
          </div>
        </div>
      </nav>

      {/* Main Content Canvas */}
      <main className="flex-grow pt-24 pb-16 px-6 max-w-7xl mx-auto w-full flex flex-col md:flex-row gap-8 items-start">
        
        {/* Left Column: Input / Actions */}
        <div className="w-full md:w-1/3 flex flex-col gap-6">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col gap-4">
            <h2 className="text-xl font-bold text-slate-900">Importer Échantillon</h2>
            <p className="text-sm text-slate-600">Sélectionnez la source de l'image pour l'analyse IA.</p>

            <button className="w-full bg-slate-50 border border-slate-300 rounded-xl py-3 px-4 flex items-center justify-center gap-2 text-[#006947] font-semibold text-sm hover:bg-slate-100 transition-colors group">
              <span className="material-symbols-outlined group-hover:scale-110 transition-transform">photo_camera</span>
              Prendre une photo
            </button>

            <div className="flex items-center gap-2 my-1">
              <div className="h-px bg-slate-200 flex-grow"></div>
              <span className="text-xs text-slate-400 uppercase font-bold">OU</span>
              <div className="h-px bg-slate-200 flex-grow"></div>
            </div>

            <button className="w-full bg-[#006947] text-white rounded-xl py-3 px-4 flex items-center justify-center gap-2 font-bold text-sm hover:bg-[#005236] transition-all shadow-md active:scale-95">
              <span className="material-symbols-outlined">upload_file</span>
              Importer une image
            </button>
          </div>

          {/* Telemetry Status Panel */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200 shadow-sm hidden md:block">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#006947] animate-pulse"></span>
              Statut du Moteur IA
            </h3>
            <div className="font-mono text-xs text-slate-600 space-y-1.5">
              <div className="flex justify-between"><span>Core Engine:</span> <span className="text-[#006947] font-bold">Online</span></div>
              <div className="flex justify-between"><span>Inference Latency:</span> <span>12ms</span></div>
              <div className="flex justify-between"><span>Model Version:</span> <span>NIANKA-CV-4.2</span></div>
            </div>
          </div>
        </div>

        {/* Right Column: Workspace / Preview */}
        <div className="w-full md:w-2/3 bg-white/80 backdrop-blur-xl rounded-2xl p-6 min-h-[580px] flex flex-col relative overflow-hidden border border-slate-200 shadow-sm">
          
          <div className="flex justify-between items-center mb-6 z-10">
            <h2 className="text-xl font-bold text-slate-900">Espace de Scan IA</h2>
            <div className="flex gap-3">
              <button className="bg-slate-100 border border-slate-300 text-slate-700 font-semibold text-sm py-2 px-4 rounded-xl hover:bg-slate-200 transition-colors">
                Changer Produit
              </button>
              <button 
                onClick={handleStartAnalysis}
                disabled={isScanning}
                className="bg-[#006947] text-white font-bold text-sm py-2 px-6 rounded-xl hover:bg-[#005236] transition-all shadow-md active:scale-95 flex items-center gap-2">
                <span className="material-symbols-outlined">search</span>
                Analyser
              </button>
            </div>
          </div>

          {/* Image Preview Area */}
          <div className="flex-grow bg-slate-900 border border-slate-800 rounded-xl relative overflow-hidden flex items-center justify-center min-h-[380px]">
            <img 
              className="w-full h-full object-cover opacity-85" 
              alt="Agricultural Sample" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuD7ZrIxcjyF2wWFTtAx8aASk-VhHTnl7S-pyf-L81Nnebp-RLsOlrNJieHGAloEIsi782NFKWkLKUOFgFWuWwpy6_SZaMyCuAD5aoVj_ZdeergVCgCjLlYOHGUkisobukuFZC7uYfeUpDu9sNV-zewzOPKgK20ke9ms4rSL2_HkEKbzBwpn4mgnqfJ5mLFFNP_csa6X9pJbAfb2EX0sKTHT5Rt_ECLC_s4Kpv2hxrQbF-h9j1FSqkvpOBbVSSHti0CYqoyqMRoXfH0"
            />

            {/* Telemetry Overlays */}
            <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md p-2.5 border border-slate-700 rounded-lg text-xs font-mono text-emerald-400 space-y-0.5">
              <div>TRGT: {isScanning ? 'ACQ_LOCKED' : 'READY'}</div>
              <div>COORD: {isScanning ? 'MAPPING_PIXELS' : 'STANDBY'}</div>
            </div>

            <div className="absolute bottom-4 right-4 flex gap-2 text-slate-400">
              <span className="material-symbols-outlined text-[40px]">crop_free</span>
            </div>

            {/* Scanning Line Animation */}
            {isScanning && (
              <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981] animate-bounce" style={{ top: `${progress}%` }}></div>
            )}
          </div>

          {/* Scanning Overlay Modal */}
          {isScanning && (
            <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center z-20">
              <div className="w-48 h-48 relative flex items-center justify-center mb-6">
                <svg className="w-full h-full animate-spin text-emerald-500/20 absolute inset-0" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" fill="none" r="45" stroke="currentColor" strokeWidth="3"></circle>
                </svg>
                <span className="material-symbols-outlined text-6xl text-[#006947] animate-pulse">biotech</span>
              </div>

              <div className="text-center flex flex-col gap-2 w-64">
                <div className="flex justify-between font-bold text-sm text-white">
                  <span>{stepText}</span>
                  <span className="text-[#006947] font-mono">{progress}%</span>
                </div>

                <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div className="bg-[#006947] h-full transition-all duration-200" style={{ width: `${progress}%` }}></div>
                </div>

                <div className="font-mono text-xs text-emerald-400 mt-2 text-left opacity-80 space-y-0.5">
                  <div>&gt; executing vision_model_v4...</div>
                  <div>&gt; extracting features & defects...</div>
                  <div>&gt; cross-referencing ISO standard...</div>
                </div>
              </div>
            </div>
          )}

        </div>

      </main>

      {/* Footer */}
      <footer className="w-full py-6 bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mt-auto">
        <div className="flex flex-col md:flex-row justify-between items-center px-6 max-w-7xl mx-auto gap-4">
          <span>© 2024 NIANKA HealthTech. Precision Food Safety Intelligence.</span>
          <span className="font-bold text-emerald-400">NIANKA AI Engine v4.2</span>
        </div>
      </footer>

    </div>
  );
}
