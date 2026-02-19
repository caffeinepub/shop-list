import { useState } from 'react';
import { useParams, Link } from '@tanstack/react-router';
import { useGetAllTasks } from '../hooks/useGetAllTasks';
import { Button } from '../components/ui/button';
import { ArrowLeft, Plus } from 'lucide-react';
import TaskKanbanBoard from '../components/TaskKanbanBoard';
import AddTaskModal from '../components/AddTaskModal';

export default function TasksPage() {
  const { projectId } = useParams({ from: '/projects/$projectId/tasks' });
  const { data: tasks, isLoading } = useGetAllTasks(BigInt(projectId));
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/projects/$projectId" params={{ projectId }}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground">Tasks</h1>
          <p className="text-muted-foreground mt-1">Manage project tasks and deadlines</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </Button>
      </div>

      <TaskKanbanBoard tasks={tasks || []} />

      <AddTaskModal open={isAddModalOpen} onOpenChange={setIsAddModalOpen} projectId={BigInt(projectId)} />
    </div>
  );
}
