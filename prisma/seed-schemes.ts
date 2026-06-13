import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DIRECT_URL } },
});

function parseJsonArray(raw: string): string[] {
  if (!raw) return [];
  return raw.split(',').map((s) => s.trim()).filter(Boolean);
}

function parseDocuments(raw: string): string[] {
  if (!raw) return [];
  const parts = raw.split(/\.\s+/).map((s) => s.replace(/\.$/, '').trim()).filter(Boolean);
  return parts.length > 1 ? parts : [raw.trim()];
}

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
    const schemeName = row['scheme_name'] || row['Scheme Name'] || row['name'] || '';
    if (!schemeName) { skipped++; continue; }

    const slug = slugify(schemeName);

    try {
      await prisma.scheme.upsert({
        where: { slug },
        update: {
          schemeName,
          details: row['details'] || row['Details'] || null,
          benefits: row['benefits'] || row['Benefits'] || null,
          eligibility: row['eligibility'] || row['Eligibility'] || null,
          application: row['application'] || row['Application Process'] || null,
          documents: parseDocuments(row['documents'] || row['Documents'] || ''),
          level: row['level'] || row['Level'] || 'Central',
          schemeCategory: parseJsonArray(row['schemeCategory'] || row['SchemeCategory'] || ''),
          tags: parseJsonArray(row['tags'] || row['Tags'] || ''),
          targetCategory: row['Target Category'] || row['target_category'] || null,
          applicationLink: row['Application Link'] || row['application_link'] || null,
          isActive: true,
        },
        create: {
          schemeName,
          slug,
          details: row['details'] || row['Details'] || null,
          benefits: row['benefits'] || row['Benefits'] || null,
          eligibility: row['eligibility'] || row['Eligibility'] || null,
          application: row['application'] || row['Application Process'] || null,
          documents: parseDocuments(row['documents'] || row['Documents'] || ''),
          level: row['level'] || row['Level'] || 'Central',
          schemeCategory: parseJsonArray(row['schemeCategory'] || row['SchemeCategory'] || ''),
          tags: parseJsonArray(row['tags'] || row['Tags'] || ''),
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
