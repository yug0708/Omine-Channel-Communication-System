import pkg from 'whatsapp-web.js';
import fs from 'fs';
import os from 'os';
import path from 'path';
const { Client, LocalAuth } = pkg;

const sessionPath = path.join(os.homedir(), '.wwebjs_auth');

export type WhatsAppStatus = 'disconnected' | 'connecting' | 'connected' | 'qr_ready';

let client: any = null;
let currentStatus: WhatsAppStatus = 'disconnected';
let latestQr: string = '';

type StatusListener = (status: WhatsAppStatus, qr: string) => void;
const listeners = new Set<StatusListener>();

export function registerListener(listener: StatusListener) {
  listeners.add(listener);
  // Send current state immediately upon registering
  listener(currentStatus, latestQr);
  return () => {
    listeners.delete(listener);
  };
}

function broadcast() {
  for (const listener of listeners) {
    listener(currentStatus, latestQr);
  }
}

export function getWhatsAppStatus() {
  return {
    status: currentStatus,
    qr: latestQr,
  };
}

export function setWhatsAppStatusManual(status: WhatsAppStatus) {
  currentStatus = status;
  latestQr = '';
  broadcast();
}

export async function initWhatsApp() {
  if (client) {
    return;
  }

  currentStatus = 'connecting';
  latestQr = '';
  broadcast();

  // Clear any existing corrupted session folder
  try {
    fs.rmSync(sessionPath, { recursive: true, force: true });
  } catch (e) {}

  try {
    client = new Client({
      authStrategy: new LocalAuth({
        dataPath: sessionPath
      }),
      puppeteer: {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36'
        ]
      }
    });

    client.on('qr', (qr: string) => {
      latestQr = qr;
      currentStatus = 'qr_ready';
      console.log('WhatsApp QR received');
      broadcast();
    });

    client.on('ready', () => {
      currentStatus = 'connected';
      latestQr = '';
      console.log('WhatsApp Client is Ready!');
      broadcast();
    });

    client.on('authenticated', () => {
      console.log('WhatsApp Client Authenticated');
    });

    client.on('auth_failure', (msg: string) => {
      currentStatus = 'disconnected';
      latestQr = '';
      console.error('WhatsApp Authentication Failure:', msg);
      broadcast();
    });

    client.on('disconnected', (reason: string) => {
      currentStatus = 'disconnected';
      latestQr = '';
      console.log('WhatsApp Client Disconnected:', reason);
      broadcast();
      // Destroy the client and reset
      destroyWhatsApp();
    });

    await client.initialize();
  } catch (error) {
    currentStatus = 'disconnected';
    latestQr = '';
    console.error('Failed to initialize WhatsApp client:', error);
    broadcast();
    client = null;
  }
}

export async function destroyWhatsApp() {
  if (!client) {
    try {
      fs.rmSync(sessionPath, { recursive: true, force: true });
    } catch (e) {}
    return;
  }
  try {
    if (currentStatus === 'connected') {
      console.log('Logging out WhatsApp client session...');
      await client.logout();
    }
  } catch (e) {
    console.error('Error logging out from WhatsApp:', e);
  }
  try {
    await client.destroy();
  } catch (e) {
    console.error('Error destroying WhatsApp client:', e);
  }
  client = null;
  currentStatus = 'disconnected';
  latestQr = '';
  try {
    fs.rmSync(sessionPath, { recursive: true, force: true });
  } catch (e) {}
  broadcast();
}
