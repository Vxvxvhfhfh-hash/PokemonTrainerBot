import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Play, User, Gamepad2 } from "lucide-react";

export function CommandsPanel() {
  const [testPhone, setTestPhone] = useState("+33612345678");
  const { toast } = useToast();

  const testNewTrainerMutation = useMutation({
    mutationFn: (phoneNumber: string) => 
      apiRequest('POST', '/api/test/new-trainer', { phoneNumber }),
    onSuccess: (response) => {
      const data = response.json();
      toast({ 
        title: "Commande testée avec succès",
        description: `Nouveau dresseur créé et carte ${data.card?.name} distribuée`
      });
    },
    onError: () => {
      toast({ 
        title: "Erreur lors du test", 
        variant: "destructive" 
      });
    },
  });

  const testPaveMutation = useMutation({
    mutationFn: () => apiRequest('GET', '/api/test/pave'),
    onSuccess: () => {
      toast({ 
        title: "Commande pavé testée",
        description: "Le pavé de jeu a été généré avec succès"
      });
    },
    onError: () => {
      toast({ 
        title: "Erreur lors du test", 
        variant: "destructive" 
      });
    },
  });

  const paveText = `✧═══════[ *DUEL☮️* ]══════✧
       *🔸 GAME - MODO 🎮◻️*
*══════════════════════*
*👤 DRESSEUR 1🎴:*
                🆚
*👤 DRESSEUR 2🎴:*

*⛩️DISTANCE🔸: 6m*
*🏟️ARENA🔸:*
*🔻LATENCE: 7min🔸*
*══════════════════════*
*rules 💢 :*

*🚫: Ne pas dévaloriser le verdict d'un modérateurs sans preuve concrête sinon vous aurez une ammende et une défaite Direct de votre duel en cours.*

*⛔: Tout votre pavé ne sera pas validé si vous êtes en retard donc après 7 minute, plus les une minute de temps additionnel accordé donc 7 + 1*

*♻️: En cas d'urgence vous pouvez demander un temps morts allant jusqu'à 10min et si cela vous semble insuffisant  vous devez soit declarer forfait soit demandé au modo et a l'adversaire si vous pouvez reporté le match (un arrangement entre vous)*

▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓

   *🔶POKEMO UNITE 🎴🎮*

✧═══════[ *GAME🎮* ]══════✧`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Commandes disponibles</h3>
          
          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-800">new dresseur</h4>
                <Badge className="bg-green-100 text-green-800">Actif</Badge>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Enregistre un nouveau dresseur et distribue une carte aléatoire
              </p>
              <div className="flex items-center gap-2 mb-3">
                <Input
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  placeholder="Numéro de téléphone"
                  className="flex-1"
                />
                <Button
                  size="sm"
                  onClick={() => testNewTrainerMutation.mutate(testPhone)}
                  disabled={testNewTrainerMutation.isPending}
                  className="whatsapp-green text-white hover:whatsapp-dark"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Tester
                </Button>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <User className="w-4 h-4 mr-1" />
                <span>Simule l'inscription d'un nouveau dresseur</span>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-800">pavé</h4>
                <Badge className="bg-green-100 text-green-800">Actif</Badge>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Affiche le pavé de jeu pour les duels
              </p>
              <div className="flex items-center gap-2 mb-3">
                <Button
                  size="sm"
                  onClick={() => testPaveMutation.mutate()}
                  disabled={testPaveMutation.isPending}
                  className="whatsapp-green text-white hover:whatsapp-dark"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Tester la commande
                </Button>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Gamepad2 className="w-4 h-4 mr-1" />
                <span>Génère le pavé de duel formaté</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Aperçu du pavé</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <pre className="text-xs whitespace-pre-wrap text-gray-800 font-mono leading-relaxed">
              {paveText}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
