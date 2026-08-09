// Plus members get an honest record of what's actually shipped — update
// this alongside real changes, not on a marketing schedule.
export interface ChangelogEntry {
  date: string; // "2026-08-08"
  title: string;
  body: string;
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    date: "2026-08-08",
    title: "Fragility ring now flags what it can't see",
    body: "The Fragility Score only ever measures cash against essential spend — on purpose. Now it wears a thin accent halo when your Priority is worse than the ring alone would suggest, so debt or a thin buffer doesn't hide behind a green ring.",
  },
  {
    date: "2026-08-08",
    title: "Money Date history & streaks",
    body: "Complete now keeps every Money Date entry in one place, with a running streak. Twelve sentences a year tells your story — now you can actually read it back.",
  },
  {
    date: "2026-08-08",
    title: "This page",
    body: "Plus members get a real changelog instead of a promise. New engine updates and modules land here as they ship.",
  },
  {
    date: "2026-08-07",
    title: "TrueNorth is live",
    body: "All four engines, net worth tracking, the debt payoff planner, and the Money Date ritual — out of Notion and into its own app.",
  },
];
