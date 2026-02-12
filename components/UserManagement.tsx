import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { getStoredUsers, saveUsers, updateUser } from '../services/storageService';
import { Trash2, UserPlus, Shield, User as UserIcon, Edit2, X } from 'lucide-react';

interface UserManagementProps {
  currentUser: User;
}

const UserManagement: React.FC<UserManagementProps> = ({ currentUser }) => {
  const [users, setUsers] = useState<User[]>([]);
  
  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form States
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('BALCONISTA');

  useEffect(() => {
    setUsers(getStoredUsers());
  }, []);

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !username || !password) return;

    if (editingId) {
      // Update existing
      const updatedUser: User = {
        id: editingId,
        name,
        username,
        password,
        role
      };
      updateUser(updatedUser);
      setUsers(prev => prev.map(u => u.id === editingId ? updatedUser : u));
      cancelEdit();
    } else {
      // Create new
      if (users.some(u => u.username === username)) {
        alert("Nome de usuário já existe.");
        return;
      }

      const newUser: User = {
        id: crypto.randomUUID(),
        name,
        username,
        password,
        role
      };

      const updatedUsers = [...users, newUser];
      setUsers(updatedUsers);
      saveUsers(updatedUsers);
      cancelEdit();
    }
  };

  const startEdit = (user: User) => {
    setEditingId(user.id);
    setName(user.name);
    setUsername(user.username);
    setPassword(user.password);
    setRole(user.role);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setName('');
    setUsername('');
    setPassword('');
    setRole('BALCONISTA');
  };

  const handleDeleteUser = (id: string) => {
    if (id === currentUser.id || id === 'root-admin') {
      alert("Você não pode excluir a si mesmo ou o administrador principal.");
      return;
    }
    if (window.confirm("Tem certeza que deseja excluir este usuário?")) {
      const updatedUsers = users.filter(u => u.id !== id);
      setUsers(updatedUsers);
      saveUsers(updatedUsers);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Shield className="w-6 h-6 text-brand-600" />
          Gerenciamento de Usuários
        </h2>

        {/* Form */}
        <form onSubmit={handleSaveUser} className={`p-6 rounded-lg border mb-8 transition-colors ${editingId ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
              {editingId ? 'Editar Usuário' : 'Adicionar Novo Usuário'}
            </h3>
            {editingId && (
              <button type="button" onClick={cancelEdit} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Nome Completo</label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-brand-500"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ex: João da Silva"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Usuário (Login)</label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-brand-500"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Ex: jsilva"
                required
                disabled={!!editingId} // Prevent changing username during edit to avoid confusion or id issues
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Senha</label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-brand-500"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Senha de acesso"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Nível de Acesso</label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-brand-500"
                value={role}
                onChange={e => setRole(e.target.value as UserRole)}
              >
                <option value="BALCONISTA">Balconista (Apenas Registro)</option>
                <option value="ADMIN">Administrador (Total)</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50"
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              className={`px-4 py-2 text-white rounded-md text-sm font-medium flex items-center gap-2 ${editingId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-brand-600 hover:bg-brand-700'}`}
            >
              {editingId ? <Edit2 size={16} /> : <UserPlus size={16} />}
              {editingId ? 'Salvar Alterações' : 'Criar Usuário'}
            </button>
          </div>
        </form>

        {/* List */}
        <div className="overflow-x-auto border rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Login</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acesso</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className={editingId === user.id ? 'bg-blue-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                        <UserIcon size={16} />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.username}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => startEdit(user)}
                        className="text-blue-600 hover:text-blue-900 bg-blue-50 p-2 rounded-full hover:bg-blue-100 transition-colors"
                        title="Editar"
                      >
                        <Edit2 size={16} />
                      </button>
                      
                      {user.id !== currentUser.id && user.id !== 'root-admin' && (
                        <button 
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-900 bg-red-50 p-2 rounded-full hover:bg-red-100 transition-colors"
                          title="Excluir"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;