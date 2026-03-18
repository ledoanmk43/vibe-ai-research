export interface Store {
  id: string;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  users?: any[];
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  storeId: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
  isActive: boolean;
  
  // Virtual / Aggregate Stats
  totalOrders?: number;
  totalSpent?: number;
  loyaltyPoints?: number;

  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ServiceItem {
  id: string;
  storeId: string;
  name: string;
  description?: string;
  pricePerUnit: number;
  unitType: 'KG' | 'PIECE' | 'METER' | 'PAIR';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  serviceId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  notes?: string;
  service?: ServiceItem;
}

export interface Order {
  id: string;
  orderNumber: string;
  storeId: string;
  customerId: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'READY_FOR_PICKUP' | 'COMPLETED' | 'CANCELLED';
  totalAmount: number;
  discount: number;
  notes?: string;
  pickupDate?: string;
  createdAt: string;
  updatedAt: string;
  customer?: Customer;
  store?: Store;
  items?: OrderItem[];
}
