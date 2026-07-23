"use client";

import React, { useState } from 'react';
import Link from 'next/link';

export default function AnalysisResultPage() {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: "Bonjour. Je suis l'assistant d'analyse NIANKA. Avez-vous des questions spécifiques sur ce spécimen de Tilapia ?" }
  ]);
  const [inputValue, setInputValue] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userText = inputValue;
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setInputValue('');

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: `Analyse visuelle confirmée pour "${userText}" : Les données de fraîcheur restent optimales à 92% sans risque bactériologique détecté.`
        }
      ]);
    }, 800);
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

      {/* Main Content */}
      <main className="flex-grow pt-24 pb-16 px-6 max-w-5xl mx-auto w-full space-y-8">
        
        {/* Header Actions */}
        <div className="flex justify-between items-center">
          <Link href="/user/analysis" className="flex items-center gap-2 text-slate-600 hover:text-[#006947] transition-colors font-bold text-sm">
            <span className="material-symbols-outlined">arrow_back</span>
            <span>Retour aux analyses</span>
          </Link>

          <div className="flex gap-3">
            <button className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 px-4 py-2 rounded-full font-bold text-xs flex items-center gap-1.5 shadow-sm">
              <span className="material-symbols-outlined text-[18px]">bookmark</span>
              Sauvegarder
            </button>
            <button className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 px-4 py-2 rounded-full font-bold text-xs flex items-center gap-1.5 shadow-sm">
              <span className="material-symbols-outlined text-[18px]">download</span>
              Rapport PDF
            </button>
            <button className="bg-[#006947] text-white hover:bg-[#005236] px-5 py-2 rounded-full font-bold text-xs flex items-center gap-1.5 shadow-md">
              <span className="material-symbols-outlined text-[18px]">share</span>
              Partager
            </button>
          </div>
        </div>

        {/* Top Section: Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Image & Identity Card */}
          <div className="md:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
            <div className="h-52 relative">
              <img 
                className="w-full h-full object-cover" 
                alt="Tilapia inspection" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDKJ63TRAeuKlL2nSwYG55KBMxsSdNUWQNXA_MNB6ZHaSmVRIxJTNFF2rOKEOYWAisOV8sQ4TsiajIjiEzkOwsVAWLvwDYpWLdDFxMPYXBZZHwPetsS6i424qjSkGqjvf5d-kFAgt23ZkxTrqFFmZa7IoqcljvTRSTu56cJNCBejVU2FtYp_47Uj7M4uxFORDncJDMP_M57icPjBpb5OtTmFAnSCnB6QJ6TfxQ6S28SVomJBZuvndgww6Nboz_QVbgnEWq6YZACHKE" 
              />
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full border border-slate-200 flex items-center gap-1 text-xs font-bold text-[#006947]">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                Vérifié
              </div>
            </div>

            <div className="p-5 flex flex-col gap-2 flex-grow">
              <div>
                <h1 className="text-2xl font-black text-slate-900">Tilapia du Nil</h1>
                <p className="text-sm font-semibold text-slate-500">Catégorie: Poisson Produit Frais</p>
              </div>
              <div className="mt-auto pt-3 border-t border-slate-100 flex justify-between items-center text-xs font-mono text-slate-400">
                <span>ID: ANA-8842-X</span>
                <span>Il y a 2 min</span>
              </div>
            </div>
          </div>

          {/* Metrics & Recommendation Card */}
          <div className="md:col-span-2 flex flex-col gap-6">
            
            {/* Metrics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col gap-2 text-center items-center justify-center">
                <span className="text-xs font-bold text-slate-500 uppercase">Score de Fraîcheur</span>
                <div className="text-3xl font-black text-[#006947]">92%</div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-[#006947] h-full rounded-full w-[92%]"></div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col gap-2 text-center items-center justify-center">
                <span className="text-xs font-bold text-slate-500 uppercase">Confiance IA</span>
                <div className="text-3xl font-black text-blue-600">97%</div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full w-[97%]"></div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col gap-2 text-center items-center justify-center">
                <span className="text-xs font-bold text-slate-500 uppercase">Niveau de Risque</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-3.5 h-3.5 rounded-full bg-[#006947]"></span>
                  <span className="text-xl font-black text-slate-900">Faible</span>
                </div>
              </div>
            </div>

            {/* Recommendation Card */}
            <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-5 flex-grow flex items-start gap-4">
              <div className="bg-[#006947] text-white p-2.5 rounded-xl flex-shrink-0">
                <span className="material-symbols-outlined">restaurant</span>
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#006947] mb-1">Recommandation Officielle</h3>
                <p className="text-sm text-slate-700 leading-relaxed">
                  <strong>Consommation recommandée.</strong> Le spécimen présente d'excellents indicateurs de fraîcheur. Apte à la consommation humaine immédiate ou à la congélation selon les standards de sécurité alimentaire.
                </p>
              </div>
            </div>

          </div>

        </div>

        {/* Middle Section: IA Explain */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-blue-600">memory</span>
            <h2 className="text-xl font-bold text-slate-900">IA Explain : Marqueurs Visuels</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
              <span className="material-symbols-outlined text-[#006947] mt-0.5">check_circle</span>
              <div>
                <span className="font-bold text-sm text-slate-900 block">Clarté des yeux</span>
                <span className="text-xs text-slate-600">Cornée transparente et convexe, absence de trouble opalescent (Confiance: 98%).</span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
              <span className="material-symbols-outlined text-[#006947] mt-0.5">check_circle</span>
              <div>
                <span className="font-bold text-sm text-slate-900 block">Coloration des branchies</span>
                <span className="text-xs text-slate-600">Rouge vif caractéristique, absence de mucus abondant (Confiance: 96%).</span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
              <span className="material-symbols-outlined text-[#006947] mt-0.5">check_circle</span>
              <div>
                <span className="font-bold text-sm text-slate-900 block">Texture des écailles</span>
                <span className="text-xs text-slate-600">Écailles adhérentes et brillantes, reflets métalliques préservés (Confiance: 94%).</span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
              <span className="material-symbols-outlined text-[#006947] mt-0.5">check_circle</span>
              <div>
                <span className="font-bold text-sm text-slate-900 block">Intégrité de la peau</span>
                <span className="text-xs text-slate-600">Tension superficielle adéquate, absence de lésions ou décomposition (Confiance: 95%).</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Vision Language QA */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col h-[400px]">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <span className="material-symbols-outlined text-blue-600">forum</span>
            <h2 className="text-xl font-bold text-slate-900">Assistant Analytique QA</h2>
          </div>

          {/* Chat History */}
          <div className="flex-grow overflow-y-auto flex flex-col gap-3 mb-4 pr-2 space-y-2">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                {msg.sender === 'bot' && (
                  <div className="bg-slate-100 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 text-slate-600">
                    <span className="material-symbols-outlined text-[18px]">smart_toy</span>
                  </div>
                )}
                <div className={`p-3 rounded-2xl max-w-[80%] text-sm ${msg.sender === 'user' ? 'bg-[#006947] text-white rounded-tr-none' : 'bg-slate-100 text-slate-800 rounded-tl-none'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendMessage} className="relative mt-auto">
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Posez une question sur l'analyse..."
              className="w-full bg-slate-100 border border-slate-300 rounded-full py-3 pl-5 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-[#006947]"
            />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-[#006947] hover:text-[#005236] p-1.5 rounded-full">
              <span className="material-symbols-outlined">send</span>
            </button>
          </form>
        </div>

      </main>

      {/* Footer */}
      <footer className="w-full py-6 bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mt-auto">
        <div className="flex flex-col md:flex-row justify-between items-center px-6 max-w-5xl mx-auto gap-4">
          <span>© 2024 NIANKA HealthTech. Precision Food Safety Intelligence.</span>
          <span className="font-bold text-emerald-400">NIANKA AI Diagnostic Engine</span>
        </div>
      </footer>

    </div>
  );
}
