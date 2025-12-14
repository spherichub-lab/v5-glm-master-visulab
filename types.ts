export interface User {
  id: string;
  name: string;
  email: string;
  company: string; // Added field
  role: 'Administrador' | 'Usuário';
  status: 'Active' | 'Offline' | 'Pending' | 'Inactive';
  lastActive: string;
  avatarUrl?: string;
  initials?: string;
}

export interface Company {
  id: string;
  name: string;
  displayId: string;
  type: 'Matriz' | 'Filial' | 'Fornecedor'; // Updated types
  contactName: string;
  contactEmail: string;
  status: 'Active' | 'Inactive' | 'Pending';
  initials: string;
  colorClass: string;
}

export interface Purchase {
  id: string;
  displayId: string;
  supplier: string;
  supplierInitials: string;
  supplierColorClass: string;
  date: string;
  itemsDescription: string;
  amount: number;
  status: 'Received' | 'Pending' | 'Cancelled';
}

export interface ShortageFormData {
  material: string; // Refractive Index
  lensType: string; // Type
  coating: string; // Treatment
  sphere: string;
  cylinder: string;
  quantity: number;
}