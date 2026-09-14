import React, { createContext, useContext, ReactNode, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
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
    timestamp: number,
    messageId?: string
  ) => void;
}

const ChannelContext = createContext<ChannelContextType | undefined>(undefined);

export const ChannelProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const tenantId = currentUser?.id || currentUser?.email || 'guest';
  const tenantKey = `tenant_${tenantId.toLowerCase().replace(/[^a-z0-9_-]/g, '_')}`;

  const [connectedChannels, setConnectedChannels] = useLocalStorage<ConnectedChannel[]>(
    `${tenantKey}_connectedChannels`,
    []
  );
  const [conversations, setConversations] = useLocalStorage<ChatConversation[]>(
    `${tenantKey}_inboxConversations`,
    []
  );

  // One-time cleanup for any previously duplicated conversations or messages in localStorage
  useEffect(() => {
    setConversations((prev) => {
      if (!prev || prev.length === 0) return prev;
      let modified = false;
      const seenConv = new Set<string>();
      const cleanConvs: ChatConversation[] = [];

      for (const conv of prev) {
        const convKey = conv.id.startsWith('wa-demo') || conv.id.startsWith('ig-demo') || conv.id.startsWith('g-demo') || conv.id.startsWith('lc-demo')
          ? conv.id
          : `${conv.channel}_${normalizePhone(conv.contactNumber) || conv.contactId}`;

        if (seenConv.has(convKey)) {
          modified = true;
          continue;
        }
        seenConv.add(convKey);

        const seenMsg = new Set<string>();
        const cleanMsgs: Message[] = [];
        for (const msg of conv.messages) {
          const msgKey = `${msg.text}_${msg.timestamp}_${msg.sender}`;
          if (seenMsg.has(msgKey)) {
            modified = true;
            continue;
          }
          seenMsg.add(msgKey);
          cleanMsgs.push(msg);
        }

        if (cleanMsgs.length !== conv.messages.length) {
          modified = true;
          cleanConvs.push({ ...conv, messages: cleanMsgs });
        } else {
          cleanConvs.push(conv);
        }
      }

      return modified ? cleanConvs : prev;
    });
  }, [setConversations]);

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
    (from: string, fromName: string, body: string, timestamp: number, messageId?: string) => {
      const timeString = new Date(timestamp * 1000).toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
      });
      const msgId = messageId || `wa-msg-${timestamp}-${normalizePhone(from)}`;

      setConversations((prev) => {
        const existing = prev.find(
          (c) => c.channel === 'WhatsApp' && normalizePhone(c.contactNumber) === normalizePhone(from)
        );

        if (existing) {
          // Prevent duplicates: check if this message is already present in this conversation
          const alreadyExists = existing.messages.some(
            (m) => m.id === msgId || (m.text === body && m.timestamp === timeString && m.sender === 'them')
          );
          if (alreadyExists) {
            return prev;
          }

          return prev.map((c) => {
            if (c.id !== existing.id) return c;
            const newMsg: Message = {
              id: msgId,
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
            id: `wa-${normalizePhone(from)}`,
            contactId: from,
            contactName: fromName || from,
            contactNumber: from,
            channel: 'WhatsApp',
            status: 'Open',
            lastMessage: body,
            timeLabel: 'Just now',
            unreadCount: 1,
            messages: [
              {
                id: msgId,
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
  const lastTimestampRef = useRef<number>(Math.floor(Date.now() / 1000) - 86400); // lookback 24h

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
              incomingHandlerRef.current(msg.from, msg.fromName, msg.body, msg.timestamp, msg.id);
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
