import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Calendar, DollarSign } from 'lucide-react';
import { Project } from '../backend';
import { calculateTotalSpent } from '../utils/budgetCalculations';

interface SharedProjectViewProps {
  project: Project;
}

export default function SharedProjectView({ project }: SharedProjectViewProps) {
  const totalSpent = calculateTotalSpent(project);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">{project.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{project.timeline}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <DollarSign className="w-4 h-4" />
            <span>
              Budget: ${Number(totalSpent).toLocaleString()} / ${Number(project.budget).toLocaleString()}
            </span>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-foreground mb-3">Rooms</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {project.rooms.map((room) => (
              <div key={room.id.toString()} className="p-3 bg-muted rounded-md">
                <p className="font-medium text-foreground">{room.name}</p>
                <p className="text-sm text-muted-foreground">{room.category}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground italic">
            This is a read-only view. Contact your designer for changes or questions.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
