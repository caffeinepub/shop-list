import { useState } from 'react';
import { useParams, Link } from '@tanstack/react-router';
import { useGetProject } from '../hooks/useGetProject';
import { Button } from '../components/ui/button';
import { ArrowLeft, Plus } from 'lucide-react';
import RoomCard from '../components/RoomCard';
import AddRoomModal from '../components/AddRoomModal';

export default function RoomsPage() {
  const { projectId } = useParams({ from: '/projects/$projectId/rooms' });
  const { data: project, isLoading } = useGetProject(BigInt(projectId));
  const [isAddRoomModalOpen, setIsAddRoomModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading rooms...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-foreground mb-2">Project not found</h2>
        <Link to="/projects">
          <Button>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Button>
        </Link>
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
          <h1 className="text-3xl font-bold text-foreground">Rooms</h1>
          <p className="text-muted-foreground mt-1">{project.name}</p>
        </div>
        <Button onClick={() => setIsAddRoomModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Room
        </Button>
      </div>

      {project.rooms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {project.rooms.map((room) => (
            <RoomCard key={room.id.toString()} room={room} projectId={project.id} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-muted/30 rounded-lg border-2 border-dashed border-border">
          <h3 className="text-lg font-semibold text-foreground mb-2">No rooms yet</h3>
          <p className="text-muted-foreground mb-4">Add rooms to organize products and costs</p>
          <Button onClick={() => setIsAddRoomModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add First Room
          </Button>
        </div>
      )}

      <AddRoomModal
        open={isAddRoomModalOpen}
        onOpenChange={setIsAddRoomModalOpen}
        projectId={BigInt(projectId)}
      />
    </div>
  );
}
