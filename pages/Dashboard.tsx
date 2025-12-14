
import React, { useState, useEffect, useRef } from 'react';
import { Icon } from '../components/Icon';
import { ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie } from 'recharts';
import { ExportButtons } from '../components/ExportButtons';
import { CustomSelect } from '../components/CustomSelect';
import { generateTxtReport } from '../lib/reports/generateTxtReport';
import { generatePdfReport } from '../lib/reports/generatePdfReport';
import { MOCK_SHORTAGES } from '../lib/dataClient/mockClient';

// --- Distinct Palette Colors ---
const INDEX_COLORS: Record<string, string> = {
    '1.49': '#94a3b8', // Slate 400
    '1.53': '#a8a29e', // Stone 400
    '1.56': '#3b82f6', // Blue 500
    '1.59': '#0ea5e9', // Sky 500
    '1.60': '#10b981', // Emerald 500
    '1.67': '#f59e0b', // Amber 500
    '1.74': '#8b5cf6', // Violet 500
};

const TREATMENT_COLORS: Record<string, string> = {
    'Incolor': '#94a3b8',           // Slate 400
    'White': '#cbd5e1',             // Slate 300
    'AR': '#60a5fa',                // Blue 400
    'HMC': '#60a5fa',               // Blue 400
    'Blue Cut': '#2563eb',          // Blue 600
    'BlueCut (Azul)': '#3b82f6',    // Blue 500
    'Filtro Azul (Verde)': '#10b981', // Emerald 500
    'AR Premium': '#8b5cf6',        // Violet 500
    'Fotossensível (Photo)': '#f59e0b', // Amber 500
    'Photo': '#f97316',             // Orange 500
    'Outros': '#64748b'             // Slate 500
};

// Helper to get CSS classes based on index (Distinct Colors)
const getIndexColorClass = (index: string) => {
    switch(index) {
        case '1.49': return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700';
        case '1.56': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
        case '1.60': return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
        case '1.67': return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
        case '1.74': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
        default: return 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600';
    }
};

const getCompanyLogoStyle = (company: string) => {
    switch(company) {
        case 'Master': return 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'; 
        case 'AMX': return 'bg-blue-600 text-white'; 
        case 'Ultra Optics': return 'bg-emerald-600 text-white'; 
        case 'GBO': return 'bg-orange-500 text-white'; 
        default: return 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300';
    }
};

const getCompanyInitials = (company: string) => {
    if (!company) return '-';
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

  const handleReportFilterChange = (name: string, value: string) => {
    setReportFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setReportFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleAnalyticsChange = (key: string, value: string) => {
    setAnalyticsFilters(prev => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    // Simulating Data Fetch with Mock Data
    const fetchDashboardData = async () => {
        setIsChartLoading(true);

        try {
            // Simulate delay
            await new Promise(resolve => setTimeout(resolve, 600));

            const data = MOCK_SHORTAGES;

            if (!data || data.length === 0) {
                 setRecentShortages([]);
                 setTotalShortages(0);
                 setBarData([]);
                 setPieData([]);
                 return;
            }

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
                const qty = item.quantity || 1;
                indexCounts[idx] = (indexCounts[idx] || 0) + qty;
            });

            const newBarData = Object.keys(indexCounts).map(key => ({
                name: key,
                value: total > 0 ? Math.round((indexCounts[key] / total) * 100) : 0, 
                color: INDEX_COLORS[key] || '#94a3b8'
            })).sort((a, b) => b.value - a.value).slice(0, 5); 

            setBarData(newBarData);

        } finally {
            setIsChartLoading(false);
        }
    };

    fetchDashboardData();

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
                <div className="h-9 w-9 md:h-12 md:w-12 rounded-2xl bg-slate-900 dark:bg-primary text-white flex items-center justify-center shadow-md">
                  <Icon name="error_outline" className="!text-lg md:!text-2xl" />
                </div>
                <span className="flex items-center text-[10px] md:text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-1.5 md:px-2 py-1 rounded-lg">
                  +8% <Icon name="trending_up" className="!text-xs md:!text-sm ml-0.5" />
                </span>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-[10px] md:text-sm font-bold uppercase tracking-wide truncate">Total de Faltas</p>
                <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mt-1">{totalShortages > 0 ? totalShortages : 0}</h3>
              </div>
           </div>

           <div ref={cardBRef} className="bg-white dark:bg-surface-dark p-4 md:p-5 rounded-3xl shadow-soft border border-slate-100 dark:border-slate-700 flex flex-col justify-center gap-2 hover:shadow-hover hover:-translate-y-1 transition-all duration-300">
              <div className="flex justify-between items-start">
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
                <div className="h-9 w-9 md:h-12 md:w-12 rounded-2xl bg-slate-900 dark:bg-primary text-white flex items-center justify-center shadow-md">
                  <Icon name="analytics" className="!text-lg md:!text-2xl" />
                </div>
                <span className="flex items-center text-[10px] md:text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-1.5 md:px-2 py-1 rounded-lg whitespace-nowrap">
                  Top #1
                </span>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-[10px] md:text-sm font-bold uppercase tracking-wide truncate">Maior Falta</p>
                <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white mt-1 leading-tight truncate">
                    {barData.length > 0 ? barData[0].name : '-'}
                </h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5 truncate">
                    {barData.length > 0 ? 'Mais frequente' : 'Sem dados'}
                </p>
              </div>
           </div>

           <div ref={cardDRef} className="bg-white dark:bg-surface-dark p-4 md:p-5 rounded-3xl shadow-soft border border-slate-100 dark:border-slate-700 flex flex-col justify-center gap-2 hover:shadow-hover hover:-translate-y-1 transition-all duration-300">
              <div className="flex justify-between items-start">
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
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Visão geral das faltas em tempo real (Modo Demonstração).</p>
             </div>

             <div className="flex flex-col md:flex-row gap-4 md:items-center bg-white dark:bg-surface-dark p-2 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                 <div className="min-w-[160px] px-2">
                     <CustomSelect 
                        label="Empresa"
                        value={analyticsFilters.company}
                        onChange={(val) => handleAnalyticsChange('company', val)}
                        options={['Todas', 'Master', 'AMX']}
                        triggerClassName="bg-transparent border-none p-0 !px-0"
                     />
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
                       <div className="p-2 bg-slate-900 dark:bg-primary text-white rounded-lg shadow-md">
                           <Icon name="bar_chart" className="!text-lg" />
                       </div>
                       Por Índice de Refração
                    </h4>
                    <button className="text-slate-400 hover:text-primary transition-colors"><Icon name="more_horiz" /></button>
                </div>
                <div className="flex-1 flex flex-col justify-center gap-5">
                  {barData.length === 0 ? (
                      <div className="flex items-center justify-center h-48 text-slate-400">
                          {isChartLoading ? 'Carregando dados...' : 'Nenhum dado encontrado'}
                      </div>
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
            <div ref={treatmentChartRef} className={`bg-white dark:bg-surface-dark p-8 rounded-3xl shadow-soft border border-slate-100 dark:border-slate-700 flex flex-col transition-all duration-300 hover:shadow-hover hover:-translate-y-1 ${isChartLoading ? 'opacity-50' : 'opacity-100'}`}>
                <div className="flex justify-between items-center mb-2">
                    <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                       <div className="p-2 bg-slate-900 dark:bg-primary text-white rounded-lg shadow-md">
                           <Icon name="pie_chart" className="!text-lg" />
                       </div>
                       Por Tratamento
                    </h4>
                    <button className="text-slate-400 hover:text-primary transition-colors"><Icon name="more_horiz" /></button>
                </div>
                
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
                     
                     <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                         <span className="text-3xl font-black text-slate-900 dark:text-white leading-none tracking-tight">{totalShortages}</span>
                         <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mt-1">TOTAL</span>
                     </div>
                   </div>
                   
                   <div className="flex-1 flex flex-col justify-center gap-3.5 w-full max-w-[240px]">
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
             {recentShortages.length === 0 ? (
                 <div className="text-center text-slate-400 py-10">
                     Nenhuma atividade recente.
                 </div>
             ) : (
                recentShortages.map((item, idx) => (
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
                ))
             )}
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
                                onChange={handleDateChange}
                                className="w-full rounded-xl border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-sm font-semibold text-slate-700 dark:text-white focus:ring-primary focus:border-primary px-3 py-2.5 cursor-pointer" 
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide ml-1">Até</label>
                            <input 
                                type="date" 
                                name="endDate"
                                value={reportFilters.endDate}
                                onChange={handleDateChange}
                                className="w-full rounded-xl border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-sm font-semibold text-slate-700 dark:text-white focus:ring-primary focus:border-primary px-3 py-2.5 cursor-pointer" 
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <CustomSelect 
                                label="Índice"
                                value={reportFilters.index}
                                onChange={(val) => handleReportFilterChange('index', val)}
                                options={['Todos', '1.49', '1.56', '1.60', '1.67', '1.74']}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <CustomSelect 
                                label="Tratamento"
                                value={reportFilters.treatment}
                                onChange={(val) => handleReportFilterChange('treatment', val)}
                                options={['Todos', 'HMC', 'Blue Cut', 'Photochromic', 'White']}
                            />
                        </div>
                         <div className="space-y-1.5">
                            <CustomSelect 
                                label="Empresa"
                                value={reportFilters.company}
                                onChange={(val) => handleReportFilterChange('company', val)}
                                options={['Todas', 'OptiLens Pro', 'Visionary Clinics', 'EyeTech']}
                            />
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
