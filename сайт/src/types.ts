export type Role = 'admin' | 'manager' | 'master' | 'client';

export type Page = 'home' | 'services' | 'orders' | 'cart' | 'profile' | 'login' | 'materials';

export interface User {
  id: string;
  username: string;
  password?: string;
  role: Role;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  roleTitle: string;
  activeOrderCount?: number;
  activeOrderCode?: string;
  isBusy?: boolean;
}

export interface Service {
  id: string;
  title: string;
  category: string;
  description: string;
  unitPrice: number;
  unit: string;
  defaultQty: number;
  minQty: number;
  stepQty: number;
  badge?: string;
  imageUrl?: string;
}

export interface CartItem {
  id: string;
  serviceId: string;
  title: string;
  category: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  customNotes?: string;
}

export interface OrderHistoryEvent {
  timestamp: string;
  text: string;
  authorRole: string;
  authorName: string;
}

export interface ReceiptItem {
  title: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
}

export interface Receipt {
  id: string;
  receiptNumber: string;
  orderCode: string;
  date: string;
  companyName: string;
  inn: string;
  address: string;
  clientName: string;
  clientPhone: string;
  cardLast4: string;
  authCode: string;
  fiscalSign: string;
  paymentType: string;
  items: ReceiptItem[];
  totalAmount: number;
}

export interface Order {
  id: string;
  code: string;
  clientUsername: string;
  clientName: string;
  clientPhone: string;
  deliveryAddress: string;
  items: CartItem[];
  totalAmount: number;
  status: 'new' | 'assigned' | 'in_progress' | 'ready' | 'completed' | 'cancelled';
  statusText: string;
  assignedMasterId?: string;
  assignedMasterName?: string;
  plannedCompletionDate?: string;
  masterNotes?: string;
  managerNotes?: string;
  isPaid?: boolean;
  paymentInfo?: string;
  receipt?: Receipt;
  createdAt: string;
  history: OrderHistoryEvent[];
}

export interface MaterialStock {
  id: string;
  name: string;
  category: string;
  unit: string;
  inStock: number;
  minThreshold: number;
  consumedLastMonth: number;
  supplier: string;
}

export interface ProcurementRecord {
  id: string;
  materialId: string;
  materialName: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
  supplier: string;
  invoiceNumber: string;
  date: string;
  receivedByName: string;
  notes?: string;
}

export interface SupplyRequest {
  id: string;
  orderId: string;
  orderCode: string;
  materialId: string;
  materialName: string;
  quantity: number;
  unit: string;
  urgency: 'normal' | 'urgent';
  reason: string;
  masterId: string;
  masterName: string;
  status: 'pending' | 'fulfilled' | 'rejected';
  createdAt: string;
  fulfilledAt?: string;
  fulfilledByName?: string;
  procurementId?: string;
}

