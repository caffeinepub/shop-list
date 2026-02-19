import { useParams, Link } from '@tanstack/react-router';
import { useGetMoodboards } from '../hooks/useGetMoodboards';
import { Button } from '../components/ui/button';
import { ArrowLeft, Plus } from 'lucide-react';
import MoodboardCard from '../components/MoodboardCard';

export default function MoodboardsPage() {
  const { projectId } = useParams({ from: '/projects/$projectId/moodboards' });
  const { data: moodboards, isLoading } = useGetMoodboards(BigInt(projectId));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading moodboards...</p>
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
          <h1 className="text-3xl font-bold text-foreground">Moodboards</h1>
          <p className="text-muted-foreground mt-1">Visual inspiration boards for your project</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Moodboard
        </Button>
      </div>

      {moodboards && moodboards.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {moodboards.map((moodboard) => (
            <MoodboardCard key={moodboard.id.toString()} moodboard={moodboard} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-muted/30 rounded-lg border-2 border-dashed border-border">
          <h3 className="text-lg font-semibold text-foreground mb-2">No moodboards yet</h3>
          <p className="text-muted-foreground mb-4">Create inspiration boards linked to real products</p>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create First Moodboard
          </Button>
        </div>
      )}
    </div>
  );
}
