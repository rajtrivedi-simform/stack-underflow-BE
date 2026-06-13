import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DIRECT_URL } },
});

const KNOWN_CATEGORIES = [
  'Agriculture, Rural & Environment',
  'Banking, Financial Services and Insurance',
  'Business & Entrepreneurship',
  'Education & Learning',
  'Health & Wellness',
  'Housing & Shelter',
  'Public Safety, Law & Justice',
  'Science, IT & Communications',
  'Skills & Employment',
  'Social welfare & Empowerment',
  'Sports & Culture',
  'Transport & Infrastructure',
  'Travel & Tourism',
  'Utility & Sanitation',
  'Women and Child',
];

// Sort longest first so "Agriculture, Rural & Environment" matches before "Agriculture"
const SORTED_CATEGORIES = [...KNOWN_CATEGORIES].sort((a, b) => b.length - a.length);

function parseCategories(raw: string): string[] {
  if (!raw || !raw.trim()) return [];
  const result: string[] = [];
  let remaining = raw.trim();

  while (remaining.length > 0) {
    const matched = SORTED_CATEGORIES.find((cat) => remaining.startsWith(cat));
    if (matched) {
      result.push(matched);
      remaining = remaining.slice(matched.length).replace(/^,\s*/, '').trim();
    } else {
      // Unknown category — take up to next ', ' boundary
      const idx = remaining.indexOf(', ');
      if (idx === -1) {
        result.push(remaining.trim());
        break;
      }
      result.push(remaining.slice(0, idx).trim());
      remaining = remaining.slice(idx + 2).trim();
    }
  }

  return result.filter(Boolean);
}

function parseApplicationLink(raw: string | null): string | null {
  if (!raw || !raw.trim()) return null;
  return raw.split(' | ')[0].trim() || null;
}

function parseApplicableStates(raw: string): string[] {
  if (!raw || !raw.trim()) return [];
  if (raw.trim() === 'All India') return ['Central'];
  return raw
    .split(' | ')
    .map((s) => s.trim())
    .filter(Boolean);
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .substring(0, 490);
}

interface EnrichedScheme {
  scheme_name: string;
  application_link: string | null;
  applicable_states: string;
  applicable_category: string;
}

async function main() {
  const jsonPath = path.join(__dirname, 'data', 'schemes_enriched.json');
  if (!fs.existsSync(jsonPath)) {
    console.error(`JSON not found at ${jsonPath}. Place schemes_enriched.json in prisma/data/.`);
    process.exit(1);
  }

  const records: EnrichedScheme[] = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  console.log(`Processing ${records.length} enriched scheme records…`);

  let updated = 0;
  let notFound = 0;
  let skipped = 0;

  for (const record of records) {
    const { scheme_name, application_link, applicable_states, applicable_category } = record;
    if (!scheme_name) { skipped++; continue; }

    const slug = slugify(scheme_name);
    const applicableStates = parseApplicableStates(applicable_states);
    const categories = parseCategories(applicable_category);
    const targetCategory = categories[0] ?? null;

    try {
      const result = await prisma.scheme.updateMany({
        where: { slug },
        data: {
          applicationLink: parseApplicationLink(application_link),
          applicableStates,
          targetCategory,
        },
      });

      if (result.count > 0) {
        updated++;
      } else {
        notFound++;
      }
    } catch (e) {
      console.warn(`Error on "${scheme_name}": ${(e as Error).message}`);
      skipped++;
    }
  }

  console.log(`Done: ${updated} updated, ${notFound} not found in DB, ${skipped} skipped`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
