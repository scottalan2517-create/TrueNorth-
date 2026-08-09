import { requireUser } from "@/lib/auth";
import { hasFeature } from "@/lib/tiers";
import { UpsellEmptyState } from "@/components/ui/UpsellEmptyState";
import { Card, MonoLabel } from "@/components/ui/Card";
import { CHANGELOG } from "@/lib/changelog";
import { format, parseISO } from "date-fns";

export default async function ChangelogPage() {
  const user = await requireUser();

  if (!hasFeature(user, "changelog")) {
    return (
      <UpsellEmptyState
        title="Know what's new, first"
        body="TrueNorth Plus includes ongoing engine updates and new modules as they ship — this page is where you'll see them land."
        cta="Add Plus →"
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-navy/45 text-sm">Plus</p>
        <h1 className="font-display text-2xl text-navy mt-0.5">What&rsquo;s new</h1>
      </div>

      <div className="flex flex-col gap-3">
        {CHANGELOG.map((entry, i) => (
          <Card key={i}>
            <MonoLabel className="text-gold">{format(parseISO(entry.date), "MMMM d, yyyy")}</MonoLabel>
            <p className="font-display text-lg text-navy mt-1">{entry.title}</p>
            <p className="text-navy/60 text-sm mt-1.5 leading-relaxed">{entry.body}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
