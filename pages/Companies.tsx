import React, { useState } from 'react';
import { Icon } from '../components/Icon';
import { Modal } from '../components/Modal';
import { Company } from '../types';
import { Toast } from '../components/Toast';

// Updated Mock Data with Distinct Colors and New Types
const MOCK_COMPANIES: Company[] = [
    { id: '1', name: 'OptiLens Pro', displayId: '#CP-8821', type: 'Fornecedor', contactName: 'Sarah Jenkins', contactEmail: 'sarah@optilens.com', status: 'Active', initials: 'OL', colorClass: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-200' },
    { id: '2', name: 'Visionary Clinics', displayId: '#CP-9932', type: 'Filial', contactName: 'Dr. Michael Chen', contactEmail: 'admin@visionary.co', status: 'Active', initials: 'VC', colorClass: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-200' },
    { id: '3', name: 'EyeTech Solutions', displayId: '#CP-7741', type: 'Fornecedor', contactName: 'Robert Fox', contactEmail: 'rfox@eyetech.net', status: 'Inactive', initials: 'ET', colorClass: 'bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-200' },
    { id: '4', name: 'ClearView Labs', displayId: '#CP-5520', type: 'Fornecedor', contactName: 'Amanda Low', contactEmail: 'amanda@clearview.io', status: 'Pending', initials: 'CL', colorClass: 'bg-sky-100 text-sky-600 dark:bg-sky-900 dark:text-sky-200' },
    { id: '5', name: 'Focus Frames', displayId: '#CP-3392', type: 'Filial', contactName: 'Jerome Bell', contactEmail: 'j.bell@focusframes.com', status: 'Active', initials: 'FF', colorClass: 'bg-pink-100 text-pink-600 dark:bg-pink-900 dark:text-pink-200' },
    { id: '6', name: 'Spectra Optics', displayId: '#CP-1102', type: 'Matriz', contactName: 'Lisa Wong', contactEmail: 'lisa@spectra.com', status: 'Active', initials: 'SO', colorClass: 'bg-purple-100 text-accent-purple dark:bg-purple-900 dark:text-purple-200' },
];

const Companies: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [companies, setCompanies] = useState(MOCK_COMPANIES);

  // Form State for New Company
  const [newCompany, setNewCompany] = useState<{
      name: string;
      type: 'Matriz' | 'Filial' | 'Fornecedor';
      isActive: boolean;
  }>({
      name: '',
      type: 'Fornecedor',
      isActive: true,
  });

  // Delete Logic State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);

  // Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; isVisible: boolean }>({
    message: '',
    type: 'success',
    isVisible: false,
  });

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type, isVisible: true });
  };

  const closeToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  const handleDeleteClick = (company: Company) => {
      setCompanyToDelete(company);
      setDeleteModalOpen(true);
  };

  const handleDeactivate = () => {
      if (companyToDelete) {
          setCompanies(companies.map(c => c.id === companyToDelete.id ? { ...c, status: 'Inactive' } : c));
          setDeleteModalOpen(false);
          setCompanyToDelete(null);
          showToast('Empresa desativada com sucesso.', 'success');
      }
  };

  const handlePermanentDelete = () => {
      if (companyToDelete) {
          setCompanies(companies.filter(c => c.id !== companyToDelete.id));
          setDeleteModalOpen(false);
          setCompanyToDelete(null);
          showToast('Empresa excluída permanentemente.', 'success');
      }
  };

  const handleCreateCompany = () => {
      // Mock create logic
      const created: Company = {
          id: Date.now().toString(),
          name: newCompany.name || 'Nova Empresa',
          displayId: `#CP-${Math.floor(Math.random() * 9000) + 1000}`,
          type: newCompany.type,
          contactName: '-',
          contactEmail: '-',
          status: newCompany.isActive ? 'Active' : 'Inactive',
          initials: (newCompany.name || 'NE').substring(0,2).toUpperCase(),
          colorClass: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
      };

      setCompanies([created, ...companies]);
      setIsModalOpen(false);
      setNewCompany({ name: '', type: 'Fornecedor', isActive: true }); // Reset
      showToast('Empresa cadastrada com sucesso!', 'success');
  };

  const getCompanyTypeIcon = (type: string) => {
      switch(type) {
          case 'Fornecedor': return 'local_shipping';
          case 'Filial': return 'storefront';
          case 'Matriz': return 'domain';
          default: return 'domain';
      }
  };

  return (
    <div className="h-full flex flex-col px-4 md:px-6 py-4 overflow-hidden relative">
      <Toast 
        message={toast.message} 
        type={toast.type} 
        isVisible={toast.isVisible} 
        onClose={closeToast} 
      />

      {/* Header Row: Title & Metrics Cards */}
      <div className="flex-none flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-4 md:mb-6">
         <div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Gerenciar Empresas</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Supervisione laboratórios parceiros, fornecedores e clínicas.</p>
         </div>
         <div className="w-full lg:w-auto grid grid-cols-2 gap-3 md:flex md:gap-4">
             {[
                // Standardized Colors: Dark Blue Icon Background
                { label: 'Total', value: '124', icon: 'domain', color: 'text-white', bg: 'bg-slate-900 dark:bg-primary' },
                { label: 'Ativos', value: '112', icon: 'check_circle', color: 'text-white', bg: 'bg-slate-900 dark:bg-primary' },
             ].map(metric => (
                <div key={metric.label} className="bg-white dark:bg-surface-dark rounded-2xl p-3 px-4 shadow-soft flex flex-col md:flex-row items-center md:gap-3 border border-slate-100 dark:border-slate-700 justify-center md:justify-start text-center md:text-left hover:shadow-hover hover:-translate-y-1 transition-all duration-300">
                    <div className={`h-8 w-8 md:h-10 md:w-10 rounded-full ${metric.bg} ${metric.color} flex items-center justify-center mb-1 md:mb-0 shadow-md`}>
                        <Icon name={metric.icon} className="!text-lg md:!text-xl" />
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-400 font-semibold uppercase">{metric.label}</p>
                        <p className="text-base md:text-lg font-bold text-slate-900 dark:text-white">{metric.value}</p>
                    </div>
                </div>
             ))}
         </div>
      </div>

      {/* Main Content Card with Search Bar inside (Identical layout to Users page) */}
      <div className="flex-1 bg-white dark:bg-surface-dark rounded-3xl shadow-soft border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col">
         <div className="flex-none flex flex-col md:flex-row justify-between items-center p-4 md:p-6 gap-4 border-b border-slate-50 dark:border-slate-700">
            <div className="relative w-full md:w-96 group">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                    <Icon name="search" />
                </span>
                <input className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border-none rounded-xl text-base md:text-sm font-medium text-slate-700 dark:text-slate-300 placeholder-slate-400 focus:ring-2 focus:ring-primary/20 transition-all" placeholder="Buscar por empresa..." type="text" />
            </div>
            <div className="flex gap-3 w-full md:w-auto">
                <button className="flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex-1 md:flex-none">
                    <Icon name="filter_list" className="!text-lg" />
                    <span>Filtros</span>
                </button>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-slate-900/20 dark:shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all flex-1 md:flex-none whitespace-nowrap"
                >
                    <Icon name="add" className="!text-lg" />
                    <span>Nova Empresa</span>
                </button>
            </div>
         </div>
         
         {/* Updated Table Container with overflow-x-auto and proper min-width */}
         <div className="flex-1 overflow-x-auto overflow-y-auto no-scrollbar relative pb-10">
             <table className="w-full text-left border-collapse min-w-[800px]">
                 <thead className="sticky top-0 bg-white dark:bg-surface-dark z-10 shadow-sm">
                     <tr className="border-b border-slate-100 dark:border-slate-700 text-slate-400 text-xs uppercase tracking-wider">
                         <th className="px-6 py-4 font-bold w-[60px]">
                             <input type="checkbox" className="rounded border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-primary focus:ring-primary/20" />
                         </th>
                         <th className="px-6 py-4 font-bold">Empresa</th>
                         <th className="px-6 py-4 font-bold">Tipo</th>
                         <th className="px-6 py-4 font-bold text-center">Status</th>
                         <th className="px-6 py-4 font-bold text-right">Ações</th>
                     </tr>
                 </thead>
                 <tbody className="text-sm font-medium">
                     {companies.map(company => (
                         <tr key={company.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-b border-slate-50 dark:border-slate-700 last:border-0 cursor-pointer">
                             <td className="px-6 py-4">
                                 <input type="checkbox" className="rounded border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-primary focus:ring-primary/20" />
                             </td>
                             <td className="px-6 py-4">
                                 <div className="flex items-center gap-4">
                                     <div className={`h-10 w-10 rounded-full ${company.colorClass} flex items-center justify-center text-sm font-bold shrink-0`}>
                                         {company.initials}
                                     </div>
                                     <div>
                                         <p className="text-slate-900 dark:text-white font-bold">{company.name}</p>
                                         <p className="text-xs text-slate-500 dark:text-slate-400">ID: {company.displayId}</p>
                                     </div>
                                 </div>
                             </td>
                             <td className="px-6 py-4">
                                 <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                      <Icon name={getCompanyTypeIcon(company.type)} className="!text-lg text-slate-400" />
                                      <span>
                                          {company.type}
                                      </span>
                                 </div>
                             </td>
                             <td className="px-6 py-4 text-center">
                                 <div className="flex justify-center">
                                     <span className={`h-2.5 w-2.5 rounded-full ${company.status === 'Active' ? 'bg-emerald-500' : 'bg-red-500'}`} title={company.status}></span>
                                 </div>
                             </td>
                             <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-1">
                                    <button onClick={() => setIsModalOpen(true)} className="h-8 w-8 flex items-center justify-center rounded-lg bg-transparent hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-primary transition-all">
                                        <Icon name="edit" className="!text-lg" />
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteClick(company)}
                                        className="h-8 w-8 flex items-center justify-center rounded-lg bg-transparent hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-red-500 transition-all"
                                    >
                                        <Icon name={company.status === 'Pending' ? 'close' : 'delete'} className="!text-lg" />
                                    </button>
                                </div>
                             </td>
                         </tr>
                     ))}
                 </tbody>
             </table>
         </div>

         <div className="flex-none p-4 px-6 border-t border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
             <span className="text-xs font-medium text-slate-400">Exibindo 1-6 de 124 empresas</span>
             <div className="flex items-center gap-2">
                 <button disabled className="h-9 w-9 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors disabled:opacity-50">
                     <Icon name="chevron_left" className="!text-lg" />
                 </button>
                 <button className="h-9 w-9 rounded-full bg-slate-900 dark:bg-primary text-white text-xs font-bold flex items-center justify-center shadow-md">1</button>
                 <button className="h-9 w-9 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors text-xs font-medium">2</button>
                 <button className="h-9 w-9 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors">
                     <Icon name="chevron_right" className="!text-lg" />
                 </button>
             </div>
         </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nova Empresa">
          <div className="space-y-4">
              <div>
                  <label htmlFor="company-name" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Nome da Empresa</label>
                  <input 
                    type="text" 
                    id="company-name" 
                    value={newCompany.name}
                    onChange={(e) => setNewCompany({...newCompany, name: e.target.value})}
                    placeholder="Ex: LensTech Soluções" 
                    className="w-full rounded-xl border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-base md:text-sm text-slate-900 dark:text-white focus:ring-primary focus:border-primary px-4 py-2.5" 
                  />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                      <label htmlFor="company-type" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Tipo</label>
                      <select 
                        id="company-type" 
                        value={newCompany.type}
                        onChange={(e) => setNewCompany({...newCompany, type: e.target.value as any})}
                        className="w-full rounded-xl border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-base md:text-sm text-slate-900 dark:text-white focus:ring-primary focus:border-primary px-4 py-2.5"
                      >
                          <option value="Fornecedor">Fornecedor</option>
                          <option value="Filial">Filial</option>
                          <option value="Matriz">Matriz</option>
                      </select>
                  </div>
                  <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Status</label>
                      <button 
                        type="button"
                        onClick={() => setNewCompany({...newCompany, isActive: !newCompany.isActive})}
                        className={`w-full px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-between border ${newCompany.isActive 
                            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800' 
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-600'}`}
                      >
                        <span>{newCompany.isActive ? 'Ativo' : 'Inativo'}</span>
                        <div className={`w-10 h-5 rounded-full relative transition-colors ${newCompany.isActive ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
                            <div className={`absolute top-1 bottom-1 w-3 h-3 bg-white rounded-full transition-all ${newCompany.isActive ? 'left-[22px]' : 'left-1'}`}></div>
                        </div>
                      </button>
                  </div>
              </div>
              
              <div className="pt-4 flex flex-col sm:flex-row-reverse gap-2">
                  <button type="button" onClick={handleCreateCompany} className="inline-flex w-full sm:w-auto justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/30 hover:bg-primary-dark hover:-translate-y-0.5 transition-all">Criar</button>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="inline-flex w-full sm:w-auto justify-center rounded-xl bg-white dark:bg-slate-800 px-5 py-2.5 text-sm font-bold text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">Cancelar</button>
              </div>
          </div>
      </Modal>

      {/* Delete/Deactivate Confirmation Modal */}
      <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Gerenciar Empresa">
          <div className="flex flex-col gap-6">
             <div className="text-center">
                <div className="h-14 w-14 mx-auto bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mb-4 border border-slate-100 dark:border-slate-700">
                    <Icon name="domain_disabled" className="!text-2xl" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">O que deseja fazer com esta empresa?</h4>
                <p className="text-slate-500 dark:text-slate-400 text-sm px-4">
                    Você pode desativar o cadastro temporariamente ou excluir o registro permanentemente.
                </p>
             </div>
             
             <div className="flex flex-col gap-3">
                 <button 
                     onClick={handleDeactivate}
                     className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2"
                 >
                     <Icon name="block" className="!text-lg" />
                     Apenas Desativar
                 </button>
                 
                 <button 
                     onClick={handlePermanentDelete}
                     className="w-full py-3 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl font-bold text-sm transition-colors border border-red-100 dark:border-red-900/30 flex items-center justify-center gap-2"
                 >
                     <Icon name="delete_forever" className="!text-lg" />
                     Excluir Permanentemente
                 </button>

                 <button 
                     onClick={() => setDeleteModalOpen(false)}
                     className="mt-2 w-full py-2 text-slate-500 dark:text-slate-400 font-semibold text-sm hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                 >
                     Cancelar
                 </button>
             </div>
          </div>
      </Modal>
    </div>
  );
};

export default Companies;