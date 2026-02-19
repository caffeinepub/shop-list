import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useAddShoppingList } from '../hooks/useAddShoppingList';

interface AddShoppingListModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddShoppingListModal({ open, onOpenChange }: AddShoppingListModalProps) {
  const [name, setName] = useState('');
  const [shop, setShop] = useState('');
  const [discount, setDiscount] = useState('');

  const { mutate: addShoppingList, isPending } = useAddShoppingList();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addShoppingList(
      {
        id: BigInt(Date.now()),
        name,
        total: BigInt(0),
        discount: BigInt(discount || '0'),
        shop,
        products: [],
        status: 'Draft',
      },
      {
        onSuccess: () => {
          setName('');
          setShop('');
          setDiscount('');
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Shopping List</DialogTitle>
          <DialogDescription>Create a new shopping list for products</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">List Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Furniture Order - March 2026"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="shop">Shop/Supplier</Label>
            <Input
              id="shop"
              value={shop}
              onChange={(e) => setShop(e.target.value)}
              placeholder="IKEA, West Elm, etc."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="discount">Discount (%)</Label>
            <Input
              id="discount"
              type="number"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              placeholder="10"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="flex-1">
              {isPending ? 'Creating...' : 'Create List'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
