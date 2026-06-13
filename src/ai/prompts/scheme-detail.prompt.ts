export function buildSchemeDetailPrompt(
  scheme: Record<string, unknown>,
  entityType: string,
  entity: Record<string, unknown>,
  existingMatch: Record<string, unknown> | null,
  similarSchemes: Array<{ id: string; schemeName: string }>,
): string {
  const entityLabel = entityType === 'BUSINESS' ? 'Business' : 'Startup';
  return `You are an expert on Indian government schemes for MSMEs and startups. Search the web for the latest official information about the scheme below, then evaluate this ${entityLabel}'s eligibility.

## Scheme (from our database)
${JSON.stringify(scheme)}

## ${entityLabel} Profile
${JSON.stringify(entity)}

${existingMatch ? `## Previous Match Result\n${JSON.stringify(existingMatch)}\n` : ''}
## Similar Schemes Available (for recommendations)
${JSON.stringify(similarSchemes)}

## Instructions
1. Search the web using the scheme name to get the latest official eligibility criteria, benefits, application process, and any recent amendments.
2. Using the web findings combined with the profile above, return JSON with exactly these fields:

- explanation: string — 3-4 sentences describing the scheme (what it offers, who it targets, key benefits)
- eligibilityCriteria: string[] — full list of eligibility criteria from official sources
- eligibilityStatus: "ELIGIBLE" | "PARTIAL" | "INELIGIBLE" — based on the profile above
- eligibilityReason: string — specific reasons why this entity qualifies or does not qualify
- legalWorkarounds: string[] — concrete, legal steps the entity can take to meet unmet criteria (empty array if ELIGIBLE)
- similarSchemes: string[] — from the provided similar schemes list, pick up to 3 that this entity is more likely to qualify for (empty array if ELIGIBLE)
- sourceUrls: string[] — URLs of official government pages or gazette notifications you found

Return ONLY valid JSON matching the structure above. Do not include any text outside the JSON.`;
}
