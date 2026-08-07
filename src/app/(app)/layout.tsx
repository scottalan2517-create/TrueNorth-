import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { TopBar } from "@/components/nav/TopBar";
import { BottomNav } from "@/components/nav/BottomNav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  if (!user.onboardedAt) redirect("/onboarding");

  return (
    <div className="min-h-dvh bg-cream flex flex-col">
      <TopBar firstName={user.firstName} />
      <div className="mx-auto w-full max-w-lg flex-1 px-5 pb-28 pt-5">{children}</div>
      <BottomNav />
    </div>
  );
}
