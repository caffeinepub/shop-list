import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Copy, Package } from 'lucide-react';
import { ProductLibrary } from '../backend';

interface LibraryProductCardProps {
  product: ProductLibrary;
}

export default function LibraryProductCard({ product }: LibraryProductCardProps) {
  return (
    <Card>
      <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden">
        {product.image ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <Package className="w-12 h-12 text-muted-foreground" />
        )}
      </div>
      <CardContent className="p-4 space-y-3">
        <div>
          <h4 className="font-medium text-foreground line-clamp-2">{product.name}</h4>
          <p className="text-sm text-muted-foreground mt-1">{product.shop}</p>
        </div>

        {product.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
        )}

        <div className="flex items-center justify-between">
          <p className="font-bold text-foreground">${Number(product.price).toLocaleString()}</p>
          <Badge variant="secondary">{product.type}</Badge>
        </div>

        <Button variant="outline" size="sm" className="w-full">
          <Copy className="w-4 h-4 mr-2" />
          Copy to Project
        </Button>
      </CardContent>
    </Card>
  );
}
