
import React, { useState, useRef, useEffect } from 'react';
import { Icon } from '../components/Icon';
import { Modal } from '../components/Modal';
import { CustomSelect, SelectOption } from '../components/CustomSelect';
import { ShortageFormData } from '../types';
import { Toast } from '../components/Toast';
import { MOCK_SHORTAGES } from '../lib/dataClient/mockClient';

const Shortages: React.FC = () => {
  const [formData, setFormData] = useState<ShortageFormData>({
    material: '1.56', 
    lensType: 'Visão Simples', 
    coating: 'HMC', 
    sphere: '',
    cylinder: '',
    quantity: 1
  });

  const [sphereError, setSphereError] = useState(false);
  const [cylinderError, setCylinderError] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [recentHistory, setRecentHistory] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Static options for Frontend Only Mode
  const [dbIndices] = useState<SelectOption[]>([
      { value: '1.49', label: '1.49' },
      { value: '1.56', label: '1.56' },
      { value: '1.59', label: '1.59 (Poly)' },
      { value: '1.60', label: '1.60' },
      { value: '1.67', label: '1.67' },
      { value: '1.74', label: '1.74' }
  ]);
  const [dbTratamentos] = useState<SelectOption[]>([
      { value: 'Incolor', label: 'Incolor' },
      { value: 'HMC', label: 'HMC' },
      { value: 'Blue Cut', label: 'Blue Cut' },
      { value: 'Photo', label: 'Photo' },
      { value: 'AR Premium', label: 'AR Premium' }
  ]);
  const [dbTipos] = useState<SelectOption[]>([
      { value: 'Visão Simples', label: 'Visão Simples' },
      { value: 'Multifocal', label: 'Multifocal' },
      { value: 'Bifocal', label: 'Bifocal' }
  ]);

  // Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; isVisible: boolean }>({
    message: '',
    type: 'success',
    isVisible: false,
  });

  const sphereRef = useRef<HTMLInputElement>(null);

  // Use Mock History
  useEffect(() => {
    if (isHistoryOpen) {
      setRecentHistory(MOCK_SHORTAGES);
    }
  }, [isHistoryOpen]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type, isVisible: true });
  };

  const closeToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  // --- SMART FORMATTING LOGIC ---
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (!value) return;

    if (name === 'sphere') {
        let num = parseFloat(value);
        if (isNaN(num)) return;

        if (Math.abs(num) >= 25 && !value.includes('.')) {
            num = num / 100;
        }

        num = Math.round(num * 4) / 4;
        
        const formatted = num === 0 ? '+0.00' : num > 0 ? `+${num.toFixed(2)}` : num.toFixed(2);
        
        setFormData(prev => ({ ...prev, sphere: formatted }));
        setSphereError(false);
    } 

    if (name === 'cylinder') {
        let num = parseFloat(value);
        
        if (isNaN(num)) {
            setCylinderError(true); 
            return;
        }

        if (Math.abs(num) >= 25 && !value.includes('.')) {
            num = num / 100;
        }

        const isStepValid = (Math.abs(num) * 100) % 25 === 0;

        if (!isStepValid) {
            setCylinderError(true);
        } else {
            const absVal = Math.abs(num);
            const formatted = `-${absVal.toFixed(2)}`;
            setFormData(prev => ({ ...prev, cylinder: formatted }));
            setCylinderError(false);
        }
    }
  };

  // Handle Input Changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'sphere') setSphereError(false);
    if (name === 'cylinder') setCylinderError(false);
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle Select Changes (CustomSelect)
  const handleSelectChange = (name: keyof ShortageFormData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cylinderError) {
        showToast("Corrija o valor do Cilíndrico.", "error");
        return;
    }
    
    setIsSubmitting(true);

    try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));

        // In Frontend Mode, we just succeed
        showToast(`Falta registrada com sucesso!`, "success");
        
        // Add to history (local simulation)
        const newItem = {
             index: formData.material,
             esfCil: `${formData.sphere} ${formData.cylinder}`,
             user: 'Você',
             treatment: formData.coating,
             time: 'Agora',
             quantity: formData.quantity,
             type: formData.lensType
        };
        setRecentHistory(prev => [newItem, ...prev]);

        setFormData(prev => ({
            ...prev,
            sphere: '',
            cylinder: '',
            quantity: 1
        }));
        
        // Refocus for next entry
        setTimeout(() => {
            sphereRef.current?.focus();
        }, 0);

    } catch (error: any) {
        console.error(error);
        showToast("Erro ao processar.", "error");
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full flex flex-col px-4 md:px-6 py-4 w-full max-w-[1440px] mx-auto overflow-hidden relative">
      <Toast 
        message={toast.message} 
        type={toast.type} 
        isVisible={toast.isVisible} 
        onClose={closeToast} 
      />
      
      {/* Header Section */}
      <div className="flex-none mb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Registrar Falta</h2>
          </div>
          <button 
            onClick={() => setIsHistoryOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 rounded-full text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm whitespace-nowrap"
          >
              <Icon name="history" className="!text-lg" />
              Histórico Recente
          </button>
      </div>

      {/* Main Content Card */}
      <div className="flex-1 bg-white dark:bg-surface-dark rounded-3xl shadow-soft border border-slate-100 dark:border-slate-700 flex flex-col transition-all duration-300 overflow-hidden mb-2">
          <form onSubmit={handleSubmit} className="flex flex-col h-full">
            <div className="p-4 md:px-10 md:py-6 flex-1 overflow-y-auto no-scrollbar flex flex-col justify-start md:justify-center">
              <div className="max-w-5xl mx-auto space-y-6 w-full py-2">
                
                {/* Section 1 */}
                <div>
                   <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
                     <Icon name="lens" className="text-primary !text-base" />
                     Especificações da Lente
                   </h3>
                   <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                      <div>
                        <CustomSelect 
                            label="Índice de Refração"
                            value={formData.material}
                            onChange={(val) => handleSelectChange('material', val)}
                            options={dbIndices}
                            placeholder="Selecione..."
                        />
                      </div>

                      <div>
                        <CustomSelect 
                            label="Tipo"
                            value={formData.lensType}
                            onChange={(val) => handleSelectChange('lensType', val)}
                            options={dbTipos}
                            placeholder="Selecione..."
                        />
                      </div>

                      <div>
                        <CustomSelect 
                            label="Tratamento"
                            value={formData.coating}
                            onChange={(val) => handleSelectChange('coating', val)}
                            options={dbTratamentos}
                            placeholder="Selecione..."
                        />
                      </div>
                   </div>
                </div>

                {/* Section 2 */}
                <div>
                   <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
                     <Icon name="tune" className="text-accent-purple !text-base" />
                     Parâmetros
                   </h3>
                   <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5 ml-1">Esférico (ESF)</label>
                        <input 
                          name="sphere" 
                          ref={sphereRef}
                          value={formData.sphere} 
                          onChange={handleChange} 
                          onBlur={handleBlur}
                          required
                          className={`w-full rounded-xl border bg-slate-50 dark:bg-slate-900 px-4 py-2.5 text-slate-900 dark:text-white text-sm font-bold focus:outline-none focus:ring-2 transition-all placeholder:text-slate-400 
                            ${sphereError ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 dark:border-slate-600 focus:ring-primary/20 focus:border-primary'}`}
                          placeholder="+0.00" 
                          type="text" 
                          inputMode="decimal"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5 ml-1">Cilíndrico (CIL)</label>
                        <div className="relative">
                            <input 
                              name="cylinder" 
                              value={formData.cylinder} 
                              onChange={handleChange} 
                              onBlur={handleBlur}
                              required
                              className={`w-full rounded-xl border bg-slate-50 dark:bg-slate-900 px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 transition-all placeholder:text-slate-400 text-red-600 dark:text-red-400
                                ${cylinderError ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 dark:border-slate-600 focus:ring-primary/20 focus:border-primary'}`}
                              placeholder="-0.00" 
                              type="text" 
                              inputMode="decimal"
                            />
                            {cylinderError && (
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 text-xs font-bold bg-white dark:bg-slate-900 px-1">CIL inválido</span>
                            )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5 ml-1">Quantidade</label>
                        <div className="relative">
                          <input 
                            name="quantity" 
                            value={formData.quantity} 
                            onChange={handleChange} 
                            required
                            min="1"
                            className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 pl-4 pr-12 py-2.5 text-slate-900 dark:text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-slate-400" 
                            type="number" 
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs font-bold bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">QTD</span>
                        </div>
                      </div>
                   </div>
                </div>

              </div>
            </div>

            <div className="flex-none p-4 md:px-10 md:py-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-700 flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
              <button 
                onClick={() => {
                    // Reset to defaults
                    if (dbIndices.length > 0) setFormData(prev => ({ ...prev, material: dbIndices[0].value }));
                    setFormData(prev => ({
                        ...prev,
                        sphere: '',
                        cylinder: '',
                        quantity: 1
                    }));
                    setCylinderError(false);
                    setSphereError(false);
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all text-sm" 
                type="button"
              >
                Limpar
              </button>
              <button 
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-3 bg-slate-900 dark:bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-slate-900/20 dark:shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 hover:bg-slate-800 dark:hover:bg-primary-dark transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:translate-y-0" 
                type="submit"
              >
                {isSubmitting ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                    <>
                        <Icon name="check" className="!text-lg" />
                        Confirmar Falta
                    </>
                )}
              </button>
            </div>
          </form>
      </div>

      {/* History Modal */}
      <Modal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} title="Histórico Recente">
          <div className="overflow-y-auto no-scrollbar -mr-2 pr-2 space-y-4">
              {recentHistory.length === 0 ? (
                  <p className="text-slate-500 text-center py-4">Nenhum registro encontrado.</p>
              ) : (
                  recentHistory.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-700">
                        <div className="h-10 w-10 rounded-full bg-blue-50 dark:bg-blue-900/20 text-primary dark:text-blue-400 flex items-center justify-center text-xs font-bold shrink-0">
                            {item.index}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline mb-0.5">
                                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{item.esfCil}</p>
                                <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">{item.time}</span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{item.treatment} - {item.type}</p>
                        </div>
                    </div>
                  ))
              )}
          </div>
      </Modal>
    </div>
  );
};

export default Shortages;
