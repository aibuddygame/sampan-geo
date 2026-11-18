import {
  AiRecommendation,
  ExtractedPageData,
  SeoCheckItem,
} from "@/interface/report";
import { callLLM } from "./llm/router";

export interface SeoAuditAiOutput {
  executiveSummary: string;
  recommendations: Record<string, AiRecommendation>;
}

// ============================================================================
// 2. DOMAIN LOGIC (Prompt construction & result parsing)
// ============================================================================

/**
 * Prepares the SEO audit prompt, invokes the injected LLM caller,
 * and parses/sanitizes the JSON response.
 */
export async function generateSeoRecommendations(
  pageData: ExtractedPageData,
  failingChecks: SeoCheckItem[],
): Promise<SeoAuditAiOutput> {
  if (failingChecks.length === 0) {
    return {
      executiveSummary:
        "All core on-page, technical, and social SEO checks passed cleanly.",
      recommendations: {},
    };
  }

  const systemPrompt =
    "You are an SEO auditing assistant that always responds in valid JSON.";

  const userPrompt = `You are an expert technical SEO engineer. Analyze the website audit data below and generate actionable fixes for each failing or warning SEO check.

Target URL: ${pageData.finalUrl}
Current Title: ${pageData.title ?? "None"}
Current Meta Description: ${pageData.metaDescription ?? "None"}
Current H1s: ${JSON.stringify(pageData.headings.h1)}
Current H2s (sample): ${JSON.stringify(pageData.headings.h2.slice(0, 5))}
Images missing alt (sample): ${JSON.stringify(pageData.images.missingAltSources)}

Failing/Warning Checks to fix:
${JSON.stringify(
  failingChecks.map((c) => ({
    id: c.id,
    name: c.name,
    severity: c.severity,
    currentValue: c.currentValue,
  })),
  null,
  2,
)}

Respond strictly with a valid JSON object matching this exact structure:
{
  "executiveSummary": "2-3 sentence overview of the site's SEO health and highest-priority improvements.",
  "recommendations": {
    "<check_id>": {
      "summary": "Clear, specific explanation of how to fix this issue for this exact page.",
      "codeSnippet": "Ready-to-paste HTML, JSON-LD, or Next.js metadata snippet tailored to this page's actual content.",
      "language": "html" | "json" | "tsx" | "text",
      "estimatedImpact": "high" | "medium" | "low"
    }
  }
}

Include an entry inside "recommendations" for every check ID listed above.`;

  const rawContent = await callLLM(systemPrompt, userPrompt);

  // Strip markdown fences in case a model wraps JSON in ```json ... ```
  const cleanedJson = rawContent
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  const parsed = JSON.parse(cleanedJson) as SeoAuditAiOutput;

  return {
    executiveSummary:
      parsed.executiveSummary ||
      "SEO audit completed. Review the individual recommendations below.",
    recommendations: parsed.recommendations || {},
  };
}
