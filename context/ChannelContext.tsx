import React, { createContext, useContext, ReactNode, useCallback, useEffect, useRef } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

function normalizePhone(num: string | undefined): string {
  if (!num) return '';
  let clean = num.split('@')[0];
  return clean.replace(/\D/g, '');
}

export type ChannelName = 
  | 'WhatsApp' 
  | 'Instagram' 
  | 'Google' 
  | 'Live Chat' 
  | 'Email' 
  | 'Voice Call' 
  | 'Messenger' 
  | 'SMS' 
  | 'Line' 
  | 'WeChat' 
  | 'Telegram' 
  | 'Teams';

export interface ConnectedChannel {
  id: ChannelName;
  connectedAt: string;
}

export interface Message {
  id: string;
  text: string;
  sender: 'me' | 'them';
  timestamp: string;
  read: boolean;
}

export interface ChatConversation {
  id: string;
  contactId: string;
  contactName: string;
  contactNumber?: string;
  channel: ChannelName;
  status: 'Open' | 'Closed' | 'Pending';
  lastMessage: string;
  timeLabel: string;
  unreadCount: number;
  messages: Message[];
}

interface ChannelContextType {
  connectedChannels: ConnectedChannel[];
  isChannelConnected: (ch: ChannelName) => boolean;
  setChannelConnected: (ch: ChannelName, connected: boolean) => void;
  conversations: ChatConversation[];
  setConversations: React.Dispatch<React.SetStateAction<ChatConversation[]>>;
  addOrUpdateConversationFromIncoming: (
    from: string,
    fromName: string,
    body: string,
    timestamp: number
  ) => void;
}

const ChannelContext = createContext<ChannelContextType | undefined>(undefined);

export const ChannelProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [connectedChannels, setConnectedChannels] = useLocalStorage<ConnectedChannel[]>(
    'connectedChannels',
    []
  );
  const [conversations, setConversations] = useLocalStorage<ChatConversation[]>(
    'inboxConversations',
    []
  );

  const isChannelConnected = useCallback(
    (ch: ChannelName) => connectedChannels.some((c) => c.id === ch),
    [connectedChannels]
  );

  const setChannelConnected = useCallback(
    (ch: ChannelName, connected: boolean) => {
      if (connected) {
        setConnectedChannels((prev) => {
          if (prev.some((c) => c.id === ch)) return prev;
          return [...prev, { id: ch, connectedAt: new Date().toISOString() }];
        });
      } else {
        setConnectedChannels((prev) => prev.filter((c) => c.id !== ch));
      }
    },
    [setConnectedChannels]
  );

  const addOrUpdateConversationFromIncoming = useCallback(
    (from: string, fromName: string, body: string, timestamp: number) => {
      const timeString = new Date(timestamp * 1000).toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
      });

      setConversations((prev) => {
        const existing = prev.find(
          (c) => c.channel === 'WhatsApp' && normalizePhone(c.contactNumber) === normalizePhone(from)
        );

        if (existing) {
          return prev.map((c) => {
            if (c.id !== existing.id) return c;
            const newMsg: Message = {
              id: `${c.id}-${Date.now()}`,
              text: body,
              sender: 'them',
              timestamp: timeString,
              read: false,
            };
            return {
              ...c,
              lastMessage: body,
              timeLabel: 'Just now',
              unreadCount: c.unreadCount + 1,
              messages: [...c.messages, newMsg],
            };
          });
        } else {
          const newConv: ChatConversation = {
            id: `wa-${Date.now()}`,
            contactId: from,
            contactName: fromName,
            contactNumber: from,
            channel: 'WhatsApp',
            status: 'Open',
            lastMessage: body,
            timeLabel: 'Just now',
            unreadCount: 1,
            messages: [
              {
                id: `wa-${Date.now()}-1`,
                text: body,
                sender: 'them',
                timestamp: timeString,
                read: false,
              },
            ],
          };
          return [newConv, ...prev];
        }
      });
    },
    [setConversations]
  );

  // WhatsApp message polling (replaces SSE - works on Vercel serverless)
  const incomingHandlerRef = useRef(addOrUpdateConversationFromIncoming);
  useEffect(() => {
    incomingHandlerRef.current = addOrUpdateConversationFromIncoming;
  }, [addOrUpdateConversationFromIncoming]);

  const isWhatsAppConnected = isChannelConnected('WhatsApp');
  const lastTimestampRef = useRef<number>(Math.floor(Date.now() / 1000) - 60); // start from 60s ago

  useEffect(() => {
    if (!isWhatsAppConnected) return;

    let active = true;

    const poll = async () => {
      if (!active) return;
      try {
        const res = await fetch(`/api/whatsapp/messages/poll?since=${lastTimestampRef.current}`);
        if (res.ok) {
          const data = await res.json();
          if (data.messages && data.messages.length > 0) {
            for (const msg of data.messages) {
              incomingHandlerRef.current(msg.from, msg.fromName, msg.body, msg.timestamp);
              if (msg.timestamp > lastTimestampRef.current) {
                lastTimestampRef.current = msg.timestamp;
              }
            }
          }
        }
      } catch (err) {
        // Server not reachable - silently skip
      }
    };

    // Poll immediately, then every 3 seconds
    poll();
    const interval = setInterval(poll, 3000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [isWhatsAppConnected]);

  const value: ChannelContextType = {
    connectedChannels,
    isChannelConnected,
    setChannelConnected,
    conversations,
    setConversations,
    addOrUpdateConversationFromIncoming,
  };

  return <ChannelContext.Provider value={value}>{children}</ChannelContext.Provider>;
};

export const useChannel = () => {
  const ctx = useContext(ChannelContext);
  if (!ctx) throw new Error('useChannel must be used within a ChannelProvider');
  return ctx;
};
