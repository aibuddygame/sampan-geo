// app/api/audit/route.ts
import { NextResponse } from "next/server";
import { AuditApiResponse, AuditReport } from "@/interface/report";
import { evaluateSeoChecks, extractPageData } from "@/src/server/engine";

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

    const report: AuditReport = {
      id: crypto.randomUUID(),
      auditedAt: new Date().toISOString(),
      url: rawMetadata.finalUrl,
      overallScore,
      grade,
      categoryScores,
      checks,
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
