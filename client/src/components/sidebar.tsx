import { useWebSocket } from "@/hooks/use-websocket";
import { Bot, BarChart3, MessageSquare, Image, Terminal, Smartphone } from "lucide-react";

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: 'dashboard' | 'connection' | 'cards' | 'commands' | 'chat') => void;
}

export function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const { connectionStatus } = useWebSocket();

  const menuItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: BarChart3 },
    { id: 'connection', label: 'Connexion WhatsApp', icon: Smartphone },
    { id: 'cards', label: 'Gestion des cartes', icon: Image },
    { id: 'commands', label: 'Commandes', icon: Terminal },
    { id: 'chat', label: 'Test Chat', icon: MessageSquare },
  ];

  return (
    <aside className="w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 pokemon-red rounded-full flex items-center justify-center">
            <Bot className="text-white text-lg" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Bot Pokémon</h1>
            <p className="text-sm text-gray-500">WhatsApp Manager</p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id as any)}
              className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                isActive 
                  ? 'whatsapp-green text-white' 
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
      
      {/* Status */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            connectionStatus ? 'bg-green-500' : 'bg-red-500'
          }`} />
          <span className="text-sm text-gray-600">
            {connectionStatus ? 'Connecté' : 'Déconnecté'}
          </span>
        </div>
      </div>
    </aside>
  );
}
