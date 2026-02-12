import { GoogleGenAI } from "@google/genai";
import { MaterialItem } from "../types";

export const analyzeInventory = async (items: MaterialItem[]): Promise<string> => {
  if (!process.env.API_KEY) {
    return "API Key não configurada. Por favor, adicione sua chave de API para usar a análise inteligente.";
  }

  // Summarize data to avoid token limits if list is huge
  const summary = items.slice(0, 50).map(item => 
    `- Material: ${item.code} (${item.description || 'N/A'}) | Depósito: ${item.warehouse} | Qtd SAP: ${item.sapQuantity} | Contagem: ${item.physicalQuantity} | Valor SAP: R$ ${item.sapTotalValue.toFixed(2)} | Divergência Financeira: R$ ${item.divergenceValue.toFixed(2)}`
  ).join('\n');

  const prompt = `
    Atue como um analista de inventário sênior. Analise os seguintes dados de inventário (amostra dos 50 primeiros itens ou itens com maior divergência).
    
    Dados:
    ${summary}

    Por favor, forneça:
    1. Um resumo executivo sobre a acuracidade do inventário.
    2. Identifique os itens com maiores perdas financeiras (Divergência negativa de valor).
    3. Identifique possíveis sobras (Divergência positiva).
    4. Sugira 3 ações corretivas baseadas nestes dados.
    
    Formate a resposta em Markdown limpo e profissional.
  `;

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Não foi possível gerar a análise.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Erro ao conectar com a IA. Verifique sua chave de API ou tente novamente mais tarde.";
  }
};