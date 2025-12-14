
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { Toast } from '../components/Toast';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; isVisible: boolean }>({
    message: '',
    type: 'success',
    isVisible: false,
  });

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type, isVisible: true });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Mock Login Delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Allow any email/password in frontend mode
      if (email && password) {
          navigate('/dashboard');
      } else {
          showToast('Preencha os campos para entrar.', 'error');
      }

    } catch (error: any) {
      console.error('Erro no login:', error);
      showToast('Erro ao realizar login.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f2f4f6] dark:bg-background-dark flex items-center justify-center font-display p-4">
      <Toast 
        message={toast.message} 
        type={toast.type} 
        isVisible={toast.isVisible} 
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))} 
      />

      <div className="w-full max-w-[420px] bg-white dark:bg-surface-dark rounded-[32px] shadow-2xl overflow-hidden animate-fade-in-up">
        
        {/* Header Section (Dark) */}
        <div className="bg-[#0f172a] p-10 flex flex-col items-center justify-center text-center pt-14 pb-14">
            <div className="h-20 w-20 bg-white/10 rounded-3xl flex items-center justify-center mb-6 backdrop-blur-sm border border-white/10 shadow-lg">
                <Logo className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight mb-3">VisuLab</h1>
            <p className="text-slate-400 text-lg font-medium">Registro de Faltas do Estoque</p>
        </div>

        {/* Form Section (Light) */}
        <div className="p-8 pt-10 pb-12">
            <form onSubmit={handleLogin} className="space-y-6">
                <div>
                    <label className="block text-base font-bold text-slate-700 dark:text-slate-300 mb-2.5 ml-1" htmlFor="email">Usuário</label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined text-[24px]">mail</span>
                        <input 
                            id="email"
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="nome@empresa.com"
                            className="w-full rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 pl-12 pr-4 py-4 text-slate-900 dark:text-white text-base font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all placeholder:text-slate-400 shadow-sm"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-base font-bold text-slate-700 dark:text-slate-300 mb-2.5 ml-1" htmlFor="password">Senha</label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined text-[24px]">lock</span>
                        <input 
                            id="password"
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••"
                            className="w-full rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 pl-12 pr-4 py-4 text-slate-900 dark:text-white text-base font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all placeholder:text-slate-400 shadow-sm"
                            required
                        />
                    </div>
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full py-4 bg-[#0f172a] dark:bg-primary text-white rounded-2xl font-bold text-lg shadow-lg shadow-slate-900/20 dark:shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 hover:bg-slate-800 dark:hover:bg-primary-dark transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:translate-y-0 disabled:cursor-not-allowed mt-8"
                >
                    {loading ? (
                        <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : (
                        <span>Entrar</span>
                    )}
                </button>
            </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
