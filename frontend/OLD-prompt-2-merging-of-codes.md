1. Go through codes of FILE-1 and File-2 carefully and understad the code of each thoroughly.
2. then create 2 files (MainShell.tsx and QuantFinance.tsx) as:
    a. MainShell.tsx with appended (not replaced) header and hud/footer from FILE-1, so that we can review features working side by side and decide which to accept.
    b. QuantFinance.tsx with the content/body (elements besides header and hud/footer in file1 ) from FILE-1
PS: Add detailed, exhaustive explicit and clear documentation for the codes you create and do not degrade any ui features
Code of FILE-1:
"use client";

import React, { useState, useEffect, useMemo } from 'react';

import { Search, ShieldAlert, BarChart3, BrainCircuit, Zap, Activity } from 'lucide-react';

import { Tile } from '../components/Tile';

import { VolatilityChart } from '../components/VolatilityChart';

import { motion } from 'framer-motion';

export default function TythysOne() {

  const [ticker, setTicker] = useState("NVDA");

  const [loading, setLoading] = useState(false);

  const [apiStatus, setApiStatus] = useState<'online' | 'offline' | 'checking'>('checking');

  const [usageCount, setUsageCount] = useState<number>(0);

  const [store, setStore] = useState<any>({ regime: null, correlation: null, sentiment: null });



  const HEADERS = { 'X-Tythys-Key': 'your-internal-secret-key' };



  // --- CALCULATE GLOBAL RISK (Retained) ---

  const globalRisk = useMemo(() => {

    if (!store.regime || !store.correlation) return 0;

    const volScore = Math.min(store.regime.vol * 1.5, 60); 

    const corrScore = Math.max(store.correlation.corr * 40, 0);

    return Math.round(volScore + corrScore);

  }, [store]);



  const fetchData = async () => {

    setLoading(true);

    try {

      const [r, c, s] = await Promise.all([

        fetch(`http://localhost:8000/api/regime?ticker=${ticker}`, { headers: HEADERS }).then(res => res.json()),

        fetch(`http://localhost:8000/api/correlation?t1=${ticker}`, { headers: HEADERS }).then(res => res.json()),

        fetch(`http://localhost:8000/api/sentiment?ticker=${ticker}`, { headers: HEADERS }).then(res => res.json()),

      ]);

      setStore({ regime: r, correlation: c, sentiment: s });

      setUsageCount(r.total_usage || 0);

      setApiStatus('online');

    } catch { setApiStatus('offline'); }

    finally { setLoading(false); }

  };



  useEffect(() => { fetchData(); }, []);



  return (

    // ROOT: Locked Viewport

    <div className="h-screen w-screen bg-[#050505] text-zinc-200 p-4 flex flex-col overflow-hidden font-sans select-none">

      

      {/* 1. HEADER (Retained & Fixed) */}

      <header className="h-[8%] flex justify-between items-center px-2 shrink-0">

        <div className="flex items-center gap-4">

          <div>

            <h1 className="text-xl font-black tracking-tighter text-white uppercase italic leading-none">

              Tythys<span className="text-emerald-500 italic">One</span>

            </h1>

            <p className="text-[7px] tracking-[0.4em] text-zinc-600 uppercase mt-1">Unified Quantitative Intelligence</p>

          </div>

          <div className="flex items-center gap-2 px-2 py-0.5 bg-zinc-900/50 border border-zinc-800/50 rounded-full">

            <div className={`h-1 w-1 rounded-full ${apiStatus === 'online' ? 'bg-emerald-500 animate-pulse shadow-[0_0_5px_#10b981]' : 'bg-red-500'}`} />

            <span className="text-[6px] font-mono tracking-widest text-zinc-500 uppercase font-bold">Engine_{apiStatus}</span>

          </div>

        </div>

        

        <div className="flex bg-[#0F0F0F] border border-zinc-800/50 rounded-lg p-1 scale-90 origin-right">

          <input 

            value={ticker} onChange={(e) => setTicker(e.target.value.toUpperCase())}

            onKeyDown={(e) => e.key === 'Enter' && fetchData()}

            className="bg-transparent border-none focus:ring-0 text-xs w-20 px-2 font-mono text-emerald-500 uppercase"

          />

          <button onClick={fetchData} className="bg-emerald-500 text-black p-1 rounded-md"><Search size={14} /></button>

        </div>

      </header>



      {/* 2. MAIN CONTAINER (Total 84%) */}

      <main className="h-[84%] flex flex-col gap-4 py-2 min-h-0">

        

        {/* UPPER SECTION: CHART + LOGIC (70% Height - Increased for better chart container) */}

<div className="flex-[0.70] flex gap-4 min-h-0 overflow-hidden">

  <Tile 

    title="Momentum & Volatility" 

    icon={BarChart3} 

    loading={loading} 

    span="w-[66%]"

    className="overflow-visible"

  >

    <div className="h-full flex flex-col min-h-0">

      <div className="flex justify-between items-center mb-4 shrink-0 px-1">

        <div className="flex items-baseline gap-2">

          <h2 className="text-4xl font-light tracking-tighter text-white leading-none">{store.regime?.vol || "0.0"}%</h2>

          <span className="text-[7px] text-zinc-600 uppercase font-bold tracking-[0.2em]">Realized_Vol</span>

        </div>

        <div className="flex items-center gap-3 px-3 py-1 bg-zinc-900/60 rounded-lg border border-zinc-800/50">

          <span className="text-[7px] text-zinc-500 uppercase tracking-widest font-bold">RSI</span>

          <span className={`text-lg font-mono leading-none font-bold ${store.regime?.rsi > 70 ? 'text-red-500' : store.regime?.rsi < 30 ? 'text-emerald-500' : 'text-zinc-400'}`}>

            {store.regime?.rsi || "0.0"}

          </span>

        </div>

      </div>

      <div className="flex-1 min-h-0 relative pb-4 px-1 overflow-hidden">

        <VolatilityChart data={store.regime} ticker={ticker} />

      </div>

    </div>

  </Tile>



          {/* AGENT LOGIC (Retained) */}

          <Tile title="Agent Logic" icon={BrainCircuit} loading={loading} span="w-[34%]">

             <div className="h-full flex flex-col justify-between py-1 min-h-0">

               <p className="text-sm font-serif italic text-zinc-300 leading-relaxed overflow-y-auto pr-1">

                 "{store.regime?.insight || "Analyzing market regime..."}"

               </p>

               <div className="bg-zinc-900/30 border border-zinc-800/40 p-3 rounded-xl mt-2 shrink-0">

                 <div className="flex justify-between text-[7px] font-mono text-zinc-600 mb-1.5 uppercase tracking-tighter">

                   <span>Momentum_Gate</span>

                   <span className={store.regime?.rsi > 70 ? 'text-red-500 font-bold' : 'text-emerald-500'}>

                      {store.regime?.rsi > 70 ? 'Overextended' : 'Stable'}

                   </span>

                 </div>

                 <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">

                   <motion.div 

                      animate={{ width: `${store.regime?.rsi || 0}%` }} 

                      className={`h-full ${store.regime?.rsi > 70 ? 'bg-red-500' : 'bg-emerald-500'} shadow-[0_0_5px_#10b981]`} 

                   />

                 </div>

               </div>

             </div>

          </Tile>

        </div>



        {/* LOWER SECTION: RISK + SENTIMENT (30% Height - Reduced as requested) */}

        <div className="flex-[0.30] flex gap-4 min-h-0">

          <Tile title="Systemic Risk" icon={ShieldAlert} loading={loading} danger={store.correlation?.corr > 0.8} span="flex-1">

            <div className="flex items-center gap-5 h-full min-h-0">

              <span className={`text-5xl font-mono tracking-tighter leading-none ${store.correlation?.corr > 0.8 ? "text-red-500" : "text-emerald-400"}`}>

                {store.correlation?.corr || "0.0"}

              </span>

              <div className="space-y-0.5 min-w-0">

                <p className="text-[8px] text-zinc-600 uppercase font-bold tracking-widest">Beta_Correlation</p>

                <p className="text-[10px] text-zinc-400 italic line-clamp-2 leading-tight">

                  {store.correlation?.insight}

                </p>

              </div>

            </div>

          </Tile>



          <Tile title="Market Sentiment" icon={Zap} loading={loading} span="flex-1">

            <div className="h-full flex flex-col justify-center min-h-0">

               <div className="flex items-center gap-1.5 mb-1 shrink-0">

                  <Activity size={10} className="text-emerald-500 animate-pulse" />

                  <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">Intelligence_Feed</span>

               </div>

               <p className="text-[10px] text-zinc-300 leading-snug font-light line-clamp-2 italic">

                 {store.sentiment?.insight}

               </p>

            </div>

          </Tile>

        </div>

      </main>



      {/* 3. FOOTER (Retained: OS, Global Risk, Consumption) */}

      <footer className="h-[8%] flex items-center justify-between px-2 border-t border-zinc-900 shrink-0">

        <div className="flex items-center gap-10">

          <div className="flex gap-4 text-[7px] font-mono tracking-[0.3em] uppercase opacity-30">

            <span>TERMINAL: {ticker}</span>

            <span>OS: TYTHYSONE_v1.5</span>

          </div>

          

          <div className="flex items-center gap-4 pl-10 border-l border-zinc-800/50">

            <span className="text-[7px] font-bold text-zinc-600 uppercase tracking-[0.2em]">Risk_Profile</span>

            <div className="w-32 h-1 bg-zinc-900 rounded-full overflow-hidden flex">

              <motion.div 

                initial={{ width: 0 }}

                animate={{ width: `${globalRisk}%` }}

                className={`h-full ${globalRisk > 70 ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : 'bg-emerald-500'}`}

              />

            </div>

            <span className={`text-[8px] font-mono font-bold ${globalRisk > 70 ? 'text-red-500' : 'text-zinc-500'}`}>

              {globalRisk}/100

            </span>

          </div>

        </div>



        {/* Consumption Token HUD (Retained) */}

        <div className="flex items-center gap-3 px-3 py-1 bg-zinc-900/50 border border-zinc-800/50 rounded-md">

          <div className="text-right">

            <p className="text-[6px] text-zinc-600 uppercase tracking-tighter leading-none">Consumption</p>

            <p className="text-[9px] font-mono font-bold text-emerald-500 tabular-nums">

              {usageCount.toLocaleString()} <span className="text-[6px] opacity-50">TKN</span>

            </p>

          </div>

        </div>

      </footer>

    </div>

  );

}

Code of FILE-2:

"use client";

import React, { useState } from 'react';

import { Shield, Cpu, Activity, LogOut, Hexagon } from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';

import BioMetricsView from '../../services/biometrics/BioMetricsView';

import EduQuantView from '../../services/eduquant/EduQuantView';



export default function MainShell({ onLogout }: { onLogout: () => void }) {

  const [activeTab, setActiveTab] = useState('biometrics');



  const navItems = [

    { id: 'biometrics', icon: Shield, label: 'Bio-Metrics', component: <BioMetricsView /> },

    { id: 'risk', icon: Activity, label: 'Systemic Risk', component: <div className="p-10 text-zinc-500">Service 3.1 Ready</div> },

    { id: 'eduquant', icon: Cpu, label: 'Edu-Quant', component: <EduQuantView />  },

  ];



  const currentService = navItems.find(item => item.id === activeTab);



  return (

    <div className="h-screen w-full bg-[#050505] text-zinc-300 flex flex-col overflow-hidden font-sans">

      

      <main className="flex-1 flex overflow-hidden">

        

        {/* SIDEBAR WITH BRAND MARK */}

        <aside className="w-20 border-r border-zinc-900 flex flex-col items-center py-6 gap-6 bg-black/40 backdrop-blur-md z-30">

          

          {/* T1 BRAND MARK - NOW ON TOP OF MENU */}

          <div className="relative mb-4 group cursor-pointer">

            <Hexagon size={38} className="text-emerald-500/40 group-hover:text-emerald-500 transition-colors" strokeWidth={1.5} />

            <div className="absolute inset-0 flex items-center justify-center text-emerald-500 font-black italic text-sm tracking-tighter">

              T1

            </div>

            <div className="absolute -inset-2 bg-emerald-500/5 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />

          </div>



          {navItems.map((item) => (

            <button

              key={item.id}

              onClick={() => setActiveTab(item.id)}

              className="relative p-3 transition-all duration-300"

            >

              <item.icon 

                size={22} 

                className={`transition-colors duration-300 ${activeTab === item.id ? 'text-emerald-500' : 'text-zinc-700 hover:text-zinc-400'}`} 

              />

              {activeTab === item.id && (

                <motion.div layoutId="nav-glow" className="absolute inset-0 bg-emerald-500/5 border border-emerald-500/20 rounded-xl -z-10 shadow-[0_0_15px_rgba(16,185,129,0.1)]" />

              )}

            </button>

          ))}



          <button onClick={onLogout} className="mt-auto p-3 text-zinc-800 hover:text-red-900 transition-all">

            <LogOut size={20} />

          </button>

        </aside>



        {/* CONTENT AREA */}

        <section className="flex-1 p-8 overflow-y-auto relative bg-[#050505] custom-scrollbar">

          <AnimatePresence mode="wait">

            <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>

              {currentService?.component}

            </motion.div>

          </AnimatePresence>

        </section>

      </main>

      

      {/* HUD FOOTER (Persistent) */}

      <footer className="h-10 border-t border-zinc-900 bg-[#070707] flex items-center justify-between px-8 text-[8px] font-mono tracking-[0.3em] uppercase text-zinc-600">

        <div>TYTHYS_OS_CORE // {activeTab}_ALIGNED</div>

        <div className="flex items-center gap-2">

          <div className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />

          <span className="text-emerald-500/60">Live_Uplink</span>

        </div>

      </footer>

    </div>

  );

}

PS: If you have better feature to suggest please add them too with explicit and clear documentation