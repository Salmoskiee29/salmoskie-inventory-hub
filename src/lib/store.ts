// LocalStorage-based data store for Salmoskie Inventory System

export interface User {
  id: string;
  username: string;
  password: string;
  role: 'admin' | 'staff';
  createdAt: string;
}

export interface InventoryItem {
  id: string;
  itemName: string;
  category: string;
  quantity: number;
  unit: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface Request {
  id: string;
  requesterName: string;
  department: string;
  itemId: string;
  itemName: string;
  quantityRequested: number;
  purpose: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  processedAt?: string;
}

export interface Record {
  id: string;
  actionType: 'item_added' | 'item_updated' | 'item_deleted' | 'request_approved' | 'request_rejected' | 'request_submitted';
  description: string;
  userId: string;
  userName: string;
  createdAt: string;
}

// Initialize default data
export const initializeData = () => {
  if (!localStorage.getItem('salmoskie_users')) {
    const defaultUsers: User[] = [
      {
        id: '1',
        username: 'admin',
        password: 'admin123',
        role: 'admin',
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        username: 'staff',
        password: 'staff123',
        role: 'staff',
        createdAt: new Date().toISOString(),
      },
    ];
    localStorage.setItem('salmoskie_users', JSON.stringify(defaultUsers));
  }

  if (!localStorage.getItem('salmoskie_inventory')) {
    localStorage.setItem('salmoskie_inventory', JSON.stringify([]));
  }

  if (!localStorage.getItem('salmoskie_requests')) {
    localStorage.setItem('salmoskie_requests', JSON.stringify([]));
  }

  if (!localStorage.getItem('salmoskie_records')) {
    localStorage.setItem('salmoskie_records', JSON.stringify([]));
  }
};

// User operations
export const getUsers = (): User[] => {
  return JSON.parse(localStorage.getItem('salmoskie_users') || '[]');
};

export const authenticateUser = (username: string, password: string): User | null => {
  const users = getUsers();
  return users.find(u => u.username === username && u.password === password) || null;
};

// Inventory operations
export const getInventory = (): InventoryItem[] => {
  return JSON.parse(localStorage.getItem('salmoskie_inventory') || '[]');
};

export const addInventoryItem = (item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>): InventoryItem => {
  const inventory = getInventory();
  const newItem: InventoryItem = {
    ...item,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  inventory.push(newItem);
  localStorage.setItem('salmoskie_inventory', JSON.stringify(inventory));
  return newItem;
};

export const updateInventoryItem = (id: string, updates: Partial<InventoryItem>): void => {
  const inventory = getInventory();
  const index = inventory.findIndex(item => item.id === id);
  if (index !== -1) {
    inventory[index] = { ...inventory[index], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem('salmoskie_inventory', JSON.stringify(inventory));
  }
};

export const deleteInventoryItem = (id: string): void => {
  const inventory = getInventory();
  const filtered = inventory.filter(item => item.id !== id);
  localStorage.setItem('salmoskie_inventory', JSON.stringify(filtered));
};

export const deductInventory = (itemId: string, quantity: number): void => {
  const inventory = getInventory();
  const item = inventory.find(i => i.id === itemId);
  if (item) {
    item.quantity = Math.max(0, item.quantity - quantity);
    item.updatedAt = new Date().toISOString();
    localStorage.setItem('salmoskie_inventory', JSON.stringify(inventory));
  }
};

// Request operations
export const getRequests = (): Request[] => {
  return JSON.parse(localStorage.getItem('salmoskie_requests') || '[]');
};

export const addRequest = (request: Omit<Request, 'id' | 'createdAt' | 'status'>): Request => {
  const requests = getRequests();
  const newRequest: Request = {
    ...request,
    id: Date.now().toString(),
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  requests.push(newRequest);
  localStorage.setItem('salmoskie_requests', JSON.stringify(requests));
  return newRequest;
};

export const updateRequestStatus = (id: string, status: 'approved' | 'rejected'): void => {
  const requests = getRequests();
  const request = requests.find(r => r.id === id);
  if (request) {
    request.status = status;
    request.processedAt = new Date().toISOString();
    localStorage.setItem('salmoskie_requests', JSON.stringify(requests));
    
    // Auto-deduct inventory if approved
    if (status === 'approved') {
      deductInventory(request.itemId, request.quantityRequested);
    }
  }
};

// Record operations
export const getRecords = (): Record[] => {
  return JSON.parse(localStorage.getItem('salmoskie_records') || '[]');
};

export const addRecord = (record: Omit<Record, 'id' | 'createdAt'>): void => {
  const records = getRecords();
  const newRecord: Record = {
    ...record,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  records.unshift(newRecord);
  localStorage.setItem('salmoskie_records', JSON.stringify(records));
};
