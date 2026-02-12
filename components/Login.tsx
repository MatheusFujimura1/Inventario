import React, { useState } from 'react';
import { User } from '../types';
import { getStoredUsers } from '../services/storageService';
import { Lock, User as UserIcon, ArrowRight } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const users = getStoredUsers();
    
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
      onLogin(user);
    } else {
      setError('Usuário ou senha incorretos.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-8 bg-brand-600 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white text-brand-600 mb-4 shadow-lg">
            <Lock size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white">Inventário Pro</h1>
          <p className="text-brand-100 mt-2 text-sm">Acesso Restrito</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md border border-red-100 text-center">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 block">Usuário</label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                placeholder="Digite seu usuário..."
                autoFocus
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 block">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-transform active:scale-95"
          >
            Entrar
            <ArrowRight size={20} />
          </button>
        </form>
        
        <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
          <p className="text-xs text-gray-500">Sistema de Gestão de Inventário SAP</p>
        </div>
      </div>
    </div>
  );
};

export default Login;