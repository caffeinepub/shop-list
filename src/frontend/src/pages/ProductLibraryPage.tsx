import { useState } from 'react';
import { useGetProductLibrary } from '../hooks/useGetProductLibrary';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Plus } from 'lucide-react';
import LibraryProductCard from '../components/LibraryProductCard';

export default function ProductLibraryPage() {
  const { data: products, isLoading } = useGetProductLibrary();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = products?.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading product library...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Product Library</h1>
          <p className="text-muted-foreground mt-1">Your collection of reusable products</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      <Input
        placeholder="Search products..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="max-w-sm"
      />

      {filteredProducts && filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <LibraryProductCard key={product.id.toString()} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-muted/30 rounded-lg border-2 border-dashed border-border">
          <h3 className="text-lg font-semibold text-foreground mb-2">No products in library</h3>
          <p className="text-muted-foreground mb-4">Add frequently used products for quick access</p>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add First Product
          </Button>
        </div>
      )}
    </div>
  );
}
