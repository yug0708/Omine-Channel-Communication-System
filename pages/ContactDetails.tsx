import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../hooks/useData';
import { TicketStatus, TicketPriority } from '../types';

import {
  EditIcon,
  SearchIcon,
  MoreVertIcon,
  FilterFunnelIcon,
  UserIcon,
  PhoneIcon,
  EmailIcon
} from '../components/icons/Icons';

const getInitials = (firstName: string, lastName: string) => {
  return (
    `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase() ||
    '?'
  );
};

const colors = [
  'bg-teal-500',
  'bg-green-500',
  'bg-emerald-500',
  'bg-red-500',
  'bg-yellow-500',
  'bg-sky-500',
  'bg-pink-500'
];

const getAvatarColor = (name: string) => {
  if (!name) return 'bg-slate-300 dark:bg-slate-500';

  let hash = 0;

  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
};

const ContactDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const navigate = useNavigate();

  const { contacts, tickets } = useData();

  const contact = contacts.find((c) => c.id === id);

  const contactTickets = tickets.filter((t) => t.contactId === id);

  const [activeTab, setActiveTab] = useState<'tickets' | 'conversation'>(
    'tickets'
  );

  if (!contact) {
    return (
      <div className="p-8 text-center text-slate-500">
        Contact not found
      </div>
    );
  }

  const isNameBlank =
    !contact.firstName?.trim() && !contact.lastName?.trim();

  const fullName = isNameBlank
    ? 'Unknown Contact'
    : `${contact.firstName} ${contact.lastName}`;

  const avatarColor = getAvatarColor(
    contact.firstName || contact.lastName || ''
  );

  const getPriorityColor = (priority?: TicketPriority) => {
    switch (priority) {
      case TicketPriority.High:
      case TicketPriority.Urgent:
        return 'text-red-400 border-red-400 bg-red-400/10';

      case TicketPriority.Low:
        return 'text-teal-400 border-teal-400 bg-teal-400/10';

      default:
        return 'text-green-400 border-green-400 bg-green-400/10';
    }
  };

  const getStatusColor = (status: TicketStatus) => {
    switch (status) {
      case TicketStatus.Open:
        return 'text-red-400 border-red-400 bg-red-400/10';

      case TicketStatus.InProgress:
        return 'text-yellow-400 border-yellow-400 bg-yellow-400/10';

      case TicketStatus.Closed:
        return 'text-green-400 border-green-400 bg-green-400/10';

      default:
        return 'text-slate-400 border-slate-400 bg-slate-400/10';
    }
  };

  return (
    <div className="flex flex-col h-full gap-4 w-full">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm font-semibold text-slate-500 dark:text-slate-400 ml-1">
        <span
          className="hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
          onClick={() => navigate('/contacts')}
        >
          Contacts
        </span>

        <span className="mx-2">·</span>

        <span className="text-slate-900 dark:text-slate-300">
          {fullName}
        </span>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start h-full">
        {/* LEFT */}
        <div className="w-full lg:w-[380px]">
          <div className="bg-white dark:bg-[#1C232E] rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800/80">
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                <div
                  className={`h-[84px] w-[84px] rounded-full flex items-center justify-center text-2xl font-bold ${
                    isNameBlank
                      ? 'bg-slate-300 dark:bg-slate-500 text-slate-900'
                      : `text-white ${avatarColor}`
                  }`}
                >
                  {isNameBlank ? (
                    <UserIcon className="h-12 w-12" />
                  ) : contact.avatarUrl ? (
                    <img
                      src={contact.avatarUrl}
                      alt="Contact"
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    getInitials(contact.firstName, contact.lastName)
                  )}
                </div>

                <button className="absolute bottom-0 -right-1 h-6 w-6 bg-emerald-500 rounded-full flex items-center justify-center text-white hover:bg-emerald-600 transition-colors border-2 border-[#1C232E]">
                  <EditIcon className="h-3 w-3" />
                </button>
              </div>

              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                {fullName}
              </h2>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white">
                  Contact
                </span>

                <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                  Created 2/24/2026
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex-1 bg-white dark:bg-[#151B25] rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800/80 flex flex-col overflow-hidden">
          {/* Tabs */}
          <div className="flex items-center px-4 pt-2 border-b border-slate-200 dark:border-slate-800/80">
            <button
              className={`px-6 py-3 text-sm font-semibold border-b-2 ${
                activeTab === 'tickets'
                  ? 'border-[#0056D2] text-[#0056D2]'
                  : 'border-transparent text-slate-500'
              }`}
              onClick={() => setActiveTab('tickets')}
            >
              Tickets
            </button>

            <button
              className={`px-6 py-3 text-sm font-semibold border-b-2 ${
                activeTab === 'conversation'
                  ? 'border-[#0056D2] text-[#0056D2]'
                  : 'border-transparent text-slate-500'
              }`}
              onClick={() => setActiveTab('conversation')}
            >
              Conversation
            </button>
          </div>

          {/* TICKETS */}
          {activeTab === 'tickets' && (
            <div className="flex-1 overflow-x-auto p-4">
              <table className="w-full text-left text-xs bg-[#1C232E] rounded-lg overflow-hidden border border-slate-800/80">
                <thead className="bg-[#242C38] text-slate-400 font-semibold border-b border-slate-700">
                  <tr>
                    <th className="px-4 py-3">Ticket No</th>
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Priority</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800/80 text-white font-medium">
                  {contactTickets.map((ticket) => (
                    <tr
                      key={ticket.id}
                      className="hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        {ticket.ticketNo || '-'}
                      </td>

                      <td className="px-4 py-3">
                        {ticket.subject}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`px-3 py-1 rounded-full text-[11px] font-bold border ${getStatusColor(
                            ticket.status
                          )}`}
                        >
                          {ticket.status}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`px-3 py-1 rounded-full text-[11px] font-bold border ${getPriorityColor(
                            ticket.priority
                          )}`}
                        >
                          {ticket.priority || 'Normal'}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <button
                            className="text-slate-400 hover:text-emerald-500 transition-colors"
                            title="Edit"
                          >
                            <EditIcon className="h-3.5 w-3.5" />
                          </button>

                          <button
                            className="text-red-500 hover:text-red-400 transition-colors"
                            title="Delete"
                          >
                            ✕
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* CONVERSATION */}
          {activeTab === 'conversation' && (
            <div className="flex-1 flex items-center justify-center text-slate-500">
              Conversation history would appear here...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactDetails;
