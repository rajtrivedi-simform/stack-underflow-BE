import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DIRECT_URL } },
});

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .substring(0, 490);
}

async function main() {
  const csvPath = path.join(__dirname, 'data', 'updated_data.csv');
  if (!fs.existsSync(csvPath)) {
    console.error(`CSV not found at ${csvPath}. Download from Kaggle and place it in prisma/data/.`);
    process.exit(1);
  }

  const content = fs.readFileSync(csvPath, 'utf-8');
  const records = parse(content, { columns: true, skip_empty_lines: true, trim: true }) as Record<string, string>[];

  console.log(`Seeding ${records.length} scheme records…`);
  let upserted = 0;
  let skipped = 0;

  for (const row of records) {
    const schemeName = row['Scheme Name'] || row['scheme_name'] || row['name'] || '';
    if (!schemeName) { skipped++; continue; }

    const slug = slugify(schemeName);

    try {
      await prisma.scheme.upsert({
        where: { slug },
        update: {
          schemeName,
          details: row['Details'] || row['details'] || null,
          benefits: row['Benefits'] || row['benefits'] || null,
          eligibility: row['Eligibility'] || row['eligibility'] || null,
          application: row['Application Process'] || row['application_process'] || null,
          level: row['Level'] || row['level'] || 'CENTRAL',
          targetCategory: row['Target Category'] || row['target_category'] || null,
          applicationLink: row['Application Link'] || row['application_link'] || null,
          isActive: true,
        },
        create: {
          schemeName,
          slug,
          details: row['Details'] || row['details'] || null,
          benefits: row['Benefits'] || row['benefits'] || null,
          eligibility: row['Eligibility'] || row['eligibility'] || null,
          application: row['Application Process'] || row['application_process'] || null,
          documents: [],
          level: row['Level'] || row['level'] || 'CENTRAL',
          schemeCategory: {},
          tags: [],
          targetCategory: row['Target Category'] || row['target_category'] || null,
          applicableStates: [],
          applicationLink: row['Application Link'] || row['application_link'] || null,
          isActive: true,
        },
      });
      upserted++;
    } catch (e) {
      console.warn(`Skipped "${schemeName}": ${(e as Error).message}`);
      skipped++;
    }
  }

  console.log(`Done: ${upserted} upserted, ${skipped} skipped`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
