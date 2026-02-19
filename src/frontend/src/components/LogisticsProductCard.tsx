import { Card, CardContent } from './ui/card';
import { Package } from 'lucide-react';
import { Product } from '../backend';

interface LogisticsProductCardProps {
  product: Product;
}

export default function LogisticsProductCard({ product }: LogisticsProductCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-3 space-y-2">
        <div className="flex items-start gap-2">
          <div className="w-12 h-12 bg-muted rounded flex items-center justify-center shrink-0">
            {product.image ? (
              <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded" />
            ) : (
              <Package className="w-6 h-6 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-foreground line-clamp-2">{product.name}</p>
            <p className="text-xs text-muted-foreground">{product.shop}</p>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Qty: {Number(product.quantity)}</span>
          <span className="font-medium text-foreground">${Number(product.price).toLocaleString()}</span>
        </div>
      </CardContent>
    </Card>
  );
}
