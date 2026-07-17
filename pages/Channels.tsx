import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { WhatsAppIcon, GoogleIcon } from '../components/icons/Icons';

const Channels: React.FC = () => {
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);

  const [whatsappStatus, setWhatsappStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'qr_ready'>('disconnected');
  const [whatsappQr, setWhatsappQr] = useState<string>('');

  // Fetch initial WhatsApp status
  useEffect(() => {
    fetch('/api/whatsapp/status')
      .then((res) => res.json())
      .then((data) => {
        setWhatsappStatus(data.status);
        setWhatsappQr(data.qr);
      })
      .catch((err) => console.error('Error fetching WhatsApp status:', err));
  }, []);

  // Listen to SSE status updates when modal is open
  useEffect(() => {
    if (!isQrModalOpen) return;

    // Trigger backend connection
    fetch('/api/whatsapp/connect', { method: 'POST' }).catch((err) =>
      console.error('Error triggering WhatsApp connect:', err)
    );

    const eventSource = new EventSource('/api/whatsapp/sse');

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setWhatsappStatus(data.status);
        setWhatsappQr(data.qr);
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

  const handleDisconnectWhatsapp = async () => {
    try {
      await fetch('/api/whatsapp/disconnect', { method: 'POST' });
      setWhatsappStatus('disconnected');
      setWhatsappQr('');
    } catch (err) {
      console.error('Error disconnecting WhatsApp:', err);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Connect Channels</h1>
      <p className="text-slate-500 dark:text-slate-400">Integrate your communication channels to bring all conversations into CommuniDesk.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center mb-4">
            <WhatsAppIcon className="h-10 w-10 text-green-500" />
            <div className="flex items-center gap-3 ml-4">
              <h2 className="text-xl font-semibold">WhatsApp Business</h2>
              {whatsappStatus === 'connected' && (
                <span className="px-2.5 py-0.5 text-xs font-bold bg-green-500/10 text-green-500 dark:bg-green-500/20 rounded-full">
                  Connected
                </span>
              )}
            </div>
          </div>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            Connect your WhatsApp Business account to manage chats and contacts directly from the dashboard.
          </p>
          {whatsappStatus === 'connected' ? (
            <Button onClick={handleDisconnectWhatsapp} variant="secondary">
              Disconnect WhatsApp
            </Button>
          ) : (
            <Button onClick={() => setIsQrModalOpen(true)}>
              Connect via QR Code
            </Button>
          )}
        </Card>

        <Card>
          <div className="flex items-center mb-4">
            <GoogleIcon className="h-10 w-10" />
            <h2 className="text-xl font-semibold ml-4">Google</h2>
          </div>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            Integrate your Google account to sync contacts and manage communications from Google services.
          </p>
          <Button 
            onClick={() => setIsGoogleConnected(!isGoogleConnected)}
            variant={isGoogleConnected ? 'secondary' : 'primary'}
          >
            {isGoogleConnected ? 'Disconnect Google' : 'Connect with Google'}
          </Button>
        </Card>
      </div>

      <Modal isOpen={isQrModalOpen} onClose={() => setIsQrModalOpen(false)} title="Connect WhatsApp">
        <div className="text-center p-4">
          {whatsappStatus === 'connecting' && (
            <div className="flex flex-col items-center py-6">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500 mb-4"></div>
              <p className="text-slate-650 dark:text-slate-350 text-sm font-semibold">
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
              <p className="text-slate-650 dark:text-slate-350 mb-4 text-sm font-semibold">
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
