import React, { useState, useRef, useEffect } from 'react';
import { useData } from '../hooks/useData';
import { Contact, Channel } from '../types';
import Button from '../components/ui/Button';

interface Message {
  id: string;
  text: string;
  sender: 'me' | 'them';
  timestamp: string; // e.g. "10:12 AM"
  read: boolean;
}

interface ChatConversation {
  id: string;
  contactId: string;
  contactName: string;
  channel: 'WhatsApp' | 'Instagram' | 'Google' | 'Live Chat';
  status: 'Open' | 'Closed' | 'Pending';
  lastMessage: string;
  timeLabel: string;
  unreadCount: number;
  messages: Message[];
}

const INITIAL_CONVERSATIONS: ChatConversation[] = [
  {
    id: '1',
    contactId: 'c1',
    contactName: 'Dixit Panchal',
    channel: 'WhatsApp',
    status: 'Open',
    lastMessage: 'You: Thank you for using Wow...',
    timeLabel: '6 minutes',
    unreadCount: 0,
    messages: [
      { id: '1-1', text: 'Hello, is anyone available?', sender: 'them', timestamp: '10:05 AM', read: true },
      { id: '1-2', text: 'Yes, Dixit! How can we assist you today?', sender: 'me', timestamp: '10:06 AM', read: true },
      { id: '1-3', text: 'I wanted to check the status of my order.', sender: 'them', timestamp: '10:07 AM', read: true },
      { id: '1-4', text: 'Thank you for using Wow. Let me check that for you right now.', sender: 'me', timestamp: '10:08 AM', read: true }
    ]
  },
  {
    id: '2',
    contactId: 'c2',
    contactName: 'Pooja',
    channel: 'WhatsApp',
    status: 'Open',
    lastMessage: 'You: Customer Support',
    timeLabel: 'an hour',
    unreadCount: 0,
    messages: [
      { id: '2-1', text: 'Hi! Need help with installation.', sender: 'them', timestamp: '9:12 AM', read: true },
      { id: '2-2', text: 'Sure! I will connect you with our Customer Support agent.', sender: 'me', timestamp: '9:15 AM', read: true }
    ]
  },
  {
    id: '3',
    contactId: 'c3',
    contactName: 'NABEL Nathan',
    channel: 'WhatsApp',
    status: 'Open',
    lastMessage: 'Thank you for customer suppo...',
    timeLabel: '2 hours',
    unreadCount: 2,
    messages: [
      { id: '3-1', text: 'Hi, I received my package. Thank you for customer support!', sender: 'them', timestamp: '8:45 AM', read: false }
    ]
  },
  {
    id: '4',
    contactId: 'c4',
    contactName: 'Yug Shah',
    channel: 'Instagram',
    status: 'Open',
    lastMessage: 'You: Sent a Media',
    timeLabel: '2 hours',
    unreadCount: 0,
    messages: [
      { id: '4-1', text: 'Check this new catalog.', sender: 'them', timestamp: '8:10 AM', read: true },
      { id: '4-2', text: 'Sent a Media', sender: 'me', timestamp: '8:12 AM', read: true }
    ]
  },
  {
    id: '5',
    contactId: 'c5',
    contactName: 'React Developer',
    channel: 'WhatsApp',
    status: 'Open',
    lastMessage: 'Test new',
    timeLabel: '21 hours',
    unreadCount: 0,
    messages: [
      { id: '5-1', text: 'Test new message flow for beta testing.', sender: 'them', timestamp: 'Yesterday', read: true }
    ]
  },
  {
    id: '6',
    contactId: 'c6',
    contactName: 'Harsh',
    channel: 'WhatsApp',
    status: 'Open',
    lastMessage: '...',
    timeLabel: '21 hours',
    unreadCount: 0,
    messages: [
      { id: '6-1', text: 'Waiting for update...', sender: 'them', timestamp: 'Yesterday', read: true }
    ]
  }
];

const Inbox: React.FC = () => {
  const { contacts } = useData();
  const [conversations, setConversations] = useState<ChatConversation[]>(INITIAL_CONVERSATIONS);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'read'>('all');
  const [newMessageText, setNewMessageText] = useState('');
  const [toContactId, setToContactId] = useState('');

  const chatEndRef = useRef<HTMLDivElement>(null);

  const selectedChat = conversations.find(c => c.id === selectedChatId);

  // Auto scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedChat?.messages]);

  // Handle sending a message
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newMessageText.trim() || !selectedChatId) return;

    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setConversations(prev =>
      prev.map(chat => {
        if (chat.id === selectedChatId) {
          const newMsg: Message = {
            id: `${chat.id}-${chat.messages.length + 1}`,
            text: newMessageText,
            sender: 'me',
            timestamp: timeString,
            read: true
          };
          return {
            ...chat,
            lastMessage: `You: ${newMessageText}`,
            timeLabel: 'Just now',
            messages: [...chat.messages, newMsg]
          };
        }
        return chat;
      })
    );
    setNewMessageText('');
  };

  // Filter conversations
  const filteredConversations = conversations.filter(chat => {
    // Search query
    const matchesSearch = chat.contactName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    // Filter tab
    if (activeTab === 'unread') return chat.unreadCount > 0;
    if (activeTab === 'read') return chat.unreadCount === 0;
    return true;
  });

  const allCount = conversations.length;
  const unreadCount = conversations.filter(c => c.unreadCount > 0).length;
  const readCount = conversations.filter(c => c.unreadCount === 0).length;

  const handleSelectContactForNewChat = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const contactId = e.target.value;
    setToContactId(contactId);
    if (!contactId) return;

    const matchedContact = contacts.find(c => c.id === contactId);
    if (!matchedContact) return;

    // Check if conversation already exists
    const existing = conversations.find(c => c.contactId === contactId);
    if (existing) {
      setSelectedChatId(existing.id);
    } else {
      // Create new mock conversation
      const newChat: ChatConversation = {
        id: `custom-${Date.now()}`,
        contactId: matchedContact.id,
        contactName: `${matchedContact.firstName} ${matchedContact.lastName}`,
        channel: 'WhatsApp',
        status: 'Open',
        lastMessage: 'Start a new conversation',
        timeLabel: 'Just now',
        unreadCount: 0,
        messages: []
      };
      setConversations(prev => [newChat, ...prev]);
      setSelectedChatId(newChat.id);
    }
  };

  return (
    <div className="flex h-[calc(100vh-80px)] -m-6 bg-slate-50 dark:bg-slate-900 overflow-hidden font-sans">
      
      {/* ── LEFT SIDEBAR: Chats list ────────────────────────────────────────── */}
      <div className="w-[360px] flex-shrink-0 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col">
        
        {/* Header section */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-50 text-[#10B981] dark:bg-emerald-500/10">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white">Inbox</h1>
          </div>
          
          <div className="flex items-center gap-1.5">
            <button title="Users Group" className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <button title="Filter Channel" className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </button>
            <button title="New Chat" className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Dropdown for All Channel Types */}
        <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700/50">
          <div className="relative">
            <select className="w-full pl-3 pr-8 py-1.5 text-sm bg-slate-50 hover:bg-slate-100 dark:bg-slate-700 dark:hover:bg-slate-600 border-none rounded-lg text-slate-600 dark:text-slate-300 font-medium focus:ring-1 focus:ring-emerald-500 cursor-pointer appearance-none">
              <option>All Channels</option>
              <option>WhatsApp</option>
              <option>Instagram</option>
              <option>Google</option>
              <option>Live Chat</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 pb-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search Contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#10B981] dark:text-white"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Status Pills */}
        <div className="px-4 py-2 flex items-center justify-between gap-1.5 border-b border-slate-100 dark:border-slate-700/50">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'all'
                ? 'bg-emerald-50 text-[#10B981] dark:bg-emerald-500/10'
                : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700'
            }`}
          >
            <span>All</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
              activeTab === 'all' ? 'bg-[#10B981] text-white' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
            }`}>
              {allCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('unread')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'unread'
                ? 'bg-emerald-50 text-[#10B981] dark:bg-emerald-500/10'
                : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700'
            }`}
          >
            <span>Unread</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
              activeTab === 'unread' && unreadCount > 0 ? 'bg-[#10B981] text-white' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
            }`}>
              {unreadCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('read')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'read'
                ? 'bg-emerald-50 text-[#10B981] dark:bg-emerald-500/10'
                : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700'
            }`}
          >
            <span>Read</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
              activeTab === 'read' ? 'bg-[#10B981] text-white' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
            }`}>
              {readCount}
            </span>
          </button>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/50">
          {filteredConversations.length > 0 ? (
            filteredConversations.map((chat) => {
              const isSelected = chat.id === selectedChatId;
              const initials = chat.contactName
                .split(' ')
                .map(n => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase();

              // Different colors for avatar circles
              const avatarColors = [
                'bg-blue-500 text-white',
                'bg-emerald-500 text-white',
                'bg-indigo-500 text-white',
                'bg-purple-500 text-white',
                'bg-orange-500 text-white',
                'bg-pink-500 text-white'
              ];
              const colorHash = chat.contactName.charCodeAt(0) % avatarColors.length;
              const avatarColorClass = avatarColors[colorHash];

              return (
                <div
                  key={chat.id}
                  onClick={() => setSelectedChatId(chat.id)}
                  className={`p-4 flex items-start gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-750 transition ${
                    isSelected ? 'bg-slate-50 dark:bg-slate-750 border-l-4 border-[#10B981]' : ''
                  }`}
                >
                  {/* Avatar wrapper */}
                  <div className="relative flex-shrink-0">
                    <div className={`h-11 w-11 rounded-full flex items-center justify-center font-bold text-sm shadow-sm ${avatarColorClass}`}>
                      {initials}
                    </div>
                    {/* Small Channel logo badge */}
                    <div className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-800 p-0.5 rounded-full shadow-sm border border-slate-100 dark:border-slate-700">
                      {chat.channel === 'WhatsApp' ? (
                        <div className="h-4 w-4 bg-[#10B981] text-white rounded-full flex items-center justify-center text-[8px] font-bold">W</div>
                      ) : chat.channel === 'Instagram' ? (
                        <div className="h-4 w-4 bg-gradient-to-tr from-yellow-500 to-purple-600 text-white rounded-full flex items-center justify-center text-[8px] font-bold">I</div>
                      ) : (
                        <div className="h-4 w-4 bg-slate-500 text-white rounded-full flex items-center justify-center text-[8px] font-bold">C</div>
                      )}
                    </div>
                  </div>

                  {/* Message Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">
                          @{chat.channel}
                        </span>
                        <h2 className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                          {chat.contactName}
                        </h2>
                      </div>
                      <span className="text-xs text-slate-400 flex-shrink-0">
                        {chat.timeLabel}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-1.5">
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate flex-1">
                        {chat.lastMessage}
                      </p>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {chat.status === 'Open' && (
                          <span className="px-1.5 py-0.5 text-[10px] font-bold bg-emerald-50 text-[#10B981] dark:bg-emerald-500/10 rounded">
                            Open
                          </span>
                        )}
                        {chat.unreadCount > 0 && (
                          <span className="h-4 min-w-[16px] px-1 bg-[#10B981] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                            {chat.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-slate-400">
              No conversations found.
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT PANEL: Conversation Details ──────────────────────────────── */}
      <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-900">
        
        {/* Top Destination Selector / Header */}
        <div className="px-6 py-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3 w-1/2">
            <span className="text-sm font-bold text-slate-500 dark:text-slate-400 flex-shrink-0">To:</span>
            <div className="relative w-full">
              <select
                value={toContactId}
                onChange={handleSelectContactForNewChat}
                className="w-full max-w-sm pl-3 pr-8 py-1.5 text-sm bg-slate-50 hover:bg-slate-100 dark:bg-slate-700 dark:hover:bg-slate-600 border-none rounded-lg text-slate-600 dark:text-slate-300 font-medium focus:ring-1 focus:ring-[#10B981] cursor-pointer appearance-none"
              >
                <option value="">Search contacts</option>
                {contacts.map(c => (
                  <option key={c.id} value={c.id}>
                    {`${c.firstName} ${c.lastName}`} ({c.contactNumber})
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {selectedChat ? (
          /* ACTIVE CONVERSATION */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Active chat header */}
            <div className="px-6 py-3 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold text-xs">
                  {selectedChat.contactName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                    {selectedChat.contactName}
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Online • {selectedChat.channel}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </button>
                <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Message Feed */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {selectedChat.messages.length > 0 ? (
                selectedChat.messages.map((msg) => {
                  const isMe = msg.sender === 'me';
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 shadow-sm ${
                        isMe 
                          ? 'bg-[#10B981] text-white rounded-tr-none' 
                          : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-100 dark:border-slate-700'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                        <div className={`flex items-center justify-end gap-1 mt-1 text-[9px] ${
                          isMe ? 'text-emerald-100' : 'text-slate-400 dark:text-slate-500'
                        }`}>
                          <span>{msg.timestamp}</span>
                          {isMe && (
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                  Start messaging by typing below...
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input Bar */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center gap-3">
              <button type="button" className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </button>
              
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
                className="flex-1 px-4 py-2 text-sm bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#10B981] dark:text-white"
              />

              <button
                type="submit"
                disabled={!newMessageText.trim()}
                className={`p-2.5 rounded-xl transition ${
                  newMessageText.trim()
                    ? 'bg-[#10B981] text-white shadow-md hover:bg-emerald-600'
                    : 'bg-slate-100 text-slate-300 dark:bg-slate-700 dark:text-slate-650 cursor-not-allowed'
                }`}
              >
                <svg className="h-5 w-5 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
          </div>
        ) : (
          /* EMPTY STATE */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-2xl mx-auto">
            {/* Beautiful dynamic chat icon illustration */}
            <div className="relative mb-6 flex items-center justify-center">
              <div className="absolute h-28 w-28 bg-emerald-50 dark:bg-emerald-500/10 rounded-full animate-ping scale-75 opacity-20"></div>
              <div className="relative h-20 w-20 bg-emerald-50 dark:bg-emerald-500/10 text-[#10B981] rounded-2xl flex items-center justify-center shadow-sm">
                <svg className="h-10 w-10 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
            </div>

            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
              No conversation selected
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 max-w-sm">
              Please select a conversation to start messaging
            </p>

            {/* Info callout block */}
            <div className="w-full max-w-md p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-500/5 border border-emerald-100/50 dark:border-emerald-500/10 flex items-start gap-3 text-left">
              <div className="p-1 rounded bg-[#10B981] text-white mt-0.5">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed font-medium">
                Looking for a specific contact or message? Use the search field in the sidebar to filter instantly.
              </p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default Inbox;
