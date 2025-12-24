import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { WhatsAppIcon, GoogleIcon } from '../components/icons/Icons';

const Channels: React.FC = () => {
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Connect Channels</h1>
      <p className="text-slate-500 dark:text-slate-400">Integrate your communication channels to bring all conversations into CommuniDesk.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center mb-4">
            <WhatsAppIcon className="h-10 w-10 text-green-500" />
            <h2 className="text-xl font-semibold ml-4">WhatsApp Business</h2>
          </div>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            Connect your WhatsApp Business account to manage chats and contacts directly from the dashboard.
          </p>
          <Button onClick={() => setIsQrModalOpen(true)}>
            Connect via QR Code
          </Button>
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
        <div className="text-center">
            <p className="text-slate-600 dark:text-slate-300 mb-4">
                Scan this QR code with your WhatsApp application to link your device.
            </p>
            <img 
                src="https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=CommuniDeskWhatsAppIntegrationPlaceholder" 
                alt="WhatsApp QR Code" 
                className="mx-auto rounded-lg"
            />
            <ol className="text-left mt-6 space-y-2 text-sm text-slate-500 dark:text-slate-400">
                <li>1. Open WhatsApp on your phone.</li>
                <li>2. Go to <strong>Settings</strong> &gt; <strong>Linked Devices</strong>.</li>
                <li>3. Tap on <strong>Link a Device</strong> and scan the code.</li>
            </ol>
        </div>
      </Modal>
    </div>
  );
};

export default Channels;
