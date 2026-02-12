import React, { useState } from 'react';
import { MaterialItem } from '../types';
import { Clipboard, ArrowDown, Database, Trash2, CheckCircle } from 'lucide-react';

interface BulkImportProps {
  onImport: (items: MaterialItem[]) => void;
}

const BulkImport: React.FC<BulkImportProps> = ({ onImport }) => {
  // Separate states for each column input
  const [codes, setCodes] = useState('');
  const [descriptions, setDescriptions] = useState('');
  const [warehouses, setWarehouses] = useState('');
  const [sapQtys, setSapQtys] = useState('');
  const [physQtys, setPhysQtys] = useState('');
  const [totalValues, setTotalValues] = useState(''); // Changed from unit values to total SAP values
  
  const [previewData, setPreviewData] = useState<MaterialItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleProcess = () => {
    setError(null);
    const splitLines = (text: string) => text.trim().split('\n').map(l => l.trim()).filter(l => l !== '');

    const codeArr = splitLines(codes);
    const descArr = splitLines(descriptions);
    const whArr = splitLines(warehouses);
    const sapArr = splitLines(sapQtys);
    const physArr = splitLines(physQtys);
    const valArr = splitLines(totalValues);

    // Basic validation: Check if main identifier (Code) exists
    if (codeArr.length === 0) {
      setError("É necessário colar pelo menos os Códigos dos materiais.");
      return;
    }

    const maxLength = codeArr.length;
    const newItems: MaterialItem[] = [];

    for (let i = 0; i < maxLength; i++) {
      const sapQ = parseFloat(sapArr[i]?.replace(',', '.') || '0');
      const physQ = parseFloat(physArr[i]?.replace(',', '.') || '0');
      
      // Parse Brazilian currency format (R$ 5.300,10 -> 5300.10)
      const rawVal = valArr[i] || '0';
      // Remove R$, remove thousand separators (.), replace decimal comma with dot
      const cleanVal = rawVal.replace(/[R$\s]/g, '').replace(/\./g, '').replace(',', '.');
      const sapTotalVal = parseFloat(cleanVal) || 0;

      // Calculate implied unit value. Avoid division by zero.
      const unitVal = sapQ !== 0 ? (sapTotalVal / sapQ) : 0;
      
      const divergenceQ = physQ - sapQ;
      // Divergence Value = Divergence Qty * Unit Price
      const divergenceV = divergenceQ * unitVal;
      
      newItems.push({
        id: crypto.randomUUID(),
        code: codeArr[i] || 'N/A',
        description: descArr[i] || '',
        warehouse: whArr[i] || 'Geral',
        sapQuantity: sapQ,
        physicalQuantity: physQ,
        sapTotalValue: sapTotalVal,
        unitValue: unitVal,
        divergenceQuantity: divergenceQ,
        divergenceValue: divergenceV,
        dateAdded: new Date().toISOString()
      });
    }

    setPreviewData(newItems);
  };

  const handleSave = () => {
    onImport(previewData);
    setPreviewData([]);
    setCodes('');
    setDescriptions('');
    setWarehouses('');
    setSapQtys('');
    setPhysQtys('');
    setTotalValues('');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Clipboard className="w-5 h-5 text-brand-600" />
          Importação em Massa (Copiar e Colar)
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Copie as colunas do seu Excel/SAP e cole nos campos abaixo. 
          <br/>
          <span className="font-semibold text-brand-600">Dica:</span> Para o valor, cole exatamente a coluna "Valor" da sua planilha (ex: R$ 5.300,10).
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <PasteArea label="Material (Código)" value={codes} onChange={setCodes} placeholder="3005..." />
          <PasteArea label="Texto breve (Descrição)" value={descriptions} onChange={setDescriptions} placeholder="CREMALHEIRA..." />
          <PasteArea label="Depósito" value={warehouses} onChange={setWarehouses} placeholder="DAGR..." />
          <PasteArea label="Quantidade (SAP)" value={sapQtys} onChange={setSapQtys} placeholder="1..." />
          <PasteArea label="Contagem (Física)" value={physQtys} onChange={setPhysQtys} placeholder="1..." />
          <PasteArea label="Valor (Coluna do SAP)" value={totalValues} onChange={setTotalValues} placeholder="R$ 5.300,10" />
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md text-sm border border-red-200">
            {error}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleProcess}
            className="px-6 py-2 bg-brand-600 text-white rounded-md hover:bg-brand-700 font-medium flex items-center gap-2 transition-colors"
          >
            <ArrowDown className="w-4 h-4" />
            Processar Divergências
          </button>
        </div>
      </div>

      {previewData.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Pré-visualização ({previewData.length} itens)</h3>
            <div className="flex gap-3">
              <button 
                onClick={() => setPreviewData([])}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-md text-sm font-medium flex items-center gap-2 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Descartar
              </button>
              <button 
                onClick={handleSave}
                className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-md text-sm font-medium flex items-center gap-2 transition-colors"
              >
                <Database className="w-4 h-4" />
                Salvar na Base
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto border rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Depósito</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Qtd SAP</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Contagem</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Valor SAP</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Divergência (R$)</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {previewData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{item.code}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{item.warehouse}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600 text-right">{item.sapQuantity}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600 text-right">{item.physicalQuantity}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600 text-right">
                      {item.sapTotalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className={`px-4 py-2 whitespace-nowrap text-sm font-bold text-right ${item.divergenceValue === 0 ? 'text-green-600' : item.divergenceValue > 0 ? 'text-blue-600' : 'text-red-600'}`}>
                      {item.divergenceValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

const PasteArea: React.FC<{ label: string; value: string; onChange: (v: string) => void; placeholder: string }> = ({ label, value, onChange, placeholder }) => (
  <div className="flex flex-col">
    <label className="text-xs font-semibold text-gray-600 mb-1">{label}</label>
    <textarea
      className="flex-1 p-2 border border-gray-300 rounded-md text-xs font-mono focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none resize-none h-40"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      wrap="off"
    />
  </div>
);

export default BulkImport;