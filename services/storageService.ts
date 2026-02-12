import { MaterialItem, User, AppData } from '../types';

const STORAGE_KEY_INVENTORY = 'sap_inventory_data';
const STORAGE_KEY_USERS = 'sap_inventory_users';

// --- INVENTORY ---

export const getStoredInventory = (): MaterialItem[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY_INVENTORY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to load inventory", error);
    return [];
  }
};

export const saveInventory = (items: MaterialItem[]) => {
  try {
    localStorage.setItem(STORAGE_KEY_INVENTORY, JSON.stringify(items));
  } catch (error) {
    console.error("Failed to save inventory", error);
  }
};

export const clearInventory = () => {
  localStorage.removeItem(STORAGE_KEY_INVENTORY);
};

// --- USERS ---

const DEFAULT_ADMIN: User = {
  id: 'root-admin',
  username: 'mvfujimura',
  password: 'Vertente@2025',
  role: 'ADMIN',
  name: 'Administrador Principal'
};

export const getStoredUsers = (): User[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY_USERS);
    if (!data) {
      // Initialize default user if empty
      saveUsers([DEFAULT_ADMIN]);
      return [DEFAULT_ADMIN];
    }
    return JSON.parse(data);
  } catch (error) {
    return [DEFAULT_ADMIN];
  }
};

export const saveUsers = (users: User[]) => {
  try {
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
  } catch (error) {
    console.error("Failed to save users", error);
  }
};

export const updateUser = (updatedUser: User) => {
  const users = getStoredUsers();
  const index = users.findIndex(u => u.id === updatedUser.id);
  
  if (index !== -1) {
    users[index] = updatedUser;
    saveUsers(users);
  }
};

// --- EXPORT / IMPORT (FULL BACKUP) ---

export const exportData = () => {
  const inventory = getStoredInventory();
  const users = getStoredUsers();
  
  const fullData: AppData = { inventory, users };

  const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
    JSON.stringify(fullData)
  )}`;
  const link = document.createElement("a");
  link.href = jsonString;
  link.download = `inventario_backup_${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
};

export const importData = async (file: File): Promise<AppData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const json = JSON.parse(text);

        // Handle backward compatibility (if file is just array of items)
        if (Array.isArray(json)) {
          resolve({
            inventory: json as MaterialItem[],
            users: getStoredUsers() // Keep current users
          });
        } else if (json.inventory && json.users) {
          // New format
          resolve(json as AppData);
        } else {
          reject(new Error("Formato de arquivo inválido"));
        }
      } catch (err) {
        reject(err);
      }
    };
    reader.readAsText(file);
  });
};