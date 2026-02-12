import React, { useState, useMemo } from 'react';
import { MaterialItem } from '../types';
import { Search, Download, Trash2, ArrowUpDown } from 'lucide-react';

interface InventoryListProps {
  items: MaterialItem[];
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

const InventoryList: React.FC<InventoryListProps> = ({ items, onDelete, onClearAll }) => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'DIVERGENT' | 'ACCURATE'>('ALL');
  const [sortConfig, setSortConfig] = useState<{ key: keyof MaterialItem; direction: 'asc' | 'desc' } | null>(null);

  const filteredItems = useMemo(() => {
    let data = items.filter(item => 
      item.code.toLowerCase().includes(search.toLowerCase()) || 
      item.warehouse.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase())
    );

    if (filterType === 'DIVERGENT') {
      data = data.filter(item => item.divergenceQuantity !== 0);
    } else if (filterType === 'ACCURATE') {
      data = data.filter(item => item.divergenceQuantity === 0);
    }

    if (sortConfig) {
      data.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return data;
  }, [items, search, filterType, sortConfig]);

  const handleSort = (key: keyof MaterialItem) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const exportCSV = () => {
    const headers = ["Material", "Texto breve", "Deposito", "Quantidade", "Contagem", "Divergencia (Qtd)", "Valor SAP", "Divergencia (Valor)"];
    const csvContent = [
      headers.join(';'),
      ...filteredItems.map(item => [
        item.code,
        item.description,
        item.warehouse,
        item.sapQuantity.toString().replace('.', ','),
        item.physicalQuantity.toString().replace('.', ','),
        item.divergenceQuantity.toString().replace('.', ','),
        item.sapTotalValue.toString().replace('.', ','),
        item.divergenceValue.toString().replace('.', ',')
      ].join(';'))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "inventario_export.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  };

  return (
    <div className="space-y-4 animate-fadeIn bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Buscar por material, depósito ou descrição..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-brand-500 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <select 
            className="border border-gray-300 rounded-md text-sm px-3 py-2 outline-none"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
          >
            <option value="ALL">Todos os Materiais</option>
            <option value="DIVERGENT">Com Divergência</option>
            <option value="ACCURATE">Sem Divergência</option>
          </select>
          
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm font-medium transition-colors">
            <Download className="w-4 h-4" />
            Excel
          </button>
          
          <button onClick={onClearAll} className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-md text-sm font-medium transition-colors ml-auto md:ml-0">
            <Trash2 className="w-4 h-4" />
            Limpar
          </button>
        </div>
      </div>

      <div className="overflow-x-auto border rounded-lg mt-4">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {[
                { label: 'Material', key: 'code' },
                { label: 'Texto breve', key: 'description' },
                { label: 'Depósito', key: 'warehouse' },
                { label: 'Quantidade', key: 'sapQuantity' },
                { label: 'Contagem', key: 'physicalQuantity' },
                { label: 'Div (Qtd)', key: 'divergenceQuantity' },
                { label: 'Valor', key: 'sapTotalValue' },
                { label: 'Divergência R$', key: 'divergenceValue' },
              ].map((header) => (
                <th 
                  key={header.key}
                  onClick={() => handleSort(header.key as keyof MaterialItem)}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                >
                  <div className="flex items-center gap-1">
                    {header.label}
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
              ))}
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredItems.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.code}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate max-w-xs">{item.description}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.warehouse}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono text-right">{item.sapQuantity}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono text-right">{item.physicalQuantity}</td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold text-right ${item.divergenceQuantity !== 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {item.divergenceQuantity > 0 ? `+${item.divergenceQuantity}` : item.divergenceQuantity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-right">
                  {item.sapTotalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold text-right ${item.divergenceValue < 0 ? 'text-red-600' : item.divergenceValue > 0 ? 'text-blue-600' : 'text-green-600'}`}>
                  {item.divergenceValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => onDelete(item.id)} className="text-gray-400 hover:text-red-600 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {filteredItems.length === 0 && (
              <tr>
                <td colSpan={9} className="px-6 py-12 text-center text-gray-400 text-sm">
                  Nenhum item encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="text-xs text-gray-400 mt-2 text-right">
        Mostrando {filteredItems.length} registros
      </div>
    </div>
  );
};

export default InventoryList;