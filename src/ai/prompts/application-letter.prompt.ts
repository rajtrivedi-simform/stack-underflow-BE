export function buildApplicationLetterPrompt(
  entity: Record<string, unknown>,
  entityType: 'BUSINESS' | 'STARTUP',
  scheme: Record<string, unknown>,
) {
  return `You are an expert government scheme application consultant for Indian MSMEs and startups.
Generate a professional scheme application letter for the ${entityType.toLowerCase()} below.

## ${entityType} Profile
${JSON.stringify(entity, null, 2)}

## Scheme Details
${JSON.stringify(scheme, null, 2)}

## Instructions
Generate a formal application letter with the following JSON structure:

{
  "sections": [
    {
      "title": "section title",
      "content": "section content — use [REQUIRED: description] as a placeholder wherever the applicant must fill in specific information",
      "requiredFields": ["list of [REQUIRED: ...] placeholders found in this section"]
    }
  ]
}

Sections must include: Date & Reference, Addressee, Subject, Introduction, Eligibility Statement, Supporting Documents, Declaration, Closing.
Use formal Hindi/English bilingual salutations appropriate for Indian government correspondence.
Mark all blank/unknown details as [REQUIRED: <description of what is needed>].

Return ONLY valid JSON with the structure above.`;
}
