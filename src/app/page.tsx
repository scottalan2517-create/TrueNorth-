import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { LandingPage } from "@/components/landing/LandingPage";

export default async function RootPage() {
  const user = await getCurrentUser();
  if (!user) return <LandingPage />;
  redirect(user.onboardedAt ? "/dashboard" : "/onboarding");
}
