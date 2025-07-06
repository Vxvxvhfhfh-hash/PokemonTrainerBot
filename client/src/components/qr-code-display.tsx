import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useWebSocket } from "@/hooks/use-websocket";
import { useQuery } from "@tanstack/react-query";
import { RefreshCw, Info, Smartphone } from "lucide-react";

interface BotStatus {
  isConnected: boolean;
  qrCode?: string;
}

export function QRCodeDisplay() {
  const { sendMessage, lastMessage, connectionStatus } = useWebSocket();
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const { data: botStatus, isLoading } = useQuery<BotStatus>({
    queryKey: ['/api/bot/status'],
    refetchInterval: 5000,
  });

  useEffect(() => {
    if (botStatus) {
      setIsConnected(botStatus.isConnected);
      setQrCode(botStatus.qrCode || null);
    }
  }, [botStatus]);

  useEffect(() => {
    if (lastMessage) {
      const data = JSON.parse(lastMessage.data);
      if (data.type === 'qr_code') {
        setQrCode(data.data);
      } else if (data.type === 'bot_ready') {
        setIsConnected(true);
      } else if (data.type === 'bot_disconnected') {
        setIsConnected(false);
      }
    }
  }, [lastMessage]);

  const handleGenerateQR = () => {
    if (connectionStatus) {
      sendMessage({ type: 'get_qr_code' });
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 whatsapp-green rounded-full flex items-center justify-center mx-auto mb-4">
              <Smartphone className="text-white text-2xl" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Connexion WhatsApp Web
            </h3>
            <p className="text-gray-600">
              Scannez le code QR avec votre application WhatsApp pour connecter le bot
            </p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-8 mb-6">
            <div className="w-64 h-64 bg-white rounded-lg mx-auto flex items-center justify-center border-2 border-dashed border-gray-300">
              {isLoading ? (
                <div className="text-center">
                  <Skeleton className="w-48 h-48 mx-auto mb-4" />
                  <Skeleton className="w-32 h-4 mx-auto" />
                </div>
              ) : isConnected ? (
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-lg font-medium text-green-600">Bot connecté !</p>
                  <p className="text-sm text-gray-500">Votre bot WhatsApp est maintenant actif</p>
                </div>
              ) : qrCode ? (
                <div className="text-center">
                  <img 
                    src={qrCode} 
                    alt="QR Code WhatsApp" 
                    className="w-48 h-48 mx-auto mb-4 rounded-lg"
                  />
                  <p className="text-sm text-gray-600">Scannez ce code avec WhatsApp</p>
                </div>
              ) : (
                <div className="text-center">
                  <RefreshCw className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-gray-500">
                    {connectionStatus ? 'Code QR en cours de génération...' : 'Connexion WebSocket requise'}
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-center space-x-4">
            <Button 
              onClick={handleGenerateQR}
              className="whatsapp-green text-white hover:whatsapp-dark"
              disabled={!connectionStatus}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Régénérer le code
            </Button>
            <Button 
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              <Info className="w-4 h-4 mr-2" />
              Instructions
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
