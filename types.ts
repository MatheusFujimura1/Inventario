export interface MaterialItem {
  id: string;
  code: string;
  description: string;
  warehouse: string; // Depósito
  sapQuantity: number;
  physicalQuantity: number;
  sapTotalValue: number; // Valor total vindo da planilha SAP (Coluna Valor)
  unitValue: number; // Calculado (sapTotalValue / sapQuantity)
  divergenceQuantity: number;
  divergenceValue: number;
  dateAdded: string;
}

export interface InventoryStats {
  totalItems: number;
  totalValueSAP: number;
  totalValuePhysical: number;
  totalDivergenceValue: number;
  accuracyPercentage: number;
}

export enum TabView {
  DASHBOARD = 'DASHBOARD',
  IMPORT = 'IMPORT',
  LIST = 'LIST',
  USERS = 'USERS',
  SETTINGS = 'SETTINGS'
}

export type UserRole = 'ADMIN' | 'BALCONISTA';

export interface User {
  id: string;
  username: string;
  password: string; // Em um app real, isso seria hash. Para este uso local, texto simples/base64.
  role: UserRole;
  name: string;
}

export interface AppData {
  inventory: MaterialItem[];
  users: User[];
}