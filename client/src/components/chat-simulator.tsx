import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWebSocket } from "@/hooks/use-websocket";
import { Send, Smartphone } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface ChatMessage {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  from?: string;
}

export function ChatSimulator() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { lastMessage, connectionStatus } = useWebSocket();

  useEffect(() => {
    if (lastMessage) {
      try {
        const data = JSON.parse(lastMessage.data);
        if (data.type === 'message_received') {
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            text: data.data.body,
            isBot: false,
            timestamp: new Date(data.data.timestamp),
            from: data.data.from
          }]);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    }
  }, [lastMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const simulateCommand = (command: string) => {
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: command,
      isBot: false,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    // Simulate bot response
    setTimeout(() => {
      let botResponse = "";
      
      if (command.toLowerCase() === "new dresseur") {
        botResponse = `🎉 Bienvenue au Centre Pokémon ! Voici votre première carte :

⚡ **Pikachu** - Niveau 25
Type: Électrique
Rareté: Commune

Pokémon Souris électrique

Utilisez "pavé" pour lancer un duel !`;
      } else if (command.toLowerCase() === "pavé") {
        botResponse = `✧═══════[ *DUEL☮️* ]══════✧
       *🔸 GAME - MODO 🎮◻️*
*══════════════════════*
*👤 DRESSEUR 1🎴:*
                🆚
*👤 DRESSEUR 2🎴:*

*⛩️DISTANCE🔸: 6m*
*🏟️ARENA🔸:*
*🔻LATENCE: 7min🔸*
*══════════════════════*`;
      } else {
        botResponse = "🤖 Commande non reconnue. Utilisez 'new dresseur' ou 'pavé'.";
      }

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    }, 1000);
  };

  const handleSend = () => {
    if (inputText.trim()) {
      simulateCommand(inputText);
      setInputText("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="h-96 flex flex-col">
        <div className="p-4 border-b border-gray-200 whatsapp-green text-white rounded-t-xl">
          <div className="flex items-center space-x-3">
            <Smartphone className="w-6 h-6" />
            <div>
              <h3 className="font-semibold">Test Chat - Simulation WhatsApp</h3>
              <p className="text-sm opacity-90">
                {connectionStatus ? 'Bot connecté' : 'Bot déconnecté'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto whatsapp-bg">
          <div className="space-y-3">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <Smartphone className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>Aucun message pour le moment</p>
                <p className="text-sm mt-2">Commencez par taper "new dresseur" ou "pavé"</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      message.isBot
                        ? 'bg-white text-gray-800 shadow-sm'
                        : 'whatsapp-light text-gray-800'
                    }`}
                  >
                    {message.isBot ? (
                      <pre className="text-sm whitespace-pre-wrap font-sans">
                        {message.text}
                      </pre>
                    ) : (
                      <p className="text-sm">{message.text}</p>
                    )}
                    <p className="text-xs text-gray-600 mt-1">
                      {format(message.timestamp, 'HH:mm', { locale: fr })}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-200">
          <div className="flex space-x-3">
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Tapez votre message de test..."
              className="flex-1"
            />
            <Button
              onClick={handleSend}
              disabled={!inputText.trim()}
              className="whatsapp-green text-white hover:whatsapp-dark"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <div className="mt-2 flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => simulateCommand("new dresseur")}
              className="text-xs"
            >
              Test: new dresseur
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => simulateCommand("pavé")}
              className="text-xs"
            >
              Test: pavé
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
