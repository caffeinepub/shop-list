import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { useAddRoom } from '../hooks/useAddRoom';

interface AddRoomModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: bigint;
}

export default function AddRoomModal({ open, onOpenChange, projectId }: AddRoomModalProps) {
  const [name, setName] = useState('');
  const [area, setArea] = useState('');
  const [category, setCategory] = useState('');
  const [budget, setBudget] = useState('');
  const [notes, setNotes] = useState('');

  const { mutate: addRoom, isPending } = useAddRoom();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addRoom(
      {
        projectId,
        id: BigInt(Date.now()),
        name,
        area: BigInt(area || '0'),
        notes,
        category,
        budget: BigInt(budget || '0'),
        products: [],
      },
      {
        onSuccess: () => {
          setName('');
          setArea('');
          setCategory('');
          setBudget('');
          setNotes('');
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Room</DialogTitle>
          <DialogDescription>Add a new room to organize products and costs</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Room Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Living Room"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="area">Area (m²)</Label>
              <Input
                id="area"
                type="number"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="25"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget">Budget ($)</Label>
              <Input
                id="budget"
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="10000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Living Space"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes about this room..."
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="flex-1">
              {isPending ? 'Adding...' : 'Add Room'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
