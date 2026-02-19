import { useState } from 'react';
import { useGetShoppingLists } from '../hooks/useGetShoppingLists';
import { Button } from '../components/ui/button';
import { Plus } from 'lucide-react';
import ShoppingListCard from '../components/ShoppingListCard';
import AddShoppingListModal from '../components/AddShoppingListModal';

export default function ShoppingListPage() {
  const { data: shoppingLists, isLoading } = useGetShoppingLists();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading shopping lists...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Shopping Lists</h1>
          <p className="text-muted-foreground mt-1">Manage products and purchases</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New List
        </Button>
      </div>

      {shoppingLists && shoppingLists.length > 0 ? (
        <div className="space-y-6">
          {shoppingLists.map((list) => (
            <ShoppingListCard key={list.id.toString()} shoppingList={list} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-muted/30 rounded-lg border-2 border-dashed border-border">
          <h3 className="text-lg font-semibold text-foreground mb-2">No shopping lists yet</h3>
          <p className="text-muted-foreground mb-4">Create your first shopping list to start tracking products</p>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Shopping List
          </Button>
        </div>
      )}

      <AddShoppingListModal open={isAddModalOpen} onOpenChange={setIsAddModalOpen} />
    </div>
  );
}
