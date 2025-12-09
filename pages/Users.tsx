import React, { useState, useEffect } from 'react';
import { Icon } from '../components/Icon';
import { Modal } from '../components/Modal';
import { User } from '../types';

const MOCK_USERS: User[] = [
  { id: '1', name: 'Sarah Jenkins', email: 'sarah.j@visulab.com', company: 'OptiLens Pro', role: 'Administrador', status: 'Active', lastActive: '2 min atrás', avatarUrl: 'https://picsum.photos/200?random=1' },
  { id: '2', name: 'Michael Korb', email: 'm.korb@visulab.com', company: 'Visionary Clinics', role: 'Usuário', status: 'Active', lastActive: '4 horas atrás', initials: 'MK' },
  { id: '3', name: 'Jessica Lee', email: 'jessica.l@visulab.com', company: 'EyeTech Solutions', role: 'Usuário', status: 'Offline', lastActive: '2 dias atrás', initials: 'JL' },
  { id: '4', name: 'David Miller', email: 'd.miller@visulab.com', company: 'ClearView Labs', role: 'Usuário', status: 'Pending', lastActive: 'Nunca', initials: 'DM' },
  { id: '5', name: 'Emily Chen', email: 'e.chen@visulab.com', company: 'Focus Frames', role: 'Usuário', status: 'Active', lastActive: '1 dia atrás', initials: 'EC' },
  { id: '6', name: 'Robert Wilson', email: 'r.wilson@visulab.com', company: 'Spectra Optics', role: 'Administrador', status: 'Inactive', lastActive: '1 semana atrás', initials: 'RW' },
];

const COMPANIES_LIST = [
    'OptiLens Pro', 'Visionary Clinics', 'EyeTech Solutions', 'ClearView Labs', 'Focus Frames', 'Spectra Optics', 'VisuLab HQ'
];

const Users: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Delete Logic State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Form State
  const [formData, setFormData] = useState({
      name: '',
      company: COMPANIES_LIST[0],
      email: '',
      password: '',
      role: 'Usuário',
      isActive: true
  });

  // Auto-generate email based on Name and Company
  useEffect(() => {
    // Only auto-generate if we are NOT editing an existing user (or if we want dynamic updates, but usually emails are static after creation)
    // Here we make it reactive for the demo to show the "auto" capability
    const cleanName = formData.name.toLowerCase().trim().split(' ')[0] || 'usuario';
    const cleanCompany = formData.company.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8);
    
    // If editing, we might want to keep original email, but prompt implies auto-generation structure.
    // For this mock, we update it dynamically to satisfy "gerado automaticamente e inalteravel" based on current inputs.
    const autoEmail = `${cleanName}.${cleanCompany}@visulab.com`;
    
    setFormData(prev => ({ ...prev, email: autoEmail }));
  }, [formData.name, formData.company]);

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setDeleteModalOpen(true);
  };

  const handleDeactivate = () => {
    if (userToDelete) {
        setUsers(users.map(u => u.id === userToDelete.id ? { ...u, status: 'Inactive' } : u));
        setDeleteModalOpen(false);
        setUserToDelete(null);
    }
  };

  const handlePermanentDelete = () => {
    if (userToDelete) {
        setUsers(users.filter(u => u.id !== userToDelete.id));
        setDeleteModalOpen(false);
        setUserToDelete(null);
    }
  };

  const openNewUserModal = () => {
      setEditingId(null);
      setFormData({
          name: '',
          company: COMPANIES_LIST[0],
          email: '',
          password: '',
          role: 'Usuário',
          isActive: true
      });
      setIsModalOpen(true);
  };

  const openEditUserModal = (user: User) => {
      setEditingId(user.id);
      setFormData({
          name: user.name,
          company: user.company || COMPANIES_LIST[0],
          email: user.email,
          password: '', // Password empty on edit
          role: user.role as string,
          isActive: user.status === 'Active'
      });
      setIsModalOpen(true);
  };

  const handleSaveUser = () => {
      if (editingId) {
          // Update existing
          setUsers(users.map(u => u.id === editingId ? {
              ...u,
              name: formData.name,
              company: formData.company,
              email: formData.email,
              role: formData.role as any,
              status: formData.isActive ? 'Active' : 'Inactive'
          } : u));
      } else {
          // Create new
          const newUser: User = {
              id: Date.now().toString(),
              name: formData.name,
              company: formData.company,
              email: formData.email,
              role: formData.role as any,
              status: formData.isActive ? 'Active' : 'Inactive',
              lastActive: 'Agora',
              initials: formData.name.substring(0,2).toUpperCase()
          };
          setUsers([newUser, ...users]);
      }
      setIsModalOpen(false);
  };

  return (
    <div className="h-full flex flex-col px-4 md:px-6 py-4 overflow-hidden">
      <div className="flex-none flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-4 md:mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Gerenciar Usuários</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Administre membros da equipe, funções e permissões.</p>
        </div>
        <div className="w-full lg:w-auto grid grid-cols-2 gap-3 md:flex md:gap-4">
           {[
             // Standardized Colors: Dark Blue Icon Background
             { label: 'Total', value: '124', icon: 'group', color: 'text-white', bg: 'bg-slate-900 dark:bg-primary' },
             { label: 'Ativos', value: '118', icon: 'verified_user', color: 'text-white', bg: 'bg-slate-900 dark:bg-primary' },
             // Removed 'Novos' Card
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

        {/* Updated Table Container with overflow-x-auto and proper min-width */}
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
              {users.map((user) => (
                <tr key={user.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-b border-slate-50 dark:border-slate-700 last:border-0">
                  <td className="py-3 px-2 pl-6">
                    <div className="flex items-center gap-3">
                      {user.avatarUrl ? (
                         <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700 bg-center bg-cover border border-slate-100 dark:border-slate-600 shrink-0" style={{ backgroundImage: `url("${user.avatarUrl}")` }}></div>
                      ) : (
                         <div className={`h-10 w-10 rounded-full flex items-center justify-center text-xs font-bold border border-slate-100 dark:border-slate-600 shrink-0
                            ${user.initials === 'MK' ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900' : ''}
                            ${user.initials === 'JL' ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-200' : ''}
                            ${user.initials === 'DM' ? 'bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-200' : ''}
                            ${user.initials === 'EC' ? 'bg-teal-100 dark:bg-teal-900 text-teal-600 dark:text-teal-200' : ''}
                            ${user.initials === 'RW' ? 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-200' : ''}
                         `}>
                           {user.initials}
                         </div>
                      )}
                      <div>
                        <p className="text-slate-900 dark:text-white font-bold">{user.name}</p>
                        {/* Company displayed below name */}
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
                    {/* Actions always visible */}
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
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="flex-none flex flex-col sm:flex-row items-center justify-between p-4 gap-4 border-t border-slate-100 dark:border-slate-700">
           <p className="text-sm text-slate-500 dark:text-slate-400">Exibindo <span className="font-bold text-slate-900 dark:text-white">1-6</span> de <span className="font-bold text-slate-900 dark:text-white">124</span> usuários</p>
           <div className="flex gap-2">
             <button disabled className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors">Anterior</button>
             <button className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Próximo</button>
           </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Editar Usuário" : "Novo Usuário"}>
        <form className="space-y-4">
          
          {/* 1. Name */}
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

          {/* 2. Company */}
          <div>
             <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Empresa</label>
             <div className="relative">
                 <select 
                    value={formData.company}
                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border-none rounded-xl text-base md:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 appearance-none"
                 >
                    {COMPANIES_LIST.map(comp => <option key={comp} value={comp}>{comp}</option>)}
                 </select>
                 <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <Icon name="expand_more" className="!text-lg" />
                 </span>
             </div>
          </div>

          {/* 3. Email (Auto-generated & Read-only) */}
          <div>
             <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex justify-between">
                Email
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider pt-1">Gerado Automaticamente</span>
             </label>
             <input 
                type="email" 
                value={formData.email}
                readOnly
                disabled
                className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-base md:text-sm text-slate-500 dark:text-slate-400 cursor-not-allowed opacity-75" 
            />
          </div>

          {/* 4. Password */}
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
             {/* 5. Type/Role */}
             <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Tipo</label>
                <div className="relative">
                    <select 
                        value={formData.role}
                        onChange={(e) => setFormData({...formData, role: e.target.value})}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border-none rounded-xl text-base md:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 appearance-none"
                    >
                        <option>Usuário</option>
                        <option>Administrador</option>
                    </select>
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <Icon name="expand_more" className="!text-lg" />
                    </span>
                </div>
             </div>
             
             {/* 6. Status Toggle */}
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

      {/* Delete/Deactivate Confirmation Modal */}
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