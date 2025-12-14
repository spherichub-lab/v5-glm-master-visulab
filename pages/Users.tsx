
import React, { useState, useEffect } from 'react';
import { Icon } from '../components/Icon';
import { Modal } from '../components/Modal';
import { CustomSelect, SelectOption } from '../components/CustomSelect';
import { User } from '../types';
import { Toast } from '../components/Toast';
import { MOCK_USERS, MOCK_COMPANIES } from '../lib/dataClient/mockClient';

const Users: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Options
  const [companyOptions, setCompanyOptions] = useState<SelectOption[]>([]);

  // Delete Logic State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Form State
  const [formData, setFormData] = useState({
      name: '',
      companyId: '', // store ID
      email: '',
      password: '',
      role: 'Usuário',
      isActive: true
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
    const initData = async () => {
        setIsLoading(true);
        // Simulate fetch
        await new Promise(resolve => setTimeout(resolve, 500));
        setUsers(MOCK_USERS);
        
        const opts = MOCK_COMPANIES.map(c => ({ value: c.id, label: c.name }));
        setCompanyOptions(opts);
        setIsLoading(false);
    };
    initData();
  }, []);

  // Auto-generate email based on Name (helper for UI)
  useEffect(() => {
    if (!editingId && formData.name) {
        const cleanName = formData.name.toLowerCase().trim().split(' ')[0] || 'usuario';
        const autoEmail = `${cleanName}@visulab.com`;
        setFormData(prev => ({ ...prev, email: autoEmail }));
    }
  }, [formData.name, editingId]);

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setDeleteModalOpen(true);
  };

  const handleDeactivate = async () => {
    if (userToDelete) {
        setUsers(users.map(u => u.id === userToDelete.id ? { ...u, status: 'Inactive' } : u));
        showToast('Usuário desativado com sucesso.', 'success');
        setDeleteModalOpen(false);
        setUserToDelete(null);
    }
  };

  const handlePermanentDelete = async () => {
    if (userToDelete) {
        setUsers(users.filter(u => u.id !== userToDelete.id));
        showToast('Usuário excluído com sucesso.', 'success');
        setDeleteModalOpen(false);
        setUserToDelete(null);
    }
  };

  const openNewUserModal = () => {
      setEditingId(null);
      setFormData({
          name: '',
          companyId: companyOptions.length > 0 ? companyOptions[0].value : '',
          email: '',
          password: '',
          role: 'Usuário',
          isActive: true
      });
      setIsModalOpen(true);
  };

  const openEditUserModal = (user: User) => {
      setEditingId(user.id);
      const companyId = companyOptions.find(c => c.label === user.company)?.value || '';
      
      setFormData({
          name: user.name,
          companyId: companyId,
          email: user.email,
          password: '',
          role: user.role as string,
          isActive: user.status === 'Active'
      });
      setIsModalOpen(true);
  };

  const handleSaveUser = async () => {
      const companyName = companyOptions.find(c => c.value === formData.companyId)?.label || 'N/A';

      if (editingId) {
          setUsers(users.map(u => u.id === editingId ? {
              ...u,
              name: formData.name,
              email: formData.email,
              role: formData.role as any,
              company: companyName,
              status: formData.isActive ? 'Active' : 'Inactive'
          } : u));
          showToast('Usuário atualizado.', 'success');
      } else {
          const newUser: User = {
              id: Math.random().toString(36).substr(2, 9),
              name: formData.name,
              email: formData.email,
              role: formData.role as any,
              company: companyName,
              status: formData.isActive ? 'Active' : 'Inactive',
              lastActive: 'Agora',
              initials: formData.name.substring(0, 2).toUpperCase()
          };
          setUsers([newUser, ...users]);
          showToast('Usuário criado.', 'success');
      }
      setIsModalOpen(false);
  };

  return (
    <div className="h-full flex flex-col px-4 md:px-6 py-4 overflow-hidden relative">
      <Toast message={toast.message} type={toast.type} isVisible={toast.isVisible} onClose={() => setToast(prev => ({ ...prev, isVisible: false }))} />

      <div className="flex-none flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-4 md:mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Gerenciar Usuários</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Administre membros da equipe, funções e permissões (Modo Demo).</p>
        </div>
        <div className="w-full lg:w-auto grid grid-cols-2 gap-3 md:flex md:gap-4">
           {[
             { label: 'Total', value: users.length.toString(), icon: 'group', color: 'text-white', bg: 'bg-slate-900 dark:bg-primary' },
             { label: 'Ativos', value: users.filter(u => u.status === 'Active').length.toString(), icon: 'verified_user', color: 'text-white', bg: 'bg-slate-900 dark:bg-primary' },
           ].map((metric) => (
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

      <div className="flex-1 bg-white dark:bg-surface-dark rounded-3xl shadow-soft border border-slate-100 dark:border-slate-700 flex flex-col overflow-hidden">
        <div className="flex-none flex flex-col md:flex-row justify-between items-center p-4 md:p-6 gap-4 border-b border-slate-50 dark:border-slate-700">
          <div className="relative w-full md:w-96 group">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
              <Icon name="search" />
            </span>
            <input className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border-none rounded-xl text-base md:text-sm font-medium text-slate-700 dark:text-slate-300 placeholder-slate-400 focus:ring-2 focus:ring-primary/20 transition-all" placeholder="Buscar por nome, e-mail ou tipo..." type="text" />
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button className="flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex-1 md:flex-none">
              <Icon name="filter_list" className="!text-lg" />
              <span>Filtros</span>
            </button>
            <button 
              onClick={openNewUserModal}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-slate-900/20 dark:shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all flex-1 md:flex-none whitespace-nowrap"
            >
              <Icon name="add" className="!text-lg" />
              <span>Novo Usuário</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-x-auto overflow-y-auto no-scrollbar relative">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="sticky top-0 bg-white dark:bg-surface-dark z-10 shadow-sm">
              <tr className="border-b border-slate-100 dark:border-slate-700 text-slate-400 text-xs uppercase tracking-wider">
                <th className="py-4 px-2 font-bold pl-6">Usuário</th>
                <th className="py-4 px-2 font-bold">Tipo</th>
                <th className="py-4 px-2 font-bold text-center">Status</th>
                <th className="py-4 px-2 font-bold">Último Acesso</th>
                <th className="py-4 px-2 font-bold text-right pr-6">Ações</th>
              </tr>
            </thead>
            <tbody className="text-sm font-medium">
              {isLoading ? (
                  <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">Carregando usuários...</td>
                  </tr>
              ) : users.length === 0 ? (
                  <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">Nenhum usuário encontrado.</td>
                  </tr>
              ) : (
                users.map((user) => (
                    <tr key={user.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-b border-slate-50 dark:border-slate-700 last:border-0">
                    <td className="py-3 px-2 pl-6">
                        <div className="flex items-center gap-3">
                        {user.avatarUrl ? (
                            <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700 bg-center bg-cover border border-slate-100 dark:border-slate-600 shrink-0" style={{ backgroundImage: `url("${user.avatarUrl}")` }}></div>
                        ) : (
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center text-xs font-bold border border-slate-100 dark:border-slate-600 shrink-0 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-200`}>
                            {user.initials}
                            </div>
                        )}
                        <div>
                            <p className="text-slate-900 dark:text-white font-bold">{user.name}</p>
                            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mt-0.5">{user.company}</p>
                        </div>
                        </div>
                    </td>
                    <td className="py-3 px-2">
                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                        <Icon name={user.role === 'Administrador' ? 'admin_panel_settings' : 'person'} 
                                className={`!text-lg ${user.role === 'Administrador' ? 'text-accent-purple dark:text-purple-400' : 'text-slate-400'}`} />
                        <span>{user.role}</span>
                        </div>
                    </td>
                    <td className="py-3 px-2 text-center">
                        <div className="flex justify-center">
                            <span className={`h-2.5 w-2.5 rounded-full ${user.status === 'Active' ? 'bg-emerald-500' : 'bg-red-500'}`} title={user.status}></span>
                        </div>
                    </td>
                    <td className="py-3 px-2 text-slate-500 dark:text-slate-400">{user.lastActive}</td>
                    <td className="py-3 px-2 text-right pr-6">
                        <div className="flex items-center justify-end gap-1">
                        <button 
                            onClick={() => openEditUserModal(user)}
                            className="h-8 w-8 flex items-center justify-center rounded-lg bg-transparent hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-primary transition-all"
                        >
                            <Icon name="edit" className="!text-lg" />
                        </button>
                        <button 
                            onClick={() => handleDeleteClick(user)}
                            className="h-8 w-8 flex items-center justify-center rounded-lg bg-transparent hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-red-500 transition-all"
                        >
                            <Icon name={user.status === 'Pending' ? 'close' : 'delete'} className="!text-lg" />
                        </button>
                        </div>
                    </td>
                    </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="flex-none flex flex-col sm:flex-row items-center justify-between p-4 gap-4 border-t border-slate-100 dark:border-slate-700">
           <p className="text-sm text-slate-500 dark:text-slate-400">Exibindo <span className="font-bold text-slate-900 dark:text-white">{users.length}</span> registros</p>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Editar Usuário" : "Novo Usuário"}>
        <form className="space-y-4">
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Nome Completo</label>
            <input 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border-none rounded-xl text-base md:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50" 
                placeholder="Ex: João Silva" 
            />
          </div>

          <div>
             <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Empresa</label>
             <CustomSelect 
                value={formData.companyId}
                onChange={(val) => setFormData({...formData, companyId: val})}
                options={companyOptions}
                triggerClassName="bg-slate-50 dark:bg-slate-900 border-none"
             />
          </div>

          <div>
             <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex justify-between">
                Email
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider pt-1">Sugerido</span>
             </label>
             <input 
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-base md:text-sm text-slate-700 dark:text-slate-300" 
            />
          </div>

          <div>
             <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Senha</label>
             <input 
                type="password" 
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder={editingId ? "Deixe em branco para manter" : "••••••••"}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border-none rounded-xl text-base md:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50" 
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Tipo</label>
                <CustomSelect 
                    value={formData.role}
                    onChange={(val) => setFormData({...formData, role: val})}
                    options={['Usuário', 'Administrador']}
                    triggerClassName="bg-slate-50 dark:bg-slate-900 border-none"
                />
             </div>
             
             <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Status</label>
                <button 
                    type="button"
                    onClick={() => setFormData({...formData, isActive: !formData.isActive})}
                    className={`w-full px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-between border ${formData.isActive 
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800' 
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-600'}`}
                >
                    <span>{formData.isActive ? 'Ativo' : 'Inativo'}</span>
                    <div className={`w-10 h-5 rounded-full relative transition-colors ${formData.isActive ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
                        <div className={`absolute top-1 bottom-1 w-3 h-3 bg-white rounded-full transition-all ${formData.isActive ? 'left-[22px]' : 'left-1'}`}></div>
                    </div>
                </button>
             </div>
          </div>
          
          <div className="pt-4 flex gap-3">
             <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Cancelar</button>
             <button type="button" onClick={handleSaveUser} className="flex-1 py-2.5 bg-slate-900 dark:bg-primary text-white rounded-xl font-bold shadow-lg shadow-slate-900/20 dark:shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all">
                 {editingId ? 'Salvar Alterações' : 'Criar Usuário'}
             </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Gerenciar Acesso">
          <div className="flex flex-col gap-6">
             <div className="text-center">
                <div className="h-14 w-14 mx-auto bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mb-4 border border-slate-100 dark:border-slate-700">
                    <Icon name="person_remove" className="!text-2xl" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">O que deseja fazer com este usuário?</h4>
                <p className="text-slate-500 dark:text-slate-400 text-sm px-4">
                    Você pode desativar o acesso temporariamente ou excluir o registro permanentemente.
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

export default Users;
