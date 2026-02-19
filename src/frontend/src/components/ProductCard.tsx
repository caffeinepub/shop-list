import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { ExternalLink, Package } from 'lucide-react';
import { Product } from '../backend';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-square bg-muted flex items-center justify-center">
        {product.image ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <Package className="w-12 h-12 text-muted-foreground" />
        )}
      </div>
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-medium text-foreground line-clamp-2">{product.name}</h4>
          <Badge variant="secondary" className="shrink-0">
            {product.status}
          </Badge>
        </div>

        <div className="space-y-1 text-sm">
          <p className="text-muted-foreground">{product.shop}</p>
          <p className="font-bold text-foreground">${Number(product.price).toLocaleString()}</p>
          <p className="text-muted-foreground">Qty: {Number(product.quantity)}</p>
          <p className="text-muted-foreground capitalize">{product.availability}</p>
        </div>

        {product.link && (
          <a
            href={product.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            View Product
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </CardContent>
    </Card>
  );
}
