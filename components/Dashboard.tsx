import React, { useState } from 'react';
import { MaterialItem } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AlertCircle, TrendingDown, CheckCircle2, DollarSign, Bot } from 'lucide-react';
import { analyzeInventory } from '../services/geminiService';

interface DashboardProps {
  items: MaterialItem[];
}

const Dashboard: React.FC<DashboardProps> = ({ items }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  const totalItems = items.length;
  const itemsWithDivergence = items.filter(i => i.divergenceQuantity !== 0);
  const totalDivergenceValue = items.reduce((acc, curr) => acc + curr.divergenceValue, 0);
  
  // Total SAP Value comes directly from inputs now
  const totalValueSAP = items.reduce((acc, curr) => acc + curr.sapTotalValue, 0);
  
  const accuracy = totalItems > 0 ? ((totalItems - itemsWithDivergence.length) / totalItems) * 100 : 0;

  // Data for Charts
  const divergenceByWarehouse = items.reduce((acc, curr) => {
    const found = acc.find(x => x.name === curr.warehouse);
    if (found) {
      found.value += Math.abs(curr.divergenceValue);
    } else {
      acc.push({ name: curr.warehouse, value: Math.abs(curr.divergenceValue) });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  const handleAIAnalysis = async () => {
    setLoadingAnalysis(true);
    const result = await analyzeInventory(items);
    setAnalysis(result);
    setLoadingAnalysis(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total de Materiais" 
          value={totalItems.toString()} 
          icon={<CheckCircle2 className="w-5 h-5 text-blue-600" />} 
          subText="Itens contados"
        />
        <StatCard 
          title="Acuracidade" 
          value={`${accuracy.toFixed(1)}%`} 
          icon={<AlertCircle className={`w-5 h-5 ${accuracy > 98 ? 'text-green-600' : 'text-yellow-600'}`} />} 
          subText="Meta: >99%"
          color={accuracy > 98 ? 'green' : 'yellow'}
        />
        <StatCard 
          title="Divergência (R$)" 
          value={totalDivergenceValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} 
          icon={<TrendingDown className="w-5 h-5 text-red-600" />} 
          subText="Impacto financeiro líquido"
          color={totalDivergenceValue === 0 ? 'gray' : totalDivergenceValue > 0 ? 'blue' : 'red'}
        />
        <StatCard 
          title="Valor Total SAP" 
          value={totalValueSAP.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} 
          icon={<DollarSign className="w-5 h-5 text-emerald-600" />} 
          subText="Soma dos valores em sistema"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Divergência Financeira por Depósito</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={divergenceByWarehouse}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`} />
                <Legend />
                <Bar dataKey="value" name="Valor Absoluto da Divergência" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Bot className="w-5 h-5 text-purple-600" />
              Análise Inteligente
            </h3>
            <button 
              onClick={handleAIAnalysis}
              disabled={loadingAnalysis || totalItems === 0}
              className={`text-sm px-3 py-1 rounded-md border flex items-center gap-2 transition-all
                ${loadingAnalysis ? 'bg-gray-100 text-gray-400' : 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'}`}
            >
              {loadingAnalysis ? 'Analisando...' : 'Gerar Análise IA'}
            </button>
          </div>
          
          <div className="flex-1 bg-gray-50 rounded-md p-4 overflow-y-auto max-h-64 border border-gray-100">
            {analysis ? (
              <div className="prose prose-sm prose-indigo">
                 <pre className="whitespace-pre-wrap font-sans text-gray-700">{analysis}</pre>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm">
                <p>Clique em "Gerar Análise IA" para obter insights sobre as divergências.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; subText: string; color?: string }> = ({ title, value, icon, subText, color = 'blue' }) => {
  return (
    <div className={`bg-white p-5 rounded-lg border border-gray-200 shadow-sm border-l-4 border-l-${color}-500`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h4 className="text-2xl font-bold text-gray-900 mt-1">{value}</h4>
        </div>
        <div className="p-2 bg-gray-50 rounded-full">
          {icon}
        </div>
      </div>
      <p className="text-xs text-gray-400 mt-2">{subText}</p>
    </div>
  );
};

export default Dashboard;