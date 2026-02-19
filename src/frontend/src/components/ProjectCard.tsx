import { Link } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Calendar, DollarSign, Users } from 'lucide-react';
import { Project } from '../backend';
import { calculateTotalSpent } from '../utils/budgetCalculations';

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const totalSpent = calculateTotalSpent(project);
  const budgetPercentage = project.budget > 0 ? (Number(totalSpent) / Number(project.budget)) * 100 : 0;

  const getBudgetStatus = () => {
    if (budgetPercentage >= 100) return { color: 'destructive', label: 'Over Budget' };
    if (budgetPercentage >= 80) return { color: 'default', label: 'Warning' };
    return { color: 'secondary', label: 'On Track' };
  };

  const budgetStatus = getBudgetStatus();

  return (
    <Link to="/projects/$projectId" params={{ projectId: project.id.toString() }}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle className="text-xl">{project.name}</CardTitle>
            <Badge variant={budgetStatus.color as any}>{budgetStatus.label}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>Client ID: {project.clientId.toString()}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{project.timeline}</span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <DollarSign className="w-4 h-4" />
                <span>Budget</span>
              </div>
              <span className="font-medium text-foreground">
                ${Number(totalSpent).toLocaleString()} / ${Number(project.budget).toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  budgetPercentage >= 100
                    ? 'bg-destructive'
                    : budgetPercentage >= 80
                    ? 'bg-chart-4'
                    : 'bg-primary'
                }`}
                style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
              />
            </div>
          </div>

          <div className="pt-2 border-t border-border">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Rooms</span>
              <span className="font-medium text-foreground">{project.rooms.length}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
