import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import TaskCard from './TaskCard';
import { Task } from '../backend';

interface TaskKanbanBoardProps {
  tasks: Task[];
}

export default function TaskKanbanBoard({ tasks }: TaskKanbanBoardProps) {
  const statuses = ['pending', 'in progress', 'completed'];

  const tasksByStatus = statuses.map((status) => ({
    status,
    tasks: tasks.filter((task) => task.status.toLowerCase() === status),
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {tasksByStatus.map(({ status, tasks }) => (
        <Card key={status}>
          <CardHeader>
            <CardTitle className="capitalize flex items-center justify-between">
              <span>{status}</span>
              <span className="text-sm font-normal text-muted-foreground">({tasks.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {tasks.length > 0 ? (
              tasks.map((task) => <TaskCard key={task.id.toString()} task={task} />)
            ) : (
              <p className="text-center text-muted-foreground py-8 text-sm">No tasks</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
