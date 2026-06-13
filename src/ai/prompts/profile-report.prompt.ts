export function buildProfileReportPrompt(
  entity: Record<string, unknown>,
  entityType: 'BUSINESS' | 'STARTUP',
  matchSummary: { total: number; eligible: number; topSchemes: string[] },
) {
  return `You are a business analyst specialising in Indian MSMEs and startups.
Generate a comprehensive profile report for the ${entityType.toLowerCase()} below.

## ${entityType} Profile
${JSON.stringify(entity, null, 2)}

## Scheme Match Summary
- Total schemes evaluated: ${matchSummary.total}
- Eligible schemes: ${matchSummary.eligible}
- Top matched schemes: ${matchSummary.topSchemes.join(', ')}

## Instructions
Generate a professional profile report with the following JSON structure:

{
  "sections": [
    {
      "title": "section title",
      "content": "section content — use [REQUIRED: description] for any blanks",
      "requiredFields": ["[REQUIRED: ...] placeholders"]
    }
  ]
}

Sections must include:
1. Executive Summary
2. ${entityType} Overview (constitution, sector, state, MSME category, key metrics)
3. Founder / Owner Profile (demographics, background)
4. Financial Snapshot (turnover range, investment, funding if startup)
5. Government Scheme Opportunities (top eligible schemes with portal links)
6. Compliance Status Overview
7. Growth Recommendations
8. Next Steps

Mark unknown specifics as [REQUIRED: <description>].
Return ONLY valid JSON with the structure above.`;
}
