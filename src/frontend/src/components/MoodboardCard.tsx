import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { DollarSign, Image as ImageIcon } from 'lucide-react';
import { Moodboard } from '../backend';

interface MoodboardCardProps {
  moodboard: Moodboard;
}

export default function MoodboardCard({ moodboard }: MoodboardCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{moodboard.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {moodboard.description && <p className="text-sm text-muted-foreground">{moodboard.description}</p>}

        <div className="grid grid-cols-2 gap-2">
          {moodboard.images.slice(0, 4).map((image, index) => (
            <div key={index} className="aspect-square bg-muted rounded-md flex items-center justify-center overflow-hidden">
              {image ? (
                <img src={image} alt={`Moodboard ${index + 1}`} className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="w-8 h-8 text-muted-foreground" />
              )}
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-border space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Linked Products</span>
            <span className="font-medium text-foreground">{moodboard.products.length}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <DollarSign className="w-4 h-4" />
              <span className="text-sm">Total Cost</span>
            </div>
            <span className="font-bold text-foreground">${Number(moodboard.totalCost).toLocaleString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
