/**
 * Parses Indian financial range strings into an upper-bound crore value.
 * Examples: "< 40 Lakh" → 0.4, "40L-5Cr" → 5, "5-50Cr" → 50, "50-250Cr" → 250
 */
export function parseRangeUpperCr(range: string): number | null {
  if (!range) return null;
  const normalized = range.replace(/\s+/g, '').toUpperCase();

  // Extract the upper bound from a hyphenated range, else use the whole string
  const parts = normalized.split('-');
  const upperPart = parts.length > 1 ? parts[parts.length - 1] : parts[0];

  const lakhMatch = upperPart.match(/([0-9.]+)\s*L(?:AKH)?/);
  if (lakhMatch) return parseFloat(lakhMatch[1]) / 100;

  const croreMatch = upperPart.match(/([0-9.]+)\s*CR(?:ORE)?/);
  if (croreMatch) return parseFloat(croreMatch[1]);

  return null;
}

export type MsmeCategory = 'MICRO' | 'SMALL' | 'MEDIUM' | null;

export function computeMsmeCategory(
  annualTurnoverRange: string,
  investmentPlantMachinery: string,
): MsmeCategory {
  const turnover = parseRangeUpperCr(annualTurnoverRange);
  const investment = parseRangeUpperCr(investmentPlantMachinery);

  if (turnover === null || investment === null) return null;

  // MSME Definition Order: Micro → Small → Medium (whichever fits first)
  if (investment <= 1 && turnover <= 5) return 'MICRO';
  if (investment <= 10 && turnover <= 50) return 'SMALL';
  if (investment <= 50 && turnover <= 250) return 'MEDIUM';

  return null;
}
