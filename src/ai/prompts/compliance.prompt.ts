export function buildCompliancePrompt(
  entity: Record<string, unknown>,
  entityType: 'BUSINESS' | 'STARTUP',
  requirements: unknown[],
) {
  return `You are a compliance expert for Indian MSMEs and startups. Evaluate the ${entityType.toLowerCase()} profile against each compliance requirement.

## ${entityType} Profile
${JSON.stringify(entity, null, 2)}

## Compliance Requirements (${(requirements as []).length} total)
${JSON.stringify(requirements, null, 2)}

## Instructions
For each requirement return:
- complianceRequirementId: string (from the requirement object)
- status: "GREEN" | "YELLOW" | "RED"
  - GREEN: fully compliant
  - YELLOW: partially compliant or approaching threshold
  - RED: non-compliant or missing
- currentTier: string | null (current compliance tier based on profile)
- requiredTier: string | null (required tier for this entity)
- penalty: string | null (applicable penalty if RED)
- fixSteps: string[] (actionable steps to achieve GREEN)
- missingActions: string[] (specific missing documents or registrations)

Compute overallScore as: floor(greenCount / totalCount * 100)

Return ONLY valid JSON:
{
  "overallScore": number,
  "results": [ ...above objects ]
}`;
}
