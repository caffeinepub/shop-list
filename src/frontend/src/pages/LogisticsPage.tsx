import { useGetShoppingLists } from '../hooks/useGetShoppingLists';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import LogisticsStatusColumn from '../components/LogisticsStatusColumn';
import { Product } from '../backend';

export default function LogisticsPage() {
  const { data: shoppingLists, isLoading } = useGetShoppingLists();

  const allProducts: Product[] = shoppingLists?.flatMap((list) => list.products) || [];

  const statuses = ['planned', 'ordered', 'in transit', 'delivered', 'installed'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading logistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Logistics Tracking</h1>
        <p className="text-muted-foreground mt-1">Track product orders from planning to installation</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {statuses.map((status) => {
          const products = allProducts.filter((p) => p.status.toLowerCase() === status);
          return <LogisticsStatusColumn key={status} status={status} products={products} />;
        })}
      </div>
    </div>
  );
}
