import { useParams, Link } from '@tanstack/react-router';
import { useGetProject } from '../hooks/useGetProject';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import BudgetProgressBar from '../components/BudgetProgressBar';
import CategoryBudgetBreakdown from '../components/CategoryBudgetBreakdown';
import { calculateTotalSpent, calculateRoomBudgets, calculateBudgetPercentage } from '../utils/budgetCalculations';

export default function BudgetOverviewPage() {
  const { projectId } = useParams({ from: '/projects/$projectId/budget' });
  const { data: project, isLoading } = useGetProject(BigInt(projectId));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading budget...</p>
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

  const totalSpent = calculateTotalSpent(project);
  const roomBudgets = calculateRoomBudgets(project);
  const percentage = calculateBudgetPercentage(totalSpent, project.budget);
  const isOverBudget = percentage > 100;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/projects/$projectId" params={{ projectId }}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Budget Overview</h1>
          <p className="text-muted-foreground mt-1">{project.name}</p>
        </div>
      </div>

      {isOverBudget && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-destructive">Budget Exceeded</h3>
            <p className="text-sm text-muted-foreground mt-1">
              This project is ${(Number(totalSpent) - Number(project.budget)).toLocaleString()} over budget
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">${Number(project.budget).toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">${Number(totalSpent).toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Remaining</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-3xl font-bold ${isOverBudget ? 'text-destructive' : 'text-foreground'}`}>
              ${(Number(project.budget) - Number(totalSpent)).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      <BudgetProgressBar spent={totalSpent} budget={project.budget} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Room Breakdown</CardTitle>
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
              {roomBudgets.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No rooms added yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        <CategoryBudgetBreakdown project={project} />
      </div>
    </div>
  );
}
