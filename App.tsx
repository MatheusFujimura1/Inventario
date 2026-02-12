import React, { useEffect, useState } from 'react';
import { LayoutDashboard, Import, List, Settings, Save, Upload, Users, LogOut } from 'lucide-react';
import Dashboard from './components/Dashboard';
import BulkImport from './components/BulkImport';
import InventoryList from './components/InventoryList';
import UserManagement from './components/UserManagement';
import Login from './components/Login';
import { MaterialItem, TabView, User } from './types';
import * as storage from './services/storageService';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<TabView>(TabView.IMPORT); // Default for Balconista
  const [inventory, setInventory] = useState<MaterialItem[]>([]);
  const [showExportModal, setShowExportModal] = useState(false);

  // Load initial inventory data (users are loaded on demand or login)
  useEffect(() => {
    const data = storage.getStoredInventory();
    setInventory(data);
  }, []);

  // Save inventory changes
  useEffect(() => {
    storage.saveInventory(inventory);
  }, [inventory]);

  // Handle Login
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    // Set default tab based on Role
    if (user.role === 'ADMIN') {
      setActiveTab(TabView.DASHBOARD);
    } else {
      setActiveTab(TabView.IMPORT);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab(TabView.IMPORT);
  };

  const handleImport = (newItems: MaterialItem[]) => {
    setInventory(prev => [...prev, ...newItems]);
    // Only redirect to list if Admin, otherwise stay on import or show success message
    if (currentUser?.role === 'ADMIN') {
      setActiveTab(TabView.LIST);
    } else {
      alert("Itens registrados com sucesso!");
    }
  };

  const handleDeleteItem = (id: string) => {
    setInventory(prev => prev.filter(i => i.id !== id));
  };

  const handleClearAll = () => {
    if (window.confirm("Tem certeza que deseja apagar TODOS os dados do inventário? Esta ação não pode ser desfeita.")) {
      setInventory([]);
      storage.clearInventory();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const appData = await storage.importData(e.target.files[0]);
        
        if (window.confirm("Isso irá substituir ou mesclar os dados. Deseja continuar?")) {
           // Update Inventory
           if (appData.inventory) {
             setInventory(appData.inventory);
             storage.saveInventory(appData.inventory);
           }
           // Update Users if present and user is Admin
           if (appData.users) {
             storage.saveUsers(appData.users);
           }
           setShowExportModal(false);
           alert("Dados importados com sucesso! Se houve alteração de usuários, por favor faça login novamente.");
           handleLogout();
        }
      } catch (err) {
        alert("Erro ao importar arquivo. Verifique se é um backup válido.");
      }
    }
  };

  // If not logged in, show Login Screen
  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  const isAdmin = currentUser.role === 'ADMIN';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-100 flex flex-col shadow-xl z-10 sticky top-0 md:h-screen">
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span className="w-8 h-8 bg-brand-500 rounded-md flex items-center justify-center text-white font-bold">I</span>
            Inventário Pro
          </h1>
          <div className="mt-4 flex items-center gap-3 bg-slate-800 p-2 rounded-md">
            <div className="w-8 h-8 rounded-full bg-brand-700 flex items-center justify-center font-bold text-xs">
              {currentUser.username.substring(0, 2).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{currentUser.name}</p>
              <p className="text-xs text-slate-400 truncate capitalize">{currentUser.role.toLowerCase()}</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {isAdmin && (
            <NavItem 
              active={activeTab === TabView.DASHBOARD} 
              onClick={() => setActiveTab(TabView.DASHBOARD)} 
              icon={<LayoutDashboard size={20} />} 
              label="Dashboard" 
            />
          )}
          
          <NavItem 
            active={activeTab === TabView.IMPORT} 
            onClick={() => setActiveTab(TabView.IMPORT)} 
            icon={<Import size={20} />} 
            label="Registrar Inventário" 
          />
          
          {isAdmin && (
            <>
              <NavItem 
                active={activeTab === TabView.LIST} 
                onClick={() => setActiveTab(TabView.LIST)} 
                icon={<List size={20} />} 
                label="Base de Dados" 
              />
              <NavItem 
                active={activeTab === TabView.USERS} 
                onClick={() => setActiveTab(TabView.USERS)} 
                icon={<Users size={20} />} 
                label="Usuários" 
              />
            </>
          )}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2">
          {isAdmin && (
            <button 
              onClick={() => setShowExportModal(true)}
              className="w-full flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors text-sm"
            >
              <Settings size={18} />
              Backup / Dados
            </button>
          )}
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-slate-800 rounded-md transition-colors text-sm"
          >
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {activeTab === TabView.DASHBOARD && 'Visão Geral'}
              {activeTab === TabView.IMPORT && 'Importação de Dados'}
              {activeTab === TabView.LIST && 'Base de Materiais'}
              {activeTab === TabView.USERS && 'Controle de Acesso'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {activeTab === TabView.DASHBOARD && 'Métricas principais e análise de divergências.'}
              {activeTab === TabView.IMPORT && 'Cole os dados do Excel para registrar a contagem.'}
              {activeTab === TabView.LIST && 'Gerencie e visualize todos os itens registrados.'}
              {activeTab === TabView.USERS && 'Gerencie quem pode acessar o sistema.'}
            </p>
          </div>
          <div className="text-right hidden md:block">
            <p className="text-xs text-gray-400">Última atualização</p>
            <p className="text-sm font-medium text-gray-600">{new Date().toLocaleDateString()}</p>
          </div>
        </header>

        {activeTab === TabView.DASHBOARD && isAdmin && <Dashboard items={inventory} />}
        {activeTab === TabView.IMPORT && <BulkImport onImport={handleImport} />}
        {activeTab === TabView.LIST && isAdmin && (
          <InventoryList 
            items={inventory} 
            onDelete={handleDeleteItem} 
            onClearAll={handleClearAll}
          />
        )}
        {activeTab === TabView.USERS && isAdmin && <UserManagement currentUser={currentUser} />}
        
        {/* Fallback if user tries to access restricted tab via state manipulation or bugs */}
        {!isAdmin && (activeTab === TabView.DASHBOARD || activeTab === TabView.LIST || activeTab === TabView.USERS) && (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <div className="bg-red-50 p-4 rounded-full mb-4">
              <LogOut className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">Acesso Negado</h3>
            <p>Seu perfil de Balconista não tem permissão para acessar esta área.</p>
          </div>
        )}
      </main>

      {/* Backup Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-fadeIn">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Gerenciar Dados (Backup Completo)</h3>
            <p className="text-sm text-gray-600 mb-6">
              Este backup inclui <strong>Inventário</strong> e <strong>Usuários</strong>. Salve este arquivo para migrar todo o sistema para outro computador.
            </p>
            
            <div className="space-y-4">
              <button 
                onClick={storage.exportData}
                className="w-full flex items-center justify-center gap-3 p-4 border-2 border-brand-100 bg-brand-50 hover:bg-brand-100 rounded-lg text-brand-700 transition-colors"
              >
                <Save className="w-6 h-6" />
                <div className="text-left">
                  <div className="font-semibold">Exportar Base Completa</div>
                  <div className="text-xs opacity-75">Salvar arquivo .json no computador</div>
                </div>
              </button>

              <div className="relative w-full flex items-center justify-center gap-3 p-4 border-2 border-dashed border-gray-300 hover:border-gray-400 bg-gray-50 rounded-lg text-gray-600 transition-colors cursor-pointer">
                <Upload className="w-6 h-6" />
                <div className="text-left">
                  <div className="font-semibold">Importar Base Completa</div>
                  <div className="text-xs opacity-75">Carregar arquivo .json de outro PC</div>
                </div>
                <input 
                  type="file" 
                  accept=".json"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handleFileUpload}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md text-sm font-medium"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const NavItem: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 ${
      active 
        ? 'bg-brand-600 text-white shadow-lg shadow-brand-900/20' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`}
  >
    {icon}
    <span className="font-medium text-sm">{label}</span>
  </button>
);

export default App;