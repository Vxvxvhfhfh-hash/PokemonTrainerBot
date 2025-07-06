import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color: 'pokemon-red' | 'pokemon-blue' | 'pokemon-yellow';
  isLoading?: boolean;
}

export function StatsCard({ title, value, icon: Icon, color, isLoading }: StatsCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">{title}</p>
            {isLoading ? (
              <Skeleton className="h-8 w-16 mt-2" />
            ) : (
              <p className="text-2xl font-bold text-gray-800">{value.toLocaleString()}</p>
            )}
          </div>
          <div className={`w-12 h-12 ${color} rounded-full flex items-center justify-center`}>
            <Icon className="text-white text-lg" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
