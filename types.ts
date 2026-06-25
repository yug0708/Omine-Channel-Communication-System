
export enum Channel {
  WhatsApp = 'WhatsApp',
  LiveChat = 'Live Chat',
  Google = 'Google',
}

export enum TicketStatus {
  Open = 'Open',
  InProgress = 'In Progress',
  Closed = 'Closed',
}

export enum TicketPriority {
  Low = 'Low',
  Normal = 'Normal',
  High = 'High',
  Urgent = 'Urgent',
}

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  contactNumber: string;
  address?: string;
  city?: string;
  nationalId?: string;
  country?: string;
  accountName: string;
  assignedTo: string;
  lifecycle: string;
  labels: string;
  createdAt: string;
  updatedAt: string;
  avatarUrl?: string;
}

export interface Account {
  id: string;
  name: string;
  website: string;
  email: string;
  phone: string;
  address: string;
  crNumber: string;
  assignedTo: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  country: string;
  city: string;
  pincode: string;
}

export interface Ticket {
  id: string;
  ticketNo?: string;
  subject: string;
  description: string;
  contactId: string;
  contactName?: string;
  accountId: string;
  accountName?: string;
  status: TicketStatus;
  priority?: TicketPriority;
  assignedTo?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Notification {
  id: string;
  userName: string;
  userInitial: string;
  avatarColor: string;
  action: string;
  timestamp: string; // ISO string
  read: boolean;
}