import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { StatsCard } from "@/components/stats-card";
import { QRCodeDisplay } from "@/components/qr-code-display";
import { CardGrid } from "@/components/card-grid";
import { CommandsPanel } from "@/components/commands-panel";
import { ChatSimulator } from "@/components/chat-simulator";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Users, Image, Swords } from "lucide-react";

type ActiveSection = 'dashboard' | 'connection' | 'cards' | 'commands' | 'chat';

interface Stats {
  activeDresseurs: number;
  cardsDistributed: number;
  activeDuels: number;
}

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState<ActiveSection>('dashboard');

  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery<Stats>({
    queryKey: ['/api/stats'],
    refetchInterval: 5000,
  });

  const pageTitles = {
    dashboard: 'Tableau de bord',
    connection: 'Connexion WhatsApp',
    cards: 'Gestion des cartes',
    commands: 'Commandes',
    chat: 'Test Chat'
  };

  const pageSubtitles = {
    dashboard: 'Gérez votre bot Pokémon WhatsApp',
    connection: 'Connectez votre bot à WhatsApp Web',
    cards: 'Gérez vos cartes Pokémon',
    commands: 'Configurez les commandes du bot',
    chat: 'Testez votre bot en temps réel'
  };

  const handleRefresh = () => {
    refetchStats();
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {pageTitles[activeSection]}
              </h2>
              <p className="text-gray-600 mt-1">
                {pageSubtitles[activeSection]}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                onClick={handleRefresh}
                className="whatsapp-green text-white hover:whatsapp-dark"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualiser
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          {activeSection === 'dashboard' && (
            <div>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatsCard
                  title="Dresseurs actifs"
                  value={stats?.activeDresseurs ?? 0}
                  icon={Users}
                  color="pokemon-blue"
                  isLoading={statsLoading}
                />
                <StatsCard
                  title="Cartes distribuées"
                  value={stats?.cardsDistributed ?? 0}
                  icon={Image}
                  color="pokemon-red"
                  isLoading={statsLoading}
                />
                <StatsCard
                  title="Duels en cours"
                  value={stats?.activeDuels ?? 0}
                  icon={Swords}
                  color="pokemon-yellow"
                  isLoading={statsLoading}
                />
              </div>

              {/* Recent Activity */}
              <Card>
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800">Activité récente</h3>
                </div>
                <CardContent className="p-6">
                  <div className="text-center text-gray-500 py-8">
                    <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>Aucune activité récente</p>
                    <p className="text-sm mt-2">Les nouvelles inscriptions et distributions apparaîtront ici</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === 'connection' && <QRCodeDisplay />}
          {activeSection === 'cards' && <CardGrid />}
          {activeSection === 'commands' && <CommandsPanel />}
          {activeSection === 'chat' && <ChatSimulator />}
        </div>
      </main>
    </div>
  );
}
