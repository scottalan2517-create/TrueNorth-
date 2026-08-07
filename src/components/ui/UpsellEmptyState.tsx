import { LinkButton } from "@/components/ui/Button";
import { Compass } from "@/components/ui/Compass";

export function UpsellEmptyState({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <div className="rise-in flex flex-col items-center text-center gap-4 rounded-2xl border border-gold/20 bg-navy px-6 py-12 text-cream">
      <Compass size={36} />
      <div>
        <h2 className="font-display text-xl">{title}</h2>
        <p className="text-cream/60 text-sm mt-2 leading-relaxed max-w-xs">{body}</p>
      </div>
      <LinkButton href="/settings/upgrade" variant="gold">
        Upgrade to Complete →
      </LinkButton>
    </div>
  );
}
