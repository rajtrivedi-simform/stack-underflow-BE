export function buildBusinessMatchPrompt(business: Record<string, unknown>, schemes: unknown[]) {
  return `You are an expert on Indian government schemes for MSMEs. Analyse the business profile below and evaluate each scheme for eligibility.

## Business Profile
${JSON.stringify(business, null, 2)}

## Schemes to Evaluate (${(schemes as []).length} total)
${JSON.stringify(schemes, null, 2)}

## Instructions
For each scheme return an object with:
- schemeId: string (from the scheme object)
- status: "ELIGIBLE" | "PARTIAL" | "INELIGIBLE"
- matchScore: number 0-100
- confidenceScore: number 0-100
- metCriteria: string[] (criteria the business satisfies)
- unmetCriteria: string[] (criteria NOT met)
- gapBridgeSteps: { condition: string; steps: string[]; effort: "instant"|"easy"|"moderate"|"complex"; cost: string }[]
- remediationCost: string (e.g. "₹5,000 – ₹20,000" or "None")
- remediationEffort: "instant" | "easy" | "moderate" | "complex"
- unlocksOtherSchemes: string[] (scheme names that become accessible after remediation)

Return ONLY valid JSON: { "matches": [ ...above objects ] }
Do not include any explanation outside the JSON.`;
}
