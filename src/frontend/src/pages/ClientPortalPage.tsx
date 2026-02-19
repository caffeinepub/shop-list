import { useGetMyProjects } from '../hooks/useGetMyProjects';
import { useGetCallerUserProfile } from '../hooks/useGetCallerUserProfile';
import { Card, CardContent } from '../components/ui/card';
import SharedProjectView from '../components/SharedProjectView';

export default function ClientPortalPage() {
  const { data: projects, isLoading: projectsLoading } = useGetMyProjects();
  const { data: userProfile } = useGetCallerUserProfile();

  const isClient = userProfile?.role === 'client';

  if (projectsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your projects...</p>
        </div>
      </div>
    );
  }

  if (!isClient) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-foreground mb-2">Access Restricted</h2>
        <p className="text-muted-foreground">This portal is only available for client users</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Projects</h1>
        <p className="text-muted-foreground mt-1">View projects shared with you</p>
      </div>

      {projects && projects.length > 0 ? (
        <div className="space-y-6">
          {projects.map((project) => (
            <SharedProjectView key={project.id.toString()} project={project} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <h3 className="text-lg font-semibold text-foreground mb-2">No projects shared</h3>
            <p className="text-muted-foreground text-center">
              Your designer will share projects with you when they're ready
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
