
import { Account, Contact, Ticket, Channel, TicketStatus, Notification } from './types';

export const INITIAL_ACCOUNTS: Account[] = [
  {
    id: 'acc1',
    name: 'Tet',
    website: 'tet.com',
    email: 'contact@tet.com',
    phone: '+1 123 456 7890',
    address: '123 Innovation Drive, Techville, USA',
    crNumber: 'CR-12345',
    assignedTo: 'Elon Musk',
    createdAt: new Date('2025-10-14T18:34:00Z').toISOString(),
    updatedAt: new Date('2025-10-14T18:34:00Z').toISOString(),
    country: 'USA',
    city: 'Techville',
    pincode: '94016',
  },
  {
    id: 'acc2',
    name: 'Test',
    website: 'test.com',
    email: 'info@test.com',
    phone: '+1 987 654 3210',
    address: '456 Test Avenue, Sampleton, Canada',
    crNumber: 'CR-67890',
    assignedTo: 'Elon Musk',
    createdAt: new Date('2025-10-13T14:40:00Z').toISOString(),
    updatedAt: new Date('2025-10-13T14:40:00Z').toISOString(),
    country: 'Canada',
    city: 'Sampleton',
    pincode: 'M5V 2T6',
  },
  { id: 'acc3', name: 'Innovate Corp', website: 'innovate.com', email: "contact@innovate.com", phone: "+1 234 567 8901", address: "789 Future St, Vision City, USA", crNumber: "CR-11223", assignedTo: "Jeff Bezos", createdAt: new Date('2025-10-12T10:00:00Z').toISOString(), updatedAt: new Date('2025-10-12T11:00:00Z').toISOString(), country: "USA", city: 'Vision City', pincode: '94025'},
  { id: 'acc4', name: 'HealthWell Inc.', website: 'healthwell.com', email: "support@healthwell.com", phone: "+44 20 7946 0958", address: "10 Health Rd, London, UK", crNumber: "CR-44556", assignedTo: "Susan Wojcicki", createdAt: new Date('2025-10-11T09:20:00Z').toISOString(), updatedAt: new Date('2025-10-11T15:30:00Z').toISOString(), country: "UK", city: 'London', pincode: 'SW1A 0AA'},
];

export const INITIAL_CONTACTS: Contact[] = [
  { id: 'con1', name: 'Alice Johnson', email: 'alice@innovate.com', phone: '123-456-7890', channel: Channel.LiveChat },
  { id: 'con2', name: 'Bob Williams', email: 'bob@healthwell.com', phone: '234-567-8901', channel: Channel.WhatsApp },
  { id: 'con3', name: 'Charlie Brown', email: 'charlie@retailking.com', phone: '345-678-9012', channel: Channel.Google },
];

export const INITIAL_TICKETS: Ticket[] = [
  {
    id: 'tkt1',
    subject: 'Login Issue',
    description: 'User is unable to log in to their account. They have tried resetting their password but did not receive the reset email. This has been an issue for the past hour. They are on a Chrome browser on Windows 11.',
    contactId: 'con1',
    accountId: 'acc1',
    status: TicketStatus.Open,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  },
  {
    id: 'tkt2',
    subject: 'Billing Question',
    description: 'Customer has a question about their recent invoice. They believe they were overcharged for a service they did not use. The invoice number is INV-12345.',
    contactId: 'con2',
    accountId: 'acc2',
    status: TicketStatus.InProgress,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
  },
  {
    id: 'tkt3',
    subject: 'Feature Request: Dark Mode',
    description: 'A loyal customer is requesting a dark mode option for the application dashboard. They find the current light theme to be too bright during night-time use and believe a dark mode would significantly improve user experience.',
    contactId: 'con3',
    accountId: 'acc3',
    status: TicketStatus.Closed,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
  },
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
    { id: 'notif1', userName: 'Amin Abdallah', userInitial: 'A', avatarColor: 'bg-green-500', action: 'A new conversation has been assigned to You.', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), read: false },
    { id: 'notif2', userName: 'Yug Shah', userInitial: 'Y', avatarColor: 'bg-red-500', action: 'A new conversation has been assigned to You.', timestamp: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(), read: false },
    { id: 'notif3', userName: 'Yug Shah', userInitial: 'Y', avatarColor: 'bg-red-500', action: 'A new conversation has been assigned to You.', timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), read: true },
    { id: 'notif4', userName: 'Yug Shah', userInitial: 'Y', avatarColor: 'bg-red-500', action: 'A new conversation has been assigned to You.', timestamp: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString(), read: true },
    { id: 'notif5', userName: 'Applitools', userInitial: 'A', avatarColor: 'bg-green-500', action: 'A new conversation has been assigned to You.', timestamp: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(), read: true },
];