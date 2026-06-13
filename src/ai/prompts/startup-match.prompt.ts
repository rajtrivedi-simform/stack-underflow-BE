export function buildStartupMatchPrompt(startup: Record<string, unknown>, schemes: unknown[]) {
  return `You are an expert on Indian government schemes for startups. Analyse the startup profile below and evaluate each scheme for eligibility.

## Startup Profile
${JSON.stringify(startup, null, 2)}

## Schemes to Evaluate (${(schemes as []).length} total)
${JSON.stringify(schemes, null, 2)}

## Instructions
For each scheme return an object with:
- schemeId: string (from the scheme object)
- status: "ELIGIBLE" | "PARTIAL" | "INELIGIBLE"
- matchScore: number 0-100
- confidenceScore: number 0-100
- metCriteria: string[]
- unmetCriteria: string[]
- gapBridgeSteps: { condition: string; steps: string[]; effort: "instant"|"easy"|"moderate"|"complex"; cost: string }[]
- remediationCost: string
- remediationEffort: "instant" | "easy" | "moderate" | "complex"
- unlocksOtherSchemes: string[]

Focus on DPIIT recognition status, funding stage, and startup-specific criteria such as SIDBI Fund of Funds and Startup India programmes.

Return ONLY valid JSON: { "matches": [ ...above objects ] }`;
}
