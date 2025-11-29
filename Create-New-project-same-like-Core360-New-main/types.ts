
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

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  channel: Channel;
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
  subject: string;
  description: string;
  contactId: string;
  accountId: string;
  status: TicketStatus;
  createdAt: string;
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