import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../hooks/useData';
import { Channel, TicketStatus, TicketPriority } from '../types';
import { EditIcon, SearchIcon, MoreVertIcon, FilterFunnelIcon, UserIcon, PhoneIcon, EmailIcon } from '../components/icons/Icons';

// Helper to generate initials
const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase() || '?';
};

// Helper for random background colors for avatars
<<<<<<< HEAD
const colors = ['bg-purple-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500', 'bg-yellow-500', 'bg-indigo-500', 'bg-pink-500'];
=======
const colors = ['bg-teal-500', 'bg-green-500', 'bg-emerald-500', 'bg-red-500', 'bg-yellow-500', 'bg-sky-500', 'bg-pink-500'];
>>>>>>> d25effb6cab6af83effe1b26eefb8f8659faa69a
const getAvatarColor = (name: string) => {
    if (!name) return 'bg-slate-300 dark:bg-slate-500';
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
};

const ContactDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { contacts, tickets } = useData();

    const contact = contacts.find(c => c.id === id);
    const contactTickets = tickets.filter(t => t.contactId === id);

    const [activeTab, setActiveTab] = useState<'tickets' | 'conversation'>('tickets');
    const [openAccordion, setOpenAccordion] = useState<string | null>('contact-info');

    if (!contact) {
        return <div className="p-8 text-center text-slate-500">Contact not found</div>;
    }

    const isNameBlank = !contact.firstName?.trim() && !contact.lastName?.trim();
    const fullName = isNameBlank ? 'Unknown Contact' : `${contact.firstName} ${contact.lastName}`;
    const avatarColor = getAvatarColor(contact.firstName || contact.lastName);

    const toggleAccordion = (name: string) => {
        setOpenAccordion(openAccordion === name ? null : name);
    };

    const getPriorityColor = (priority?: TicketPriority) => {
        switch (priority) {
            case TicketPriority.High:
            case TicketPriority.Urgent:
                return 'text-red-400 border-red-400 bg-red-400/10';
            case TicketPriority.Low:
<<<<<<< HEAD
                return 'text-purple-400 border-purple-400 bg-purple-400/10';
=======
                return 'text-teal-400 border-teal-400 bg-teal-400/10';
>>>>>>> d25effb6cab6af83effe1b26eefb8f8659faa69a
            case TicketPriority.Normal:
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
                <span className="hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer" onClick={() => navigate('/contacts')}>Contacts</span>
                <span className="mx-2">·</span>
                <span className="text-slate-900 dark:text-slate-300">{fullName}</span>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 items-start h-full">

                {/* Left Sidebar */}
                <div className="w-full lg:w-[380px] flex flex-col gap-3">
                    {/* Profile Card */}
                    <div className="bg-white dark:bg-[#1C232E] rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800/80">
                        <div className="flex flex-col items-center mb-6">
                            <div className="relative mb-4">
                                <div className={`h-[84px] w-[84px] rounded-full flex items-center justify-center text-2xl font-bold ${isNameBlank ? 'bg-slate-300 dark:bg-slate-500 text-slate-900 pt-2' : `text-white ${avatarColor}`} overflow-hidden border border-slate-700/50`}>
                                    {isNameBlank ? <UserIcon className="h-12 w-12 relative top-1" /> : (contact.avatarUrl ? <img src={contact.avatarUrl} alt="Contact" className="h-full w-full object-cover" /> : getInitials(contact.firstName, contact.lastName))}
                                </div>
<<<<<<< HEAD
                                <button className="absolute bottom-0 -right-1 h-6 w-6 bg-purple-500 rounded-full flex items-center justify-center text-white hover:bg-purple-600 transition-colors border-2 border-[#1C232E]">
=======
                                <button className="absolute bottom-0 -right-1 h-6 w-6 bg-emerald-500 rounded-full flex items-center justify-center text-white hover:bg-emerald-600 transition-colors border-2 border-[#1C232E]">
>>>>>>> d25effb6cab6af83effe1b26eefb8f8659faa69a
                                    <EditIcon className="h-3 w-3" />
                                </button>
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2 text-center">{fullName}</h2>
                            <div className="flex items-center gap-2">
<<<<<<< HEAD
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500 text-white">Contact</span>
=======
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white">Contact</span>
>>>>>>> d25effb6cab6af83effe1b26eefb8f8659faa69a
                                <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Created 2/24/2026</span>
                            </div>
                        </div>

                        {/* Action Icons */}
                        <div className="pt-5 border-t border-slate-200 dark:border-slate-700/50 flex items-center justify-center gap-4 w-full">
                            <button className="h-9 w-9 rounded-full bg-slate-100 dark:bg-[#242C38] flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-[#2A3441] transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
                            </button>
                            <button className="h-9 w-9 rounded-full bg-slate-100 dark:bg-[#242C38] flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-[#2A3441] transition-colors">
                                <EmailIcon className="h-4 w-4" />
                            </button>
                            <button className="h-9 w-9 rounded-full bg-slate-100 dark:bg-[#242C38] flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-[#2A3441] transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            </button>
                            <button className="h-9 w-9 rounded-full bg-slate-100 dark:bg-[#242C38] flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-[#2A3441] transition-colors">
                                <MoreVertIcon className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* Accordions */}
                    <div className="flex flex-col gap-3">
                        {/* Contact Information */}
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => toggleAccordion('contact-info')}
                                className={`w-full flex items-center justify-between p-4 bg-white dark:bg-[#1C232E] shadow-sm border ${openAccordion === 'contact-info' ? 'border-[#0056D2]' : 'border-slate-200 dark:border-slate-800/80'} rounded-xl transition-colors hover:dark:bg-[#1e2733] outline-none`}
                            >
                                <div className="flex items-center gap-3 font-semibold text-sm text-slate-900 dark:text-slate-200">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" /></svg>
                                    Contact Information
                                </div>
                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-slate-400 transition-transform ${openAccordion === 'contact-info' ? 'rotate-180 text-slate-300' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                            </button>

                            {openAccordion === 'contact-info' && (
                                <>
                                    <div className="flex items-center gap-4 bg-white dark:bg-[#1C232E] px-5 py-4 rounded-xl border border-slate-200 dark:border-slate-800/80 shadow-sm">
                                        <UserIcon className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{contact.firstName || 'empty'}</span>
                                    </div>
                                    <div className="flex items-center gap-4 bg-white dark:bg-[#1C232E] px-5 py-4 rounded-xl border border-slate-200 dark:border-slate-800/80 shadow-sm">
                                        <UserIcon className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{contact.lastName || 'empty'}</span>
                                    </div>
                                    <div className="flex items-center gap-4 bg-white dark:bg-[#1C232E] px-5 py-4 rounded-xl border border-slate-200 dark:border-slate-800/80 shadow-sm">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-400">{contact.accountName || 'Account Name'}</span>
                                    </div>
                                    <div className="flex items-center gap-4 bg-white dark:bg-[#1C232E] px-5 py-4 rounded-xl border border-slate-200 dark:border-slate-800/80 shadow-sm">
                                        <EmailIcon className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-400">{contact.email || 'Email'}</span>
                                    </div>
                                    <div className="flex items-center gap-4 bg-white dark:bg-[#1C232E] px-5 py-4 rounded-xl border border-slate-200 dark:border-slate-800/80 shadow-sm">
                                        <PhoneIcon className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-400">{contact.contactNumber || 'Contact Number'}</span>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Team Assignment */}
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => toggleAccordion('team')}
                                className={`w-full flex items-center justify-between p-4 bg-white dark:bg-[#1C232E] shadow-sm border ${openAccordion === 'team' ? 'border-[#0056D2]' : 'border-slate-200 dark:border-slate-800/80'} rounded-xl transition-colors hover:dark:bg-[#1e2733] outline-none`}
                            >
                                <div className="flex items-center gap-3 font-semibold text-sm text-slate-900 dark:text-slate-200">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                    Team Assignment
                                </div>
                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-slate-400 transition-transform ${openAccordion === 'team' ? 'rotate-180 text-slate-300' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </button>
                        </div>

                        {/* Address Information */}
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => toggleAccordion('address')}
                                className={`w-full flex items-center justify-between p-4 bg-white dark:bg-[#1C232E] shadow-sm border ${openAccordion === 'address' ? 'border-[#0056D2]' : 'border-slate-200 dark:border-slate-800/80'} rounded-xl transition-colors hover:dark:bg-[#1e2733] outline-none`}
                            >
                                <div className="flex items-center gap-3 font-semibold text-sm text-slate-900 dark:text-slate-200">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    Address Information
                                </div>
                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-slate-400 transition-transform ${openAccordion === 'address' ? 'rotate-180 text-slate-300' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Main Area */}
                <div className="flex-1 bg-white dark:bg-[#151B25] rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800/80 flex flex-col overflow-hidden min-h-[600px] xl:h-[calc(100vh-120px)]">

                    {/* Tabs */}
                    <div className="flex items-center px-4 pt-2 border-b border-slate-200 dark:border-slate-800/80">
                        <button
                            className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'tickets' ? 'border-[#0056D2] text-[#0056D2] dark:text-white' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'}`}
                            onClick={() => setActiveTab('tickets')}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 012-2h3a2 2 0 012 2v3a2 2 0 01-2 2H7a2 2 0 01-2-2V5zM5 14a2 2 0 012-2h3a2 2 0 012 2v3a2 2 0 01-2 2H7a2 2 0 01-2-2v-3z" /></svg>
                            Tickets
                        </button>
                        <button
                            className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'conversation' ? 'border-[#0056D2] text-[#0056D2] dark:text-white' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'}`}
                            onClick={() => setActiveTab('conversation')}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                            Conversation
                        </button>
                    </div>

                    {activeTab === 'tickets' && (
                        <div className="flex flex-col flex-1 pb-4">
                            {/* Actions Bar */}
                            <div className="p-4 flex justify-between items-center">
                                <button className="bg-[#0056D2] hover:bg-[#00449E] text-white px-5 py-2 rounded-full text-sm font-bold shadow-sm flex items-center transition-colors">
                                    <span className="text-lg mr-1.5 leading-none relative bottom-[1px]">+</span>
                                    Create Ticket
                                </button>

                                <div className="flex items-center gap-4">
                                    <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" /></svg>
                                    </button>
                                    <div className="relative">
                                        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder="Search..."
                                            className="pl-9 pr-4 py-1.5 bg-transparent border border-slate-300 dark:border-slate-700 rounded-full text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#0056D2] focus:ring-1 focus:ring-[#0056D2] w-64"
                                        />
                                    </div>
                                    <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-md">
                                        <MoreVertIcon className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Ticket Table */}
                            <div className="flex-1 overflow-x-auto px-4">
                                <table className="w-full whitespace-nowrap text-left text-xs bg-[#1C232E] rounded-lg overflow-hidden border border-slate-800/80">
                                    <thead className="bg-[#242C38] text-slate-400 font-semibold border-b border-slate-700">
                                        <tr>
                                            <th scope="col" className="px-4 py-3 w-10 text-center"><input type="checkbox" className="rounded border-slate-600 bg-transparent" /></th>
                                            <th scope="col" className="px-4 py-3"><div className="flex items-center gap-1">Ticket <br /> No <FilterFunnelIcon className="h-3.5 w-3.5 ml-1 inline text-slate-500" /></div></th>
                                            <th scope="col" className="px-4 py-3"><div className="flex items-center gap-1">Title <FilterFunnelIcon className="h-3.5 w-3.5 ml-1 inline text-slate-500" /></div></th>
                                            <th scope="col" className="px-4 py-3"><div className="flex items-center gap-1">Status <FilterFunnelIcon className="h-3.5 w-3.5 ml-1 inline text-slate-500" /></div></th>
                                            <th scope="col" className="px-4 py-3"><div className="flex items-center gap-1">Priority <FilterFunnelIcon className="h-3.5 w-3.5 ml-1 inline text-slate-500" /></div></th>
                                            <th scope="col" className="px-4 py-3"><div className="flex items-center gap-1">Contact <br /> Name <FilterFunnelIcon className="h-3.5 w-3.5 ml-1 inline text-slate-500" /></div></th>
                                            <th scope="col" className="px-4 py-3"><div className="flex items-center gap-1">Account <br /> Name <FilterFunnelIcon className="h-3.5 w-3.5 ml-1 inline text-slate-500" /></div></th>
                                            <th scope="col" className="px-4 py-3">Assigned to</th>
                                            <th scope="col" className="px-4 py-3"><div className="flex items-center gap-1">Created <br /> Date <FilterFunnelIcon className="h-3.5 w-3.5 ml-1 inline text-slate-500" /></div></th>
                                            <th scope="col" className="px-4 py-3"><div className="flex items-center gap-1">Updated <br /> Date <FilterFunnelIcon className="h-3.5 w-3.5 ml-1 inline text-slate-500" /></div></th>
                                            <th scope="col" className="px-4 py-3 text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/80 text-white font-medium">
                                        {contactTickets.map(ticket => {
                                            const cDate = new Date(ticket.createdAt);
                                            const uDate = ticket.updatedAt ? new Date(ticket.updatedAt) : cDate;

                                            const formattedCDate = cDate.toLocaleDateString('en-GB');
                                            const formattedCTime = cDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

                                            const formattedUDate = uDate.toLocaleDateString('en-GB');
                                            const formattedUTime = uDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

                                            return (
                                                <tr key={ticket.id} className="hover:bg-slate-800/30 transition-colors">
                                                    <td className="px-4 py-3 text-center"><input type="checkbox" className="rounded border-slate-600 bg-transparent" /></td>
                                                    <td className="px-4 py-3 font-bold">{ticket.ticketNo || '-'}</td>
                                                    <td className="px-4 py-3 font-bold">{ticket.subject}</td>
                                                    <td className="px-4 py-3">
                                                        <span className={`px-3 py-1 rounded-full text-[11px] font-bold border ${getStatusColor(ticket.status)}`}>
                                                            {ticket.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`px-3 py-1 rounded-full text-[11px] font-bold border ${getPriorityColor(ticket.priority)}`}>
                                                            {ticket.priority || 'Normal'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-300">{ticket.contactName || contact.firstName + ' ' + contact.lastName}</td>
                                                    <td className="px-4 py-3 text-slate-300">{ticket.accountName || '-'}</td>
                                                    <td className="px-4 py-3 text-center">
                                                        <div className="h-6 w-6 rounded-full bg-white text-[#1C232E] flex items-center justify-center font-bold text-[10px] mx-auto">
                                                            {ticket.assignedTo || 'Y'}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-[10px] leading-tight font-medium">
                                                        <div>{formattedCDate}</div>
                                                        <div className="text-slate-400">{formattedCTime}</div>
                                                    </td>
                                                    <td className="px-4 py-3 text-[10px] leading-tight font-medium">
                                                        <div>{formattedUDate}</div>
                                                        <div className="text-slate-400">{formattedUTime}</div>
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <div className="flex items-center justify-center gap-3">
<<<<<<< HEAD
                                                            <button className="text-slate-400 hover:text-purple-500 transition-colors" title="Edit">
=======
                                                            <button className="text-slate-400 hover:text-emerald-500 transition-colors" title="Edit">
>>>>>>> d25effb6cab6af83effe1b26eefb8f8659faa69a
                                                                <EditIcon className="h-3.5 w-3.5" />
                                                            </button>
                                                            <button className="text-red-900 hover:text-red-500 transition-colors" title="Delete">
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="mt-4 px-4 flex items-center justify-end text-xs font-semibold text-slate-100 gap-6">
                                <div className="flex items-center gap-2">
                                    Row Per page
                                    <select className="bg-transparent focus:outline-none cursor-pointer font-bold border-b border-transparent hover:border-slate-500">
                                        <option>10</option>
                                        <option>20</option>
                                        <option>50</option>
                                    </select>
                                </div>
                                <div>1-{contactTickets.length} of {contactTickets.length}</div>
                                <div className="flex items-center gap-2 cursor-pointer font-bold">
                                    <button className="p-1 text-slate-400 hover:text-white transition-colors">&lt;</button>
                                    <button className="p-1 text-slate-400 hover:text-white transition-colors">&gt;</button>
                                </div>
                            </div>
                        </div>
                    )}

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
