export function buildComplianceActionPlanPrompt(
  entity: Record<string, unknown>,
  entityType: 'BUSINESS' | 'STARTUP',
  complianceResults: unknown[],
) {
  return `You are a compliance consultant for Indian MSMEs and startups.
Generate a prioritised compliance action plan for the ${entityType.toLowerCase()} below based on their compliance check results.

## ${entityType} Profile
${JSON.stringify(entity, null, 2)}

## Compliance Check Results
${JSON.stringify(complianceResults, null, 2)}

## Instructions
Generate a structured action plan with the following JSON structure:

{
  "sections": [
    {
      "title": "section title",
      "content": "section content — use [REQUIRED: description] for any blanks the user must fill",
      "requiredFields": ["[REQUIRED: ...] placeholders in this section"]
    }
  ]
}

Sections must include:
1. Executive Summary (overall score, key risks)
2. Critical Actions (RED items) — prioritised, with deadlines and estimated costs
3. Recommended Actions (YELLOW items)
4. Compliance Calendar (month-by-month action timeline)
5. Document Checklist
6. Portal & Contact Directory (relevant government portals)

Mark unknown specifics as [REQUIRED: <description>].
Return ONLY valid JSON with the structure above.`;
}
