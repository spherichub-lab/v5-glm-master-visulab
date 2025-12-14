
import React, { useState, useEffect } from 'react';
import { Icon } from '../components/Icon';
import { Purchase } from '../types';
import { ExportButtons } from '../components/ExportButtons';
import { CustomSelect } from '../components/CustomSelect';
import { generateTxtReport } from '../lib/reports/generateTxtReport';
import { generateCsvReport } from '../lib/reports/generateCsvReport';
import { Toast } from '../components/Toast';
import { MOCK_PURCHASES } from '../lib/dataClient/mockClient';

const Purchases: React.FC = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [statusFilter, setStatusFilter] = useState('Todos Status');
  const [newPurchaseSupplier, setNewPurchaseSupplier] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // New purchase state
  const [newPurchaseData, setNewPurchaseData] = useState({
      date: new Date().toISOString().split('T')[0],
      itemsDescription: '',
      amount: '',
      status: 'Pendente'
  });

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; isVisible: boolean }>({
    message: '',
    type: 'success',
    isVisible: false,
  });

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type, isVisible: true });
  };

  useEffect(() => {
      const fetchPurchases = async () => {
          setIsLoading(true);
          await new Promise(resolve => setTimeout(resolve, 600)); // Delay
          setPurchases(MOCK_PURCHASES);
          setIsLoading(false);
      };
      fetchPurchases();
  }, []);

  const handleExportCsv = () => {
      setIsExporting(true);
      try {
          generateCsvReport(purchases, 'compras');
      } finally {
          setIsExporting(false);
      }
  };

  const handleExportTxt = () => {
      setIsExporting(true);
      try {
          // Adapt purchases data to simple ReportItem format used by current TXT generator
          const reportData = purchases.map(p => ({
              index: p.displayId,
              esfCil: p.supplier,
              treatment: p.status,
              quantity: 1, // dummy
              user: '-',
              time: p.date
          }));
          // Pass custom title here
          generateTxtReport({ 
            company: 'Todas (Compras)', 
            title: 'HISTÓRICO DE COMPRAS',
            groupByLabel: 'PEDIDO' // Group by Order ID instead of Refractive Index
          }, reportData); 
      } finally {
          setIsExporting(false);
      }
  };

  // Handler for New Purchase form
  const handleSavePurchase = async () => {
      try {
          // Simulate backend ID generation
          const newId = Math.random().toString(36).substr(2, 4);
          
          const created: Purchase = {
              id: newId,
              displayId: `#PO-${newId.toUpperCase()}`,
              supplier: newPurchaseSupplier || 'Fornecedor',
              supplierInitials: (newPurchaseSupplier || 'F').substring(0, 1).toUpperCase(),
              supplierColorClass: 'bg-blue-100 text-blue-600', 
              date: newPurchaseData.date,
              itemsDescription: newPurchaseData.itemsDescription || '-',
              amount: parseFloat(newPurchaseData.amount || '0'),
              status: newPurchaseData.status as any
          };

          setPurchases([created, ...purchases]);
          showToast('Compra registrada com sucesso!', 'success');
          
          // Reset form
          setNewPurchaseSupplier('');
          setNewPurchaseData({
            date: new Date().toISOString().split('T')[0],
            itemsDescription: '',
            amount: '',
            status: 'Pendente'
          });

      } catch (e) {
          console.error(e);
          showToast('Erro ao salvar compra.', 'error');
      }
  };

  return (
    <div className="h-full flex flex-col px-4 md:px-6 py-4 overflow-hidden">
        <Toast message={toast.message} type={toast.type} isVisible={toast.isVisible} onClose={() => setToast(prev => ({ ...prev, isVisible: false }))} />

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 h-full min-h-0 lg:overflow-hidden no-scrollbar overflow-y-auto">
            
            {/* Left Column (Table & Stats) - Now Order 1 on Mobile (Top) */}
            <div className="lg:col-span-8 flex flex-col gap-4 h-full lg:overflow-hidden min-h-[500px] lg:min-h-0 order-1">
                <div className="flex-none grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                        // Standardized Colors: Dark Blue Icon Background
                        { label: 'Custo Total', value: `R$ ${purchases.reduce((acc, curr) => acc + (curr.amount || 0), 0).toFixed(2)}`, icon: 'receipt_long', color: 'text-white', bg: 'bg-slate-900 dark:bg-primary' },
                        { label: 'Recebidos', value: `${purchases.filter(p => p.status === 'Received').length} Pedidos`, icon: 'check_circle', color: 'text-white', bg: 'bg-slate-900 dark:bg-primary' },
                    ].map(metric => (
                        <div key={metric.label} className="bg-white dark:bg-surface-dark rounded-2xl p-4 shadow-soft border border-slate-100 dark:border-slate-700 flex items-center gap-4 hover:shadow-hover hover:-translate-y-1 transition-all duration-300">
                            <div className={`h-10 w-10 rounded-full ${metric.bg} ${metric.color} flex items-center justify-center shadow-md`}>
                                <Icon name={metric.icon} />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-slate-400 uppercase">{metric.label}</p>
                                <p className="text-lg font-bold text-slate-900 dark:text-white">{metric.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex-1 bg-white dark:bg-surface-dark rounded-3xl shadow-soft border border-slate-100 dark:border-slate-700 flex flex-col overflow-hidden">
                    <div className="flex-none p-4 md:p-6 pb-2">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                            <div>
                                 <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Histórico de Compras</h2>
                                 <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Gerencie e rastreie aquisições de estoque.</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <ExportButtons 
                                    isLoading={isExporting}
                                    onExportTxt={handleExportTxt}
                                    onExportCsv={handleExportCsv}
                                />
                                <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-primary text-white rounded-full text-sm font-semibold shadow-md hover:opacity-90 transition-opacity">
                                    <Icon name="filter_list" className="!text-lg" />
                                    Filtrar
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-2 bg-slate-50 dark:bg-slate-800 p-2 rounded-2xl border border-slate-100 dark:border-slate-700">
                             <div className="relative flex-1 min-w-[200px]">
                                 <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                     <Icon name="search" className="!text-lg" />
                                 </span>
                                 <input type="text" placeholder="Buscar por ID, Fornecedor..." className="w-full bg-white dark:bg-surface-dark border-none rounded-xl py-2 pl-10 pr-4 text-base md:text-sm focus:ring-2 focus:ring-primary shadow-sm text-slate-700 dark:text-white" />
                             </div>
                             <div className="w-full sm:w-auto min-w-[160px]">
                                 <CustomSelect 
                                    value={statusFilter}
                                    onChange={setStatusFilter}
                                    options={['Todos Status', 'Recebido', 'Pendente', 'Cancelado']}
                                    triggerClassName="bg-white dark:bg-surface-dark border-none shadow-sm py-2"
                                 />
                             </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-x-auto overflow-y-auto no-scrollbar relative">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead className="sticky top-0 bg-white dark:bg-surface-dark z-10">
                                <tr className="border-b border-slate-100 dark:border-slate-700">
                                    <th className="py-4 px-3 pl-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">ID</th>
                                    <th className="py-4 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Fornecedor</th>
                                    <th className="py-4 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Data</th>
                                    <th className="py-4 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Itens</th>
                                    <th className="py-4 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Valor</th>
                                    <th className="py-4 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-center">Status</th>
                                    <th className="py-4 px-3 pr-6 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Ação</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm divide-y divide-slate-50 dark:divide-slate-700">
                                {isLoading ? (
                                    <tr><td colSpan={7} className="py-8 text-center text-slate-400">Carregando histórico...</td></tr>
                                ) : purchases.length === 0 ? (
                                    <tr><td colSpan={7} className="py-8 text-center text-slate-400">Nenhum registro encontrado.</td></tr>
                                ) : (
                                    purchases.map(purchase => (
                                    <tr key={purchase.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                                        <td className="py-4 px-3 pl-6 font-medium text-primary">{purchase.displayId}</td>
                                        <td className="py-4 px-3">
                                            <div className="flex items-center gap-3">
                                                <div className={`h-8 w-8 rounded-full ${purchase.supplierColorClass} flex items-center justify-center font-bold text-xs`}>
                                                    {purchase.supplierInitials}
                                                </div>
                                                <span className="font-semibold text-slate-700 dark:text-slate-200">{purchase.supplier}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-3 text-slate-500 dark:text-slate-400">{purchase.date}</td>
                                        <td className="py-4 px-3 text-slate-500 dark:text-slate-400 max-w-[150px] truncate">{purchase.itemsDescription}</td>
                                        <td className="py-4 px-3 font-bold text-slate-900 dark:text-white text-right">R$ {purchase.amount.toFixed(2)}</td>
                                        <td className="py-4 px-3 text-center">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium 
                                                ${purchase.status === 'Received' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' : ''}
                                                ${purchase.status === 'Pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' : ''}
                                                ${purchase.status === 'Cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' : ''}
                                            `}>
                                                {purchase.status === 'Received' ? 'Recebido' : purchase.status === 'Pending' ? 'Pendente' : 'Cancelado'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-3 pr-6 text-right">
                                            <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                                                <Icon name="more_vert" className="!text-lg" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    <div className="flex-none flex flex-col sm:flex-row items-center justify-between p-4 px-6 gap-4 border-t border-slate-100 dark:border-slate-700">
                         <span className="text-sm text-slate-500 dark:text-slate-400">Exibindo {purchases.length} itens</span>
                    </div>
                </div>
            </div>

            {/* Right Column (Form) - Now Order 2 on Mobile (Bottom) */}
            <div className="lg:col-span-4 flex flex-col gap-4 h-auto lg:h-full lg:overflow-y-auto pr-1 no-scrollbar shrink-0 order-2">
                <div className="bg-white dark:bg-surface-dark rounded-3xl p-6 shadow-soft border border-slate-100 dark:border-slate-700 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-4">
                        {/* Updated Icon Container Color */}
                        <div className="h-10 w-10 rounded-xl bg-slate-900 dark:bg-primary flex items-center justify-center text-white shadow-md">
                            <Icon name="add_shopping_cart" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Nova Compra</h2>
                    </div>
                    <form className="flex flex-col gap-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                             <div className="col-span-1">
                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Fornecedor</label>
                                <CustomSelect 
                                    value={newPurchaseSupplier}
                                    onChange={setNewPurchaseSupplier}
                                    options={['Essilor International', 'Hoya Corporation', 'Zeiss Vision', 'Rodenstock']}
                                    placeholder="Selecionar"
                                    triggerClassName="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-600"
                                />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Data</label>
                                <input 
                                    type="date" 
                                    value={newPurchaseData.date}
                                    onChange={(e) => setNewPurchaseData({...newPurchaseData, date: e.target.value})}
                                    className="w-full rounded-xl border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-white focus:border-primary focus:ring-primary text-base md:text-sm py-2.5 px-4 shadow-sm" 
                                />
                            </div>
                        </div>
                        
                        <div>
                             <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Descrição</label>
                             <textarea 
                                rows={2} 
                                value={newPurchaseData.itemsDescription}
                                onChange={(e) => setNewPurchaseData({...newPurchaseData, itemsDescription: e.target.value})}
                                placeholder="Ex: 50x Lentes Blue Cut..." 
                                className="w-full rounded-xl border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-white focus:border-primary focus:ring-primary text-base md:text-sm py-2.5 px-4 shadow-sm resize-none"
                             ></textarea>
                        </div>
                        <div>
                             <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Valor Total</label>
                             <div className="relative">
                                 <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">R$</span>
                                 <input 
                                    type="number" 
                                    value={newPurchaseData.amount}
                                    onChange={(e) => setNewPurchaseData({...newPurchaseData, amount: e.target.value})}
                                    placeholder="0.00" 
                                    className="w-full rounded-xl border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-white focus:border-primary focus:ring-primary text-base md:text-sm py-2.5 px-4 pl-10 shadow-sm" 
                                />
                             </div>
                        </div>
                        <div>
                             <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Status</label>
                             <div className="flex gap-2">
                                <label className="flex-1 cursor-pointer">
                                    <input 
                                        type="radio" 
                                        name="status" 
                                        className="peer sr-only" 
                                        checked={newPurchaseData.status === 'Pendente'}
                                        onChange={() => setNewPurchaseData({...newPurchaseData, status: 'Pendente'})}
                                    />
                                    <div className="rounded-xl border border-slate-200 dark:border-slate-600 p-2.5 text-center text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:text-primary transition-all">Pendente</div>
                                </label>
                                <label className="flex-1 cursor-pointer">
                                    <input 
                                        type="radio" 
                                        name="status" 
                                        className="peer sr-only" 
                                        checked={newPurchaseData.status === 'Received'}
                                        onChange={() => setNewPurchaseData({...newPurchaseData, status: 'Received'})}
                                    />
                                    <div className="rounded-xl border border-slate-200 dark:border-slate-600 p-2.5 text-center text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 peer-checked:border-accent-green peer-checked:bg-accent-green/5 peer-checked:text-accent-green transition-all">Recebido</div>
                                </label>
                             </div>
                        </div>
                        <button type="button" onClick={handleSavePurchase} className="mt-2 w-full py-3 bg-slate-900 dark:bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-slate-900/20 dark:shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
                             <Icon name="save" className="!text-lg" />
                             Salvar Compra
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>
  );
};

export default Purchases;
