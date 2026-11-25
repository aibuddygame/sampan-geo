import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:30200";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ runId: string }> },
) {
  const { runId } = await context.params;
  try {
    const res = await fetch(
      `${BACKEND_URL}/api/runs/${encodeURIComponent(runId)}`,
      {
        cache: "no-store",
      },
    );

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to fetch run detail";
    return NextResponse.json({ detail: message }, { status: 502 });
  }
}
