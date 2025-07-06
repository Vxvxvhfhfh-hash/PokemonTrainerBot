import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Edit, Trash2, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PokemonCard {
  id: number;
  name: string;
  type: string;
  level: number;
  rarity: string;
  imageUrl?: string;
  description?: string;
  isActive: boolean;
}

export function CardGrid() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<PokemonCard | null>(null);
  const { toast } = useToast();

  const { data: cards = [], isLoading } = useQuery<PokemonCard[]>({
    queryKey: ['/api/cards'],
  });

  const addCardMutation = useMutation({
    mutationFn: (cardData: Omit<PokemonCard, 'id'>) => 
      apiRequest('POST', '/api/cards', cardData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cards'] });
      setIsAddDialogOpen(false);
      toast({ title: "Carte ajoutée avec succès" });
    },
    onError: () => {
      toast({ title: "Erreur lors de l'ajout de la carte", variant: "destructive" });
    },
  });

  const updateCardMutation = useMutation({
    mutationFn: ({ id, ...cardData }: PokemonCard) => 
      apiRequest('PUT', `/api/cards/${id}`, cardData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cards'] });
      setEditingCard(null);
      toast({ title: "Carte mise à jour avec succès" });
    },
    onError: () => {
      toast({ title: "Erreur lors de la mise à jour", variant: "destructive" });
    },
  });

  const deleteCardMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest('DELETE', `/api/cards/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cards'] });
      toast({ title: "Carte supprimée avec succès" });
    },
    onError: () => {
      toast({ title: "Erreur lors de la suppression", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const cardData = {
      name: formData.get('name') as string,
      type: formData.get('type') as string,
      level: parseInt(formData.get('level') as string),
      rarity: formData.get('rarity') as string,
      imageUrl: formData.get('imageUrl') as string,
      description: formData.get('description') as string,
      isActive: true,
    };

    if (editingCard) {
      updateCardMutation.mutate({ ...cardData, id: editingCard.id });
    } else {
      addCardMutation.mutate(cardData);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'commune': return 'bg-gray-100 text-gray-800';
      case 'rare': return 'bg-blue-100 text-blue-800';
      case 'épique': return 'bg-purple-100 text-purple-800';
      case 'légendaire': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'feu': return 'bg-red-100 text-red-800';
      case 'eau': return 'bg-blue-100 text-blue-800';
      case 'plante': return 'bg-green-100 text-green-800';
      case 'électrique': return 'bg-yellow-100 text-yellow-800';
      case 'psy': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Gestion des cartes Pokémon</h3>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="pokemon-red text-white hover:pokemon-red/90">
              <Plus className="w-4 h-4 mr-2" />
              Ajouter une carte
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter une nouvelle carte</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nom</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    placeholder="Nom du Pokémon"
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select name="type" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Feu">Feu</SelectItem>
                      <SelectItem value="Eau">Eau</SelectItem>
                      <SelectItem value="Plante">Plante</SelectItem>
                      <SelectItem value="Électrique">Électrique</SelectItem>
                      <SelectItem value="Psy">Psy</SelectItem>
                      <SelectItem value="Combat">Combat</SelectItem>
                      <SelectItem value="Poison">Poison</SelectItem>
                      <SelectItem value="Vol">Vol</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="level">Niveau</Label>
                  <Input 
                    id="level" 
                    name="level" 
                    type="number" 
                    min="1" 
                    max="100"
                    placeholder="25"
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="rarity">Rareté</Label>
                  <Select name="rarity" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Rareté" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Commune">Commune</SelectItem>
                      <SelectItem value="Rare">Rare</SelectItem>
                      <SelectItem value="Épique">Épique</SelectItem>
                      <SelectItem value="Légendaire">Légendaire</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="imageUrl">URL de l'image</Label>
                <Input 
                  id="imageUrl" 
                  name="imageUrl" 
                  placeholder="https://..."
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input 
                  id="description" 
                  name="description" 
                  placeholder="Description du Pokémon"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full whatsapp-green text-white hover:whatsapp-dark"
                disabled={addCardMutation.isPending}
              >
                {addCardMutation.isPending ? "Ajout en cours..." : "Ajouter la carte"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <Skeleton className="w-full h-48" />
              <CardContent className="p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-3" />
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-20" />
                  <div className="flex space-x-2">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {cards.map((card) => (
            <Card key={card.id} className="overflow-hidden">
              <div className="relative">
                {card.imageUrl ? (
                  <img 
                    src={card.imageUrl} 
                    alt={`Carte ${card.name}`}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                    <ImageIcon className="w-16 h-16 text-gray-400" />
                  </div>
                )}
                {!card.isActive && (
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="bg-red-100 text-red-800">
                      Inactif
                    </Badge>
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <h4 className="font-semibold text-gray-800 mb-2">{card.name}</h4>
                <div className="flex items-center gap-2 mb-3">
                  <Badge className={getTypeColor(card.type)}>
                    {card.type}
                  </Badge>
                  <Badge className={getRarityColor(card.rarity)}>
                    {card.rarity}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <Badge variant="outline">
                    Niveau {card.level}
                  </Badge>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingCard(card)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteCardMutation.mutate(card.id)}
                      disabled={deleteCardMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      {editingCard && (
        <Dialog open={!!editingCard} onOpenChange={() => setEditingCard(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Modifier la carte</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nom</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    defaultValue={editingCard.name}
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select name="type" defaultValue={editingCard.type} required>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Feu">Feu</SelectItem>
                      <SelectItem value="Eau">Eau</SelectItem>
                      <SelectItem value="Plante">Plante</SelectItem>
                      <SelectItem value="Électrique">Électrique</SelectItem>
                      <SelectItem value="Psy">Psy</SelectItem>
                      <SelectItem value="Combat">Combat</SelectItem>
                      <SelectItem value="Poison">Poison</SelectItem>
                      <SelectItem value="Vol">Vol</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="level">Niveau</Label>
                  <Input 
                    id="level" 
                    name="level" 
                    type="number" 
                    min="1" 
                    max="100"
                    defaultValue={editingCard.level}
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="rarity">Rareté</Label>
                  <Select name="rarity" defaultValue={editingCard.rarity} required>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Commune">Commune</SelectItem>
                      <SelectItem value="Rare">Rare</SelectItem>
                      <SelectItem value="Épique">Épique</SelectItem>
                      <SelectItem value="Légendaire">Légendaire</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="imageUrl">URL de l'image</Label>
                <Input 
                  id="imageUrl" 
                  name="imageUrl" 
                  defaultValue={editingCard.imageUrl || ''}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input 
                  id="description" 
                  name="description" 
                  defaultValue={editingCard.description || ''}
                />
              </div>
              <Button 
                type="submit" 
                className="w-full whatsapp-green text-white hover:whatsapp-dark"
                disabled={updateCardMutation.isPending}
              >
                {updateCardMutation.isPending ? "Mise à jour..." : "Mettre à jour"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
