import { Project, Room } from '../backend';

export function calculateTotalSpent(project: Project): bigint {
  let total = BigInt(0);
  for (const room of project.rooms) {
    for (const product of room.products) {
      total += product.price * product.quantity;
    }
  }
  return total;
}

export function calculateRoomBudgets(project: Project): Array<{
  id: bigint;
  name: string;
  category: string;
  budget: bigint;
  spent: number;
}> {
  return project.rooms.map((room) => {
    const spent = room.products.reduce(
      (sum, product) => sum + Number(product.price) * Number(product.quantity),
      0
    );
    return {
      id: room.id,
      name: room.name,
      category: room.category,
      budget: room.budget,
      spent,
    };
  });
}

export function calculateCategoryBudgets(project: Project): Record<string, number> {
  const categories: Record<string, number> = {};

  for (const room of project.rooms) {
    for (const product of room.products) {
      const category = room.category || 'Uncategorized';
      const cost = Number(product.price) * Number(product.quantity);
      categories[category] = (categories[category] || 0) + cost;
    }
  }

  return categories;
}

export function calculateBudgetPercentage(spent: bigint, budget: bigint): number {
  if (budget === BigInt(0)) return 0;
  return (Number(spent) / Number(budget)) * 100;
}
