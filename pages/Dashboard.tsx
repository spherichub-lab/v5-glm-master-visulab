import React, { useState, useEffect, useRef } from 'react';
import { Icon } from '../components/Icon';
import { ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie } from 'recharts';
import { ExportButtons } from '../components/ExportButtons';
import { generateTxtReport } from '../lib/reports/generateTxtReport';
import { generatePdfReport } from '../lib/reports/generatePdfReport';

// --- Local Mock Data (Backend Removed) ---
const MOCK_DASHBOARD_DATA = [
    { index: '1.56', esfCil: '+1.00 -2.25', user: 'Junior Carvalho', treatment: 'Filtro Azul (Verde)', company: 'AMX', time: '2 min atrás', quantity: 1, type: 'Incolor' },
    { index: '1.74', esfCil: '-4.50 -1.00', user: 'Sarah Jenkins', treatment: 'AR Premium', company: 'Master', time: '45 min atrás', quantity: 2, type: 'Photo' },
    { index: '1.60', esfCil: '+2.00 -0.50', user: 'Michael Korb', treatment: 'Fotossensível (Photo)', company: 'Ultra Optics', time: '2 hrs atrás', quantity: 1, type: 'Photo' },
    { index: '1.49', esfCil: '+0.00 -1.25', user: 'Robert Wilson', treatment: 'Incolor', company: 'GBO', time: '5 hrs atrás', quantity: 3, type: 'Incolor' },
    { index: '1.56', esfCil: '-1.00 -1.00', user: 'Emily Chen', treatment: 'AR', company: 'Master', time: '1 dia atrás', quantity: 2, type: 'Incolor' },
    { index: '1.59', esfCil: '+2.50 -0.00', user: 'David Miller', treatment: 'BlueCut (Azul)', company: 'AMX', time: '1 dia atrás', quantity: 1, type: 'Incolor' },
    { index: '1.67', esfCil: '-5.00 -2.00', user: 'Jessica Lee', treatment: 'AR', company: 'Master', time: '2 dias atrás', quantity: 1, type: 'Incolor' },
    { index: '1.49', esfCil: '+3.00 -0.00', user: 'Junior Carvalho', treatment: 'White', company: 'GBO', time: '2 dias atrás', quantity: 10, type: 'Incolor' }
];

// --- Distinct Blue Scale Colors (Light to Dark) ---
const INDEX_COLORS: Record<string, string> = {
    '1.49': '#bfdbfe', // Blue 200 (Mais claro)
    '1.53': '#93c5fd', // Blue 300
    '1.56': '#60a5fa', // Blue 400
    '1.59': '#3b82f6', // Blue 500
    '1.60': '#2563eb', // Blue 600
    '1.67': '#1d4ed8', // Blue 700
    '1.74': '#1e3a8a', // Blue 900 (Mais escuro)
};

const TREATMENT_COLORS: Record<string, string> = {
    'Incolor': '#dbeafe',           // Blue 100
    'White': '#bfdbfe',             // Blue 200
    'AR': '#93c5fd',                // Blue 300
    'Blue Cut': '#60a5fa',          // Blue 400
    'BlueCut (Azul)': '#3b82f6',    // Blue 500
    'Filtro Azul (Verde)': '#2563eb', // Blue 600
    'AR Premium': '#1d4ed8',        // Blue 700
    'Fotossensível (Photo)': '#1e40af', // Blue 800
    'Photo': '#1e3a8a',             // Blue 900
    'Outros': '#172554'             // Blue 950
};

// Helper to get CSS classes based on index (Blue Scale)
const getIndexColorClass = (index: string) => {
    switch(index) {
        case '1.49': return 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 border-blue-200 dark:border-blue-800';
        case '1.56': return 'bg-blue-200 dark:bg-blue-800/30 text-blue-700 dark:text-blue-200 border-blue-300 dark:border-blue-700';
        case '1.60': return 'bg-blue-300 dark:bg-blue-700/40 text-blue-800 dark:text-blue-100 border-blue-400 dark:border-blue-600';
        case '1.67': return 'bg-blue-500 dark:bg-blue-600/50 text-white dark:text-white border-blue-600 dark:border-blue-500';
        case '1.74': return 'bg-slate-900 dark:bg-blue-900 text-white dark:text-white border-slate-700 dark:border-blue-800';
        default: return 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600';
    }
};

const getCompanyLogoStyle = (company: string) => {
    switch(company) {
        case 'Master': return 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'; 
        case 'AMX': return 'bg-blue-600 text-white'; 
        case 'Ultra Optics': return 'bg-emerald-600 text-white'; 
        case 'GBO': return 'bg-orange-500 text-white'; 
        case 'OptiLens Pro': return 'bg-indigo-500 text-white';
        default: return 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300';
    }
};

const getCompanyInitials = (company: string) => {
    switch(company) {
        case 'Master': return 'M';
        case 'AMX': return 'A';
        case 'Ultra Optics': return 'UO';
        case 'GBO': return 'G';
        default: return company.substring(0,2).toUpperCase();
    }
};

const Dashboard: React.FC = () => {
  const [barData, setBarData] = useState<any[]>([]);
  const [pieData, setPieData] = useState<any[]>([]);
  const [isChartLoading, setIsChartLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [recentShortages, setRecentShortages] = useState<any[]>([]);
  const [totalShortages, setTotalShortages] = useState(0);

  // Refs for PDF capture
  const cardARef = useRef<HTMLDivElement>(null); 
  const cardBRef = useRef<HTMLDivElement>(null); 
  const cardCRef = useRef<HTMLDivElement>(null); 
  const cardDRef = useRef<HTMLDivElement>(null); 
  const indexChartRef = useRef<HTMLDivElement>(null); 
  const treatmentChartRef = useRef<HTMLDivElement>(null); 
  
  const [reportFilters, setReportFilters] = useState({
    startDate: '',
    endDate: '',
    index: 'Todos',
    treatment: 'Todos',
    company: 'Todas'
  });

  const [analyticsFilters, setAnalyticsFilters] = useState({
    company: 'Todas', 
    range: '7 Dias',
    customStartDate: '',
    customEndDate: ''
  });

  const handleReportFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setReportFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleAnalyticsChange = (key: string, value: string) => {
    setAnalyticsFilters(prev => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    setIsChartLoading(true);
    
    // Simulate Loading local data
    const data = MOCK_DASHBOARD_DATA;
    
    setRecentShortages(data.slice(0, 4));

    // 1. Calculate Treatment Stats (Pie Chart)
    const treatmentCounts: Record<string, number> = {};
    let total = 0;
    
    data.forEach((item: any) => {
        let t = item.treatment || 'Outros';
        const qty = item.quantity || 1;
        treatmentCounts[t] = (treatmentCounts[t] || 0) + qty;
        total += qty;
    });

    // Convert to Pie Data Format
    const newPieData = Object.keys(treatmentCounts).map((key) => {
        // Fallback to Blue 500 if unknown
        let color = TREATMENT_COLORS[key] || '#3b82f6'; 
        
        return {
            name: key,
            value: treatmentCounts[key],
            percentage: total > 0 ? Math.round((treatmentCounts[key] / total) * 100) : 0,
            color: color
        };
    }).sort((a, b) => b.value - a.value);

    setPieData(newPieData);
    setTotalShortages(total);

    // 2. Calculate Index Stats (Bar Chart)
    const indexCounts: Record<string, number> = {};
    data.forEach((item: any) => {
        let idx = item.index || 'Outros';
        if (idx.includes('1.56')) idx = '1.56';
        else if (idx.includes('1.60')) idx = '1.60';
        else if (idx.includes('1.67')) idx = '1.67';
        else if (idx.includes('1.74')) idx = '1.74';
        
        const qty = item.quantity || 1;
        indexCounts[idx] = (indexCounts[idx] || 0) + qty;
    });

    const newBarData = Object.keys(indexCounts).map(key => ({
        name: key,
        value: total > 0 ? Math.round((indexCounts[key] / total) * 100) : 0, 
        color: INDEX_COLORS[key] || '#94a3b8'
    })).sort((a, b) => b.value - a.value).slice(0, 5); 

    setBarData(newBarData);
    setIsChartLoading(false);

  }, [analyticsFilters]);

  const handleExportTxt = () => {
    setIsExporting(true);
    // Use local helper
    generateTxtReport(
        { 
            company: reportFilters.company, 
            startDate: reportFilters.startDate, 
            endDate: reportFilters.endDate,
            groupByLabel: 'ÍNDICE DE REFRAÇÃO' // Explicitly set label for Shortages
        },
        recentShortages 
    );
    setIsExporting(false);
  };

  const handleExportPdf = async () => {
    setIsExporting(true);
    try {
        const cards = [
            cardARef.current!, 
            cardBRef.current!, 
            cardCRef.current!, 
            cardDRef.current!
        ];
        // Use local helper
        await generatePdfReport({
            kpiCards: cards,
            indexChart: indexChartRef.current!,
            treatmentChart: treatmentChartRef.current!,
            companyChart: treatmentChartRef.current! 
        });
    } catch (e) {
        console.error(e);
        alert('Erro ao gerar PDF');
    } finally {
        setIsExporting(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto px-4 md:px-6 py-6 w-full max-w-[1440px] mx-auto flex flex-col gap-6 no-scrollbar">
      
      {/* Header */}
      <div className="flex justify-between items-center">
         <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white block">Painel de Controle</h2>
      </div>

      {/* KPI Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Left Block */}
        <div className="grid grid-cols-2 gap-3 md:gap-6">
           <div ref={cardARef} className="bg-white dark:bg-surface-dark p-4 md:p-5 rounded-3xl shadow-soft border border-slate-100 dark:border-slate-700 flex flex-col justify-center gap-2 hover:shadow-hover hover:-translate-y-1 transition-all duration-300">
              <div className="flex justify-between items-start">
                {/* Updated Icon Color: Standard Slate-900/Primary */}
                <div className="h-9 w-9 md:h-12 md:w-12 rounded-2xl bg-slate-900 dark:bg-primary text-white flex items-center justify-center shadow-md">
                  <Icon name="error_outline" className="!text-lg md:!text-2xl" />
                </div>
                <span className="flex items-center text-[10px] md:text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-1.5 md:px-2 py-1 rounded-lg">
                  +8% <Icon name="trending_up" className="!text-xs md:!text-sm ml-0.5" />
                </span>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-[10px] md:text-sm font-bold uppercase tracking-wide truncate">Total de Faltas</p>
                <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mt-1">{totalShortages > 0 ? totalShortages : 142}</h3>
              </div>
           </div>

           <div ref={cardBRef} className="bg-white dark:bg-surface-dark p-4 md:p-5 rounded-3xl shadow-soft border border-slate-100 dark:border-slate-700 flex flex-col justify-center gap-2 hover:shadow-hover hover:-translate-y-1 transition-all duration-300">
              <div className="flex justify-between items-start">
                {/* Updated Icon Color: Standard Slate-900/Primary */}
                <div className="h-9 w-9 md:h-12 md:w-12 rounded-2xl bg-slate-900 dark:bg-primary text-white flex items-center justify-center shadow-md">
                  <Icon name="today" className="!text-lg md:!text-2xl" />
                </div>
                <span className="flex items-center text-[10px] md:text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-1.5 md:px-2 py-1 rounded-lg">
                  -2 <Icon name="trending_down" className="!text-xs md:!text-sm ml-0.5" />
                </span>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-[10px] md:text-sm font-bold uppercase tracking-wide truncate">Faltas Hoje</p>
                <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mt-1">12</h3>
              </div>
           </div>
        </div>

        {/* Right Block */}
        <div className="grid grid-cols-2 gap-3 md:gap-6">
           <div ref={cardCRef} className="bg-white dark:bg-surface-dark p-4 md:p-5 rounded-3xl shadow-soft border border-slate-100 dark:border-slate-700 flex flex-col justify-center gap-2 hover:shadow-hover hover:-translate-y-1 transition-all duration-300">
              <div className="flex justify-between items-start">
                {/* Updated Icon Color: Standard Slate-900/Primary */}
                <div className="h-9 w-9 md:h-12 md:w-12 rounded-2xl bg-slate-900 dark:bg-primary text-white flex items-center justify-center shadow-md">
                  <Icon name="analytics" className="!text-lg md:!text-2xl" />
                </div>
                <span className="flex items-center text-[10px] md:text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-1.5 md:px-2 py-1 rounded-lg whitespace-nowrap">
                  Top #1
                </span>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-[10px] md:text-sm font-bold uppercase tracking-wide truncate">Maior Falta</p>
                <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white mt-1 leading-tight truncate">1.56 Blue Cut</h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5 truncate">42 unidades</p>
              </div>
           </div>

           <div ref={cardDRef} className="bg-white dark:bg-surface-dark p-4 md:p-5 rounded-3xl shadow-soft border border-slate-100 dark:border-slate-700 flex flex-col justify-center gap-2 hover:shadow-hover hover:-translate-y-1 transition-all duration-300">
              <div className="flex justify-between items-start">
                {/* Updated Icon Color: Standard Slate-900/Primary */}
                <div className="h-9 w-9 md:h-12 md:w-12 rounded-2xl bg-slate-900 dark:bg-primary text-white flex items-center justify-center shadow-md">
                  <Icon name="receipt_long" className="!text-lg md:!text-2xl" />
                </div>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-[10px] md:text-sm font-bold uppercase tracking-wide truncate">Última Compra</p>
                <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white mt-1 whitespace-nowrap">24/10/23</h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">Verificado</p>
              </div>
           </div>
        </div>
      </div>

      {/* Analytics */}
      <div className="flex flex-col gap-6">
        
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
             <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Análise de Faltas</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Visão geral das faltas em tempo real.</p>
             </div>

             <div className="flex flex-col md:flex-row gap-4 md:items-center bg-white dark:bg-surface-dark p-2 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                 <div className="min-w-[160px] px-2">
                     <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Empresa</label>
                     <div className="relative">
                        <select 
                            value={analyticsFilters.company}
                            onChange={(e) => handleAnalyticsChange('company', e.target.value)}
                            className="w-full appearance-none bg-transparent border-none p-0 text-sm font-bold text-slate-700 dark:text-slate-200 focus:ring-0 cursor-pointer pr-6"
                        >
                            <option value="Todas">Todas</option>
                            <option value="Master">Master</option>
                            <option value="AMX">AMX</option>
                        </select>
                        <span className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                            <Icon name="expand_more" className="!text-lg" />
                        </span>
                     </div>
                 </div>

                 <div className="w-px bg-slate-100 dark:bg-slate-700 hidden md:block h-8"></div>

                 <div className="flex flex-col md:flex-row items-center gap-2">
                    <div className="flex gap-2 flex-wrap">
                        {['Hoje', '7 Dias', '30 Dias', 'Personalizado'].map((period) => (
                            <button 
                                key={period}
                                onClick={() => handleAnalyticsChange('range', period)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                    analyticsFilters.range === period 
                                    ? 'bg-slate-900 dark:bg-primary text-white shadow-md' 
                                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                                }`}
                            >
                                {period}
                            </button>
                        ))}
                    </div>

                    {/* Custom Date Inputs show when 'Personalizado' is selected */}
                    {analyticsFilters.range === 'Personalizado' && (
                        <div className="flex gap-2 items-center mt-2 md:mt-0 pl-2 animate-fade-in border-l border-slate-100 dark:border-slate-700">
                            <div className="flex items-center bg-slate-50 dark:bg-slate-800 rounded-lg px-2 py-1 border border-slate-200 dark:border-slate-600">
                                <span className="text-[10px] text-slate-400 mr-2 uppercase font-bold">De</span>
                                <input 
                                    type="date" 
                                    value={analyticsFilters.customStartDate}
                                    onChange={(e) => handleAnalyticsChange('customStartDate', e.target.value)}
                                    className="bg-transparent border-none p-0 text-xs text-slate-700 dark:text-slate-200 focus:ring-0 w-[100px]"
                                />
                            </div>
                            <div className="flex items-center bg-slate-50 dark:bg-slate-800 rounded-lg px-2 py-1 border border-slate-200 dark:border-slate-600">
                                <span className="text-[10px] text-slate-400 mr-2 uppercase font-bold">Até</span>
                                <input 
                                    type="date" 
                                    value={analyticsFilters.customEndDate}
                                    onChange={(e) => handleAnalyticsChange('customEndDate', e.target.value)}
                                    className="bg-transparent border-none p-0 text-xs text-slate-700 dark:text-slate-200 focus:ring-0 w-[100px]"
                                />
                            </div>
                        </div>
                    )}
                 </div>
            </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Chart 1: Index (Bar Chart) */}
            <div ref={indexChartRef} className={`bg-white dark:bg-surface-dark p-6 rounded-3xl shadow-soft border border-slate-100 dark:border-slate-700 flex flex-col transition-all duration-300 hover:shadow-hover hover:-translate-y-1 ${isChartLoading ? 'opacity-50' : 'opacity-100'}`}>
                <div className="flex justify-between items-center mb-6">
                    <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                       {/* Updated Icon Color: Standard Slate-900/Primary */}
                       <div className="p-2 bg-slate-900 dark:bg-primary text-white rounded-lg shadow-md">
                           <Icon name="bar_chart" className="!text-lg" />
                       </div>
                       Por Índice de Refração
                    </h4>
                    <button className="text-slate-400 hover:text-primary transition-colors"><Icon name="more_horiz" /></button>
                </div>
                <div className="flex-1 flex flex-col justify-center gap-5">
                  {barData.length === 0 ? (
                      <div className="flex items-center justify-center h-48 text-slate-400">Carregando dados...</div>
                  ) : (
                      barData.map((item, idx) => (
                        <div key={idx}>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="font-medium text-slate-700 dark:text-slate-300">{item.name}</span>
                            <span className="font-bold text-slate-900 dark:text-white">{item.value}%</span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                            <div className="h-3 rounded-full transition-all duration-1000 ease-out" style={{ width: `${item.value}%`, backgroundColor: item.color }}></div>
                          </div>
                        </div>
                      ))
                  )}
                </div>
            </div>

            {/* Chart 2: Treatment (Pie Chart) with Center Total */}
            {/* Increased padding from p-6 to p-8 as requested */}
            <div ref={treatmentChartRef} className={`bg-white dark:bg-surface-dark p-8 rounded-3xl shadow-soft border border-slate-100 dark:border-slate-700 flex flex-col transition-all duration-300 hover:shadow-hover hover:-translate-y-1 ${isChartLoading ? 'opacity-50' : 'opacity-100'}`}>
                <div className="flex justify-between items-center mb-2">
                    <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                       {/* Updated Icon Color: Standard Slate-900/Primary */}
                       <div className="p-2 bg-slate-900 dark:bg-primary text-white rounded-lg shadow-md">
                           <Icon name="pie_chart" className="!text-lg" />
                       </div>
                       Por Tratamento
                    </h4>
                    <button className="text-slate-400 hover:text-primary transition-colors"><Icon name="more_horiz" /></button>
                </div>
                
                {/* IMPROVED LAYOUT: Stacks on tablet/mobile to show content, Side-by-side centered on large screens */}
                <div className="flex-1 flex flex-col xl:flex-row items-center justify-center gap-6 xl:gap-10 px-2 pt-2">
                   <div className="relative h-56 w-56 shrink-0 flex items-center justify-center">
                     <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={88}
                          paddingAngle={0}
                          dataKey="value"
                          startAngle={90}
                          endAngle={-270}
                          animationDuration={1000}
                          stroke="none"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                     </ResponsiveContainer>
                     
                     {/* CENTERED DYNAMIC TOTAL DISPLAY */}
                     <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                         <span className="text-3xl font-black text-slate-900 dark:text-white leading-none tracking-tight">{totalShortages}</span>
                         <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mt-1">TOTAL</span>
                     </div>
                   </div>
                   
                   {/* Legend for Pie Chart - Improved Spacing & Centered */}
                   <div className="flex flex-col justify-center gap-3.5 w-full max-w-[240px]">
                     {pieData.map((item, idx) => (
                       <div key={idx} className="flex items-center justify-between text-sm">
                         <div className="flex items-center gap-2.5">
                           <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{backgroundColor: item.color}}></div>
                           <span className="font-medium text-slate-600 dark:text-slate-300 truncate max-w-[140px]" title={item.name}>{item.name}</span>
                         </div>
                         <span className="font-bold text-slate-900 dark:text-white">{item.percentage}%</span>
                       </div>
                     ))}
                   </div>
                </div>
            </div>

        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
        
        {/* Recent Activity */}
        <div className="bg-white dark:bg-surface-dark p-6 rounded-3xl shadow-soft border border-slate-100 dark:border-slate-700 h-full flex flex-col hover:shadow-hover hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Atividade Recente</h3>
            <a href="#" className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors">Ver Tudo</a>
          </div>
          <div className="space-y-6 flex-1">
             {recentShortages.map((item, idx) => (
                <div key={idx} className="flex gap-4 relative">
                  {idx !== recentShortages.length - 1 && (
                      <div className="absolute left-[20px] top-10 bottom-[-24px] w-px bg-slate-100 dark:bg-slate-700 -translate-x-1/2 z-0"></div>
                  )}

                  <div className={`h-10 w-10 rounded-full flex items-center justify-center text-[11px] font-bold border-2 border-white dark:border-surface-dark shadow-sm z-10 relative shrink-0 ${getIndexColorClass(item.index)}`}>
                    {item.index}
                  </div>

                  <div className="flex-1 flex items-center justify-between min-w-0 py-2">
                    <div className="flex flex-col gap-0.5 mr-2 min-w-0">
                         <div className="flex flex-wrap items-baseline gap-2">
                            <span className="text-sm font-bold text-slate-900 dark:text-white whitespace-nowrap">{item.esfCil}</span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap truncate">{item.treatment}</span>
                         </div>
                         <div className="flex items-center">
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{item.user}</span>
                         </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 pl-2">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm ${getCompanyLogoStyle(item.company)}`}>
                            {getCompanyInitials(item.company)}
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap w-[60px] text-right">{item.time}</span>
                    </div>
                  </div>
                </div>
             ))}
          </div>
        </div>

        {/* Generate Report UI - RESTORED FULL LAYOUT */}
        <div className="bg-white dark:bg-surface-dark p-6 rounded-3xl shadow-soft border border-slate-100 dark:border-slate-700 h-full flex flex-col">
             <div className="flex items-center gap-3 mb-6 border-b border-slate-50 dark:border-slate-700 pb-4">
                <div className="h-10 w-10 rounded-full bg-slate-900 dark:bg-primary flex items-center justify-center text-white shadow-md">
                   <Icon name="description" className="!text-xl" />
                </div>
                <div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">Gerar Relatório</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Exportar dados de faltas filtrados.</p>
                </div>
             </div>

             <div className="flex flex-col gap-5 flex-1 justify-between">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide ml-1">De</label>
                            <input 
                                type="date" 
                                name="startDate"
                                value={reportFilters.startDate}
                                onChange={handleReportFilterChange}
                                className="w-full rounded-xl border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-sm font-semibold text-slate-700 dark:text-white focus:ring-primary focus:border-primary px-3 py-2.5 cursor-pointer" 
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide ml-1">Até</label>
                            <input 
                                type="date" 
                                name="endDate"
                                value={reportFilters.endDate}
                                onChange={handleReportFilterChange}
                                className="w-full rounded-xl border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-sm font-semibold text-slate-700 dark:text-white focus:ring-primary focus:border-primary px-3 py-2.5 cursor-pointer" 
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide ml-1">Índice</label>
                            <select 
                                name="index"
                                value={reportFilters.index}
                                onChange={handleReportFilterChange}
                                className="w-full rounded-xl border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-sm font-semibold text-slate-700 dark:text-white focus:ring-primary focus:border-primary px-3 py-2.5 cursor-pointer"
                            >
                                <option>Todos</option>
                                <option>1.49</option>
                                <option>1.56</option>
                                <option>1.60</option>
                                <option>1.67</option>
                                <option>1.74</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide ml-1">Tratamento</label>
                            <select 
                                name="treatment"
                                value={reportFilters.treatment}
                                onChange={handleReportFilterChange}
                                className="w-full rounded-xl border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-sm font-semibold text-slate-700 dark:text-white focus:ring-primary focus:border-primary px-3 py-2.5 cursor-pointer"
                            >
                                <option>Todos</option>
                                <option>HMC</option>
                                <option>Blue Cut</option>
                                <option>Photochromic</option>
                                <option>White</option>
                            </select>
                        </div>
                         <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide ml-1">Empresa</label>
                            <select 
                                name="company"
                                value={reportFilters.company}
                                onChange={handleReportFilterChange}
                                className="w-full rounded-xl border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-sm font-semibold text-slate-700 dark:text-white focus:ring-primary focus:border-primary px-3 py-2.5 cursor-pointer"
                            >
                                <option>Todas</option>
                                <option>OptiLens Pro</option>
                                <option>Visionary Clinics</option>
                                <option>EyeTech</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="mt-auto">
                    <ExportButtons 
                        onExportTxt={handleExportTxt}
                        isLoading={isExporting}
                    />
                </div>
             </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;