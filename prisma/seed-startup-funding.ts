import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DIRECT_URL } },
});

function parseAmount(raw: string): number | null {
  if (!raw) return null;
  const cleaned = raw.replace(/[^0-9.]/g, '');
  const val = parseFloat(cleaned);
  return isNaN(val) ? null : val;
}

async function main() {
  const csvPath = path.join(__dirname, 'data', 'startup_funding.csv');
  if (!fs.existsSync(csvPath)) {
    console.error(`CSV not found at ${csvPath}. Download from Kaggle and place it in prisma/data/.`);
    process.exit(1);
  }

  const content = fs.readFileSync(csvPath, 'utf-8');
  const records = parse(content, { columns: true, skip_empty_lines: true, trim: true }) as Record<string, string>[];

  console.log(`Seeding ${records.length} funding records…`);

  await prisma.startupFundingRecord.deleteMany();

  const BATCH = 100;
  for (let i = 0; i < records.length; i += BATCH) {
    const batch = records.slice(i, i + BATCH);
    await prisma.startupFundingRecord.createMany({
      data: batch.map((row) => {
        const investors = (row['Investors'] || row['investors'] || '')
          .split(',')
          .map((s: string) => s.trim())
          .filter(Boolean);

        const rawDate = row['Date'] || row['date'] || row['funding_date'] || '';
        let fundingDate: Date | null = null;
        try { fundingDate = rawDate ? new Date(rawDate) : null; } catch { fundingDate = null; }

        return {
          startupName: row['Startup Name'] || row['startup_name'] || row['company'] || 'Unknown',
          sector: row['Sector'] || row['sector'] || row['industry'] || null,
          state: row['State'] || row['state'] || row['city'] || null,
          fundingRound: row['Funding Round'] || row['funding_round'] || row['stage'] || null,
          amount: parseAmount(row['Amount'] || row['amount'] || ''),
          amountCurrency: row['Currency'] || row['currency'] || 'INR',
          investors: investors.length ? investors : [],
          fundingDate: fundingDate && !isNaN(fundingDate.getTime()) ? fundingDate : null,
        };
      }),
      skipDuplicates: true,
    });
    process.stdout.write(`\r${Math.min(i + BATCH, records.length)}/${records.length}`);
  }

  console.log('\nDone.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
