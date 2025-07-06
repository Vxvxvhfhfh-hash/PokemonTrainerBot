import { useEffect, useState, useRef } from 'react';

interface WebSocketMessage {
  data: string;
  timestamp: Date;
}

export function useWebSocket() {
  const [connectionStatus, setConnectionStatus] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const connect = () => {
      ws.current = new WebSocket(wsUrl);
      
      ws.current.onopen = () => {
        console.log('WebSocket connected');
        setConnectionStatus(true);
        
        // Request initial status
        sendMessage({ type: 'get_status' });
      };
      
      ws.current.onmessage = (event) => {
        setLastMessage({
          data: event.data,
          timestamp: new Date()
        });
      };
      
      ws.current.onclose = () => {
        console.log('WebSocket disconnected');
        setConnectionStatus(false);
        
        // Attempt to reconnect after 3 seconds
        setTimeout(connect, 3000);
      };
      
      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus(false);
      };
    };

    connect();

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  const sendMessage = (message: any) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    }
  };

  return {
    connectionStatus,
    lastMessage,
    sendMessage
  };
}
