import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { WhatsAppIcon, GoogleIcon } from '../components/icons/Icons';
import { useChannel, ChannelName, ConnectedChannel } from '../context/ChannelContext';
import { useToast } from '../context/ToastContext';

interface ChannelProviderItem {
  name: string;
  category: 'Messaging' | 'Voice' | 'Team' | 'Email';
  description: string;
}

const PROVIDERS: ChannelProviderItem[] = [
  { name: 'WhatsApp Business', category: 'Messaging', description: 'Connect with customers through WhatsApp Business API for secure and reliable messaging.' },
  { name: 'Email', category: 'Email', description: 'Send and receive emails with professional templates and tracking.' },
  { name: 'Live Chat', category: 'Messaging', description: 'Provide real-time customer support through your website or app.' },
  { name: 'Voice Call', category: 'Voice', description: 'Make and receive voice calls with advanced call routing and management.' },
  { name: 'Messenger', category: 'Messaging', description: 'Connect Facebook Messenger to engage with customers on this platform.' },
  { name: 'Instagram', category: 'Messaging', description: 'Manage Instagram Direct Messages and engage with your audience.' },
  { name: 'SMS', category: 'Messaging', description: 'Send text messages globally with high deliverability rates.' },
  { name: 'Line', category: 'Messaging', description: 'Connect Line official account to reach customers in Asian markets.' },
  { name: 'WeChat', category: 'Messaging', description: 'Connect with customers through WeChat Official Account for secure and reliable messaging.' },
  { name: 'Telegram', category: 'Messaging', description: 'Connect Telegram to engage with customers on this platform.' },
  { name: 'Teams', category: 'Team', description: 'Create teams to organize users and manage permissions effectively.' },
];

const PROVIDER_ICONS: Record<string, React.ReactNode> = {
  'WhatsApp': (
    <svg className="h-8 w-8 text-emerald-500" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.703 1.458h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  ),
  'Email': (
    <svg className="h-8 w-8 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  'Live Chat': (
    <svg className="h-8 w-8 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  ),
  'Voice Call': (
    <svg className="h-8 w-8 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  ),
  'Messenger': (
    <svg className="h-8 w-8 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.14 2 11.25c0 2.91 1.45 5.51 3.73 7.15.19.14.31.36.31.6l-.03 1.83c-.02.77.78 1.3 1.48.97l2.06-.97c.18-.08.38-.1.58-.05 1.22.35 2.52.54 3.87.54 5.52 0 10-4.14 10-9.25C22 6.14 17.52 2 12 2zm1.18 11.58l-2.42-2.58-4.73 2.58 5.2-5.53 2.47 2.58 4.68-2.58-5.2 5.53z" />
    </svg>
  ),
  'Instagram': (
    <svg className="h-8 w-8 text-pink-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zM17.5 6.5h.01" />
    </svg>
  ),
  'SMS': (
    <svg className="h-8 w-8 text-yellow-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
    </svg>
  ),
  'Line': (
    <svg className="h-8 w-8 text-green-600" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 10.3c0-5.7-5.4-10.3-12-10.3s-12 4.6-12 10.3c0 5.1 4.3 9.4 10.1 10.2.4.1.9.3 1 .7.1.3.1.8 0 1.1-.1.4-.4 1.7-.5 2.2-.1.5-.5 2.1.2 1.4.7-.7 3.8-5.6 5.1-7.4 3.7-1.1 6.1-4.7 6.1-8.2zM8.3 12.8H6.5v-5c0-.3-.2-.5-.5-.5s-.5.2-.5.5v5.5c0 .3.2.5.5.5h2.3c.3 0 .5-.2.5-.5s-.2-.5-.5-.5zm3.9-5c0-.3-.2-.5-.5-.5s-.5.2-.5.5v5.5c0 .3.2.5.5.5s.5-.2.5-.5v-5.5zm3.8 0h-2.3c-.3 0-.5.2-.5.5v5.5c0 .3.2.5.5.5h2.3c.3 0 .5-.2.5-.5s-.2-.5-.5-.5h-1.8v-1.7h1.8c.3 0 .5-.2.5-.5s-.2-.5-.5-.5h-1.8V8.3h1.8c.3 0 .5-.2.5-.5s-.2-.5-.5-.5zm5.5 0h-2.3c-.3 0-.5.2-.5.5v5.5c0 .3.2.5.5.5h2.3c.3 0 .5-.2.5-.5s-.2-.5-.5-.5h-1.8v-1.7h1.8c.3 0 .5-.2.5-.5s-.2-.5-.5-.5h-1.8V8.3h1.8c.3 0 .5-.2.5-.5s-.2-.5-.5-.5z" />
    </svg>
  ),
  'WeChat': (
    <svg className="h-8 w-8 text-emerald-600" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8.7 1.5C3.9 1.5 0 4.6 0 8.4c0 2.2 1.3 4.1 3.4 5.3l-.9 2.7 3.1-1.6c1 .3 2.1.4 3.1.4 4.8 0 8.7-3.1 8.7-6.9 0-3.8-3.9-6.8-8.7-6.8zm11 7.2c-.3 0-.6.1-.9.1 2.8 1.8 4.7 4.5 4.7 7.5 0 1.6-.5 3.1-1.5 4.3l.8 2.4-2.5-1.3c-.8.2-1.7.3-2.6.3-4 0-7.3-2.6-7.9-6 1.4.3 2.8.5 4.3.5 5.5 0 10-3.5 10-7.8 0-.1 0-.1-.1-.1z" />
    </svg>
  ),
  'Telegram': (
    <svg className="h-8 w-8 text-sky-500" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.28-.02-.12.02-1.99 1.26-5.63 3.72-.53.37-1.01.55-1.44.54-.48-.01-1.4-.27-2.08-.5-.83-.27-1.5-.42-1.44-.89.03-.24.37-.49 1.03-.74 4.05-1.76 6.75-2.92 8.1-3.48 3.85-1.6 4.65-1.88 5.17-1.89.11 0 .37.03.54.17.14.12.18.28.2.45-.02.07-.02.13-.03.17z" />
    </svg>
  ),
  'Teams': (
    <svg className="h-8 w-8 text-violet-600" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2c5.52 0 10 4.48 10 10s-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2zm-3.5 7c.83 0 1.5-.67 1.5-1.5S9.33 6 8.5 6 7 6.67 7 7.5 7.67 9 8.5 9zm7 0c.83 0 1.5-.67 1.5-1.5S16.33 6 15.5 6 14 6.67 14 7.5c0 .83.67 1.5 1.5 1.5zm-7 5c-1.66 0-3 1.34-3 3v1h6v-1c0-1.66-1.34-3-3-3zm7 0c-1.66 0-3 1.34-3 3v1h6v-1c0-1.66-1.34-3-3-3z" />
    </svg>
  ),
  'WhatsApp Business': (
    <svg className="h-8 w-8 text-emerald-500" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.703 1.458h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  ),
  'Google': (
    <svg className="h-8 w-8" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
    </svg>
  )
};

const Channels: React.FC = () => {
  const { isChannelConnected, setChannelConnected, connectedChannels } = useChannel();
  const { showToast } = useToast();

  // App-wide state configurations
  const [isCreating, setIsCreating] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  // Onboarding wizard choices
  const [selectedProvider, setSelectedProvider] = useState<ChannelName | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'All' | 'Messaging' | 'Voice' | 'Team' | 'Email'>('All');
  
  // Onboarding configurations
  const [channelNameInput, setChannelNameInput] = useState('');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [assignedAgent, setAssignedAgent] = useState('John Doe');

  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [whatsappStatus, setWhatsappStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'qr_ready'>('disconnected');
  const [whatsappQr, setWhatsappQr] = useState<string>('');

  // Fetch initial WhatsApp status
  useEffect(() => {
    fetch('/api/whatsapp/status')
      .then((res) => res.json())
      .then((data) => {
        setWhatsappStatus(data.status);
        setWhatsappQr(data.qr);
        if (data.status === 'connected') {
          setChannelConnected('WhatsApp', true);
        }
      })
      .catch((err) => console.error('Error fetching WhatsApp status:', err));
  }, []);

  // Listen to SSE status updates when modal is open
  useEffect(() => {
    if (!isQrModalOpen) return;

    fetch('/api/whatsapp/connect', { method: 'POST' }).catch((err) =>
      console.error('Error triggering WhatsApp connect:', err)
    );

    const eventSource = new EventSource('/api/whatsapp/sse');

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setWhatsappStatus(data.status);
        setWhatsappQr(data.qr);
        if (data.status === 'connected') {
          setChannelConnected('WhatsApp', true);
          showToast('WhatsApp connected successfully!', 'success');
        }
      } catch (err) {
        console.error('Error parsing SSE data:', err);
      }
    };

    eventSource.onerror = (err) => {
      console.error('SSE Error:', err);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [isQrModalOpen]);

  const handleMetaConnect = () => {
    const appId = '1501306521375669';
    const configId = '2369838823546957';
    // Dynamically build redirect URI from current deployment origin (works on Vercel & local dev)
    const callbackBase = window.location.origin;
    const redirectUri = encodeURIComponent(`${callbackBase}/api/whatsapp/callback`);
    const extras = encodeURIComponent(JSON.stringify({
      setup: {},
      featureType: 'whatsapp_business_app_onboarding',
      sessionInfoVersion: '3'
    }));
    const oauthUrl = `https://www.facebook.com/v20.0/dialog/oauth?client_id=${appId}&config_id=${configId}&display=popup&response_type=code&redirect_uri=${redirectUri}&extras=${extras}`;
    
    window.open(oauthUrl, 'MetaSignup', 'width=600,height=700,status=no,resizable=yes,scrollbars=yes');
  };

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.data && event.data.type === 'META_ONBOARDING_SUCCESS') {
        try {
          const redirectUri = event.data.redirectUri || `${window.location.origin}/api/whatsapp/callback`;
          const res = await fetch('/api/whatsapp/exchange-code', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
              code: event.data.code,
              redirectUri
            })
          });
          const data = await res.json();
          if (data.success) {
            setWhatsappStatus('connected');
            setChannelConnected('WhatsApp', true);
            showToast('WhatsApp Business successfully linked!', 'success');
          } else {
            showToast(`Code exchange failed: ${data.error}`, 'error');
          }
        } catch (err) {
          console.error('Error during WhatsApp exchange:', err);
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleDisconnectChannel = async (ch: ChannelName) => {
    if (ch === 'WhatsApp') {
      try {
        await fetch('/api/whatsapp/disconnect', { method: 'POST' });
        setWhatsappStatus('disconnected');
        setWhatsappQr('');
      } catch (err) {
        console.error('Error disconnecting WhatsApp:', err);
      }
    }
    setChannelConnected(ch, false);
    showToast(`${ch} channel disconnected successfully.`, 'success');
  };

  // Stepper navigation handlers
  const handleNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Finish onboarding
      if (selectedProvider) {
        setChannelConnected(selectedProvider, true);
        showToast(`${selectedProvider} channel created successfully!`, 'success');
      }
      resetWizard();
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    } else {
      resetWizard();
    }
  };

  const resetWizard = () => {
    setIsCreating(false);
    setCurrentStep(1);
    setSelectedProvider(null);
    setChannelNameInput('');
    setApiKeyInput('');
    setAssignedAgent('John Doe');
  };

  // Render provider SVG or placeholder
  const getProviderIcon = (name: ChannelName) => {
    return PROVIDER_ICONS[name] || (
      <svg className="h-8 w-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    );
  };

  // Map PROVIDERS names to ChannelName types safely
  const mapProviderNameToType = (name: string): ChannelName => {
    if (name === 'WhatsApp Business') return 'WhatsApp';
    return name as ChannelName;
  };

  // Filtered providers list for Step 1 selection
  const filteredProviders = PROVIDERS.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* ── MAIN CHANNELS TABLE VIEW ───────────────────────── */}
      {!isCreating ? (
        <div className="bg-white dark:bg-dark-card border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm animate-fade-in-up">
          {/* Card Header with Title and Button */}
          <div className="space-y-4 mb-6">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Channel</h2>
            <button
              onClick={() => setIsCreating(true)}
              className="px-4 py-2.5 rounded-lg text-white font-semibold flex items-center justify-center gap-2 transition-all duration-200 w-fit"
              style={{ backgroundColor: '#10B981' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#059669')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#10B981')}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              + New Channel
            </button>
          </div>

          {connectedChannels.length === 0 ? (
            // Empty State view inside card
            <div className="py-12 text-center flex flex-col items-center justify-center min-h-[300px]">
              <div className="relative mb-6">
                <div className="h-24 w-24 bg-slate-50 dark:bg-slate-800/40 rounded-full flex items-center justify-center">
                  <svg className="h-12 w-12 text-slate-350 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
              </div>
              <h2 className="text-lg font-bold text-slate-855 dark:text-white mb-2">No data</h2>
              <p className="text-slate-500 max-w-sm text-xs mb-6 leading-relaxed">
                Connect channels to aggregate all customer tickets, live chats, and support threads under a single communications inbox.
              </p>
            </div>
          ) : (
            // Connected channels table view (clean, integrated wrapper style)
            <div className="overflow-hidden">
              <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/75 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      <th className="py-4 px-6 w-12">
                        <input type="checkbox" className="rounded text-emerald-500 focus:ring-emerald-500 border-slate-300 dark:border-slate-700 h-4 w-4" />
                      </th>
                      <th className="py-4 px-6">Channel Name</th>
                      <th className="py-4 px-6">Channel Configuration</th>
                      <th className="py-4 px-6">Assigned To</th>
                      <th className="py-4 px-6">Created Date</th>
                      <th className="py-4 px-6">Updated Date</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm text-slate-700 dark:text-slate-350">
                    {connectedChannels.map((channel) => {
                      const displayTitle = channel.id === 'WhatsApp' ? 'WhatsApp Business' : channel.id;
                      return (
                        <tr key={channel.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                          <td className="py-4 px-6">
                            <input type="checkbox" className="rounded text-emerald-500 focus:ring-emerald-500 border-slate-300 dark:border-slate-700 h-4 w-4" />
                          </td>
                          <td className="py-4 px-6 font-medium text-slate-900 dark:text-white">
                            <div className="flex items-center gap-3">
                              {getProviderIcon(channel.id)}
                              <span>{displayTitle}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            {channel.id === 'WhatsApp' ? (
                              <div className="text-xs space-y-0.5">
                                <span className="font-semibold text-emerald-600 dark:text-emerald-500">Active</span>
                                <p className="text-slate-400 font-mono">WABA ID: 1615564906818207</p>
                              </div>
                            ) : (
                              <span className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded">Enabled</span>
                            )}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <div className="h-6 w-6 rounded-full bg-emerald-500/10 text-emerald-500 font-bold flex items-center justify-center text-[10px]">
                                JD
                              </div>
                              <span className="text-slate-800 dark:text-slate-200">{assignedAgent}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-slate-400 text-xs">
                            {channel.connectedAt || new Date().toLocaleDateString()}
                          </td>
                          <td className="py-4 px-6 text-slate-400 text-xs">
                            Just now
                          </td>
                          <td className="py-4 px-6 text-right">
                            <button
                              onClick={() => handleDisconnectChannel(channel.id)}
                              className="px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-500/10 rounded-lg transition-colors duration-150"
                            >
                              Disconnect
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-4 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <span>Row Per page</span>
                  <select className="border border-slate-200 dark:border-slate-700 bg-transparent rounded px-1.5 py-1 focus:ring-emerald-500 focus:border-emerald-500">
                    <option>10</option>
                    <option>25</option>
                    <option>50</option>
                  </select>
                  <span>0-0 of 0</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50" disabled>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50" disabled>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        // ── STEPPER ONBOARDING WIZARD VIEW ─────────────────────────
        <div className="flex flex-col lg:flex-row gap-8 bg-white dark:bg-dark-card p-6 sm:p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm animate-fade-in-up">
          {/* Left Stepper Sidebar Panel */}
          <div className="w-full lg:w-72 flex-shrink-0 border-r-0 lg:border-r border-slate-100 dark:border-slate-800 pr-0 lg:pr-8">
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Choose Provider</h2>
              
              {/* Vertical Stepper List */}
              <div className="relative pl-4 border-l border-slate-100 dark:border-slate-800 ml-4 space-y-8">
                {[
                  { step: 1, title: 'Choose Provider', desc: 'Choose the Provider you want to integrate with WowChat' },
                  { step: 2, title: 'Create Channel', desc: 'Authenticate your account and create a channel' },
                  { step: 3, title: 'Add User and Teams', desc: 'Add users to the created inbox' },
                  { step: 4, title: 'Finish', desc: 'You are all set to go!' }
                ].map((s) => {
                  const isActive = currentStep === s.step;
                  const isCompleted = currentStep > s.step;
                  
                  return (
                    <div key={s.step} className="relative flex gap-4">
                      {/* Step Indicator Dot */}
                      <div 
                        className={`absolute -left-[29px] top-0 h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 border-2 ${
                          isActive 
                            ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-500/20' 
                            : isCompleted 
                              ? 'bg-emerald-500 border-emerald-500 text-white' 
                              : 'bg-white border-slate-200 text-slate-400 dark:bg-dark-card dark:border-slate-700'
                        }`}
                      >
                        {isCompleted ? (
                          <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : s.step}
                      </div>

                      <div className="flex flex-col">
                        <span className={`text-sm font-semibold transition-colors duration-200 ${isActive ? 'text-emerald-500' : 'text-slate-800 dark:text-slate-200'}`}>
                          {s.title}
                        </span>
                        <span className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-[220px]">
                          {s.desc}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Stepper Content Panel */}
          <div className="flex-1 flex flex-col justify-between min-h-[550px]">
            <div className="space-y-6">
              {/* Step 1 Content: Choose Provider */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">Select Channel</h2>
                    <p className="text-slate-450 dark:text-slate-400 text-sm mt-1">
                      Choose the communication channel you want to set up.
                    </p>
                  </div>

                  {/* Filter & Search Bar */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                      <svg className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <input
                        type="text"
                        placeholder="Search Channel..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-full border border-slate-200 dark:border-slate-700 bg-transparent rounded-lg py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>
                    <select
                      value={activeCategory}
                      onChange={(e: any) => setActiveCategory(e.target.value)}
                      className="border border-slate-200 dark:border-slate-700 bg-transparent rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    >
                      <option value="All">All Categories</option>
                      <option value="Messaging">Messaging</option>
                      <option value="Email">Email</option>
                      <option value="Voice">Voice</option>
                      <option value="Team">Team</option>
                    </select>
                  </div>

                  {/* Channels Selection Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 max-h-[380px] overflow-y-auto pr-1">
                    {filteredProviders.map((provider) => {
                      const providerType = mapProviderNameToType(provider.name);
                      const isSelected = selectedProvider === providerType;
                      
                      return (
                        <div
                          key={provider.name}
                          onClick={() => setSelectedProvider(providerType)}
                          className={`flex flex-col p-4 rounded-xl border cursor-pointer transition-all duration-200 text-left select-none relative ${
                            isSelected 
                              ? 'border-2 border-emerald-500 bg-emerald-50/10 dark:bg-emerald-500/5 shadow-md shadow-emerald-500/5' 
                              : 'border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/30'
                          }`}
                        >
                          {/* Selection Checkmark Indicator */}
                          {isSelected && (
                            <div className="absolute right-3 top-3 h-5 w-5 bg-emerald-500 text-white rounded-full flex items-center justify-center">
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}

                          <div className="mb-3">
                            {getProviderIcon(providerType)}
                          </div>
                          <h3 className="font-bold text-slate-850 dark:text-white text-sm">
                            {provider.name}
                          </h3>
                          <p className="text-slate-450 dark:text-slate-450 text-xs mt-1 leading-normal">
                            {provider.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 2 Content: Create Channel */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">Authenticate & Setup</h2>
                    <p className="text-slate-450 dark:text-slate-400 text-sm mt-1">
                      Link your account credentials or test setup for {selectedProvider === 'WhatsApp' ? 'WhatsApp Business' : selectedProvider}.
                    </p>
                  </div>

                  <div className="bg-slate-50/50 dark:bg-slate-800/10 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 max-w-xl">
                    {selectedProvider === 'WhatsApp' ? (
                      // WhatsApp specific connection UI flow (replaces Cards modal launcher)
                      <div className="space-y-6 text-center py-4">
                        <div className="flex justify-center mb-4">
                          <svg className="h-16 w-16 text-emerald-500" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.703 1.458h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                          </svg>
                        </div>
                        <h3 className="text-md font-bold text-slate-800 dark:text-white">Link WhatsApp Business Account</h3>
                        <p className="text-slate-455 dark:text-slate-400 text-xs px-6 leading-relaxed">
                          Link your WhatsApp business number instantly. You can choose to connect using QR scan initialization or authorize with your Meta developer credentials.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                          <button
                            onClick={handleMetaConnect}
                            className="px-6 py-2 rounded-lg text-white font-semibold text-sm transition-colors shadow-sm"
                            style={{ backgroundColor: '#10B981' }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#059669')}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#10B981')}
                          >
                            Connect via Meta Pop-up
                          </button>
                          <button
                            onClick={() => setIsQrModalOpen(true)}
                            className="px-6 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-sm transition-colors"
                          >
                            Connect via QR Code
                          </button>
                        </div>

                        {whatsappStatus === 'connected' && (
                          <div className="pt-4 flex items-center justify-center gap-2 text-xs font-bold text-emerald-500">
                            <span className="h-2.5 w-2.5 bg-emerald-500 rounded-full animate-ping"></span>
                            <span>WhatsApp Status: Connected</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      // Generic dynamic config form for other channels
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-500 uppercase">Channel Display Name</label>
                          <input
                            type="text"
                            placeholder={`e.g. support-${selectedProvider?.toLowerCase()}`}
                            value={channelNameInput}
                            onChange={(e) => setChannelNameInput(e.target.value)}
                            className="w-full border border-slate-200 dark:border-slate-700 bg-transparent rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-500 uppercase">API Key / Access Secret</label>
                          <input
                            type="password"
                            placeholder="Enter configuration API key"
                            value={apiKeyInput}
                            onChange={(e) => setApiKeyInput(e.target.value)}
                            className="w-full border border-slate-200 dark:border-slate-700 bg-transparent rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3 Content: Add User and Teams */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">Assign Agents</h2>
                    <p className="text-slate-450 dark:text-slate-400 text-sm mt-1">
                      Determine which team members are assigned incoming chats from this channel.
                    </p>
                  </div>

                  <div className="bg-slate-50/50 dark:bg-slate-800/10 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 max-w-xl space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase">Assignee Agent</label>
                      <select
                        value={assignedAgent}
                        onChange={(e) => setAssignedAgent(e.target.value)}
                        className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-dark-card rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      >
                        <option value="John Doe">John Doe (Admin)</option>
                        <option value="Dixit Panchal">Dixit Panchal (Support Tier 1)</option>
                        <option value="Pooja Sharma">Pooja Sharma (Client Relations)</option>
                        <option value="Yug Shah">Yug Shah (Developer Support)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase">Auto-Assign Group</label>
                      <select
                        className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-dark-card rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        disabled
                      >
                        <option>Default Inbox Routing Group</option>
                        <option>Tier 2 escalations</option>
                      </select>
                      <p className="text-[10px] text-slate-400 italic">Conversations will be placed directly in this agent's inbox.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4 Content: Finish */}
              {currentStep === 4 && (
                <div className="space-y-6 text-center max-w-lg mx-auto py-8 animate-fade-in">
                  <div className="h-16 w-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="h-10 w-10 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-white">You are all set!</h2>
                  <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                    The connection with **{selectedProvider === 'WhatsApp' ? 'WhatsApp Business' : selectedProvider}** was successfully established and verified. Conversations will begin syncing instantly.
                  </p>

                  <div className="bg-slate-50/50 dark:bg-slate-800/10 border border-slate-100 dark:border-slate-800 rounded-xl p-4 text-left text-xs space-y-2 mt-8">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Selected Provider:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-200">{selectedProvider === 'WhatsApp' ? 'WhatsApp Business' : selectedProvider}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Assigned Agent:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-200">{assignedAgent}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Verification Status:</span>
                      <span className="font-bold text-emerald-500">Active</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Stepper Navigation Buttons Bottom Bar */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-6 mt-8 flex justify-between items-center">
              <button
                onClick={handlePrevStep}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-sm font-semibold text-slate-600 dark:text-slate-300 transition-colors"
              >
                Previous
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={resetWizard}
                  className="px-4 py-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleNextStep}
                  disabled={currentStep === 1 && !selectedProvider}
                  className="px-6 py-2 rounded-lg text-white font-semibold text-sm transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#10B981' }}
                  onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = '#059669'; }}
                  onMouseLeave={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = '#10B981'; }}
                >
                  {currentStep === 4 ? 'Finish' : 'Next'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Connection QR Modal for WhatsApp */}
      <Modal isOpen={isQrModalOpen} onClose={() => setIsQrModalOpen(false)} title="Connect WhatsApp">
        <div className="text-center p-4">
          {whatsappStatus === 'connecting' && (
            <div className="flex flex-col items-center py-6">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500 mb-4"></div>
              <p className="text-slate-655 dark:text-slate-350 text-sm font-semibold">
                Initializing WhatsApp client...
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Please wait, this might take a moment.
              </p>
            </div>
          )}

          {whatsappStatus === 'qr_ready' && (
            <div className="flex flex-col items-center">
              <p className="text-slate-600 dark:text-slate-300 mb-6 text-sm">
                Scan this QR code with your WhatsApp application to link your device.
              </p>
              <div className="bg-white p-3 rounded-2xl shadow-md border border-slate-100">
                {whatsappQr ? (
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(whatsappQr)}`} 
                    alt="WhatsApp QR Code" 
                    className="w-64 h-64 mx-auto rounded-lg animate-fade-in"
                  />
                ) : (
                  <div className="w-64 h-64 flex items-center justify-center text-slate-400">
                    Generating QR code...
                  </div>
                )}
              </div>
              <ol className="text-left mt-6 space-y-2 text-sm text-slate-500 dark:text-slate-400">
                <li>1. Open WhatsApp on your phone.</li>
                <li>2. Go to <strong>Settings</strong> &gt; <strong>Linked Devices</strong>.</li>
                <li>3. Tap on <strong>Link a Device</strong> and scan the code.</li>
              </ol>
            </div>
          )}

          {whatsappStatus === 'connected' && (
            <div className="flex flex-col items-center py-6">
              <div className="h-14 w-14 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
                <svg className="h-8 w-8 text-emerald-500 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-slate-800 dark:text-white font-bold text-lg">
                Connected Successfully!
              </p>
              <p className="text-sm text-slate-500 mt-1 mb-6">
                Your WhatsApp account is now linked.
              </p>
              <Button onClick={() => setIsQrModalOpen(false)}>
                Close
              </Button>
            </div>
          )}

          {whatsappStatus === 'disconnected' && (
            <div className="flex flex-col items-center py-6">
              <p className="text-slate-655 dark:text-slate-350 mb-4 text-sm font-semibold">
                Failed to initialize WhatsApp or disconnected.
              </p>
              <Button onClick={() => fetch('/api/whatsapp/connect', { method: 'POST' })}>
                Retry
              </Button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Channels;
