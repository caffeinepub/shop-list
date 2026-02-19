import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Home } from 'lucide-react';
import { Project } from '../backend';
import { calculateRoomBudgets } from '../utils/budgetCalculations';

interface RoomBudgetListProps {
  project: Project;
}

export default function RoomBudgetList({ project }: RoomBudgetListProps) {
  const roomBudgets = calculateRoomBudgets(project);

  if (project.rooms.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="w-5 h-5" />
            Rooms
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">No rooms added yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Home className="w-5 h-5" />
          Rooms & Budgets
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {roomBudgets.map((room) => (
            <div key={room.id.toString()} className="flex items-center justify-between p-3 bg-muted rounded-md">
              <div>
                <p className="font-medium text-foreground">{room.name}</p>
                <p className="text-sm text-muted-foreground">{room.category}</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-foreground">${room.spent.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">of ${Number(room.budget).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
