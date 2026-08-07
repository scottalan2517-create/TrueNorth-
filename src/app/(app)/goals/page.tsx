import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { hasFeature } from "@/lib/tiers";
import { UpsellEmptyState } from "@/components/ui/UpsellEmptyState";
import { Card } from "@/components/ui/Card";
import { GoalCard } from "./goal-card";
import { AddGoal } from "./add-goal";

export default async function GoalsPage() {
  const user = await requireUser();

  if (!hasFeature(user, "goals")) {
    return (
      <UpsellEmptyState
        title="Give your surplus a destination"
        body="TrueNorth Complete adds goal tracking that ties directly into your monthly Action Panel."
      />
    );
  }

  const goals = await db.goal.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" } });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-navy/45 text-sm">Goals</p>
        <h1 className="font-display text-2xl text-navy mt-0.5">{goals.length} in motion</h1>
      </div>

      {goals.length === 0 && (
        <Card className="text-center py-10">
          <p className="text-navy/50 text-sm">No goals yet. What are you saving for?</p>
        </Card>
      )}

      <div className="flex flex-col gap-3">
        {goals.map((g) => (
          <GoalCard
            key={g.id}
            id={g.id}
            name={g.name}
            kind={g.kind}
            targetAmount={g.targetAmount}
            currentAmount={g.currentAmount}
          />
        ))}
      </div>

      <AddGoal />
    </div>
  );
}
