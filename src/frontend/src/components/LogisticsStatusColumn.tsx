import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import LogisticsProductCard from './LogisticsProductCard';
import { Product } from '../backend';

interface LogisticsStatusColumnProps {
  status: string;
  products: Product[];
}

export default function LogisticsStatusColumn({ status, products }: LogisticsStatusColumnProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="capitalize text-base flex items-center justify-between">
          <span>{status}</span>
          <span className="text-sm font-normal text-muted-foreground">({products.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {products.length > 0 ? (
          products.map((product) => <LogisticsProductCard key={product.id.toString()} product={product} />)
        ) : (
          <p className="text-center text-muted-foreground py-8 text-sm">No items</p>
        )}
      </CardContent>
    </Card>
  );
}
