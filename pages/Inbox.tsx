import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../hooks/useData';
import { useAuth } from '../hooks/useAuth';
import { useChannel, ChannelName, ChatConversation, Message } from '../context/ChannelContext';
import { useToast } from '../context/ToastContext';

const DEMO_CONVERSATIONS: Partial<Record<ChannelName, ChatConversation[]>> = {
  WhatsApp: [
    {
      id: 'wa-demo-1',
      contactId: 'c1',
      contactName: 'Dixit Panchal',
      contactNumber: '919876540001',
      channel: 'WhatsApp',
      status: 'Open',
      lastMessage: 'Thank you for using Wow...',
      timeLabel: '6 min ago',
      unreadCount: 0,
      messages: [
        { id: 'wa-d1-1', text: 'Hello, is anyone available?', sender: 'them', timestamp: '10:05 AM', read: true },
        { id: 'wa-d1-2', text: 'Yes, Dixit! How can we assist you today?', sender: 'me', timestamp: '10:06 AM', read: true },
        { id: 'wa-d1-3', text: 'I wanted to check the status of my order.', sender: 'them', timestamp: '10:07 AM', read: true },
        { id: 'wa-d1-4', text: 'Thank you for using Wow. Let me check that for you right now.', sender: 'me', timestamp: '10:08 AM', read: true },
      ],
    },
    {
      id: 'wa-demo-2',
      contactId: 'c2',
      contactName: 'Pooja Sharma',
      contactNumber: '919876540002',
      channel: 'WhatsApp',
      status: 'Open',
      lastMessage: 'You: Customer Support',
      timeLabel: '1 hr ago',
      unreadCount: 0,
      messages: [
        { id: 'wa-d2-1', text: 'Hi! Need help with installation.', sender: 'them', timestamp: '9:12 AM', read: true },
        { id: 'wa-d2-2', text: 'Sure! I will connect you with our Customer Support agent.', sender: 'me', timestamp: '9:15 AM', read: true },
      ],
    },
  ],
  Instagram: [
    {
      id: 'ig-demo-1',
      contactId: 'ig-c1',
      contactName: 'Yug Shah',
      channel: 'Instagram',
      status: 'Open',
      lastMessage: 'You: Sent a Media',
      timeLabel: '2 hrs ago',
      unreadCount: 0,
      messages: [
        { id: 'ig-d1-1', text: 'Check this new catalog 🔥', sender: 'them', timestamp: '8:10 AM', read: true },
        { id: 'ig-d1-2', text: 'Sent a Media', sender: 'me', timestamp: '8:12 AM', read: true },
      ],
    },
  ],
  Google: [
    {
      id: 'g-demo-1',
      contactId: 'g-c1',
      contactName: 'Alex Thompson',
      channel: 'Google',
      status: 'Open',
      lastMessage: 'Your review response',
      timeLabel: '1 day ago',
      unreadCount: 0,
      messages: [
        { id: 'g-d1-1', text: 'Great service! Very satisfied with my experience.', sender: 'them', timestamp: 'Yesterday', read: true },
        { id: 'g-d1-2', text: 'Thank you, Alex! We really appreciate your kind words.', sender: 'me', timestamp: 'Yesterday', read: true },
      ],
    },
  ],
  'Live Chat': [
    {
      id: 'lc-demo-1',
      contactId: 'lc-c1',
      contactName: 'Website Visitor',
      channel: 'Live Chat',
      status: 'Open',
      lastMessage: 'How do I reset my password?',
      timeLabel: '5 min ago',
      unreadCount: 1,
      messages: [
        { id: 'lc-d1-1', text: 'Hi there! How do I reset my password?', sender: 'them', timestamp: '3:10 PM', read: false },
      ],
    },
  ],
};

const CHANNEL_META: Partial<Record<ChannelName, { label: string; color: string; bg: string; badge: React.ReactNode }>> = {
  WhatsApp: {
    label: 'WhatsApp',
    color: 'text-green-500',
    bg: 'bg-green-500',
    badge: <div className="h-4 w-4 bg-[#25D366] text-white rounded-full flex items-center justify-center text-[8px] font-bold">W</div>,
  },
  Instagram: {
    label: 'Instagram',
    color: 'text-pink-500',
    bg: 'bg-gradient-to-tr from-yellow-400 to-purple-600',
    badge: <div className="h-4 w-4 rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600 text-white flex items-center justify-center text-[8px] font-bold">I</div>,
  },
  Google: {
    label: 'Google',
    color: 'text-blue-500',
    bg: 'bg-blue-500',
    badge: <div className="h-4 w-4 bg-blue-500 text-white rounded-full flex items-center justify-center text-[8px] font-bold">G</div>,
  },
  'Live Chat': {
    label: 'Live Chat',
    color: 'text-indigo-500',
    bg: 'bg-indigo-500',
    badge: <div className="h-4 w-4 bg-indigo-500 text-white rounded-full flex items-center justify-center text-[8px] font-bold">L</div>,
  },
};

const AVATAR_COLORS = [
  'bg-blue-500',
  'bg-emerald-500',
  'bg-indigo-500',
  'bg-purple-500',
  'bg-orange-500',
  'bg-pink-500',
];

function avatarColor(name: string) {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

const Inbox: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const { contacts } = useData();
  const {
    connectedChannels,
    isChannelConnected,
    conversations,
    setConversations,
    addOrUpdateConversationFromIncoming,
  } = useChannel();

  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'mine' | 'unassigned'>('all');
  const [channelFilter, setChannelFilter] = useState<ChannelName | 'All'>('All');
  const [newMessageText, setNewMessageText] = useState('');
  const [toContactId, setToContactId] = useState('');
  const [newChatChannel, setNewChatChannel] = useState<ChannelName | ''>('');
  const [isSending, setIsSending] = useState(false);
  const [showNewChatRow, setShowNewChatRow] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Seed demo conversations when a channel first connects
  useEffect(() => {
    connectedChannels.forEach(({ id: ch }) => {
      const demos = DEMO_CONVERSATIONS[ch];
      if (!demos) return;
      setConversations((prev) => {
        const toAdd = demos.filter((demo) => !prev.some((p) => p.id === demo.id));
        if (toAdd.length === 0) return prev;
        return [...toAdd, ...prev];
      });
    });
  }, [connectedChannels, setConversations]);



  // Auto-scroll
  const selectedChat = conversations.find((c) => c.id === selectedChatId);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedChat?.messages.length]);

  // Mark as read on open
  useEffect(() => {
    if (!selectedChatId) return;
    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedChatId
          ? { ...c, unreadCount: 0, messages: c.messages.map((m) => ({ ...m, read: true })) }
          : c
      )
    );
  }, [selectedChatId, setConversations]);

  // Close open chat or new chat row on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedChatId) {
          setSelectedChatId(null);
          setNewMessageText('');
        }
        if (showNewChatRow) {
          setShowNewChatRow(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedChatId, showNewChatRow]);

  // Send message via Meta Cloud API
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newMessageText.trim() || !selectedChatId) return;

    const timeString = new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    const msgText = newMessageText;
    setNewMessageText('');

    // Optimistic UI update
    setConversations((prev) =>
      prev.map((chat) => {
        if (chat.id !== selectedChatId) return chat;
        const newMsg: Message = {
          id: `${chat.id}-${Date.now()}`,
          text: msgText,
          sender: 'me',
          timestamp: timeString,
          read: true,
        };
        return {
          ...chat,
          lastMessage: `You: ${msgText}`,
          timeLabel: 'Just now',
          messages: [...chat.messages, newMsg],
        };
      })
    );

    // If WhatsApp conversation — send via real Meta Cloud API
    if (selectedChat?.channel === 'WhatsApp' && selectedChat.contactNumber) {
      try {
        setIsSending(true);
        const res = await fetch('/api/whatsapp/messages/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ to: selectedChat.contactNumber, message: msgText }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to send message over WhatsApp');
        }
      } catch (err: any) {
        console.error('Error sending WhatsApp message:', err);
        showToast(err.message || 'Failed to send message over WhatsApp', 'error');
      } finally {
        setIsSending(false);
      }
    }
  };

  // Create new conversation
  const handleCreateNewChat = useCallback(() => {
    if (!toContactId || !newChatChannel) return;
    const contact = contacts.find((c) => c.id === toContactId);
    if (!contact) return;

    const existing = conversations.find(
      (c) => c.contactId === toContactId && c.channel === newChatChannel
    );
    if (existing) {
      setSelectedChatId(existing.id);
      setShowNewChatRow(false);
      return;
    }

    const newConv: ChatConversation = {
      id: `custom-${Date.now()}`,
      contactId: contact.id,
      contactName: `${contact.firstName} ${contact.lastName}`,
      contactNumber: contact.contactNumber
        ? contact.contactNumber.replace(/\D/g, '')
        : undefined,
      channel: newChatChannel as ChannelName,
      status: 'Open',
      lastMessage: 'New conversation',
      timeLabel: 'Just now',
      unreadCount: 0,
      messages: [],
    };
    setConversations((prev) => [newConv, ...prev]);
    setSelectedChatId(newConv.id);
    setShowNewChatRow(false);
    setToContactId('');
    setNewChatChannel('');
  }, [toContactId, newChatChannel, contacts, conversations, setConversations]);

  // Filtering conversations
  const visibleConversations = conversations.filter((chat) => {
    if (!isChannelConnected(chat.channel)) return false;
    if (channelFilter !== 'All' && chat.channel !== channelFilter) return false;
    
    const q = searchQuery.toLowerCase();
    if (q && !chat.contactName.toLowerCase().includes(q) && !chat.lastMessage.toLowerCase().includes(q)) return false;
    
    if (activeTab === 'mine') return chat.assignedTo === currentUser?.email;
    if (activeTab === 'unassigned') return !chat.assignedTo;
    return true;
  });

  const connected = conversations.filter((c) => isChannelConnected(c.channel));
  const allCount = connected.length;
  const mineCount = connected.filter((c) => c.assignedTo === currentUser?.email).length;
  const unassignedCount = connected.filter((c) => !c.assignedTo).length;
  const unreadCount = connected.filter((c) => c.unreadCount > 0).length;

  const noChannelsConnected = connectedChannels.length === 0;

  return (
    <div className="flex h-[calc(100vh-80px)] -m-6 bg-slate-50 dark:bg-slate-900 overflow-hidden font-sans">

      {/* ── LEFT SIDEBAR ──────────────────────────────────────────────────── */}
      <div className="w-[360px] flex-shrink-0 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col">

        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-50 text-[#10B981] dark:bg-emerald-500/10">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white">Inbox</h1>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-[#10B981] text-white font-bold">
                {unreadCount}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              title="New Conversation"
              onClick={() => setShowNewChatRow((v) => !v)}
              className={`p-2 rounded-lg transition ${showNewChatRow ? 'bg-emerald-50 text-[#10B981]' : 'text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700'}`}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </button>
          </div>
        </div>

        {/* New Chat row */}
        {showNewChatRow && !noChannelsConnected && (
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 bg-emerald-50/40 dark:bg-emerald-500/5 space-y-2">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">New conversation</p>
            <select
              value={toContactId}
              onChange={(e) => setToContactId(e.target.value)}
              className="w-full px-3 py-1.5 text-sm bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-200 focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">Select contact...</option>
              {contacts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.firstName} {c.lastName} ({c.contactNumber})
                </option>
              ))}
            </select>
            <select
              value={newChatChannel}
              onChange={(e) => setNewChatChannel(e.target.value as ChannelName)}
              className="w-full px-3 py-1.5 text-sm bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-200 focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">Select channel...</option>
              {connectedChannels.map((ch) => (
                <option key={ch.id} value={ch.id}>{ch.id}</option>
              ))}
            </select>
            <button
              onClick={handleCreateNewChat}
              disabled={!toContactId || !newChatChannel}
              className="w-full py-1.5 rounded-lg text-sm font-semibold bg-[#10B981] text-white disabled:opacity-40 hover:bg-emerald-600 transition"
            >
              Start Conversation
            </button>
          </div>
        )}

        {/* Channel filter dropdown */}
        <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700/50">
          <div className="relative">
            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value as ChannelName | 'All')}
              className="w-full pl-3 pr-8 py-1.5 text-sm bg-slate-50 hover:bg-slate-100 dark:bg-slate-700 dark:hover:bg-slate-600 border-none rounded-lg text-slate-600 dark:text-slate-300 font-medium focus:ring-1 focus:ring-emerald-500 cursor-pointer appearance-none"
            >
              <option value="All">All Channels</option>
              {connectedChannels.map((ch) => (
                <option key={ch.id} value={ch.id}>{ch.id}</option>
              ))}
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
              placeholder="Search conversations..."
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

        {/* Tab Pills */}
        <div className="px-4 py-2 flex items-center justify-between gap-1.5 border-b border-slate-100 dark:border-slate-700/50">
          {(['all', 'mine', 'unassigned'] as const).map((tab) => {
            const count = tab === 'all' ? allCount : tab === 'mine' ? mineCount : unassignedCount;
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all capitalize ${
                  isActive
                    ? 'bg-emerald-50 text-[#10B981] dark:bg-emerald-500/10'
                    : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700'
                }`}
              >
                <span>{tab}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  isActive && count > 0 ? 'bg-[#10B981] text-white' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Connected channel pills */}
        {connectedChannels.length > 0 && (
          <div className="px-4 pt-2 pb-1 flex flex-wrap gap-1">
            {connectedChannels.map((ch) => (
              <span
                key={ch.id}
                className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20"
              >
                ✓ {ch.id}
              </span>
            ))}
          </div>
        )}

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/50 hide-scrollbar">
          {noChannelsConnected ? (
            <div className="p-8 text-center flex flex-col items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                <svg className="h-7 w-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">No channels connected</p>
                <p className="text-xs text-slate-400 mt-1">Connect a channel to see conversations here.</p>
              </div>
              <button
                onClick={() => navigate('/channels')}
                className="px-4 py-2 text-xs font-bold bg-[#10B981] text-white rounded-lg hover:bg-emerald-600 transition"
              >
                → Go to Channels
              </button>
            </div>
          ) : visibleConversations.length > 0 ? (
            visibleConversations.map((chat) => {
              const isSelected = chat.id === selectedChatId;
              const meta = CHANNEL_META[chat.channel];
              const color = avatarColor(chat.contactName);

              return (
                <div
                  key={chat.id}
                  onClick={() => setSelectedChatId(chat.id)}
                  className={`p-4 flex items-start gap-3 cursor-pointer border-l-4 transition-all duration-150 ${
                    isSelected
                      ? 'bg-emerald-50/70 dark:bg-emerald-500/10 hover:bg-emerald-50 dark:hover:bg-emerald-500/15 border-[#10B981]'
                      : 'border-transparent hover:bg-slate-100/80 dark:hover:bg-slate-700/60'
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <div className={`h-11 w-11 rounded-full flex items-center justify-center font-bold text-sm shadow-sm text-white ${color}`}>
                      {initials(chat.contactName)}
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-800 p-0.5 rounded-full shadow-sm border border-slate-100 dark:border-slate-700">
                      {meta.badge}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0">@{chat.channel}</span>
                        <h2 className="text-sm font-semibold text-slate-800 dark:text-white truncate">{chat.contactName}</h2>
                      </div>
                      <span className="text-xs text-slate-400 flex-shrink-0 ml-1">{chat.timeLabel}</span>
                    </div>

                    <div className="flex items-center justify-between gap-1.5">
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate flex-1">{chat.lastMessage}</p>
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
            <div className="p-8 text-center text-slate-400 text-sm">
              No conversations found.
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT PANEL ───────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-900">

        {selectedChat ? (
          <div className="flex-1 flex flex-col overflow-hidden">

            {/* Chat header */}
            <div className="px-6 py-3 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`h-9 w-9 text-white rounded-full flex items-center justify-center font-bold text-xs ${avatarColor(selectedChat.contactName)}`}>
                  {initials(selectedChat.contactName)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white">{selectedChat.contactName}</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                      {selectedChat.assignedTo ? `Assigned · ${selectedChat.assignedTo}` : 'Unassigned'} • {selectedChat.channel}
                    </span>
                    {selectedChat.contactNumber && (
                      <span className="text-[10px] text-slate-400 dark:text-slate-400 font-semibold">
                        • {selectedChat.contactNumber}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  const email = currentUser?.email;
                  if (!email || !selectedChat) return;
                  setConversations((prev) =>
                    prev.map((c) =>
                      c.id === selectedChat.id
                        ? { ...c, assignedTo: c.assignedTo === email ? undefined : email }
                        : c
                    )
                  );
                }}
                className="px-3 py-1.5 text-xs font-semibold rounded-md bg-[#00A76F] text-white hover:bg-[#007867] transition"
              >
                {selectedChat.assignedTo === currentUser?.email ? 'Unassign' : 'Assign to me'}
              </button>
            </div>

            {/* Message feed */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 hide-scrollbar">
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

            {/* Input bar */}
            <form
              onSubmit={handleSendMessage}
              className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center gap-3"
            >
              <input
                type="text"
                placeholder={`Type a message via ${selectedChat.channel}...`}
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
                className="flex-1 px-4 py-2 text-sm bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#10B981] dark:text-white"
              />

              <button
                type="submit"
                disabled={!newMessageText.trim() || isSending}
                className={`p-2.5 rounded-xl transition ${
                  newMessageText.trim() && !isSending
                    ? 'bg-[#10B981] text-white shadow-md hover:bg-emerald-600'
                    : 'bg-slate-100 text-slate-300 dark:bg-slate-700 dark:text-slate-500 cursor-not-allowed'
                }`}
              >
                {isSending ? (
                  <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                ) : (
                  <svg className="h-5 w-5 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </form>
          </div>

        ) : (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-2xl mx-auto">
            <div className="relative mb-6 flex items-center justify-center">
              <div className="absolute h-28 w-28 bg-emerald-50 dark:bg-emerald-500/10 rounded-full animate-ping scale-75 opacity-20"></div>
              <div className="relative h-20 w-20 bg-emerald-50 dark:bg-emerald-500/10 text-[#10B981] rounded-2xl flex items-center justify-center shadow-sm">
                <svg className="h-10 w-10 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
            </div>

            {noChannelsConnected ? (
              <>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">No channels connected</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-sm">
                  Connect at least one channel to start receiving and sending messages in your Inbox.
                </p>
                <button
                  onClick={() => navigate('/channels')}
                  className="px-6 py-2.5 rounded-xl font-bold text-sm bg-[#10B981] text-white hover:bg-emerald-600 transition shadow-md hover:shadow-lg"
                >
                  Connect a Channel →
                </button>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">No conversation selected</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 max-w-sm">
                  Select a conversation from the sidebar, or start a new one using the <strong>+</strong> button.
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Inbox;
