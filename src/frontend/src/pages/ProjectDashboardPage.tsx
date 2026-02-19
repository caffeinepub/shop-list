import { useParams, Link } from '@tanstack/react-router';
import { useGetProject } from '../hooks/useGetProject';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ArrowLeft, ShoppingCart, CheckSquare, Image, Truck, DollarSign, Home } from 'lucide-react';
import BudgetSummaryCard from '../components/BudgetSummaryCard';
import RoomBudgetList from '../components/RoomBudgetList';

export default function ProjectDashboardPage() {
  const { projectId } = useParams({ from: '/projects/$projectId' });
  const { data: project, isLoading } = useGetProject(BigInt(projectId));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-foreground mb-2">Project not found</h2>
        <p className="text-muted-foreground mb-4">The project you're looking for doesn't exist</p>
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
        <Link to="/projects">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">{project.name}</h1>
          <p className="text-muted-foreground mt-1">Client ID: {project.clientId.toString()} • {project.timeline}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BudgetSummaryCard project={project} />

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Link to="/projects/$projectId/rooms" params={{ projectId }}>
              <Button variant="outline" className="w-full justify-start">
                <Home className="w-4 h-4 mr-2" />
                Rooms
              </Button>
            </Link>
            <Link to="/shopping-lists">
              <Button variant="outline" className="w-full justify-start">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Shopping Lists
              </Button>
            </Link>
            <Link to="/projects/$projectId/tasks" params={{ projectId }}>
              <Button variant="outline" className="w-full justify-start">
                <CheckSquare className="w-4 h-4 mr-2" />
                Tasks
              </Button>
            </Link>
            <Link to="/projects/$projectId/moodboards" params={{ projectId }}>
              <Button variant="outline" className="w-full justify-start">
                <Image className="w-4 h-4 mr-2" />
                Moodboards
              </Button>
            </Link>
            <Link to="/projects/$projectId/budget" params={{ projectId }}>
              <Button variant="outline" className="w-full justify-start">
                <DollarSign className="w-4 h-4 mr-2" />
                Budget
              </Button>
            </Link>
            <Link to="/logistics">
              <Button variant="outline" className="w-full justify-start">
                <Truck className="w-4 h-4 mr-2" />
                Logistics
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <RoomBudgetList project={project} />
    </div>
  );
}
