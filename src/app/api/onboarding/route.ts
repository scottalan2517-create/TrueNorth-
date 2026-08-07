import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";

const debtSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["CREDIT_CARD", "STUDENT_LOAN", "AUTO_LOAN", "MORTGAGE", "PERSONAL_LOAN", "OTHER"]),
  balance: z.number().min(0),
  apr: z.number().min(0).max(100),
  minPayment: z.number().min(0),
});

const schema = z.object({
  monthlyTakeHomeIncome: z.number().min(0),
  monthlyEssentialSpend: z.number().min(0),
  cash: z.number().min(0),
  investments: z.number().min(0),
  retirement: z.number().min(0),
  realEstate: z.number().min(0),
  otherAssets: z.number().min(0),
  debts: z.array(debtSchema),
});

export async function POST(request: Request) {
  const user = await requireUser();
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  }

  const { debts, ...profileData } = parsed.data;

  await db.$transaction([
    db.financialProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        monthlyTakeHomeIncome: profileData.monthlyTakeHomeIncome,
        monthlyEssentialSpend: profileData.monthlyEssentialSpend,
      },
      update: {
        monthlyTakeHomeIncome: profileData.monthlyTakeHomeIncome,
        monthlyEssentialSpend: profileData.monthlyEssentialSpend,
      },
    }),
    db.netWorthSnapshot.create({
      data: {
        userId: user.id,
        cash: profileData.cash,
        investments: profileData.investments,
        retirement: profileData.retirement,
        realEstate: profileData.realEstate,
        otherAssets: profileData.otherAssets,
        creditCardDebt: sumDebtByType(debts, "CREDIT_CARD"),
        studentLoanDebt: sumDebtByType(debts, "STUDENT_LOAN"),
        mortgageDebt: sumDebtByType(debts, "MORTGAGE"),
        autoLoanDebt: sumDebtByType(debts, "AUTO_LOAN"),
        otherDebt: sumDebtByType(debts, "PERSONAL_LOAN") + sumDebtByType(debts, "OTHER"),
        note: "Starting snapshot from onboarding",
      },
    }),
    ...debts.map((d, i) =>
      db.debtAccount.create({
        data: { userId: user.id, sortOrder: i, ...d },
      }),
    ),
    db.user.update({ where: { id: user.id }, data: { onboardedAt: new Date() } }),
  ]);

  return NextResponse.json({ ok: true });
}

function sumDebtByType(debts: z.infer<typeof debtSchema>[], type: string) {
  return debts.filter((d) => d.type === type).reduce((sum, d) => sum + d.balance, 0);
}
