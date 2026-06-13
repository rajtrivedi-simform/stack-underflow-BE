export function buildCompliancePrompt(
  entity: Record<string, unknown>,
  entityType: 'BUSINESS' | 'STARTUP',
  requirements: unknown[],
) {
  return `You are a compliance expert for Indian MSMEs and startups. Evaluate the ${entityType.toLowerCase()} profile against each compliance requirement, then list any additional applicable compliances you know of.

## ${entityType} Profile
${JSON.stringify(entity, null, 2)}

## Compliance Requirements (${(requirements as []).length} total)
${JSON.stringify(requirements, null, 2)}

## Instructions

### Part 1 — Evaluate each DB requirement
For each requirement return:
- complianceRequirementId: string (from the requirement object)
- status: "GREEN" | "YELLOW" | "RED"
  - GREEN: fully compliant
  - YELLOW: partially compliant or approaching threshold
  - RED: non-compliant or missing
- isMandatory: boolean — true if this compliance is legally mandatory for this entity based on its constitution, sector, employee count, turnover, and applicable state/central laws; false if it is optional or best-practice
- currentTier: string | null (current compliance tier based on profile)
- requiredTier: string | null (required tier for this entity)
- penalty: string | null (applicable penalty if RED)
- fixSteps: string[] (actionable steps to achieve GREEN)
- missingActions: string[] (specific missing documents or registrations)

### Part 2 — Suggest additional compliances
Using your knowledge of Indian law, list any compliances applicable to this ${entityType.toLowerCase()} (based on its sector, constitution, state, employee count, and turnover) that are NOT already covered by the requirements above. For each:
- name: string (compliance name)
- category: string (e.g. "Labor", "Tax", "Environmental", "FSSAI", "Shops & Establishments", etc.)
- isMandatory: boolean
- status: "GREEN" | "YELLOW" | "RED" (based on what can be inferred from the profile)
- penalty: string | null
- fixSteps: string[]
- missingActions: string[]

Compute overallScore as: floor(greenCount / totalCount * 100) counting only Part 1 DB requirements.

Return ONLY valid JSON:
{
  "overallScore": number,
  "results": [ ...Part 1 objects ],
  "suggestedCompliances": [ ...Part 2 objects ]
}`;
}
