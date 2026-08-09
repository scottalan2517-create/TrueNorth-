import { z } from "zod";

const EXPECTED_COLUMNS = [
  "date",
  "cash",
  "investments",
  "retirement",
  "realestate",
  "otherassets",
  "creditcarddebt",
  "studentloandebt",
  "mortgagedebt",
  "autoloandebt",
  "otherdebt",
] as const;

const rowSchema = z.object({
  date: z.coerce.date(),
  cash: z.coerce.number().min(0),
  investments: z.coerce.number().min(0),
  retirement: z.coerce.number().min(0),
  realEstate: z.coerce.number().min(0),
  otherAssets: z.coerce.number().min(0),
  creditCardDebt: z.coerce.number().min(0),
  studentLoanDebt: z.coerce.number().min(0),
  mortgageDebt: z.coerce.number().min(0),
  autoLoanDebt: z.coerce.number().min(0),
  otherDebt: z.coerce.number().min(0),
  note: z.string().max(280).optional(),
});

export type ImportedSnapshot = z.infer<typeof rowSchema>;

// Minimal CSV line splitter: handles double-quoted fields (with "" escapes)
// so exported files — and anything a spreadsheet re-saves — round-trip.
function splitCsvLine(line: string): string[] {
  const fields: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      fields.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  fields.push(cur);
  return fields.map((f) => f.trim());
}

export const MAX_IMPORT_ROWS = 1000;

export function parseNetWorthCsv(text: string): { rows: ImportedSnapshot[]; errors: string[] } {
  const lines = text.split(/\r\n|\r|\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) {
    return { rows: [], errors: ["The file is empty."] };
  }

  const header = splitCsvLine(lines[0]).map((h) => h.toLowerCase());
  const missing = EXPECTED_COLUMNS.filter((c) => !header.includes(c));
  if (missing.length > 0) {
    return { rows: [], errors: [`Missing column(s): ${missing.join(", ")}. Use the exported CSV format.`] };
  }

  const dataLines = lines.slice(1).slice(0, MAX_IMPORT_ROWS);
  const errors: string[] = [];
  const rows: ImportedSnapshot[] = [];

  dataLines.forEach((line, i) => {
    const fields = splitCsvLine(line);
    const byCol: Record<string, string> = {};
    header.forEach((col, idx) => (byCol[col] = fields[idx] ?? ""));

    const parsed = rowSchema.safeParse({
      date: byCol.date,
      cash: byCol.cash,
      investments: byCol.investments,
      retirement: byCol.retirement,
      realEstate: byCol.realestate,
      otherAssets: byCol.otherassets,
      creditCardDebt: byCol.creditcarddebt,
      studentLoanDebt: byCol.studentloandebt,
      mortgageDebt: byCol.mortgagedebt,
      autoLoanDebt: byCol.autoloandebt,
      otherDebt: byCol.otherdebt,
      note: byCol.note || undefined,
    });

    if (!parsed.success) {
      errors.push(`Row ${i + 2}: ${parsed.error.issues[0]?.message ?? "invalid value"}`);
      return;
    }
    rows.push(parsed.data);
  });

  return { rows, errors };
}
