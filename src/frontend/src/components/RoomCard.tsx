import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ChevronDown, ChevronUp, Package } from 'lucide-react';
import { Room } from '../backend';

interface RoomCardProps {
  room: Room;
  projectId: bigint;
}

export default function RoomCard({ room }: RoomCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const totalCost = room.products.reduce((sum, product) => sum + Number(product.price) * Number(product.quantity), 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-xl">{room.name}</CardTitle>
          <Badge variant="secondary">{room.category}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Area</span>
            <span className="font-medium text-foreground">{Number(room.area)} m²</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Budget</span>
            <span className="font-medium text-foreground">${Number(room.budget).toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Spent</span>
            <span className="font-medium text-foreground">${totalCost.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Products</span>
            <span className="font-medium text-foreground">{room.products.length}</span>
          </div>
        </div>

        {room.notes && (
          <div className="pt-2 border-t border-border">
            <p className="text-sm text-muted-foreground">{room.notes}</p>
          </div>
        )}

        {room.products.length > 0 && (
          <div className="pt-2 border-t border-border">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full justify-between"
            >
              <span className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Products ({room.products.length})
              </span>
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>

            {isExpanded && (
              <div className="mt-3 space-y-2">
                {room.products.map((product) => (
                  <div key={product.id.toString()} className="p-2 bg-muted rounded text-sm">
                    <p className="font-medium text-foreground">{product.name}</p>
                    <p className="text-muted-foreground">
                      ${Number(product.price).toLocaleString()} × {Number(product.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
