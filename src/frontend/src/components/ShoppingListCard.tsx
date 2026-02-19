import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ChevronDown, ChevronUp, Store } from 'lucide-react';
import { ShoppingList } from '../backend';
import ProductCard from './ProductCard';

interface ShoppingListCardProps {
  shoppingList: ShoppingList;
}

export default function ShoppingListCard({ shoppingList }: ShoppingListCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl">{shoppingList.name}</CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Store className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{shoppingList.shop}</span>
            </div>
          </div>
          <Badge>{shoppingList.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-lg font-bold text-foreground">${Number(shoppingList.total).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Discount</p>
            <p className="text-lg font-bold text-foreground">{Number(shoppingList.discount)}%</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Products</p>
            <p className="text-lg font-bold text-foreground">{shoppingList.products.length}</p>
          </div>
        </div>

        {shoppingList.products.length > 0 && (
          <div className="pt-4 border-t border-border">
            <Button
              variant="ghost"
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full justify-between"
            >
              <span>View Products</span>
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>

            {isExpanded && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {shoppingList.products.map((product) => (
                  <ProductCard key={product.id.toString()} product={product} />
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
