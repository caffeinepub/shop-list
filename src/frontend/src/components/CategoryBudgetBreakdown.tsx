import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Project } from '../backend';
import { calculateCategoryBudgets } from '../utils/budgetCalculations';

interface CategoryBudgetBreakdownProps {
  project: Project;
}

export default function CategoryBudgetBreakdown({ project }: CategoryBudgetBreakdownProps) {
  const categoryBudgets = calculateCategoryBudgets(project);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Category Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Object.entries(categoryBudgets).map(([category, amount]) => (
            <div key={category} className="flex items-center justify-between p-3 bg-muted rounded-md">
              <p className="font-medium text-foreground capitalize">{category}</p>
              <p className="font-medium text-foreground">${amount.toLocaleString()}</p>
            </div>
          ))}
          {Object.keys(categoryBudgets).length === 0 && (
            <p className="text-center text-muted-foreground py-8">No products categorized yet</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
