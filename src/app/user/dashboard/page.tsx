"use client";

import React from 'react';
import Link from 'next/link';

export default function UserDashboardPage() {
  return (
    <div className="bg-slate-50 text-slate-900 font-sans min-h-screen flex">
      
      {/* SideNavBar */}
      <nav className="hidden md:flex flex-col py-6 px-4 bg-white border-r border-slate-200 shadow-sm h-screen w-64 fixed left-0 top-0 z-40 justify-between">
        <div>
          {/* Brand */}
          <div className="px-3 mb-8 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#006947] text-white flex items-center justify-center text-xl font-bold shadow-md">
              N
            </div>
            <div>
              <h1 className="font-black text-xl text-[#006947] leading-none">NIANKA</h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Precision Food Safety</p>
            </div>
          </div>

          {/* Main Navigation */}
          <div className="flex flex-col gap-1.5">
            <Link href="/user/dashboard" className="flex items-center gap-3 px-3 py-2.5 bg-emerald-50 text-[#006947] font-bold rounded-xl text-sm">
              <span className="material-symbols-outlined">dashboard</span>
              <span>Dashboard</span>
            </Link>

            <Link href="/user/analysis" className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-100 font-semibold rounded-xl text-sm transition-colors">
              <span className="material-symbols-outlined">add_circle</span>
              <span>New Analysis</span>
            </Link>

            <Link href="/user/history" className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-100 font-semibold rounded-xl text-sm transition-colors">
              <span className="material-symbols-outlined">history</span>
              <span>History</span>
            </Link>

            <Link href="/user/terminal" className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-100 font-semibold rounded-xl text-sm transition-colors">
              <span className="material-symbols-outlined">terminal</span>
              <span>Field Terminal</span>
            </Link>
          </div>
        </div>

        {/* Footer User Info */}
        <div className="pt-4 border-t border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#006947] text-white flex items-center justify-center font-bold text-sm">
            SL
          </div>
          <div>
            <p className="font-bold text-sm text-slate-900 leading-tight">Stéphane L.</p>
            <p className="text-xs text-slate-500">Lab Analyst</p>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 ml-0 md:ml-64 p-8 max-w-7xl mx-auto overflow-y-auto w-full">
        
        {/* Mobile Header */}
        <div className="md:hidden flex justify-between items-center mb-6">
          <h1 className="text-xl font-black text-[#006947]">NIANKA</h1>
          <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-full">
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>

        {/* Page Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-black text-slate-900 mb-1">Bonjour Stéphane 👋</h2>
            <p className="text-slate-600 text-base">Voici votre résumé quotidien d'intelligence de sécurité alimentaire.</p>
          </div>

          <Link href="/user/analysis" className="bg-[#006947] hover:bg-[#005236] text-white font-bold text-sm px-5 py-3 rounded-xl flex items-center gap-2 shadow-md transition-all active:scale-95">
            <span className="material-symbols-outlined text-[20px]">qr_code_scanner</span>
            Analyser un aliment
          </Link>
        </header>

        {/* Metrics Bento Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          {/* Metric 1 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between h-44">
            <div className="flex justify-between items-start">
              <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600">
                <span className="material-symbols-outlined">biotech</span>
              </div>
              <span className="text-xs font-bold text-slate-500 px-2.5 py-1 bg-slate-100 rounded-full">+12% cette semaine</span>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Analyses Totales</p>
              <p className="text-3xl font-black text-slate-900">1,492</p>
            </div>
          </div>

          {/* Metric 2 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between h-44 relative overflow-hidden group cursor-pointer">
            <div className="absolute inset-0 bg-cover bg-center opacity-10 group-hover:opacity-20 transition-opacity" style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBIDpbWWo2ymXYHvmNlzYRCJKtojbeCq5S9go0QmzJozL6cVORADGW7CJzeYgGWM4NMNS-B8wBpmA3vZnNxQnKMtqzqRJfZXSbHlBl9V3TpdSPEg-7g8xIsBANSCCgRFpZ7dHI8I8Ng1gZx5bkkZc-OkPnY7kBDf1UceyBL3bwiNZioXokUssLx8YH5w_6pY63arqtpTZxsKO7DLNb8wypFTOcMVy24nnmHj6ZuK9KaQF_8kU936ATSm72CSWkHZEfSo9SNlb8JiHs')` }}></div>
            <div className="relative z-10 flex justify-between items-start">
              <div className="p-2.5 bg-emerald-50 rounded-xl text-[#006947]">
                <span className="material-symbols-outlined">set_meal</span>
              </div>
              <span className="flex items-center gap-1 text-[#006947] font-bold text-xs bg-emerald-50 px-2.5 py-1 rounded-full">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                Conforme
              </span>
            </div>
            <div className="relative z-10">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Dernier Scan</p>
              <p className="text-xl font-black text-slate-900 truncate">Tilapia Fillet (Lot B42)</p>
            </div>
          </div>

          {/* Metric 3 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between h-44">
            <div className="flex justify-between items-start">
              <div className="p-2.5 bg-rose-50 rounded-xl text-rose-600">
                <span className="material-symbols-outlined">warning</span>
              </div>
              <span className="text-xs font-bold text-slate-500 px-2.5 py-1 bg-slate-100 rounded-full">Global</span>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Taux d'Anomalies</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-black text-slate-900">2.4%</p>
                <p className="text-xs font-bold text-[#006947]">Risque Faible</p>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2">
                <div className="bg-[#006947] h-1.5 rounded-full" style={{ width: '2.4%' }}></div>
              </div>
            </div>
          </div>

        </section>

        {/* Recent Activity List */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-slate-900">Analyses Récentes</h3>
            <Link href="/user/history" className="text-sm font-bold text-[#006947] hover:underline">
              Voir Tout
            </Link>
          </div>

          <div className="space-y-4">
            
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-[#006947] flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined">set_meal</span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Tilapia du Nil (Lot ANA-8842-X)</h4>
                  <p className="text-xs text-slate-500">24 Oct 2023, 14:30 • Poisson Produit Frais</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <span className="text-sm font-bold text-[#006947] bg-emerald-50 px-3 py-1 rounded-full">
                  Score: 92% (Conforme)
                </span>
                <Link href="/analysis/result" className="text-xs font-bold text-slate-600 hover:text-[#006947]">
                  Détails →
                </Link>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined">eco</span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Mangue Kent Export (Lot MNG-9012)</h4>
                  <p className="text-xs text-slate-500">24 Oct 2023, 11:15 • Fruits & Légumes</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <span className="text-sm font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full">
                  Grade B (15.2° Brix)
                </span>
                <Link href="/analysis/result" className="text-xs font-bold text-slate-600 hover:text-[#006947]">
                  Détails →
                </Link>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined">grain</span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Noix de Cajou KOR (Lot CAJ-5501)</h4>
                  <p className="text-xs text-slate-500">23 Oct 2023, 16:45 • Anacarde Brute</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <span className="text-sm font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
                  KOR 54.2 lbs (Grade A)
                </span>
                <Link href="/analysis/result" className="text-xs font-bold text-slate-600 hover:text-[#006947]">
                  Détails →
                </Link>
              </div>
            </div>

          </div>
        </section>

      </main>

    </div>
  );
}
