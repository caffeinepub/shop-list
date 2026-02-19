import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { Project } from '../backend';
import { calculateTotalSpent, calculateBudgetPercentage } from '../utils/budgetCalculations';

interface BudgetSummaryCardProps {
  project: Project;
}

export default function BudgetSummaryCard({ project }: BudgetSummaryCardProps) {
  const totalSpent = calculateTotalSpent(project);
  const remaining = Number(project.budget) - Number(totalSpent);
  const percentage = calculateBudgetPercentage(totalSpent, project.budget);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Budget Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Total Budget</p>
            <p className="text-2xl font-bold text-foreground">${Number(project.budget).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Spent</p>
            <p className="text-2xl font-bold text-foreground">${Number(totalSpent).toLocaleString()}</p>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Budget Usage</span>
            <span className="text-sm font-medium text-foreground">{percentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all ${
                percentage >= 100 ? 'bg-destructive' : percentage >= 80 ? 'bg-chart-4' : 'bg-primary'
              }`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
        </div>

        <div className={`flex items-center gap-2 p-3 rounded-md ${remaining < 0 ? 'bg-destructive/10' : 'bg-muted'}`}>
          {remaining < 0 ? (
            <>
              <AlertCircle className="w-5 h-5 text-destructive" />
              <div>
                <p className="text-sm font-medium text-destructive">Over Budget</p>
                <p className="text-sm text-muted-foreground">${Math.abs(remaining).toLocaleString()} over</p>
              </div>
            </>
          ) : (
            <>
              <TrendingUp className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">Remaining</p>
                <p className="text-sm text-muted-foreground">${remaining.toLocaleString()}</p>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
