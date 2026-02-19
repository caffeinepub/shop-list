import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { calculateBudgetPercentage } from '../utils/budgetCalculations';

interface BudgetProgressBarProps {
  spent: bigint;
  budget: bigint;
}

export default function BudgetProgressBar({ spent, budget }: BudgetProgressBarProps) {
  const percentage = calculateBudgetPercentage(spent, budget);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Usage</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Progress</span>
            <span className="text-sm font-medium text-foreground">{percentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-4">
            <div
              className={`h-4 rounded-full transition-all ${
                percentage >= 100 ? 'bg-destructive' : percentage >= 80 ? 'bg-chart-4' : 'bg-primary'
              }`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>$0</span>
            <span>${Number(budget).toLocaleString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
