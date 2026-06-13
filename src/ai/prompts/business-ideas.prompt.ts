export interface IdeasPromptOptions {
  locality: string;
  budget: number;
  scheme?: { schemeName: string; eligibility: string | null; benefits: string | null } | null;
  availableSchemes: Array<{ id: string; schemeName: string; eligibility: string | null; targetCategory: string | null }>;
}

export function buildBusinessIdeasPrompt(opts: IdeasPromptOptions): string {
  const schemeSection = opts.scheme
    ? `\n## Focus Scheme\nIdeas should be compatible with or directly benefit from this government scheme:\nName: ${opts.scheme.schemeName}\nEligibility: ${opts.scheme.eligibility ?? 'Not specified'}\nBenefits: ${opts.scheme.benefits ?? 'Not specified'}\n`
    : '';

  const schemesJson = JSON.stringify(
    opts.availableSchemes.map((s) => ({ id: s.id, name: s.schemeName, eligibility: s.eligibility })),
  );

  return `You are an expert Indian business consultant who suggests practical, profitable business ideas tailored to a person's location and budget.

## User Inputs
- Locality: ${opts.locality}
- Budget: ₹${opts.budget.toLocaleString('en-IN')}
${schemeSection}
## Available Government Schemes (${opts.availableSchemes.length} total)
${schemesJson}

## Instructions
Generate 5 business ideas that are:
1. Realistic for the given budget and locality
2. Suitable for the Indian market and local demand
3. Aligned with the focus scheme if provided

For each idea return an object with:
- name: string (business name/type)
- description: string (2-3 sentence overview)
- estimatedInvestment: string (e.g. "₹2,00,000 – ₹3,50,000")
- potentialMonthlyRevenue: string (e.g. "₹40,000 – ₹80,000")
- paybackPeriodMonths: number (estimated months to recover investment)
- requiredSkills: string[] (3-5 key skills needed)
- marketDemand: "HIGH" | "MEDIUM" | "LOW"
- targetCustomers: string (who the primary customers are)
- pros: string[] (2-3 advantages)
- cons: string[] (2-3 challenges)
- schemeAlignment: string | null (how this idea benefits from the focus scheme, or null if no focus scheme)
- firstSteps: string[] (3 actionable first steps to start)
- applicableSchemes: array of schemes from the Available Government Schemes list that this business idea is eligible for. Each entry:
  - schemeId: string (the "id" from the scheme list)
  - schemeName: string (the "name" from the scheme list)
  - reason: string (one sentence — why this idea qualifies for this scheme)
  - benefit: string (one sentence — what subsidy, loan, or support the scheme provides)
  Only include schemes where there is a genuine eligibility match. Return an empty array if none apply.

Return ONLY valid JSON: { "ideas": [ ...above objects ] }
Do not include any explanation outside the JSON.`;
}
