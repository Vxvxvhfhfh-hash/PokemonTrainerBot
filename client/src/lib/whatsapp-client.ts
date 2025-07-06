export interface WhatsAppMessage {
  from: string;
  body: string;
  timestamp: Date;
}

export interface BotStatus {
  isConnected: boolean;
  qrCode?: string;
}

export class WhatsAppClient {
  private ws: WebSocket | null = null;
  private listeners: Map<string, (data: any) => void> = new Map();

  constructor() {
    this.connect();
  }

  private connect() {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    this.ws = new WebSocket(wsUrl);
    
    this.ws.onopen = () => {
      console.log('WhatsApp WebSocket connected');
      this.emit('connected', true);
    };
    
    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.emit(data.type, data.data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    this.ws.onclose = () => {
      console.log('WhatsApp WebSocket disconnected');
      this.emit('connected', false);
      
      // Attempt to reconnect after 3 seconds
      setTimeout(() => this.connect(), 3000);
    };
    
    this.ws.onerror = (error) => {
      console.error('WhatsApp WebSocket error:', error);
      this.emit('error', error);
    };
  }

  private emit(event: string, data: any) {
    const listener = this.listeners.get(event);
    if (listener) {
      listener(data);
    }
  }

  public on(event: string, callback: (data: any) => void) {
    this.listeners.set(event, callback);
  }

  public off(event: string) {
    this.listeners.delete(event);
  }

  public sendMessage(message: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  public getQRCode() {
    this.sendMessage({ type: 'get_qr_code' });
  }

  public getStatus() {
    this.sendMessage({ type: 'get_status' });
  }

  public testMessage(to: string, message: string) {
    this.sendMessage({ 
      type: 'send_test_message', 
      to, 
      message 
    });
  }
}

export const whatsappClient = new WhatsAppClient();
