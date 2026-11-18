// app/api/audit/route.ts
import { NextResponse } from "next/server";
import {
  AiRecommendation,
  AuditApiResponse,
  AuditReport,
  SeoCheckItem,
} from "@/interface/report";
import { evaluateSeoChecks, extractPageData } from "@/src/server/engine";
import { generateSeoRecommendations } from "@/src/server/ai/ai";

export async function POST(
  request: Request,
): Promise<NextResponse<AuditApiResponse>> {
  try {
    const body = await request.json();
    const url = typeof body?.url === "string" ? body.url.trim() : "";

    if (!url) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid website URL." },
        { status: 400 },
      );
    }

    // 1. Fetch & parse webpage HTML
    const rawMetadata = await extractPageData(url);

    // 2. Evaluate SEO rules & calculate category/overall scores
    const { checks, categoryScores, overallScore, grade } =
      evaluateSeoChecks(rawMetadata);

    // 3. Generate AI recommendations for non-passing checks via Ollama
    const failingChecks = checks.filter((c) => c.severity !== "pass");

    let executiveSummary =
      "SEO audit complete. Review your score breakdown below.";
    let recommendationsMap: Record<string, AiRecommendation> = {};

    try {
      const aiOutput = await generateSeoRecommendations(
        rawMetadata,
        failingChecks,
      );
      executiveSummary = aiOutput.executiveSummary;
      recommendationsMap = aiOutput.recommendations;
    } catch (aiError) {
      // Graceful fallback: return the deterministic Cheerio scores even if Ollama is offline
      console.error("Ollama generation error:", aiError);
      executiveSummary =
        "Numeric SEO audit completed, but local Ollama AI recommendations could not be generated. Ensure Ollama is running on localhost:11434.";
    }

    // 4. Merge AI recommendations back into checks
    const enrichedChecks: SeoCheckItem[] = checks.map((check) => {
      const rec = recommendationsMap[check.id];
      return rec ? { ...check, recommendation: rec } : check;
    });

    const report: AuditReport = {
      id: crypto.randomUUID(),
      auditedAt: new Date().toISOString(),
      url: rawMetadata.finalUrl,
      overallScore,
      grade,
      executiveSummary,
      categoryScores,
      checks: enrichedChecks,
      rawMetadata,
    };

    return NextResponse.json({ success: true, data: report });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.name === "AbortError"
          ? "Request timed out while fetching the target website."
          : error.message
        : "An unexpected error occurred during the SEO audit.";

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
