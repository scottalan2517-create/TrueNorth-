import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { hasFeature } from "@/lib/tiers";
import { UpsellEmptyState } from "@/components/ui/UpsellEmptyState";
import { Card, MonoLabel } from "@/components/ui/Card";
import { CategoryRow } from "./category-row";
import { AddCategory } from "./add-category";
import { format } from "date-fns";

const GROUP_LABEL: Record<string, string> = {
  ESSENTIALS: "Essentials",
  LIFESTYLE: "Lifestyle",
  SAVINGS_AND_DEBT: "Savings & Debt",
};
const GROUP_ORDER = ["ESSENTIALS", "LIFESTYLE", "SAVINGS_AND_DEBT"];

export default async function BudgetPage() {
  const user = await requireUser();

  if (!hasFeature(user, "budget")) {
    return (
      <UpsellEmptyState
        title="Plan every dollar, on purpose"
        body="TrueNorth Complete adds full category budgeting — planned vs. actual, tied straight into your Action Panel."
      />
    );
  }

  const month = format(new Date(), "yyyy-MM");
  const categories = await db.budgetCategory.findMany({
    where: { userId: user.id },
    orderBy: { sortOrder: "asc" },
    include: { actuals: { where: { month } } },
  });

  const totalPlanned = categories.reduce((s, c) => s + c.monthlyPlanned, 0);
  const totalActual = categories.reduce((s, c) => s + (c.actuals[0]?.amount ?? 0), 0);

  const grouped = GROUP_ORDER.map((g) => ({
    group: g,
    categories: categories.filter((c) => c.group === g),
  })).filter((g) => g.categories.length > 0);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-navy/45 text-sm">Budget · {format(new Date(), "MMMM yyyy")}</p>
        <h1 className="font-display text-2xl text-navy mt-0.5">
          ${totalActual.toLocaleString()}{" "}
          <span className="text-navy/35 text-lg font-sans">of ${totalPlanned.toLocaleString()}</span>
        </h1>
      </div>

      {grouped.length === 0 ? (
        <Card className="text-center py-10">
          <p className="text-navy/50 text-sm">No categories yet. Add your first one below.</p>
        </Card>
      ) : (
        grouped.map(({ group, categories: cats }) => (
          <Card key={group}>
            <MonoLabel className="text-navy/40 mb-1 block">{GROUP_LABEL[group]}</MonoLabel>
            <div className="divide-y divide-navy/8">
              {cats.map((c) => (
                <CategoryRow
                  key={c.id}
                  id={c.id}
                  name={c.name}
                  planned={c.monthlyPlanned}
                  actual={c.actuals[0]?.amount ?? 0}
                  month={month}
                />
              ))}
            </div>
          </Card>
        ))
      )}

      <AddCategory />
    </div>
  );
}
