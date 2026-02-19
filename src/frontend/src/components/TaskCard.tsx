import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Calendar, User, AlertCircle } from 'lucide-react';
import { Task } from '../backend';

interface TaskCardProps {
  task: Task;
}

export default function TaskCard({ task }: TaskCardProps) {
  const isOverdue = new Date(task.deadline) < new Date() && task.status !== 'completed';

  return (
    <Card className={isOverdue ? 'border-destructive' : ''}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-medium text-foreground">{task.title}</h4>
          {isOverdue && <AlertCircle className="w-4 h-4 text-destructive shrink-0" />}
        </div>

        {task.description && <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>}

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span className={isOverdue ? 'text-destructive font-medium' : ''}>{task.deadline}</span>
          </div>

          {task.assigned && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="w-4 h-4" />
              <span>{task.assigned}</span>
            </div>
          )}

          <Badge variant="secondary" className="capitalize">
            {task.type}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
