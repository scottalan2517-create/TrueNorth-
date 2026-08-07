import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, MonoLabel } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { ProfileForm } from "@/components/settings/ProfileForm";
import { SignOutButton } from "@/components/settings/SignOutButton";
import { PortalButton } from "@/components/settings/PortalButton";
import { ChangePasswordForm } from "@/components/settings/ChangePasswordForm";
import { DeleteAccountSection } from "@/components/settings/DeleteAccountSection";
import { hasFeature, TIERS } from "@/lib/tiers";
import { Download } from "lucide-react";

export default async function SettingsPage() {
  const user = await requireUser();
  const profile = await db.financialProfile.findUnique({ where: { userId: user.id } });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-navy/45 text-sm">Settings</p>
        <h1 className="font-display text-xl text-navy mt-0.5 break-all">{user.email}</h1>
      </div>

      <Card>
        <MonoLabel className="text-navy/40 mb-2 block">Your Plan</MonoLabel>
        <p className="font-display text-lg text-navy">
          {user.tier ? TIERS[user.tier].name : "No plan yet"}
          {user.plusActive && " + Plus"}
        </p>
        <div className="flex flex-col gap-2 mt-4">
          {(!user.tier || user.tier === "STARTER" || !user.plusActive) && (
            <LinkButton href="/settings/upgrade" variant="gold">
              {user.tier ? "Upgrade or add Plus" : "Choose a plan"}
            </LinkButton>
          )}
          {user.stripeCustomerId && <PortalButton />}
        </div>
      </Card>

      <Card>
        <MonoLabel className="text-navy/40 mb-3 block">Financial Profile</MonoLabel>
        <ProfileForm
          income={profile?.monthlyTakeHomeIncome ?? 0}
          essentials={profile?.monthlyEssentialSpend ?? 0}
          highInterestAprCutoff={profile?.highInterestAprCutoff ?? 8}
          defaultConsistencyPct={profile?.defaultConsistencyPct ?? 85}
        />
      </Card>

      <Card>
        <MonoLabel className="text-navy/40 mb-3 block">Security</MonoLabel>
        <ChangePasswordForm />
      </Card>

      <Card>
        <MonoLabel className="text-navy/40 mb-3 block">Data</MonoLabel>
        {hasFeature(user, "csv_export") ? (
          <a
            href="/api/export/csv"
            className="flex items-center gap-2 text-sm font-semibold text-navy"
          >
            <Download size={15} /> Export net worth history (CSV)
          </a>
        ) : (
          <p className="text-sm text-navy/45">
            CSV export is part of{" "}
            <Link href="/settings/upgrade" className="text-gold font-medium">
              TrueNorth Complete
            </Link>
            .
          </p>
        )}
      </Card>

      <SignOutButton />

      <Card>
        <MonoLabel className="text-red/70 mb-3 block">Danger Zone</MonoLabel>
        <DeleteAccountSection />
      </Card>
    </div>
  );
}
